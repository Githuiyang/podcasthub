"""录音室变更申请 — 审批 + diff + 同步链路"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from models.database import get_db, Studio, StudioChangeRequest
from models.schemas import ChangeRequestCreate, ChangeRequestReview, ChangeRequestResponse

router = APIRouter()


def _generate_diff(before: dict, after: dict) -> dict:
    """生成字段级差异：{field: {before: ..., after: ...}}"""
    diff = {}
    all_keys = set(list(before.keys()) + list(after.keys()))
    for key in all_keys:
        old_val = before.get(key)
        new_val = after.get(key)
        if old_val != new_val:
            diff[key] = {"before": old_val, "after": new_val}
    return diff


@router.get("/list")
def list_requests(
    status: Optional[str] = None,
    page: int = 1,
    size: int = 50,
    db: Session = Depends(get_db),
):
    """获取变更申请列表"""
    query = db.query(StudioChangeRequest).order_by(StudioChangeRequest.created_at.desc())
    if status:
        query = query.filter(StudioChangeRequest.status == status)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return {
        "items": [ChangeRequestResponse.model_validate(r).model_dump() for r in items],
        "total": total,
        "page": page,
        "size": size,
    }


@router.get("/detail/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db)):
    """获取变更申请详情"""
    req = db.query(StudioChangeRequest).filter(StudioChangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="变更申请不存在")
    return ChangeRequestResponse.model_validate(req).model_dump()


@router.post("/create")
def create_request(data: ChangeRequestCreate, db: Session = Depends(get_db)):
    """创建变更申请"""
    if data.request_type not in ("create", "update"):
        raise HTTPException(status_code=400, detail="request_type 只能是 create 或 update")
    if data.request_type == "update" and not data.studio_id:
        raise HTTPException(status_code=400, detail="update 类型必须指定 studio_id")
    if data.request_type == "update":
        studio = db.query(Studio).filter(Studio.id == data.studio_id).first()
        if not studio:
            raise HTTPException(status_code=404, detail="目标录音室不存在")

    req = StudioChangeRequest(
        studio_id=data.studio_id,
        request_type=data.request_type,
        source=data.source,
        applicant_name=data.applicant_name,
        applicant_note=data.applicant_note,
        proposed_data=data.proposed_data,
        status="pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return ChangeRequestResponse.model_validate(req).model_dump()


@router.put("/approve/{request_id}")
def approve_request(request_id: int, data: ChangeRequestReview, db: Session = Depends(get_db)):
    """审批通过变更申请"""
    req = db.query(StudioChangeRequest).filter(StudioChangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="变更申请不存在")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"当前状态 {req.status} 不可审批，仅 pending 可审批")

    req.status = "approved"
    req.review_note = data.review_note
    req.reviewed_at = datetime.now()
    db.commit()
    db.refresh(req)
    return ChangeRequestResponse.model_validate(req).model_dump()


@router.put("/reject/{request_id}")
def reject_request(request_id: int, data: ChangeRequestReview, db: Session = Depends(get_db)):
    """拒绝变更申请"""
    req = db.query(StudioChangeRequest).filter(StudioChangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="变更申请不存在")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"当前状态 {req.status} 不可拒绝")

    req.status = "rejected"
    req.review_note = data.review_note
    req.reviewed_at = datetime.now()
    db.commit()
    db.refresh(req)
    return ChangeRequestResponse.model_validate(req).model_dump()


@router.put("/apply/{request_id}")
def apply_request(request_id: int, db: Session = Depends(get_db)):
    """应用变更到线上录音室（生成 diff → 写入 studios 表）"""
    req = db.query(StudioChangeRequest).filter(StudioChangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="变更申请不存在")
    if req.status != "approved":
        raise HTTPException(status_code=400, detail="仅 approved 状态可应用")

    proposed = req.proposed_data or {}
    diff = {}

    if req.request_type == "create":
        studio = Studio(**proposed)
        db.add(studio)
        db.flush()
        req.studio_id = studio.id
        diff = {"action": "create", "studio_id": studio.id, "fields": proposed}

    elif req.request_type == "update":
        studio = db.query(Studio).filter(Studio.id == req.studio_id).first()
        if not studio:
            raise HTTPException(status_code=404, detail="目标录音室不存在")
        before = {}
        for key, value in proposed.items():
            if hasattr(studio, key):
                before[key] = getattr(studio, key)
                setattr(studio, key, value)
        diff = _generate_diff(before, proposed)

    req.status = "applied"
    req.diff_snapshot = diff
    req.applied_at = datetime.now()
    db.commit()
    db.refresh(req)
    return ChangeRequestResponse.model_validate(req).model_dump()


@router.get("/diff/{request_id}")
def preview_diff(request_id: int, db: Session = Depends(get_db)):
    """预览变更差异（不实际写入）"""
    req = db.query(StudioChangeRequest).filter(StudioChangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="变更申请不存在")

    proposed = req.proposed_data or {}

    if req.request_type == "create":
        return {"action": "create", "proposed": proposed}

    elif req.request_type == "update" and req.studio_id:
        studio = db.query(Studio).filter(Studio.id == req.studio_id).first()
        if not studio:
            raise HTTPException(status_code=404, detail="目标录音室不存在")
        before = {}
        for key in proposed:
            if hasattr(studio, key):
                before[key] = getattr(studio, key)
        return {"action": "update", "studio_id": req.studio_id, "diff": _generate_diff(before, proposed)}

    return {"action": req.request_type, "proposed": proposed}
