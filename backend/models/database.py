"""SQLAlchemy 数据库模型定义"""
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

from config import DATABASE_URL, AUTO_INIT_DB

JSONType = JSON().with_variant(JSONB, "postgresql")

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Postgres 连接池配置（Supabase）
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Studio(Base):
    """录音间"""
    __tablename__ = "studios"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 基本信息
    name = Column(String(200), nullable=False)
    cover_image = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    open_hours = Column(String(200), nullable=True)

    # 位置信息
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    longitude = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)

    # 设备信息
    equipment = Column(JSONType, nullable=True)
    room_count = Column(Integer, default=1)
    room_features = Column(JSONType, nullable=True)

    # 房间结构化信息
    capacity = Column(Integer, nullable=True)
    need_own_equipment_for_video = Column(Boolean, nullable=True)

    # 价格信息
    price_per_hour = Column(Integer, nullable=True)
    price_per_day = Column(Integer, nullable=True)
    price_note = Column(String(500), nullable=True)
    charging_method = Column(String(100), nullable=True)

    # 预约方式
    booking_url = Column(String(500), nullable=True)
    booking_note = Column(String(200), nullable=True)
    booking_qr_image = Column(String(500), nullable=True)

    # 联系方式
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_wechat = Column(String(100), nullable=True)
    contact_info = Column(String(200), nullable=True)

    # 作品展示
    portfolio_images = Column(JSONType, nullable=True)
    portfolio_links = Column(JSONType, nullable=True)

    # 标签和状态
    tags = Column(JSONType, nullable=True)
    is_active = Column(Boolean, default=True)


class StudioReview(Base):
    """录音室体验评价（按录音室维度绑定）"""
    __tablename__ = "studio_reviews"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now)

    # 关联录音室
    studio_id = Column(Integer, nullable=False, index=True)

    # 评价内容
    rating = Column(Integer, nullable=True)          # 1-5 可选评分
    content = Column(Text, nullable=False)            # 体验文字（必填）
    nickname = Column(String(100), nullable=True)     # 可选署名

    # 状态与来源
    status = Column(String(20), default="pending")    # pending / published / hidden
    source = Column(String(50), default="web")        # web / import / feishu


class StudioChangeRequest(Base):
    """录音室变更申请（审批 + diff + 同步链路）"""
    __tablename__ = "studio_change_requests"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 关联录音室（null = 新建，有值 = 修改已有录音室）
    studio_id = Column(Integer, nullable=True, index=True)

    # 申请类型与来源
    request_type = Column(String(20), nullable=False)   # create / update
    source = Column(String(50), default="feishu")        # feishu / admin / manual

    # 申请人信息
    applicant_name = Column(String(200), nullable=True)
    applicant_note = Column(Text, nullable=True)         # 申请备注

    # 申请数据（JSON，包含拟写入的字段）
    proposed_data = Column(JSONType, nullable=False)

    # 审批状态
    status = Column(String(20), default="pending")       # pending / approved / applied / rejected
    review_note = Column(Text, nullable=True)             # 审批备注

    # 应用后的 diff 快照（字段级差异）
    diff_snapshot = Column(JSONType, nullable=True)

    # 时间节点
    reviewed_at = Column(DateTime, nullable=True)
    applied_at = Column(DateTime, nullable=True)


class Editor(Base):
    """剪辑师"""
    __tablename__ = "editors"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 基本信息
    name = Column(String(200), nullable=False)
    avatar = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    editor_type = Column(String(100), nullable=True)         # 类型/级别：高级/中级/初级
    availability_status = Column(String(100), nullable=True)  # 状态：可接单/暂停接单

    # 专业能力
    skills = Column(JSONType, nullable=True)
    software = Column(JSONType, nullable=True)
    experience_years = Column(Integer, default=0)
    specialties = Column(JSONType, nullable=True)
    strengths = Column(Text, nullable=True)                   # 擅长方向/备注

    # 价格信息
    price_per_episode = Column(Integer, nullable=True)
    price_per_hour = Column(Integer, nullable=True)
    price_note = Column(String(500), nullable=True)

    # 联系方式
    contact_phone = Column(String(50), nullable=True)
    contact_wechat = Column(String(100), nullable=True)
    contact_email = Column(String(200), nullable=True)
    portfolio_url = Column(String(500), nullable=True)

    # 作品展示
    portfolio_images = Column(JSONType, nullable=True)
    portfolio_links = Column(JSONType, nullable=True)
    portfolio_works = Column(Text, nullable=True)             # 过往作品（文本描述）
    coop_review = Column(Text, nullable=True)                 # 合作评价

    # 标签和状态
    tags = Column(JSONType, nullable=True)
    rating = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class BusinessContact(Base):
    """商务联系人"""
    __tablename__ = "business_contacts"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 基本信息
    name = Column(String(200), nullable=False)
    avatar = Column(String(500), nullable=True)
    company = Column(String(200), nullable=True)
    title = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)

    # 业务信息
    business_type = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    budget_range = Column(String(100), nullable=True)
    cooperation_types = Column(JSONType, nullable=True)

    # 联系方式
    contact_phone = Column(String(50), nullable=True)
    contact_wechat = Column(String(100), nullable=True)
    contact_email = Column(String(200), nullable=True)

    # 案例展示
    case_images = Column(JSONType, nullable=True)
    case_links = Column(JSONType, nullable=True)
    reference_podcasts = Column(JSONType, nullable=True)

    # 标签和状态
    tags = Column(JSONType, nullable=True)
    rating = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


def init_db():
    """初始化数据库，创建所有表"""
    if not AUTO_INIT_DB:
        return
    Base.metadata.create_all(bind=engine)


def get_db():
    """获取数据库会话（依赖注入用）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
