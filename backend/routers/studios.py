"""录音间 CRUD 接口"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional

from models.database import get_db, Studio
from models.schemas import (
    StudioCreate, StudioUpdate, StudioResponse, StudioListItem, PaginatedResponse
)
from config import DEFAULT_PAGE_SIZE

router = APIRouter()


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    """获取所有有录音间的城市列表"""
    cities = db.query(Studio.city).filter(
        Studio.is_active == True,
        Studio.city.isnot(None),
        Studio.city != ""
    ).distinct().all()
    return [c[0] for c in cities]


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
    studio = Studio(**data.model_dump())
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
    file_path = await save_upload(file, "studios")
    studio.cover_image = f"/uploads/studios/{file_path}"
    db.commit()

    return {"url": f"/uploads/studios/{file_path}"}
