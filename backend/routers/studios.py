"""录音间 CRUD 接口"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import time

from models.database import get_db, Studio
from models.schemas import (
    StudioCreate, StudioUpdate, StudioResponse, StudioListItem, PaginatedResponse
)
from config import DEFAULT_PAGE_SIZE
from services.studio_pricing import infer_charging_method

router = APIRouter()

# 内存缓存：城市列表（不常变化）
_cities_cache: dict = {"data": None, "expires": 0}
_CITIES_CACHE_TTL = 300  # 5 分钟


def resolve_charging_method(
    price_note: Optional[str],
    price_per_hour: Optional[int],
    price_per_day: Optional[int],
    booking_note: Optional[str] = None,
    current_value: Optional[str] = None,
):
    return infer_charging_method(price_note, price_per_hour, price_per_day, booking_note) or current_value


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    """获取所有有录音间的城市列表，按录音室数量降序排序（带内存缓存）"""
    now = time.time()
    if _cities_cache["data"] is not None and now < _cities_cache["expires"]:
        return _cities_cache["data"]

    results = db.query(
        Studio.city,
        func.count(Studio.id).label('count')
    ).filter(
        Studio.is_active == True,
        Studio.city.isnot(None),
        Studio.city != ""
    ).group_by(
        Studio.city
    ).order_by(
        func.count(Studio.id).desc(),
        Studio.city.asc()
    ).all()
    data = [{"city": r[0], "count": r[1]} for r in results]
    _cities_cache["data"] = data
    _cities_cache["expires"] = now + _CITIES_CACHE_TTL
    return data


@router.get("/list")
def list_studios(
    city: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    size: int = DEFAULT_PAGE_SIZE,
    db: Session = Depends(get_db),
):
    """获取录音间列表"""
    query = db.query(Studio).filter(Studio.is_active == True)

    if city:
        query = query.filter(Studio.city == city)
    if tag:
        query = query.filter(Studio.tags.contains(tag))
    if search:
        query = query.filter(Studio.name.contains(search))

    total = query.count()
    items = query.order_by(Studio.created_at.desc()).offset((page - 1) * size).limit(size).all()

    return {
        "items": [StudioListItem.model_validate(s).model_dump() for s in items],
        "total": total,
        "page": page,
        "size": size,
    }


@router.get("/detail/{studio_id}")
def get_studio(studio_id: int, db: Session = Depends(get_db)):
    """获取录音间详情"""
    studio = db.query(Studio).filter(Studio.id == studio_id).first()
    if not studio:
        raise HTTPException(status_code=404, detail="录音间不存在")
    return StudioResponse.model_validate(studio).model_dump()


@router.post("/create")
def create_studio(data: StudioCreate, db: Session = Depends(get_db)):
    """创建录音间"""
    payload = data.model_dump()
    payload["charging_method"] = resolve_charging_method(
        payload.get("price_note"),
        payload.get("price_per_hour"),
        payload.get("price_per_day"),
        payload.get("booking_note"),
        payload.get("charging_method"),
    )
    studio = Studio(**payload)
    db.add(studio)
    db.commit()
    db.refresh(studio)
    return StudioResponse.model_validate(studio).model_dump()


@router.put("/update/{studio_id}")
def update_studio(studio_id: int, data: StudioUpdate, db: Session = Depends(get_db)):
    """更新录音间"""
    studio = db.query(Studio).filter(Studio.id == studio_id).first()
    if not studio:
        raise HTTPException(status_code=404, detail="录音间不存在")

    update_data = data.model_dump(exclude_unset=True)
    if {"price_note", "price_per_hour", "price_per_day", "charging_method"} & update_data.keys():
        update_data["charging_method"] = resolve_charging_method(
            update_data.get("price_note", studio.price_note),
            update_data.get("price_per_hour", studio.price_per_hour),
            update_data.get("price_per_day", studio.price_per_day),
            update_data.get("booking_note", studio.booking_note),
            update_data.get("charging_method", studio.charging_method),
        )
    for key, value in update_data.items():
        setattr(studio, key, value)

    db.commit()
    db.refresh(studio)
    return StudioResponse.model_validate(studio).model_dump()


@router.delete("/delete/{studio_id}")
def delete_studio(studio_id: int, db: Session = Depends(get_db)):
    """删除录音间（软删除）"""
    studio = db.query(Studio).filter(Studio.id == studio_id).first()
    if not studio:
        raise HTTPException(status_code=404, detail="录音间不存在")

    studio.is_active = False
    db.commit()
    return {"message": "已删除"}


@router.post("/{studio_id}/upload")
async def upload_image(studio_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """上传录音间图片"""
    studio = db.query(Studio).filter(Studio.id == studio_id).first()
    if not studio:
        raise HTTPException(status_code=404, detail="录音间不存在")

    from services.image_service import save_upload
    file_url = await save_upload(file, "studios")
    studio.cover_image = file_url
    db.commit()

    return {"url": file_url}


@router.post("/{studio_id}/upload-qr")
async def upload_booking_qr(studio_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """上传预约二维码图片"""
    studio = db.query(Studio).filter(Studio.id == studio_id).first()
    if not studio:
        raise HTTPException(status_code=404, detail="录音间不存在")

    from services.image_service import save_upload
    file_url = await save_upload(file, "studios")
    studio.booking_qr_image = file_url
    db.commit()

    return {"url": file_url}
