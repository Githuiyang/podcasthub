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
    # 录音室上下文（可选，来自录音室详情页/弹窗的信息反馈入口）
    source: Optional[str] = None          # web_detail / web_modal / general
    studio_id: Optional[int] = None
    studio_name: Optional[str] = None
    feedback_type: Optional[str] = None   # correction / status / price / booking / contact / experience


@router.post("")
async def submit_feedback(data: FeedbackRequest):
    """提交反馈，发送到飞书机器人"""
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="反馈内容不能为空")

    # 构建飞书消息内容
    text_parts = [
        "📢 **PodcastHub 新反馈**\n",
        f"**来自**: {data.name or '匿名用户'}\n",
    ]

    # 录音室上下文
    if data.studio_id or data.studio_name:
        studio_label = data.studio_name or f"录音室#{data.studio_id}"
        text_parts.append(f"**录音室**: {studio_label}")
        if data.studio_id:
            text_parts.append(f" (ID: {data.studio_id})")
        text_parts.append("\n")
        if data.feedback_type:
            feedback_type_map = {
                "correction": "信息更正",
                "status": "状态变化",
                "price": "价格变化",
                "booking": "预约方式变化",
                "contact": "联系方式变化",
                "experience": "使用体验",
            }
            type_label = feedback_type_map.get(data.feedback_type, data.feedback_type)
            text_parts.append(f"**反馈类型**: {type_label}\n")
        if data.source:
            source_map = {
                "web_detail": "Web 详情页",
                "web_modal": "Web 首页弹窗",
            }
            source_label = source_map.get(data.source, data.source)
            text_parts.append(f"**来源**: {source_label}\n")

    text_parts.append(f"\n**内容**:\n{data.content}")
    text = "".join(text_parts)

    # 卡片标题：有录音室上下文时用不同颜色区分
    header_title = f"PodcastHub 反馈 · {data.studio_name}" if data.studio_name else "PodcastHub 反馈"
    header_template = "orange" if data.studio_id else "blue"

    message = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": header_title},
                "template": header_template
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {"tag": "lark_md", "content": text}
                }
            ]
        }
    }

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


@router.post("/submit")
async def submit_feedback_legacy(data: FeedbackRequest):
    return await submit_feedback(data)
