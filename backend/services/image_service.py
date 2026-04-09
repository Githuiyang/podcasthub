"""图片上传服务"""
import uuid
from pathlib import Path
from fastapi import UploadFile

from config import UPLOADS_DIR


async def save_upload(file: UploadFile, subfolder: str = "") -> str:
    """保存上传的图片，返回文件名"""
    save_dir = UPLOADS_DIR / subfolder
    save_dir.mkdir(parents=True, exist_ok=True)

    # 生成唯一文件名
    ext = Path(file.filename or "image.jpg").suffix
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = save_dir / filename

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return filename
