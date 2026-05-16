"""图片上传服务"""
import uuid
from pathlib import Path
from fastapi import UploadFile
import httpx

from config import (
    ENABLE_LOCAL_UPLOADS,
    PUBLIC_BASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET,
    SUPABASE_URL,
    UPLOADS_DIR,
)


def _build_public_storage_url(object_path: str) -> str:
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_STORAGE_BUCKET}/{object_path}"


async def _save_to_supabase_storage(file: UploadFile, subfolder: str) -> str:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY or not SUPABASE_STORAGE_BUCKET:
        raise RuntimeError("Supabase Storage 环境变量未配置完整")

    ext = Path(file.filename or "image.jpg").suffix
    filename = f"{uuid.uuid4().hex}{ext}"
    object_path = "/".join(part for part in (subfolder.strip("/"), filename) if part)
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{object_path}"

    content = await file.read()
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "x-upsert": "true",
        "content-type": file.content_type or "application/octet-stream",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(upload_url, content=content, headers=headers)
        response.raise_for_status()

    return _build_public_storage_url(object_path)


async def _save_to_local_uploads(file: UploadFile, subfolder: str) -> str:
    save_dir = UPLOADS_DIR / subfolder
    save_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename or "image.jpg").suffix
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = save_dir / filename

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    relative_path = f"/uploads/{'/'.join(part for part in (subfolder.strip('/'), filename) if part)}"
    if PUBLIC_BASE_URL:
        return f"{PUBLIC_BASE_URL}{relative_path}"
    return relative_path


async def save_upload(file: UploadFile, subfolder: str = "") -> str:
    """保存上传的图片，返回可公网访问的 URL。"""
    if SUPABASE_STORAGE_BUCKET:
        return await _save_to_supabase_storage(file, subfolder)
    if ENABLE_LOCAL_UPLOADS:
        return await _save_to_local_uploads(file, subfolder)
    raise RuntimeError("未配置可用的上传存储后端")
