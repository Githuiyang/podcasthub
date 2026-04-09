"""反馈收集接口 — 通过飞书机器人 Webhook 发送"""
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from config import FEISHU_WEBHOOK_URL

router = APIRouter()


class FeedbackRequest(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    type: str = "general"  # general / bug / suggestion
    content: str


async def _submit_feedback(data: FeedbackRequest):
    """提交反馈，发送到飞书机器人"""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="反馈内容不能为空")

    # 构造飞书消息
    type_label = {"general": "一般反馈", "bug": "Bug反馈", "suggestion": "功能建议"}.get(data.type, "反馈")
    text = (
        f"📢 **PodcastHub 新反馈**\n\n"
        f"**类型**: {type_label}\n"
        f"**来自**: {data.name or '匿名用户'}\n"
        f"**联系方式**: {data.contact or '未提供'}\n\n"
        f"**内容**:\n{data.content}"
    )

    message = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": f"PodcastHub {type_label}"},
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {"tag": "lark_md", "content": text}
                }
            ]
        }
    }

    # 发送到飞书
    if FEISHU_WEBHOOK_URL:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(FEISHU_WEBHOOK_URL, json=message)
                resp.raise_for_status()
                result = resp.json()
                if result.get("code") == 0:
                    return {"message": "反馈已发送"}
                raise HTTPException(status_code=502, detail=f"飞书推送失败: {result.get('msg', '未知错误')}")
        except HTTPException:
            raise
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"飞书推送失败: {exc}") from exc

    return {"message": "反馈已记录（未配置飞书机器人）"}


@router.post("")
async def submit_feedback(data: FeedbackRequest):
    return await _submit_feedback(data)


@router.post("/submit")
async def submit_feedback_legacy(data: FeedbackRequest):
    return await _submit_feedback(data)
