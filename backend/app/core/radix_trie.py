"""
radix_trie.py
=============
Core implementation of the Radix Trie (Compressed Trie) data structure.

This module is completely framework-agnostic — it has zero dependency on
FastAPI, databases, or any external library.  All dictionary indexing logic
lives here so that upper layers (Repository, Service, Router) depend on this
abstraction, never the other way around.

Design principles applied
--------------------------
- SRP  : This module has one job — manage the Radix-Trie structure.
- OCP  : New traversal strategies (autocomplete, fuzzy search …) can be added
         without modifying existing node/trie logic.
- DIP  : Upper layers import RadixTrie through the repository interface, not
         directly, keeping this core truly isolated.

Radix-Trie (Compressed Trie) overview
--------------------------------------
Unlike a plain Trie where every character occupies its own node, a Radix Trie
compresses chains of single-child nodes into a single edge label.  This saves
memory and speeds up prefix operations.

Key operations
--------------
insert(word, entry)  — Add a word and its dictionary entry.
search(word)         — Return the entry for an exact word, or None.
delete(word)         — Remove a word; merge/compress nodes as needed.
get_all_entries()    — Return every stored (word, entry) pair.
get_trie_snapshot()  — Return a JSON-serialisable tree for visualisation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


@dataclass
class DictionaryEntry:
    """
    Represents a single dictionary record attached to a Trie leaf.

    Attributes
    ----------
    word : str
        The English word exactly as inserted (preserves original casing).
    meaning : str
        Vietnamese or English definition of the word.
    pronunciation : str, optional
        IPA or informal phonetic string, e.g. ``/ˈpɪk.tʃər/``.
    part_of_speech : str, optional
        Grammatical category: noun, verb, adjective …
    """

    word: str
    meaning: str
    pronunciation: str = ""
    part_of_speech: str = ""


@dataclass
class RadixTrieNode:
    """
    A single node in the Radix Trie.

    Attributes
    ----------
    children : Dict[str, RadixTrieNode]
        Maps the *first character* of an edge label to the child node.
        Using the first character as key gives O(1) child lookup.
    edge_label : str
        The compressed string on the incoming edge from the parent.
        Root node has an empty label.
    is_end_of_word : bool
        True when this node marks the end of a complete dictionary word.
    entry : DictionaryEntry or None
        The dictionary payload; present only when ``is_end_of_word`` is True.
    """

    children: Dict[str, "RadixTrieNode"] = field(default_factory=dict)
    edge_label: str = ""
    is_end_of_word: bool = False
    entry: Optional[DictionaryEntry] = None


# ---------------------------------------------------------------------------
# Radix Trie
# ---------------------------------------------------------------------------


class RadixTrie:
    """
    Radix Trie (Compressed Trie) for indexing English dictionary entries.

    The trie stores words in lower-case so that look-ups are
    case-insensitive, but the original casing is preserved inside
    ``DictionaryEntry.word``.

    Example
    -------
    >>> trie = RadixTrie()
    >>> entry = DictionaryEntry(word="apple", meaning="a fruit")
    >>> trie.insert("apple", entry)
    >>> result = trie.search("apple")
    >>> result.meaning
    'a fruit'
    """

    def __init__(self) -> None:
        """Initialise the trie with an empty root node."""
        # Root node holds no edge label and is never an end-of-word marker.
        self._root: RadixTrieNode = RadixTrieNode(edge_label="")
        self._size: int = 0  # Number of words currently stored.

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def size(self) -> int:
        """Return the number of words stored in the trie."""
        return self._size

    def insert(self, word: str, entry: DictionaryEntry) -> None:
        """
        Insert *word* together with its *entry* into the trie.

        If the word already exists its entry is **overwritten** (upsert
        semantics), which supports the "update meaning" use-case without
        an explicit update endpoint.

        Algorithm
        ---------
        1. Normalise the word to lower-case.
        2. Walk the trie following matching edge prefixes.
        3. On a partial match, **split** the existing node so the shared
           prefix becomes a new internal node and the two suffixes become
           its children.
        4. On a full edge match, recurse into the child with the remaining
           suffix.

        Parameters
        ----------
        word : str
            The English word to insert (case-insensitive).
        entry : DictionaryEntry
            Payload to attach at the word's terminal node.

        Raises
        ------
        ValueError
            If *word* is empty or contains only whitespace.
        """
        if not word or not word.strip():
            raise ValueError("Word must be a non-empty string.")

        normalised = word.strip().lower()
        self._insert_recursive(self._root, normalised, entry)

    def search(self, word: str) -> Optional[DictionaryEntry]:
        """
        Search for *word* and return its ``DictionaryEntry``, or ``None``.

        Parameters
        ----------
        word : str
            The English word to look up (case-insensitive).

        Returns
        -------
        DictionaryEntry or None
            The stored entry when the word exists; ``None`` otherwise.
        """
        if not word or not word.strip():
            return None

        normalised = word.strip().lower()
        node = self._search_node(self._root, normalised)
        return node.entry if (node and node.is_end_of_word) else None

    def delete(self, word: str) -> bool:
        """
        Delete *word* from the trie.

        After deletion, redundant internal nodes (nodes with a single child
        and no end-of-word marker) are **merged** to keep the trie compressed.

        Parameters
        ----------
        word : str
            The English word to remove (case-insensitive).

        Returns
        -------
        bool
            ``True`` if the word was found and deleted; ``False`` otherwise.
        """
        if not word or not word.strip():
            return False

        normalised = word.strip().lower()
        deleted, _ = self._delete_recursive(self._root, normalised)
        return deleted

    def get_all_entries(self) -> List[DictionaryEntry]:
        """
        Return every ``DictionaryEntry`` stored in the trie.

        Returns
        -------
        List[DictionaryEntry]
            Entries in lexicographic order.
        """
        entries: List[DictionaryEntry] = []
        self._collect_entries(self._root, entries)
        return entries

    def get_trie_snapshot(self) -> Dict[str, Any]:
        """
        Return a JSON-serialisable representation of the entire trie.

        This snapshot is consumed by the React frontend to render the
        interactive Radix-Trie visualiser.

        Returns
        -------
        dict
            Nested dictionary describing every node and edge.
        """
        return self._node_to_dict(self._root, is_root=True)

    # ------------------------------------------------------------------
    # Private helpers — insert
    # ------------------------------------------------------------------

    def _insert_recursive(
        self,
        node: RadixTrieNode,
        remaining: str,
        entry: DictionaryEntry,
    ) -> None:
        """
        Recursively walk / modify the trie to insert *remaining* suffix.

        Parameters
        ----------
        node : RadixTrieNode
            Current node being examined.
        remaining : str
            The part of the word not yet consumed by edge labels.
        entry : DictionaryEntry
            Payload for the terminal node.
        """
        # Base case — nothing left to insert; mark this node as terminal.
        if remaining == "":
            if not node.is_end_of_word:
                self._size += 1
            node.is_end_of_word = True
            node.entry = entry
            return

        first_char = remaining[0]

        # No child starts with this character — create a brand-new leaf.
        if first_char not in node.children:
            new_leaf = RadixTrieNode(
                edge_label=remaining,
                is_end_of_word=True,
                entry=entry,
            )
            node.children[first_char] = new_leaf
            self._size += 1
            return

        child = node.children[first_char]
        label = child.edge_label
        common_len = _common_prefix_length(remaining, label)

        # Full edge match — continue deeper with leftover suffix.
        if common_len == len(label):
            self._insert_recursive(child, remaining[common_len:], entry)
            return

        # Partial match — split the existing edge at the divergence point.
        #
        #  Before split:
        #    node --[label]--> child
        #
        #  After split (common_len = k):
        #    node --[label[:k]]--> split_node --[label[k:]]--> child
        #                                     --[remaining[k:]]--> new_leaf
        #
        self._split_node(node, child, first_char, common_len, remaining, entry)

    def _split_node(
        self,
        parent: RadixTrieNode,
        child: RadixTrieNode,
        first_char: str,
        common_len: int,
        remaining: str,
        entry: DictionaryEntry,
    ) -> None:
        """
        Split *child* at position *common_len* to accommodate a diverging key.

        Parameters
        ----------
        parent : RadixTrieNode
            The node whose child map will be updated.
        child : RadixTrieNode
            The existing node whose edge label will be split.
        first_char : str
            Key in ``parent.children`` that points to *child*.
        common_len : int
            Number of shared characters between existing label and new key.
        remaining : str
            The new key suffix being inserted.
        entry : DictionaryEntry
            Payload for the new terminal node.
        """
        old_label = child.edge_label
        shared_prefix = old_label[:common_len]
        old_suffix = old_label[common_len:]
        new_suffix = remaining[common_len:]

        # Internal node representing the shared prefix.
        split_node = RadixTrieNode(edge_label=shared_prefix)

        # Re-attach the existing child under its shortened label.
        child.edge_label = old_suffix
        split_node.children[old_suffix[0]] = child

        # Attach the brand-new leaf for the diverging suffix.
        if new_suffix == "":
            # The new word IS the shared prefix — mark split_node as terminal.
            split_node.is_end_of_word = True
            split_node.entry = entry
            self._size += 1
        else:
            new_leaf = RadixTrieNode(
                edge_label=new_suffix,
                is_end_of_word=True,
                entry=entry,
            )
            split_node.children[new_suffix[0]] = new_leaf
            self._size += 1

        # Replace the old child in the parent's map.
        parent.children[first_char] = split_node

    # ------------------------------------------------------------------
    # Private helpers — search
    # ------------------------------------------------------------------

    def _search_node(
        self,
        node: RadixTrieNode,
        remaining: str,
    ) -> Optional[RadixTrieNode]:
        """
        Return the terminal node for *remaining*, or ``None`` if not found.

        Parameters
        ----------
        node : RadixTrieNode
            Current node in the traversal.
        remaining : str
            Unconsumed portion of the search key.
        """
        if remaining == "":
            return node

        first_char = remaining[0]
        if first_char not in node.children:
            return None

        child = node.children[first_char]
        label = child.edge_label
        common_len = _common_prefix_length(remaining, label)

        # The full edge label must be consumed to continue.
        if common_len < len(label):
            return None

        return self._search_node(child, remaining[common_len:])

    # ------------------------------------------------------------------
    # Private helpers — delete
    # ------------------------------------------------------------------

    def _delete_recursive(
        self,
        node: RadixTrieNode,
        remaining: str,
    ) -> tuple[bool, bool]:
        """
        Recursively delete *remaining* suffix and clean up the trie.

        Returns
        -------
        tuple[bool, bool]
            ``(deleted, should_merge)`` where *deleted* indicates whether the
            word was found, and *should_merge* signals the parent to compress
            this node if it has become redundant.
        """
        if remaining == "":
            if not node.is_end_of_word:
                return False, False  # Word does not exist.

            # Unmark the terminal flag and drop the payload.
            node.is_end_of_word = False
            node.entry = None
            self._size -= 1

            # Signal parent to merge if this node now has exactly one child.
            should_merge = len(node.children) <= 1
            return True, should_merge

        first_char = remaining[0]
        if first_char not in node.children:
            return False, False  # Prefix path not found.

        child = node.children[first_char]
        label = child.edge_label
        common_len = _common_prefix_length(remaining, label)

        if common_len < len(label):
            return False, False  # Edge label mismatch.

        deleted, should_merge = self._delete_recursive(child, remaining[common_len:])

        if not child.is_end_of_word and len(child.children) == 0:
            del node.children[first_char]

        elif should_merge:
            self._maybe_merge_child(node, first_char, child)

        return True, (not node.is_end_of_word and len(node.children) <= 1)

    def _maybe_merge_child(
        self,
        parent: RadixTrieNode,
        first_char: str,
        child: RadixTrieNode,
    ) -> None:
        """
        Merge *child* into its own child when *child* has become redundant.

        A node is redundant when it is not an end-of-word marker **and** has
        exactly one child.  Merging keeps the trie compressed.

        Parameters
        ----------
        parent : RadixTrieNode
            Owner of the ``children`` map to update.
        first_char : str
            Key identifying *child* inside ``parent.children``.
        child : RadixTrieNode
            The potentially redundant node.
        """
        if child.is_end_of_word or len(child.children) != 1:
            return  # Not eligible for merging.

        # Collapse child and its sole grandchild into one node.
        grandchild_key = next(iter(child.children))
        grandchild = child.children[grandchild_key]

        grandchild.edge_label = child.edge_label + grandchild.edge_label
        parent.children[first_char] = grandchild

    # ------------------------------------------------------------------
    # Private helpers — traversal / serialisation
    # ------------------------------------------------------------------

    def _collect_entries(
        self,
        node: RadixTrieNode,
        result: List[DictionaryEntry],
    ) -> None:
        """
        DFS traversal that appends every ``DictionaryEntry`` to *result*.

        Parameters
        ----------
        node : RadixTrieNode
            Starting node for the traversal.
        result : List[DictionaryEntry]
            Accumulator list; entries are appended in-place.
        """
        if node.is_end_of_word and node.entry:
            result.append(node.entry)

        for child in sorted(node.children.values(), key=lambda n: n.edge_label):
            self._collect_entries(child, result)

    def _node_to_dict(
        self,
        node: RadixTrieNode,
        is_root: bool = False,
    ) -> Dict[str, Any]:
        """
        Serialise *node* and its subtree into a plain dictionary.

        The structure mirrors the props expected by the React D3/Framer
        Motion visualiser component.

        Parameters
        ----------
        node : RadixTrieNode
            Node to serialise.
        is_root : bool
            Whether this call is for the virtual root node.

        Returns
        -------
        dict
            JSON-ready representation of the node.
        """
        node_dict: Dict[str, Any] = {
            "edge_label": node.edge_label if not is_root else "ROOT",
            "is_end_of_word": node.is_end_of_word,
            "entry": (
                {
                    "word": node.entry.word,
                    "meaning": node.entry.meaning,
                    "pronunciation": node.entry.pronunciation,
                    "part_of_speech": node.entry.part_of_speech,
                }
                if node.entry
                else None
            ),
            "children": [
                self._node_to_dict(child)
                for child in sorted(node.children.values(), key=lambda n: n.edge_label)
            ],
        }
        return node_dict


# ---------------------------------------------------------------------------
# Module-level utility
# ---------------------------------------------------------------------------


def _common_prefix_length(a: str, b: str) -> int:
    """
    Return the length of the longest common prefix of strings *a* and *b*.

    Parameters
    ----------
    a : str
        First string.
    b : str
        Second string.

    Returns
    -------
    int
        Number of leading characters shared by *a* and *b*.

    Examples
    --------
    >>> _common_prefix_length("apple", "application")
    3
    >>> _common_prefix_length("dog", "cat")
    0
    """
    i = 0
    while i < len(a) and i < len(b) and a[i] == b[i]:
        i += 1
    return i
