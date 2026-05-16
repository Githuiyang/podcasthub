"""录音室体验评价 — 按录音室维度绑定的评价 CRUD"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.database import get_db, StudioReview
from models.schemas import StudioReviewCreate, StudioReviewResponse

router = APIRouter()


@router.post("", response_model=StudioReviewResponse)
def create_review(data: StudioReviewCreate, db: Session = Depends(get_db)):
    """提交录音室体验评价"""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="评价内容不能为空")
    if data.rating is not None and (data.rating < 1 or data.rating > 5):
        raise HTTPException(status_code=400, detail="评分范围 1-5")

    review = StudioReview(
        studio_id=data.studio_id,
        rating=data.rating,
        content=data.content.strip(),
        nickname=data.nickname.strip() if data.nickname else None,
        status="pending",
        source="web",
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/studio/{studio_id}", response_model=List[StudioReviewResponse])
def list_published_reviews(studio_id: int, db: Session = Depends(get_db)):
    """获取某个录音室的已发布评价"""
    reviews = (
        db.query(StudioReview)
        .filter(StudioReview.studio_id == studio_id, StudioReview.status == "published")
        .order_by(StudioReview.created_at.desc())
        .limit(20)
        .all()
    )
    return reviews


@router.get("/studio/{studio_id}/count")
def count_published_reviews(studio_id: int, db: Session = Depends(get_db)):
    """获取某个录音室的已发布评价数量"""
    count = (
        db.query(StudioReview)
        .filter(StudioReview.studio_id == studio_id, StudioReview.status == "published")
        .count()
    )
    return {"studio_id": studio_id, "count": count}


@router.get("/counts")
def batch_review_counts(db: Session = Depends(get_db)):
    """批量获取所有录音室的评价数量"""
    from sqlalchemy import func
    results = (
        db.query(StudioReview.studio_id, func.count(StudioReview.id))
        .filter(StudioReview.status == "published")
        .group_by(StudioReview.studio_id)
        .all()
    )
    return {str(studio_id): count for studio_id, count in results}
