"""SQLAlchemy 数据库模型定义"""
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, JSON, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

from config import DATABASE_PATH

engine = create_engine(f"sqlite:///{DATABASE_PATH}", connect_args={"check_same_thread": False})
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

    # 位置信息
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    longitude = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)

    # 设备信息
    equipment = Column(JSON, nullable=True)
    room_count = Column(Integer, default=1)
    room_features = Column(JSON, nullable=True)

    # 价格信息
    price_per_hour = Column(Integer, nullable=True)
    price_per_day = Column(Integer, nullable=True)
    price_note = Column(String(500), nullable=True)

    # 报名方式
    booking_url = Column(String(500), nullable=True)
    booking_note = Column(String(200), nullable=True)

    # 联系方式
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_wechat = Column(String(100), nullable=True)

    # 作品展示
    portfolio_images = Column(JSON, nullable=True)
    portfolio_links = Column(JSON, nullable=True)

    # 标签和状态
    tags = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)


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

    # 专业能力
    skills = Column(JSON, nullable=True)
    software = Column(JSON, nullable=True)
    experience_years = Column(Integer, default=0)
    specialties = Column(JSON, nullable=True)

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
    portfolio_images = Column(JSON, nullable=True)
    portfolio_links = Column(JSON, nullable=True)

    # 标签和状态
    tags = Column(JSON, nullable=True)
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
    cooperation_types = Column(JSON, nullable=True)

    # 联系方式
    contact_phone = Column(String(50), nullable=True)
    contact_wechat = Column(String(100), nullable=True)
    contact_email = Column(String(200), nullable=True)

    # 案例展示
    case_images = Column(JSON, nullable=True)
    case_links = Column(JSON, nullable=True)
    reference_podcasts = Column(JSON, nullable=True)

    # 标签和状态
    tags = Column(JSON, nullable=True)
    rating = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


def init_db():
    """初始化数据库，创建所有表"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """获取数据库会话（依赖注入用）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
