"""PodcastHub FastAPI 应用入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import APP_NAME, APP_VERSION, UPLOADS_DIR, CORS_ALLOW_ORIGINS, ENABLE_LOCAL_UPLOADS
from models.database import init_db
from routers import studios, editors, business, feedback, reviews, auth, change_requests, feishu_sync

app = FastAPI(title=APP_NAME, version=APP_VERSION)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 仅在本地存储模式下暴露 uploads 静态目录。
if ENABLE_LOCAL_UPLOADS and UPLOADS_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# 注册路由
app.include_router(studios.router, prefix="/api/studios", tags=["录音间"])
app.include_router(editors.router, prefix="/api/editors", tags=["剪辑师"])
app.include_router(business.router, prefix="/api/business", tags=["商务"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["反馈"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["录音室评价"])
app.include_router(auth.router, prefix="/api/auth/admin", tags=["后台认证"])
app.include_router(change_requests.router, prefix="/api/change-requests", tags=["变更申请"])
app.include_router(feishu_sync.router, prefix="/api/feishu-sync", tags=["飞书同步"])


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def health_check():
    return {"app": APP_NAME, "version": APP_VERSION, "status": "ok"}
