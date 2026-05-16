"""PodcastHub 后端集中配置"""
from pathlib import Path
from dotenv import load_dotenv
import os

# 路径基准
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "podcasthub.db"
DEFAULT_SQLITE_URL = f"sqlite:///{DATABASE_PATH}"

# 环境变量
load_dotenv(BASE_DIR / ".env")

# 应用配置
APP_NAME = "PodcastHub API"
APP_VERSION = "0.1.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
VERCEL_ENV = os.getenv("VERCEL_ENV", "")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
AUTO_INIT_DB = os.getenv(
    "AUTO_INIT_DB",
    "true" if DATABASE_URL.startswith("sqlite") else "false",
).lower() == "true"
FEISHU_WEBHOOK_URL = os.getenv("FEISHU_WEBHOOK_URL", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "podcasthub-admin-secret-key")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "")
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
ENABLE_LOCAL_UPLOADS = os.getenv(
    "ENABLE_LOCAL_UPLOADS",
    "true" if DATABASE_URL.startswith("sqlite") and not SUPABASE_STORAGE_BUCKET else "false",
).lower() == "true"

# 仅在确实需要本地文件系统时创建目录，避免 Vercel Runtime 导入阶段写只读文件系统。
if DATABASE_URL.startswith("sqlite") or ENABLE_LOCAL_UPLOADS:
    DATA_DIR.mkdir(exist_ok=True)
if ENABLE_LOCAL_UPLOADS:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# 分页
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
