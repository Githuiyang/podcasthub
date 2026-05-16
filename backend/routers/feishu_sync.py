"""
飞书结果表同步路由。

工作流：飞书问卷收集 → 飞书结果表整理 → 人工确认 diff → 同步线上。
此模块负责「读取飞书结果表 + 比对差异 + 执行同步」。

结果表字段映射（飞书 → 线上）：
  录音室名称 → name
  详细地址 → address
  录音室描述 → description
  开放时间与预约方式 → open_hours / booking_note
  收费方式和价格 → charging_method / price_note
  空间特性与设备 → equipment
  联系人 → contact_name
  联系方式 → contact_info
"""

import json
import subprocess
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import get_db, Studio

router = APIRouter()

# 飞书结果表配置
FEISHU_BASE_TOKEN = "GbOqbmrqEaM7F2sWDhecsjr4nOd"
FEISHU_TABLE_ID = "tblZtDyWE2zJZUdE"

# 飞书字段名 → 线上字段名
FEISHU_FIELD_MAP = {
    "录音室名称": "name",
    "详细地址": "address",
    "录音室描述": "description",
    "开放时间与预约方式": "open_hours",
    "收费方式和价格": "price_note",
    "空间特性与设备": "equipment",
    "联系人": "contact_name",
    "联系方式": "contact_info",
}


def _fetch_feishu_records() -> list[dict]:
    """通过 lark-cli 从飞书结果表拉取所有记录，返回映射后的字典列表。"""
    cmd = [
        "lark-cli", "base", "+record-list",
        "--base-token", FEISHU_BASE_TOKEN,
        "--table-id", FEISHU_TABLE_ID,
        "--limit", "200",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        raise HTTPException(status_code=502, detail=f"飞书数据拉取失败: {result.stderr[:200]}")

    data = json.loads(result.stdout)
    fields_list = data.get("data", {}).get("fields", [])
    rows = data.get("data", {}).get("data", [])

    mapped = []
    for row in rows:
        record = {}
        for i, field_name in enumerate(fields_list):
            value = row[i] if i < len(row) else None
            # 跳过系统字段和附件字段
            if field_name in ("编号", "空间照片", "提交时间", "提交人"):
                continue
            if field_name in FEISHU_FIELD_MAP:
                record[FEISHU_FIELD_MAP[field_name]] = value or ""
        # 只有有名称的才视为有效记录
        if record.get("name"):
            mapped.append(record)
    return mapped


def _compare(
    feishu_records: list[dict], online_studios: list[Studio]
) -> dict:
    """比对飞书结果表与线上数据，生成 diff。"""
    # 按名称建立索引
    online_by_name = {s.name: s for s in online_studios}
    feishu_names = {r["name"] for r in feishu_records}
    online_names = set(online_by_name.keys())

    # 新增：在飞书结果表中但不在上线
    to_create = []
    for r in feishu_records:
        if r["name"] not in online_names:
            to_create.append(r)

    # 删除：在线上但不在飞书结果表中
    to_delete = []
    for name in online_names:
        if name not in feishu_names:
            to_delete.append({
                "id": online_by_name[name].id,
                "name": name,
            })

    # 更新：两边都有，但字段值不同
    to_update = []
    comparable_fields = ["address", "description", "open_hours", "price_note", "equipment", "contact_name", "contact_info"]
    for r in feishu_records:
        name = r["name"]
        if name not in online_by_name:
            continue
        studio = online_by_name[name]
        changes = {}
        for field in comparable_fields:
            feishu_val = (r.get(field) or "").strip()
            online_val = (getattr(studio, field, None) or "")
            if isinstance(online_val, list):
                online_val = ", ".join(online_val)
            online_val = str(online_val).strip()
            if feishu_val != online_val:
                changes[field] = {"before": online_val, "after": feishu_val}
        if changes:
            to_update.append({
                "id": studio.id,
                "name": name,
                "changes": changes,
            })

    return {
        "feishu_count": len(feishu_records),
        "online_count": len(online_studios),
        "to_create": to_create,
        "to_update": to_update,
        "to_delete": to_delete,
        "summary": {
            "create": len(to_create),
            "update": len(to_update),
            "delete": len(to_delete),
            "unchanged": len(feishu_records) - len(to_create) - len(to_update),
        },
    }


@router.get("/records")
def get_feishu_records():
    """拉取飞书结果表中的所有记录（映射后的）。"""
    records = _fetch_feishu_records()
    return {"count": len(records), "records": records}


@router.get("/compare")
def compare_with_online(db: Session = Depends(get_db)):
    """比对飞书结果表与线上 studios 表，返回 diff。"""
    feishu_records = _fetch_feishu_records()
    online_studios = db.query(Studio).filter(Studio.is_active == True).all()
    return _compare(feishu_records, online_studios)


class SyncAction(BaseModel):
    action: str  # "create" | "update" | "delete"
    studio_id: Optional[int] = None
    data: Optional[dict] = None


class SyncRequest(BaseModel):
    actions: list[SyncAction]


@router.post("/apply")
def apply_sync(req: SyncRequest, db: Session = Depends(get_db)):
    """执行同步操作（新增/更新/软删除），返回操作结果。"""
    results = []

    for item in req.actions:
        try:
            if item.action == "create" and item.data:
                # 新增录音室
                studio = Studio(**item.data)
                db.add(studio)
                db.flush()
                results.append({"action": "create", "name": item.data.get("name"), "status": "ok", "id": studio.id})

            elif item.action == "update" and item.studio_id and item.data:
                # 更新录音室
                studio = db.query(Studio).filter(Studio.id == item.studio_id).first()
                if not studio:
                    results.append({"action": "update", "id": item.studio_id, "status": "not_found"})
                    continue
                for key, value in item.data.items():
                    if hasattr(studio, key):
                        setattr(studio, key, value)
                results.append({"action": "update", "name": studio.name, "status": "ok", "id": studio.id})

            elif item.action == "delete" and item.studio_id:
                # 软删除
                studio = db.query(Studio).filter(Studio.id == item.studio_id).first()
                if not studio:
                    results.append({"action": "delete", "id": item.studio_id, "status": "not_found"})
                    continue
                studio.is_active = False
                results.append({"action": "delete", "name": studio.name, "status": "ok", "id": studio.id})

            else:
                results.append({"action": item.action, "status": "invalid_request"})

        except Exception as e:
            results.append({"action": item.action, "id": item.studio_id, "status": "error", "detail": str(e)})

    db.commit()
    return {"applied": len(results), "results": results}
