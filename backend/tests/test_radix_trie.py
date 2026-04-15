"""
test_radix_trie.py
==================
Unit tests for the RadixTrie core algorithm.

Covers: insert, search, delete, split-node, merge-node, edge cases.
Run with: pytest tests/test_radix_trie.py -v
"""

import pytest
from app.core.radix_trie import RadixTrie, DictionaryEntry, _common_prefix_length


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def trie() -> RadixTrie:
    """Return a fresh empty RadixTrie for each test."""
    return RadixTrie()


@pytest.fixture
def sample_entry() -> DictionaryEntry:
    """Return a reusable DictionaryEntry."""
    return DictionaryEntry(
        word="apple", meaning="a fruit", pronunciation="/ˈæp.əl/", part_of_speech="noun"
    )


# ---------------------------------------------------------------------------
# _common_prefix_length
# ---------------------------------------------------------------------------


def test_common_prefix_full_match():
    assert _common_prefix_length("apple", "apple") == 5


def test_common_prefix_partial():
    assert _common_prefix_length("apple", "application") == 4


def test_common_prefix_no_match():
    assert _common_prefix_length("dog", "cat") == 0


def test_common_prefix_empty():
    assert _common_prefix_length("", "apple") == 0


# ---------------------------------------------------------------------------
# Insert & Search
# ---------------------------------------------------------------------------


def test_insert_and_search_single_word(trie, sample_entry):
    """Inserting a word must make it searchable."""
    trie.insert("apple", sample_entry)
    result = trie.search("apple")
    assert result is not None
    assert result.meaning == "a fruit"


def test_search_missing_word_returns_none(trie):
    """Searching for a non-existent word must return None."""
    assert trie.search("ghost") is None


def test_insert_case_insensitive(trie, sample_entry):
    """Insert is case-insensitive; search must match regardless of case."""
    trie.insert("Apple", sample_entry)
    assert trie.search("apple") is not None
    assert trie.search("APPLE") is not None


def test_insert_multiple_words(trie):
    """Multiple distinct words must all be retrievable."""
    words = {
        "apple": "a fruit",
        "application": "a program",
        "apply": "to request",
        "apt": "appropriate",
        "banana": "yellow fruit",
    }
    for word, meaning in words.items():
        trie.insert(word, DictionaryEntry(word=word, meaning=meaning))

    for word, meaning in words.items():
        result = trie.search(word)
        assert result is not None, f"'{word}' not found"
        assert result.meaning == meaning


def test_size_increments_on_insert(trie, sample_entry):
    """Trie size must grow with each new unique word."""
    assert trie.size == 0
    trie.insert("apple", sample_entry)
    assert trie.size == 1
    trie.insert("application", DictionaryEntry(word="application", meaning="a program"))
    assert trie.size == 2


def test_upsert_does_not_increase_size(trie, sample_entry):
    """Re-inserting the same word must overwrite, not increase size."""
    trie.insert("apple", sample_entry)
    updated = DictionaryEntry(word="apple", meaning="updated meaning")
    trie.insert("apple", updated)
    assert trie.size == 1
    assert trie.search("apple").meaning == "updated meaning"


# ---------------------------------------------------------------------------
# Split node
# ---------------------------------------------------------------------------


def test_split_node_on_diverging_words(trie):
    """
    Inserting 'apple' then 'application' must trigger a node split at
    'appl' → 'e' and 'ication'.
    """
    trie.insert("apple", DictionaryEntry(word="apple", meaning="fruit"))
    trie.insert("application", DictionaryEntry(word="application", meaning="program"))

    assert trie.search("apple") is not None
    assert trie.search("application") is not None
    assert trie.search("appl") is None  # Internal node, not a word.


def test_split_creates_correct_prefix_node(trie):
    """'app' inserted after 'apple' must split correctly."""
    trie.insert("apple", DictionaryEntry(word="apple", meaning="fruit"))
    trie.insert("app", DictionaryEntry(word="app", meaning="application shorthand"))

    assert trie.search("apple") is not None
    assert trie.search("app") is not None


# ---------------------------------------------------------------------------
# Delete & Merge
# ---------------------------------------------------------------------------


def test_delete_existing_word(trie, sample_entry):
    """Deleting a word must remove it from the trie."""
    trie.insert("apple", sample_entry)
    result = trie.delete("apple")
    assert result is True
    assert trie.search("apple") is None
    assert trie.size == 0


def test_delete_nonexistent_word_returns_false(trie):
    """Deleting a word that was never inserted must return False."""
    assert trie.delete("ghost") is False


def test_delete_does_not_remove_prefix_word(trie):
    """Deleting 'application' must not affect 'apply'."""
    trie.insert("application", DictionaryEntry(word="application", meaning="program"))
    trie.insert("apply", DictionaryEntry(word="apply", meaning="to request"))
    trie.delete("application")

    assert trie.search("application") is None
    assert trie.search("apply") is not None


def test_delete_prefix_word_does_not_remove_longer(trie):
    """Deleting 'app' must not affect 'apple'."""
    trie.insert("app", DictionaryEntry(word="app", meaning="shorthand"))
    trie.insert("apple", DictionaryEntry(word="apple", meaning="fruit"))
    trie.delete("app")

    assert trie.search("app") is None
    assert trie.search("apple") is not None


def test_merge_after_delete(trie):
    """
    After deleting 'apple', if 'application' remains, the trie must
    still correctly return 'application'.
    """
    trie.insert("apple", DictionaryEntry(word="apple", meaning="fruit"))
    trie.insert("application", DictionaryEntry(word="application", meaning="program"))
    trie.delete("apple")

    assert trie.search("application") is not None
    assert trie.search("apple") is None


# ---------------------------------------------------------------------------
# Snapshot
# ---------------------------------------------------------------------------


def test_snapshot_is_serialisable(trie, sample_entry):
    """get_trie_snapshot() must return a plain dict (JSON-ready)."""
    trie.insert("apple", sample_entry)
    snapshot = trie.get_trie_snapshot()
    assert isinstance(snapshot, dict)
    assert snapshot["edge_label"] == "ROOT"
    assert isinstance(snapshot["children"], list)


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------


def test_insert_empty_word_raises(trie):
    """Inserting an empty string must raise ValueError."""
    with pytest.raises(ValueError):
        trie.insert("", DictionaryEntry(word="", meaning="nothing"))


def test_search_empty_string_returns_none(trie):
    """Searching with an empty string must return None gracefully."""
    assert trie.search("") is None
