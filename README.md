<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="Trường Đại học Công nghệ Thông tin | University of Information Technology">
  </a>
</p>
<h1 align="center">CS523 - CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT NÂNG CAO</h1>

# ENGLISH DICTIONARY 
![React](https://img.shields.io/badge/Frontend-ReactJS-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Language-Python_3.x-3776AB?style=flat-square&logo=python)
> + Ứng dụng Web English Dictionary là một hệ thống quản lý từ vựng tiếng anh kết hợp minh họa trực quan thuật toán đánh chỉ mục bằng cấu trúc dữ liệu cây Radix-Trie. Ứng dụng được xây dựng theo kiến trúc Clean Architecture và tuân thủ nghiêm túc các nguyên tắc SOLID.
> + Mục tiêu chính của ứng dụng là minh họa cách một hệ thống quản lý từ vựng tiếng anh sử dụng cấu trúc dữ liệu cây Radix-Trie để đánh chỉ mục và tăng tốc độ tìm kiếm chuỗi kí tự (string) trong thực tế, việc sử dụng cây Radix-Trie giúp cho hiệu suất tìm kiếm cực kì hiệu quả và vượt trội hơn rất nhiều so với các cấu trúc cây nhị phân thông thường. Mỗi thao tác thêm, xóa trên danh sách từ vựng đều được phản ánh trực tiếp lên cấu trúc cây hiển thị trên giao diện, giúp người dùng quan sát rõ ràng cách Radix-Trie tối ưu hóa tiền tố chung (common prefixes) thông qua các thao tác gộp (merge) và tách (split) node.

LINK DEMO: https://cs-523-english-dictionary.vercel.app/
---
## 1. GIỚI THIỆU MÔN HỌC:
| | |
|---|---|
| **Môn học** | Cấu Trúc Dữ Liệu Và Giải Thuật Nâng Cao |
| **Mã lớp** | CS523.Q21 |
| **Giảng viên** | ThS. Nguyễn Thanh Sơn |
| **Sinh viên** | Tô Quốc Thái |
| **MSSV** | 24521598 |
---
## 2. GIỚI THIỆU VỀ CẤU TRÚC DỮ LIỆU RADIX-TRIE:
### 2.1. Bản chất cấu trúc:
+ Radix-Trie (hay Patricia Trie) là một biến thể được tối ưu hóa vượt trội về mặt không gian bộ nhớ so với cây tiền tố (Standard Trie) thông thường nhờ cơ chế nén đường dẫn.
+ Khác với cây Trie truyền thống (mỗi cạnh chỉ lưu một ký tự đơn lẻ), Radix-Trie nén các đường dẫn không phân nhánh, cho phép một cạnh (edge) lưu trữ toàn bộ một chuỗi ký tự liền kề (tiền tố chung).
+ Phân định vai trò Node: Các node trung gian (internal nodes) hoạt động độc quyền như các điểm chia nhánh khi có sự phân kỳ về tiền tố. Chỉ những node đánh dấu sự kết thúc của một từ vựng hợp lệ (terminal nodes) mới đóng vai trò lưu trữ dữ liệu thực tế (payload).
### 2.2. Cơ chế tái cấu trúc và Tối ưu bộ nhớ:
+ Thao tác Tách node (Split): Được kích hoạt khi xảy ra xung đột tiền tố trong quá trình thêm từ mới. Thuật toán tự động phân chia cạnh chứa chuỗi ký tự bị xung đột, khởi tạo một node trung gian tại vị trí chia cắt và định tuyến phần hậu tố thành các nhánh con độc lập.
+ Thao tác Gộp node (Merge): Là cơ chế dọn dẹp tự động được kích hoạt trong quá trình xóa từ vựng. Nếu thao tác xóa làm cho node cha chỉ còn duy nhất một nhánh con (single-child node), hệ thống sẽ tự động gộp chúng lại để nén cấu trúc cây và thu hồi không gian thừa.
### 2.3. Độ phức tạp thuật toán:
+ Nhờ việc nén số lượng node và giảm triệt để chiều cao tối đa của cây, hiệu suất truy xuất được tối ưu hóa với độ ổn định cao:
  + Thêm từ vựng (Insert): O(m).
  + Xóa từ vựng (Delete): O(m).
  + Tìm kiếm chính xác (Exact Search): O(m).
  + Tìm kiếm tiền tố (Prefix Search): O(k) (Trong đó: m là độ dài của từ khóa, k là độ dài của chuỗi tiền tố).
---
## 3. MÔ TẢ DỰ ÁN:
### 3.1. Quản lý dữ liệu từ vựng:
+ Hỗ trợ thêm mới và cập nhật từ vựng với các trường dữ liệu toàn diện: Từ khóa tiếng Anh (khóa chính), Nghĩa tiếng Việt, Cách phát âm chuẩn quốc tế (IPA), và Từ loại.
+ Thực hiện xóa cứng (hard delete) từ vựng khỏi hệ thống, đảm bảo dữ liệu được loại bỏ hoàn toàn khỏi cấu trúc cây lưu trữ để giữ tính nhất quán của dữ liệu.
+ Cung cấp phản hồi trực quan qua hệ thống thông báo (Toast Message) với các mã màu tương ứng cho từng trạng thái thao tác: thông báo thành công màu xanh lá, thông báo không tìm thấy hoặc lỗi màu đỏ và xanh dương.
### 3.2. Minh họa cấu trúc cây Radix-Trie:
+ Trực quan hóa cấu trúc dữ liệu cây Radix-Trie theo thời gian thực ngay sau mỗi thao tác cập nhật.
+ Thể hiện rõ đặc trưng cấu trúc của thuật toán: Khác với cây Trie tiêu chuẩn (mỗi cạnh/node chỉ đại diện cho một ký tự), Radix-Trie tối ưu hóa không gian bằng cách nén các đường dẫn không phân nhánh. Do đó, các cạnh (edges) có thể lưu trữ một chuỗi ký tự (tiền tố chung). Đồng thời, các node trung gian sẽ đóng vai trò là điểm chia nhánh (branching points), và chỉ những node kết thúc một từ vựng hợp lệ (terminal nodes) mới tiến hành lưu trữ ý nghĩa của từ (payload) tương ứng.
+ Phân biệt trực quan trạng thái thao tác bằng hệ thống màu sắc (Highlight) rõ ràng: node chứa từ vựng vừa được thêm vào và đường đi tới node đó sẽ được hiển thị màu xanh lá, đường đi đến node kết quả tìm kiếm thành công được hiển thị màu xanh dương và đường đi tới node bị xóa sẽ được hiển thị màu đỏ.
+ Minh họa tự động cơ chế tối ưu hóa chiều sâu và không gian lưu trữ của cây:
  + Thao tác Tách node (Split): Kích hoạt khi bổ sung các từ vựng có chung tiền tố, thuật toán sẽ tự động phân tách và tạo node chia cắt tại đoạn tiền tố chung, từ đó rẽ thành các nhánh phụ.
  + Thao tác Gộp node (Merge): Kích hoạt trong quá trình xóa từ vựng nhằm thu hồi không gian bộ nhớ thừa, hệ thống tự động gộp các nhánh đơn lẻ thành một đường dẫn hợp nhất để tối ưu hoàn toàn chiều sâu cấu trúc của cây.
+ Cung cấp bộ công cụ điều khiển thuật toán (Algorithm Controls) cho phép tinh chỉnh tốc độ hiệu ứng (Animation) và tuỳ biến đồ họa cây: bật/tắt nhãn của cạnh (Show edge labels), bật/tắt hiển thị nghĩa của từ tại node (Show payload) và kích hoạt chế độ nén cấu trúc (Compact mode) giúp dễ dàng quan sát tổng quát toàn bộ cây.
### 3.3. Tìm kiếm và lọc dữ liệu: 
+ Thực thi truy vấn từ vựng trực tiếp trên đồ họa Radix-Trie thông qua API, áp dụng cơ chế duyệt cây bằng thuật toán so khớp tiền tố (prefix matching) nhằm mang lại hiệu suất tìm kiếm vượt trội.
+ Tích hợp tính năng tìm kiếm cục bộ (Local Search) linh hoạt trên danh sách dữ liệu, cho phép tra cứu thông tin theo cả từ khóa tiếng Anh lẫn ngữ nghĩa tiếng Việt.
### 3.4. Các chế độ hiển thị và phân tích dữ liệu:
+ Radix-Trie Graph: Không gian làm việc trung tâm cung cấp đồ họa trực quan về cấu trúc liên kết hiện hành của cây Radix-Trie.
+ Dictionary List: Giao diện quản lý hiển thị toàn bộ cơ sở dữ liệu từ vựng dưới định dạng các thẻ thông tin (cards) chi tiết.
+ Before vs After: Môi trường đối chiếu song song cấu trúc đồ họa ở hai trạng thái: ngay trước và ngay sau khi thực thi thao tác, hỗ trợ phân tích chuyên sâu các quá trình biến đổi dữ liệu (Split/Merge node).
+ Timeline: Hệ thống nhật ký (Operation History) ghi nhận chi tiết chuỗi hành động (Thêm, Xóa, Tìm kiếm) trên trục thời gian, đảm bảo khả năng theo dõi và kiểm soát luồng thao tác người dùng.
### 3.5. Phiên làm việc độc lập (Session-based Isolation):
+ Mỗi người dùng khi truy cập hệ thống được cấp một Session ID riêng biệt, lưu trữ trong localStorage của trình duyệt.
+ Dữ liệu và cấu trúc cây Radix-Trie của mỗi người dùng hoàn toàn độc lập với nhau.
### 3.6. Kiến trúc hệ thống và Giao diện người dùng:
+ Tích hợp bảng thống kê (Metrics) theo dõi thông số dữ liệu theo thời gian thực: tổng số từ vựng, tổng số node, chiều cao hiện hành của cây và thao tác truy xuất gần nhất.
+ Giao diện thân thiện đi kèm các tiện ích hỗ trợ: tính năng tự động nạp dữ liệu mẫu (Demo Dataset), cơ chế chuyển đổi giao diện Sáng/Tối (Dark/Light mode) và biểu tượng theo dõi trạng thái kết nối Backend (Online/Offline) theo thời gian thực.
---
## 4. CÔNG NGHỆ SỬ DỤNG:
| Phần | Công nghệ |
|---|---|
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Thư viện đồ họa & UI** | D3.js (d3-hierarchy), Framer Motion, Lucide React |
| **Thuật toán & Cấu trúc dữ liệu** | Radix-Trie (Compact Prefix Tree) |
| **State Management & Persistence**| Custom React Hooks, LocalStorage API |
| **HTTP Client** | Axios |
| **Deploy Backend** | DigitalOcean |
| **Deploy Frontend** | Vercel |
---
## 5. CẤU TRÚC DỰ ÁN:
```
CS523-English-Dictionary/
├── backend/                   # Mã nguồn Backend (Python + FastAPI)
│   ├── app/
│   │   ├── core/
│   │   │   └── radix_trie.py  # Cấu trúc dữ liệu và thuật toán Radix-Trie cốt lõi
│   │   ├── dependencies.py    # Quản lý các phụ thuộc (Dependency Injection)
│   │   ├── repositories/      # Lớp truy xuất dữ liệu (Data Access Layer)
│   │   ├── routers/           # Định nghĩa các API Endpoints (ví dụ: /api/dictionary)
│   │   ├── schemas/           # Pydantic models (Xác thực dữ liệu Request/Response)
│   │   └── services/          # Lớp chứa logic nghiệp vụ (Business logic)
│   ├── tests/
│   │   └── test_radix_trie.py # Unit tests kiểm tra tính đúng đắn của thuật toán
│   ├── main.py                # Điểm khởi chạy của server FastAPI
│   └── requirements.txt       # Danh sách các thư viện Python (FastAPI, Uvicorn,...)
│
├── frontend/                  # Mã nguồn Frontend (React + Vite + TypeScript)
│   ├── public/                # Chứa các tài nguyên tĩnh (Icons, Logo trường)
│   ├── src/
│   │   ├── api/
│   │   │   └── dictionaryApi.ts # Axios client dùng để gọi API xuống Backend
│   │   ├── components/        # Các thành phần giao diện (UI) chia nhỏ
│   │   │   ├── layout/        # Chứa Header, ControlPanel
│   │   │   ├── ui/            # Chứa các component dùng chung (Badge, Toast)
│   │   │   └── visualizer/    # Chứa các tab trực quan hóa (GraphTab, TimelineTab,...)
│   │   ├── hooks/
│   │   │   └── useDictionary.ts # Custom hook quản lý State và lưu trữ LocalStorage
│   │   ├── types/
│   │   │   ├── dictionary.ts  # Định nghĩa các Interface cốt lõi của từ điển
│   │   │   └── ui.ts          # Định nghĩa Type cho giao diện (ví dụ: TabId)
│   │   ├── utils/
│   │   │   └── trieMetrics.ts # Chứa các hàm toán học đo lường số Node, chiều cao cây
│   │   ├── App.css            # CSS cục bộ cho các component đặc thù
│   │   ├── index.css          # Cấu hình Tailwind CSS và biến màu (Design Tokens)
│   │   ├── App.tsx            # Component gốc (Root shell) của toàn bộ ứng dụng
│   │   └── main.tsx           # Điểm mồi (Entry point) gắn React vào DOM
│   ├── package.json           # Khai báo các thư viện Node.js và script chạy
│   └── vite.config.ts         # Cấu hình môi trường build của Vite
│
└── UserManual.pdf             # Tài liệu Hướng dẫn sử dụng dự án
```
---
## 6. GIẤY PHÉP:
Dự Án Được Thực Hiện Cho Mục Đích Học Thuật - Môn Cấu Trúc Dữ Liệu Và Giải Thuật Nâng Cao (CS523) - Trường Đại Học Công Nghệ Thông Tin ĐHQG.TPHCM (UIT).
 
