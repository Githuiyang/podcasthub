"""录音间收费方式推导工具。"""
from __future__ import annotations

from typing import Any, Mapping


def _normalize_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def infer_charging_method(
    price_note: Any = None,
    price_per_hour: Any = None,
    price_per_day: Any = None,
    booking_note: Any = None,
) -> str | None:
    """根据价格字段推导一个简洁的收费方式描述。"""
    note = _normalize_text(price_note)
    booking = _normalize_text(booking_note)
    combined = f"{note} {booking}".strip()
    lowered = combined.lower()

    if not combined and price_per_hour is None and price_per_day is None:
        return None

    if "免费" in combined:
        return "免费"

    if any(token in combined for token in ("2h", "2小时", "2 小时", "两小时")):
        return "按时段收费"

    if price_per_hour is not None or any(token in lowered for token in ("r/h", "/h", "每小时", "小时", "hour", "按小时")):
        return "按小时收费"

    if price_per_day is not None or any(token in lowered for token in ("按天", "按日", "daily", "per day")):
        return "按天收费"

    if any(token in combined for token in ("预约", "咨询", "面议", "私信", "联系")):
        return "咨询后报价"

    if "收费" in combined:
        return "收费"

    return None


def infer_charging_method_from_row(row: Mapping[str, Any]) -> str | None:
    return infer_charging_method(
        row.get("price_note"),
        row.get("price_per_hour"),
        row.get("price_per_day"),
        row.get("booking_note"),
    )
