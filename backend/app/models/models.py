import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Boolean
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
    uploaded_videos = relationship("UploadedVideo", back_populates="company")

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
    hybrid_render = relationship("VideoRender", back_populates="content_item", uselist=False)

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


# --- Hybrid Video Creation & AI Editing Models ---

class UploadedVideo(Base):
    __tablename__ = "uploaded_videos"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    original_file = Column(String)  # File path or URL
    filename = Column(String)
    duration = Column(Float, default=0.0)  # in seconds
    resolution = Column(String, default="1080x1920")  # e.g., 1080x1920 or 1920x1080
    aspect_ratio = Column(String, default="9:16")  # "9:16", "1:1", "16:9"
    file_size = Column(Integer, default=0)  # in bytes
    mode = Column(String, default="HYBRID")  # "AI_GENERATED", "USER_EDIT", "HYBRID"
    status = Column(String, default="UPLOADED")  # "UPLOADED", "ANALYZING", "ANALYZED", "PLANNING", "READY", "FAILED"
    processing_stage = Column(String, default="Uploaded")
    processing_progress = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="uploaded_videos")
    transcripts = relationship("VideoTranscript", back_populates="video", cascade="all, delete-orphan")
    segments = relationship("VideoSegment", back_populates="video", cascade="all, delete-orphan")
    edits = relationship("VideoEdit", back_populates="video", cascade="all, delete-orphan")
    assets = relationship("VideoAssetRecord", back_populates="video", cascade="all, delete-orphan")
    renders = relationship("VideoRender", back_populates="video", cascade="all, delete-orphan")


class VideoTranscript(Base):
    __tablename__ = "video_transcripts"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("uploaded_videos.id", ondelete="CASCADE"))
    text = Column(Text)
    start_time = Column(Float, default=0.0)
    end_time = Column(Float, default=0.0)
    confidence = Column(Float, default=0.95)
    words_json = Column(JSON, default=list)  # List of {word, start, end, highlight}

    video = relationship("UploadedVideo", back_populates="transcripts")


class VideoSegment(Base):
    __tablename__ = "video_segments"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("uploaded_videos.id", ondelete="CASCADE"))
    start_time = Column(Float)
    end_time = Column(Float)
    segment_type = Column(String)  # "hook", "problem", "solution", "insight", "cta", "story"
    importance_score = Column(Float, default=0.8)  # 0.0 to 1.0
    keep = Column(Boolean, default=True)
    suggested_action = Column(String, default="ORIGINAL")  # "ORIGINAL", "B-ROLL", "GRAPHIC", "SCREENSHOT", "MIXED"
    broll_query = Column(String, nullable=True)
    text_overlay = Column(String, nullable=True)

    video = relationship("UploadedVideo", back_populates="segments")


class VideoEdit(Base):
    __tablename__ = "video_edits"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("uploaded_videos.id", ondelete="CASCADE"))
    edit_type = Column(String)  # "silence_removal", "filler_removal", "zoom", "caption", "broll_insert", "graphic_insert", "hook_reorder", "cta_overlay"
    start_time = Column(Float)
    end_time = Column(Float)
    description = Column(String)
    configuration = Column(JSON, default=dict)  # Options & parameters for the edit
    status = Column(String, default="SUGGESTED")  # "SUGGESTED", "ACCEPTED", "REJECTED"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    video = relationship("UploadedVideo", back_populates="edits")


class VideoAssetRecord(Base):
    __tablename__ = "video_asset_records"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("uploaded_videos.id", ondelete="CASCADE"))
    asset_type = Column(String)  # "B_ROLL", "GRAPHIC", "SCREENSHOT", "MUSIC", "BRANDING"
    source = Column(String)  # "PEXELS", "UNSPLASH", "AI_GENERATED", "USER_UPLOAD"
    url = Column(String)
    attribution = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)

    video = relationship("UploadedVideo", back_populates="assets")


class VideoRender(Base):
    __tablename__ = "video_renders"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("uploaded_videos.id", ondelete="CASCADE"))
    content_item_id = Column(Integer, ForeignKey("content_items.id", ondelete="SET NULL"), nullable=True)
    render_type = Column(String, default="MASTER")  # "MASTER", "INSTAGRAM_REEL", "YOUTUBE_SHORT", "LINKEDIN", "X_PUNCHY", "FACEBOOK"
    aspect_ratio = Column(String, default="9:16")  # "9:16", "1:1", "16:9"
    output_url = Column(String)
    status = Column(String, default="PENDING")  # "PENDING", "RENDERING", "COMPLETED", "FAILED"
    composition_data = Column(JSON, default=dict)  # Full multi-track Remotion configuration
    provenance = Column(JSON, default=dict)  # {"original_pct": 68, "broll_pct": 18, "graphics_pct": 9, "ai_pct": 5}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    video = relationship("UploadedVideo", back_populates="renders")
    content_item = relationship("ContentItem", back_populates="hybrid_render")
    dropoff_metrics = relationship("VideoDropoffMetric", back_populates="render", cascade="all, delete-orphan")


class VideoDropoffMetric(Base):
    __tablename__ = "video_dropoff_metrics"

    id = Column(Integer, primary_key=True, index=True)
    render_id = Column(Integer, ForeignKey("video_renders.id", ondelete="CASCADE"))
    second_mark = Column(Integer)  # e.g., 0, 5, 10, 15, 20...
    retention_percentage = Column(Float)  # e.g., 100.0, 94.0, 61.0
    audience_drop_flag = Column(Boolean, default=False)
    ai_recommendation = Column(String, nullable=True)

    render = relationship("VideoRender", back_populates="dropoff_metrics")

