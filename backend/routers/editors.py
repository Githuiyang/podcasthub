"""剪辑师 CRUD 接口"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from models.database import get_db, Editor
from models.schemas import (
    EditorCreate, EditorUpdate, EditorResponse, EditorListItem
)
from config import DEFAULT_PAGE_SIZE

router = APIRouter()


@router.get("/list")
def list_editors(
    skill: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    size: int = DEFAULT_PAGE_SIZE,
    db: Session = Depends(get_db),
):
    """获取剪辑师列表"""
    query = db.query(Editor).filter(Editor.is_active == True)

    if skill:
        query = query.filter(Editor.skills.contains(skill))
    if tag:
        query = query.filter(Editor.tags.contains(tag))
    if search:
        query = query.filter(Editor.name.contains(search))

    total = query.count()
    items = query.order_by(Editor.created_at.desc()).offset((page - 1) * size).limit(size).all()

    return {
        "items": [EditorListItem.model_validate(e).model_dump() for e in items],
        "total": total,
        "page": page,
        "size": size,
    }


@router.get("/detail/{editor_id}")
def get_editor(editor_id: int, db: Session = Depends(get_db)):
    """获取剪辑师详情"""
    editor = db.query(Editor).filter(Editor.id == editor_id).first()
    if not editor:
        raise HTTPException(status_code=404, detail="剪辑师不存在")
    return EditorResponse.model_validate(editor).model_dump()


@router.post("/create")
def create_editor(data: EditorCreate, db: Session = Depends(get_db)):
    """创建剪辑师"""
    editor = Editor(**data.model_dump())
    db.add(editor)
    db.commit()
    db.refresh(editor)
    return EditorResponse.model_validate(editor).model_dump()


@router.put("/update/{editor_id}")
def update_editor(editor_id: int, data: EditorUpdate, db: Session = Depends(get_db)):
    """更新剪辑师"""
    editor = db.query(Editor).filter(Editor.id == editor_id).first()
    if not editor:
        raise HTTPException(status_code=404, detail="剪辑师不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(editor, key, value)

    db.commit()
    db.refresh(editor)
    return EditorResponse.model_validate(editor).model_dump()


@router.delete("/delete/{editor_id}")
def delete_editor(editor_id: int, db: Session = Depends(get_db)):
    """删除剪辑师（软删除）"""
    editor = db.query(Editor).filter(Editor.id == editor_id).first()
    if not editor:
        raise HTTPException(status_code=404, detail="剪辑师不存在")

    editor.is_active = False
    db.commit()
    return {"message": "已删除"}
