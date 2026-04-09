"""PodcastHub 后端集中配置"""
from pathlib import Path
from dotenv import load_dotenv
import os

# 路径基准
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "podcasthub.db"

# 确保目录存在
DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

# 环境变量
load_dotenv(BASE_DIR / ".env")

# 应用配置
APP_NAME = "PodcastHub API"
APP_VERSION = "0.1.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
FEISHU_WEBHOOK_URL = os.getenv("FEISHU_WEBHOOK_URL", "")
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

# 分页
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
