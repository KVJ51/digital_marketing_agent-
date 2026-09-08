import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, unique=True, index=True)
    industry = Column(String)
    target_audience = Column(Text)
    products = Column(JSON)  # List of product names/info
    features = Column(JSON)  # List of core features
    brand_voice = Column(String)
    website = Column(String)
    social_links = Column(JSON)  # List of links
    goals = Column(JSON)  # List of goals
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("MarketingProfile", back_populates="company", uselist=False)
    strategies = relationship("WeeklyStrategy", back_populates="company")
    content_items = relationship("ContentItem", back_populates="company")
    memory_nodes = relationship("ContentMemory", back_populates="company")

class MarketingProfile(Base):
    __tablename__ = "marketing_profiles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    company_summary = Column(Text)
    marketing_summary = Column(Text)
    audience_profile = Column(Text)
    opportunities = Column(JSON)  # List of opportunity descriptions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="profile")

class WeeklyStrategy(Base):
    __tablename__ = "weekly_strategies"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    week_number = Column(Integer)
    weekly_strategy = Column(JSON)  # Array of strategy themes / focus areas
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="strategies")
    content_items = relationship("ContentItem", back_populates="strategy")

class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    strategy_id = Column(Integer, ForeignKey("weekly_strategies.id", ondelete="SET NULL"), nullable=True)
    type = Column(String)  # "Founder Story", "Product Demo", "Industry Insight", etc.
    platform = Column(String)  # "LinkedIn", "Instagram", "Facebook", "X", "YouTube Shorts"
    status = Column(String, default="DRAFT")  # "DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "PUBLISHED"
    scheduled_time = Column(DateTime, nullable=True)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="content_items")
    strategy = relationship("WeeklyStrategy", back_populates="content_items")
    script = relationship("Script", back_populates="content_item", uselist=False)
    video = relationship("VideoAsset", back_populates="content_item", uselist=False)
    analytics = relationship("AnalyticsRecord", back_populates="content_item")

class Script(Base):
    __tablename__ = "scripts"

    id = Column(Integer, primary_key=True, index=True)
    content_item_id = Column(Integer, ForeignKey("content_items.id", ondelete="CASCADE"))
    script_text = Column(Text)
    hook = Column(Text)
    problem = Column(Text)
    solution = Column(Text)
    cta = Column(Text)
    caption = Column(Text)
    hashtags = Column(JSON)  # List of hashtags
    duration = Column(Integer)  # 30, 60, 90
    voice_gender = Column(String)  # "MALE", "FEMALE", "BRAND"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    content_item = relationship("ContentItem", back_populates="script")

class VideoAsset(Base):
    __tablename__ = "video_assets"

    id = Column(Integer, primary_key=True, index=True)
    content_item_id = Column(Integer, ForeignKey("content_items.id", ondelete="CASCADE"))
    video_url = Column(String)
    storyboard = Column(JSON)  # List of scenes with {visual_prompt, stock_search_query, text_overlay, duration}
    voiceover_url = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    content_item = relationship("ContentItem", back_populates="video")

class ContentMemory(Base):
    __tablename__ = "content_memory"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    topic = Column(String, index=True)
    angle = Column(String)
    engagement_score = Column(Float, default=0.0)
    times_posted = Column(Integer, default=0)
    last_posted_at = Column(DateTime, nullable=True)
    relations = Column(JSON, default=list)  # Connections to other topics/keywords (Knowledge Graph)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="memory_nodes")

class AnalyticsRecord(Base):
    __tablename__ = "analytics_records"

    id = Column(Integer, primary_key=True, index=True)
    content_item_id = Column(Integer, ForeignKey("content_items.id", ondelete="CASCADE"))
    platform = Column(String)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    ctr = Column(Float, default=0.0)
    watch_time = Column(Float, default=0.0)
    tracked_at = Column(DateTime, default=datetime.datetime.utcnow)

    content_item = relationship("ContentItem", back_populates="analytics")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user = Column(String)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
