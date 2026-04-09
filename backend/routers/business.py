"""商务 CRUD 接口"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from models.database import get_db, BusinessContact
from models.schemas import (
    BusinessCreate, BusinessUpdate, BusinessResponse, BusinessListItem
)
from config import DEFAULT_PAGE_SIZE

router = APIRouter()


@router.get("/list")
def list_business(
    business_type: Optional[str] = None,
    industry: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    size: int = DEFAULT_PAGE_SIZE,
    db: Session = Depends(get_db),
):
    """获取商务列表"""
    query = db.query(BusinessContact).filter(BusinessContact.is_active == True)

    if business_type:
        query = query.filter(BusinessContact.business_type == business_type)
    if industry:
        query = query.filter(BusinessContact.industry == industry)
    if search:
        query = query.filter(BusinessContact.name.contains(search))

    total = query.count()
    items = query.order_by(BusinessContact.created_at.desc()).offset((page - 1) * size).limit(size).all()

    return {
        "items": [BusinessListItem.model_validate(b).model_dump() for b in items],
        "total": total,
        "page": page,
        "size": size,
    }


@router.get("/detail/{contact_id}")
def get_business(contact_id: int, db: Session = Depends(get_db)):
    """获取商务详情"""
    contact = db.query(BusinessContact).filter(BusinessContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="商务信息不存在")
    return BusinessResponse.model_validate(contact).model_dump()


@router.post("/create")
def create_business(data: BusinessCreate, db: Session = Depends(get_db)):
    """创建商务"""
    contact = BusinessContact(**data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return BusinessResponse.model_validate(contact).model_dump()


@router.put("/update/{contact_id}")
def update_business(contact_id: int, data: BusinessUpdate, db: Session = Depends(get_db)):
    """更新商务"""
    contact = db.query(BusinessContact).filter(BusinessContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="商务信息不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contact, key, value)

    db.commit()
    db.refresh(contact)
    return BusinessResponse.model_validate(contact).model_dump()


@router.delete("/delete/{contact_id}")
def delete_business(contact_id: int, db: Session = Depends(get_db)):
    """删除商务（软删除）"""
    contact = db.query(BusinessContact).filter(BusinessContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="商务信息不存在")

    contact.is_active = False
    db.commit()
    return {"message": "已删除"}
