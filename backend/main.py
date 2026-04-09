"""PodcastHub FastAPI 应用入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import APP_NAME, APP_VERSION, UPLOADS_DIR, CORS_ALLOW_ORIGINS
from models.database import init_db
from routers import studios, editors, business, feedback

app = FastAPI(title=APP_NAME, version=APP_VERSION)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件（上传的图片）
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# 注册路由
app.include_router(studios.router, prefix="/api/studios", tags=["录音间"])
app.include_router(editors.router, prefix="/api/editors", tags=["剪辑师"])
app.include_router(business.router, prefix="/api/business", tags=["商务"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["反馈"])


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def health_check():
    return {"app": APP_NAME, "version": APP_VERSION, "status": "ok"}
