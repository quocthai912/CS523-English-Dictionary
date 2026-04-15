"""
main.py
=======
Entry point của ứng dụng FastAPI — English Dictionary Indexing Visualizer.

Vai trò
-------
- Khởi tạo ứng dụng FastAPI với cấu hình CORS cho phép Frontend React
  gọi API từ domain khác (localhost:5173 khi dev).
- Đăng ký tất cả các Router vào ứng dụng.
- Cung cấp health-check endpoint để kiểm tra server còn sống không.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.dictionary_router import router as dictionary_router

# ---------------------------------------------------------------------------
# Khởi tạo ứng dụng FastAPI
# ---------------------------------------------------------------------------

app = FastAPI(
    title="English Dictionary Indexing Visualizer",
    description=(
        "API cho ứng dụng từ điển tiếng Anh kết hợp minh họa trực quan "
        "thuật toán đánh chỉ mục bằng Radix-Trie (Compressed Trie)."
    ),
    version="1.0.0",
    docs_url="/docs",  # Swagger UI tại /docs
    redoc_url="/redoc",  # ReDoc tại /redoc
)

# ---------------------------------------------------------------------------
# Cấu hình CORS — cho phép Frontend React gọi API
# ---------------------------------------------------------------------------

# Danh sách các origin được phép gọi API.
# Khi deploy production, thay localhost bằng domain thực của frontend.
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả HTTP methods
    allow_headers=["*"],  # Cho phép tất cả headers
)

# ---------------------------------------------------------------------------
# Đăng ký các Router
# ---------------------------------------------------------------------------

# Đăng ký dictionary router — xử lý tất cả endpoint /api/dictionary/...
app.include_router(dictionary_router)


# ---------------------------------------------------------------------------
# Health check endpoint
# ---------------------------------------------------------------------------


@app.get(
    "/health-check",
    tags=["Hệ thống"],
    summary="Kiểm tra trạng thái server",
)
def health_check() -> dict:
    """
    Endpoint kiểm tra server có đang hoạt động không.

    Returns
    -------
    dict
        Trạng thái server và phiên bản ứng dụng.
    """
    return {
        "status": "ok",
        "message": "English Dictionary Visualizer API đang hoạt động.",
        "version": "1.0.0",
    }
