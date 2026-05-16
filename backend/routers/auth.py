"""后台认证接口"""
import hashlib
import hmac
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import ADMIN_PASSWORD, ADMIN_SECRET_KEY

router = APIRouter()


class AdminLoginRequest(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    token: str
    expires_at: float


def _generate_token() -> tuple[str, float]:
    """生成简易 token：HMAC(密钥 + 时间窗口)"""
    # 24 小时过期
    expires_at = time.time() + 86400
    window = str(int(expires_at // 86400))
    msg = f"{window}:{ADMIN_SECRET_KEY}".encode()
    token = hmac.new(ADMIN_SECRET_KEY.encode(), msg, hashlib.sha256).hexdigest()
    return token, expires_at


def verify_token(token: str) -> bool:
    """验证 token 是否在当前有效窗口内"""
    if not token:
        return False
    now = time.time()
    w = int(now // 86400)
    # 检查前一天、当天、后一天三个窗口
    for delta in [-1, 0, 1]:
        window = str(w + delta)
        msg = f"{window}:{ADMIN_SECRET_KEY}".encode()
        expected = hmac.new(ADMIN_SECRET_KEY.encode(), msg, hashlib.sha256).hexdigest()
        if hmac.compare_digest(token, expected):
            return True
    return False


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(data: AdminLoginRequest):
    """验证管理密码，返回 token"""
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="后台密码未配置")
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="密码错误")
    token, expires_at = _generate_token()
    return AdminLoginResponse(token=token, expires_at=expires_at)


@router.get("/verify")
def admin_verify(token: str = ""):
    """验证 token 是否有效"""
    if verify_token(token):
        return {"valid": True}
    return {"valid": False}
