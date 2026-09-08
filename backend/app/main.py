import os
import shutil
import datetime
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Security, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
import strawberry
from strawberry.fastapi import GraphQLRouter

# DB configuration
from backend.app.db.session import engine, Base, get_db, SessionLocal
from backend.app.models import models as db_models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Agents & Services
from backend.app.agents.agents import (
    BusinessAnalysisAgent,
    MarketingStrategyAgent,
    ContentPlannerAgent,
    ScriptWriterAgent,
    VideoGenerationAgent,
    ApprovalAgent,
    PublishingAgent,
    AnalyticsAgent,
    LearningAgent
)
from backend.app.agents.hybrid_editing_agent import HybridEditingAgent
from backend.app.services.memory_service import ContentMemorySystem
from backend.app.services.video_renderer import VideoRendererService
from backend.app.services.video_analysis_service import VideoAnalysisService


# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FounderOS AI Digital Marketing Agent API",
    description="Enterprise-grade marketing automation system backend.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT / Security Settings
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey_change_in_production")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def log_audit(action: str, user: str, details: str, db: Session):
    log = db_models.AuditLog(action=action, user=user, details=details)
    db.add(log)
    db.commit()

# --- Pydantic Schema Definitions ---
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CompanyOnboarding(BaseModel):
    company_name: str
    industry: str
    target_audience: str
    products: List[str]
    features: List[str]
    brand_voice: str
    website: str
    social_links: List[str]
    goals: List[str]

class CompanyResponse(BaseModel):
    id: int
    company_name: str
    industry: str
    brand_voice: str
    website: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ScriptEditSchema(BaseModel):
    script_text: str
    caption: str
    hashtags: List[str]

class ApprovalSchema(BaseModel):
    status: str  # "APPROVED" or "REJECTED"


# --- Authentication Endpoint ---
@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Simple hardcoded check for onboarding demo
    if form_data.username == "admin" and form_data.password == "founderpass":
        log_audit("USER_LOGIN", form_data.username, "Login succeeded", db)
        return {"access_token": "mock_jwt_token_for_admin_role", "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


# --- Core User Onboarding ---
@app.post("/api/onboarding", response_model=CompanyResponse)
async def onboard_company(data: CompanyOnboarding, db: Session = Depends(get_db)):
    # Check if company already exists
    existing = db.query(db_models.Company).filter(db_models.Company.company_name == data.company_name).first()
    if existing:
        return existing

    company = db_models.Company(
        company_name=data.company_name,
        industry=data.industry,
        target_audience=data.target_audience,
        products=data.products,
        features=data.features,
        brand_voice=data.brand_voice,
        website=data.website,
        social_links=data.social_links,
        goals=data.goals
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    log_audit("ONBOARD_COMPANY", "admin", f"Onboarded company {company.company_name}", db)
    return company


# --- Step 2: Analyze Business Info ---
@app.post("/api/business/analyze/{company_id}")
async def analyze_business(company_id: int, db: Session = Depends(get_db)):
    company = db.query(db_models.Company).filter(db_models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    analysis_agent = BusinessAnalysisAgent()
    result = analysis_agent.analyze({
        "company_name": company.company_name,
        "industry": company.industry,
        "target_audience": company.target_audience,
        "products": company.products,
        "features": company.features
    })

    # Save to MarketingProfile
    profile = db.query(db_models.MarketingProfile).filter(db_models.MarketingProfile.company_id == company_id).first()
    if profile:
        profile.company_summary = result["business_summary"]
        profile.marketing_summary = result["business_summary"]
        profile.audience_profile = result["audience_summary"]
        profile.opportunities = result["opportunities"]
    else:
        profile = db_models.MarketingProfile(
            company_id=company_id,
            company_summary=result["business_summary"],
            marketing_summary=result["business_summary"],
            audience_profile=result["audience_summary"],
            opportunities=result["opportunities"]
        )
        db.add(profile)
    
    db.commit()
    log_audit("ANALYZE_BUSINESS", "agent", f"Analyzed company {company.company_name}", db)
    return result


# --- Step 3 & 4: Strategy & Planning Generation ---
@app.post("/api/strategy/weekly/{company_id}")
async def generate_weekly_strategy(company_id: int, week: int = 1, db: Session = Depends(get_db)):
    company = db.query(db_models.Company).filter(db_models.Company.id == company_id).first()
    profile = db.query(db_models.MarketingProfile).filter(db_models.MarketingProfile.company_id == company_id).first()
    if not company or not profile:
        raise HTTPException(status_code=404, detail="Company profile not created yet. Run onboarding and analysis first.")

    # Fetch remembered topics
    memory_sys = ContentMemorySystem(db)
    memory_nodes = db.query(db_models.ContentMemory).filter(db_models.ContentMemory.company_id == company_id).all()
    memory_topics = [node.topic for node in memory_nodes]

    # Generate themes
    strategy_agent = MarketingStrategyAgent()
    strat_res = strategy_agent.generate_strategy(
        company.company_name,
        {
            "summary": profile.company_summary,
            "opportunities": profile.opportunities
        },
        memory_topics,
        week
    )

    weekly_strat = db_models.WeeklyStrategy(
        company_id=company_id,
        week_number=week,
        weekly_strategy=strat_res["weekly_strategy"]
    )
    db.add(weekly_strat)
    db.commit()

    # Automatically trigger Content Planner Agent
    planner_agent = ContentPlannerAgent()
    plan_res = planner_agent.create_calendar(strat_res["weekly_strategy"])

    # Create ContentItems in DB
    created_items = []
    script_writer = ScriptWriterAgent()
    video_gen = VideoGenerationAgent()

    for idx, item in enumerate(plan_res["calendar"]):
        scheduled = datetime.datetime.utcnow() + datetime.timedelta(days=idx+1)
        content_item = db_models.ContentItem(
            company_id=company_id,
            strategy_id=weekly_strat.id,
            type=item["type"],
            platform=item["platform"],
            status="DRAFT",
            scheduled_time=scheduled,
            title=item["title"]
        )
        db.add(content_item)
        db.commit()

        # Generate script for content
        script_res = script_writer.write_script(
            content_type=item["type"],
            platform=item["platform"],
            title=item["title"],
            brand_voice=company.brand_voice
        )
        script_obj = db_models.Script(
            content_item_id=content_item.id,
            script_text=script_res["script"],
            hook=script_res["hook"],
            problem=script_res["problem"],
            solution=script_res["solution"],
            cta=script_res["cta"],
            caption=script_res["caption"],
            hashtags=script_res["hashtags"],
            duration=script_res["duration"],
            voice_gender=script_res["voice_gender"]
        )
        db.add(script_obj)

        # Generate storyboard
        video_res = video_gen.generate_storyboard(script_res)
        video_obj = db_models.VideoAsset(
            content_item_id=content_item.id,
            video_url=video_res["video_url"],
            storyboard=video_res["storyboard"],
            voiceover_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        )
        db.add(video_obj)
        db.commit()

        # Store topic in Memory System
        memory_sys.add_or_update_topic(
            company_id=company_id,
            topic=item["type"],
            angle=script_res["hook"],
            relations=[{"topic": company.industry, "type": "industry"}]
        )

        created_items.append({
            "id": content_item.id,
            "title": content_item.title,
            "platform": content_item.platform,
            "type": content_item.type
        })

    log_audit("GENERATE_WEEKLY_STRATEGY", "agent", f"Generated strategy for week {week}", db)
    return {
        "weekly_strategy": strat_res["weekly_strategy"],
        "calendar": created_items
    }


# --- Calendar endpoints ---
@app.get("/api/content/calendar/{company_id}")
async def get_calendar(company_id: int, db: Session = Depends(get_db)):
    items = db.query(db_models.ContentItem).filter(db_models.ContentItem.company_id == company_id).all()
    calendar_data = []
    for item in items:
        script = db.query(db_models.Script).filter(db_models.Script.content_item_id == item.id).first()
        video = db.query(db_models.VideoAsset).filter(db_models.VideoAsset.content_item_id == item.id).first()
        
        calendar_data.append({
            "id": item.id,
            "title": item.title,
            "type": item.type,
            "platform": item.platform,
            "status": item.status,
            "scheduled_time": item.scheduled_time.isoformat() if item.scheduled_time else None,
            "script": {
                "id": script.id if script else None,
                "text": script.script_text if script else "",
                "caption": script.caption if script else "",
                "hashtags": script.hashtags if script else []
            } if script else None,
            "video": {
                "video_url": video.video_url if video else "",
                "storyboard": video.storyboard if video else []
            } if video else None
        })
    return calendar_data


# --- Approvals Center ---
@app.put("/api/content/script/{content_item_id}")
async def update_script(content_item_id: int, data: ScriptEditSchema, db: Session = Depends(get_db)):
    script_obj = db.query(db_models.Script).filter(db_models.Script.content_item_id == content_item_id).first()
    if not script_obj:
        raise HTTPException(status_code=404, detail="Script not found")

    script_obj.script_text = data.script_text
    script_obj.caption = data.caption
    script_obj.hashtags = data.hashtags
    db.commit()

    log_audit("UPDATE_SCRIPT", "admin", f"Updated script for ContentItem {content_item_id}", db)
    return {"status": "success", "detail": "Script updated successfully."}

@app.post("/api/content/approve/{content_item_id}")
async def approve_content(content_item_id: int, approval: ApprovalSchema, db: Session = Depends(get_db)):
    item = db.query(db_models.ContentItem).filter(db_models.ContentItem.id == content_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")

    approval_agent = ApprovalAgent()
    if approval.status == "APPROVED":
        approval_agent.approve(item)
        db.commit()

        # Trigger Publishing Agent automatically
        publisher = PublishingAgent()
        publish_log = publisher.publish_content(item)
        db.commit()
        log_audit("PUBLISH_CONTENT", "agent", f"Published content ID {content_item_id} to {item.platform}", db)
        return {"status": "PUBLISHED", "log": publish_log}
    else:
        approval_agent.reject(item)
        db.commit()
        log_audit("REJECT_CONTENT", "admin", f"Rejected content ID {content_item_id}", db)
        return {"status": "REJECTED"}


# --- Step 6: Video Rendering Endpoint ---
@app.post("/api/video/render/{content_item_id}")
async def render_video(content_item_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    item = db.query(db_models.ContentItem).filter(db_models.ContentItem.id == content_item_id).first()
    script = db.query(db_models.Script).filter(db_models.Script.content_item_id == content_item_id).first()
    video_asset = db.query(db_models.VideoAsset).filter(db_models.VideoAsset.content_item_id == content_item_id).first()
    
    if not item or not script or not video_asset:
        raise HTTPException(status_code=404, detail="Video configuration elements missing.")

    renderer = VideoRendererService()

    # Step-by-step resolution of actual assets
    resolved_storyboard = []
    for scene in (video_asset.storyboard or []):
        # Fetch stock video URL based on scene keyword search
        media_url = await renderer.fetch_stock_media(scene.get("stock_search_query", "business"), "video")
        resolved_storyboard.append({
            "scene_index": scene.get("scene_index"),
            "visual_url": media_url,
            "text_overlay": scene.get("text_overlay"),
            "duration": scene.get("duration", 5)
        })

    # Fetch voiceover from ElevenLabs or local fallback
    voiceover_url = await renderer.generate_voiceover(script.script_text, script.voice_gender)
    
    # Calculate word captions timings
    total_duration = sum(s.get("duration", 5) for s in resolved_storyboard)
    subtitles = renderer.calculate_captions(script.script_text, total_duration)

    # Save details to database
    video_asset.storyboard = resolved_storyboard
    video_asset.voiceover_url = voiceover_url
    db.commit()

    # Trigger async compile command (via subprocess wrapper in background_tasks)
    remotion_config = {
        "storyboard": resolved_storyboard,
        "voiceover_url": voiceover_url,
        "subtitles": subtitles,
        "duration": total_duration,
        "ratio": "9:16" if item.platform in ["Instagram", "YouTube Shorts"] else "16:9"
    }

    # Save temporary JSON config file
    config_dir = "frontend/public/configs"
    os.makedirs(config_dir, exist_ok=True)
    config_path = f"{config_dir}/config_{content_item_id}.json"
    with open(config_path, "w") as f:
        json.dump(remotion_config, f, indent=2)

    output_dir = "frontend/public/renders"
    os.makedirs(output_dir, exist_ok=True)
    output_path = f"{output_dir}/render_{content_item_id}.mp4"

    # Queue background compile task
    async def render_task():
        success = await renderer.compile_remotion_video(config_path, output_path)
        if success:
            logger.info(f"Render output created: {output_path}")

    background_tasks.add_task(render_task)

    return {
        "status": "RENDERING",
        "voiceover_url": voiceover_url,
        "storyboard": resolved_storyboard,
        "rendered_video_url": f"/renders/render_{content_item_id}.mp4"
    }


# --- Analytics & Memory Graph ---
@app.get("/api/analytics/{company_id}")
async def get_analytics(company_id: int, db: Session = Depends(get_db)):
    items = db.query(db_models.ContentItem).filter(
        db_models.ContentItem.company_id == company_id,
        db_models.ContentItem.status == "PUBLISHED"
    ).all()

    # Populate dummy metrics if database is empty
    analytics_agent = AnalyticsAgent()
    records = []
    for item in items:
        # Check if record exists, else generate
        existing = db.query(db_models.AnalyticsRecord).filter(db_models.AnalyticsRecord.content_item_id == item.id).first()
        if not existing:
            metrics = analytics_agent.fetch_metrics(item.id, item.platform)
            existing = db_models.AnalyticsRecord(
                content_item_id=item.id,
                platform=item.platform,
                views=metrics["views"],
                likes=metrics["likes"],
                comments=metrics["comments"],
                shares=metrics["shares"],
                ctr=metrics["ctr"],
                watch_time=metrics["watch_time"]
            )
            db.add(existing)
            db.commit()
        records.append(existing)

    learning_agent = LearningAgent()
    learn_insights = learning_agent.analyze_performance(records)
    retention_curve = analytics_agent.generate_retention_curve(duration=65.0)

    return {
        "records": [
            {
                "id": r.id,
                "title": r.content_item.title,
                "platform": r.platform,
                "views": r.views,
                "likes": r.likes,
                "comments": r.comments,
                "shares": r.shares,
                "ctr": r.ctr,
                "watch_time": r.watch_time
            } for r in records
        ],
        "insights": learn_insights,
        "retention_curve": retention_curve,
        "editing_benchmarks": learning_agent.get_editing_style_benchmark()
    }


@app.get("/api/memory/graph/{company_id}")
async def get_memory_graph(company_id: int, db: Session = Depends(get_db)):
    memory_sys = ContentMemorySystem(db)
    # Re-calculate engagement scores
    memory_sys.update_engagement_scores(company_id)
    return memory_sys.fetch_knowledge_graph(company_id)


# --- Hybrid Video Creation & AI Editing Endpoints ---

class SuggestionUpdateSchema(BaseModel):
    status: str  # "ACCEPTED" or "REJECTED"

class PlanRequestSchema(BaseModel):
    platform: Optional[str] = "Instagram Reels"
    preferred_style: Optional[str] = "HYBRID"

class RenderRequestSchema(BaseModel):
    platform: Optional[str] = "Instagram Reels"
    aspect_ratio: Optional[str] = "9:16"


def process_hybrid_video_background(video_id: int):
    """
    Background worker that runs the full video analysis and hybrid editing pipeline.
    Updates processing stages in database for real-time frontend polling.
    """
    db = SessionLocal()
    try:
        video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
        if not video:
            return

        company = db.query(db_models.Company).filter(db_models.Company.id == video.company_id).first()
        company_info = {
            "company_name": company.company_name if company else "FounderOS",
            "industry": company.industry if company else "SaaS",
            "brand_voice": company.brand_voice if company else "Authoritative & Energetic"
        }

        # Stage 1: Audio Extraction & Speech Recognition
        video.status = "ANALYZING"
        video.processing_stage = "Extracting audio track & transcribing speech..."
        video.processing_progress = 30
        db.commit()

        analysis_service = VideoAnalysisService()
        analysis_res = analysis_service.execute_full_pipeline(
            file_path=video.original_file,
            filename=video.filename,
            file_size=video.file_size,
            company_info=company_info
        )

        # Stage 2: Scene Detection & Highlights
        video.processing_stage = "Detecting scenes, hook quality & highlight moments..."
        video.processing_progress = 60
        video.duration = analysis_res["metadata"]["duration"]
        video.resolution = analysis_res["metadata"]["resolution"]
        video.aspect_ratio = analysis_res["metadata"]["aspect_ratio"]
        db.commit()

        # Save Transcripts to DB
        transcript_data = analysis_res["transcription"]
        v_transcript = db_models.VideoTranscript(
            video_id=video.id,
            text=transcript_data["full_transcript"],
            start_time=0.0,
            end_time=video.duration,
            confidence=transcript_data.get("confidence", 0.96),
            words_json=transcript_data.get("words", [])
        )
        db.add(v_transcript)

        # Save Segments to DB
        for seg in analysis_res["segments"]:
            v_seg = db_models.VideoSegment(
                video_id=video.id,
                start_time=seg["start"],
                end_time=seg["end"],
                segment_type=seg["type"],
                importance_score=seg.get("importance", 0.85),
                keep=seg.get("keep", True),
                suggested_action=seg.get("suggested_action", "ORIGINAL"),
                broll_query=seg.get("broll_query"),
                text_overlay=seg.get("text_overlay")
            )
            db.add(v_seg)

        # Save Suggestions to DB
        for sug in analysis_res["suggestions"]:
            v_edit = db_models.VideoEdit(
                video_id=video.id,
                edit_type=sug["type"],
                start_time=sug["start"],
                end_time=sug["end"],
                description=sug["description"],
                status=sug.get("status", "SUGGESTED"),
                configuration=sug
            )
            db.add(v_edit)

        db.commit()

        # Stage 3: Planning B-Roll & Hybrid Timeline
        video.processing_stage = "Matching semantic B-roll & generating timeline..."
        video.processing_progress = 85
        db.commit()

        import asyncio
        editing_agent = HybridEditingAgent()
        timeline_plan = asyncio.run(editing_agent.generate_hybrid_editing_plan(
            analysis_data=analysis_res,
            company_profile=company_info,
            platform="Instagram Reels"
        ))

        # Save Master VideoRender entry
        render_entry = db_models.VideoRender(
            video_id=video.id,
            render_type="MASTER",
            aspect_ratio="9:16",
            output_url=f"/renders/hybrid_master_{video.id}.mp4",
            status="READY",
            composition_data=timeline_plan,
            provenance=timeline_plan.get("provenance", {})
        )
        db.add(render_entry)

        # Stage 4: Ready for Studio Review
        video.status = "READY"
        video.processing_stage = "Analysis complete · Ready in Studio"
        video.processing_progress = 100
        db.commit()

        log_audit("ANALYZE_HYBRID_VIDEO", "agent", f"Completed analysis and timeline for video ID {video.id}", db)

    except Exception as e:
        logger.error(f"Error processing hybrid video in background: {e}", exc_info=True)
        try:
            video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
            if video:
                video.status = "FAILED"
                video.processing_stage = f"Error: {str(e)}"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@app.post("/api/hybrid/upload")
async def upload_raw_video(
    background_tasks: BackgroundTasks,
    company_id: int = Form(1),
    mode: str = Form("HYBRID"),
    file: Optional[UploadFile] = File(None),
    sample_mode: Optional[bool] = Form(False),
    db: Session = Depends(get_db)
):
    upload_dir = "frontend/public/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    if file and file.filename:
        filename = file.filename
        clean_name = os.path.basename(filename).replace(" ", "_")
        target_path = os.path.join(upload_dir, f"{int(datetime.datetime.utcnow().timestamp())}_{clean_name}")
        
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(target_path)
        file_url = f"/uploads/{os.path.basename(target_path)}"
    else:
        # Sample mode or fallback
        filename = "founder_product_explanation.mp4"
        file_size = 14500000
        file_url = "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4"
        target_path = file_url

    # Create UploadedVideo record
    uploaded_video = db_models.UploadedVideo(
        company_id=company_id,
        original_file=file_url,
        filename=filename,
        duration=68.0,
        resolution="1080x1920",
        aspect_ratio="9:16",
        file_size=file_size,
        mode=mode,
        status="ANALYZING",
        processing_stage="Extracting audio track...",
        processing_progress=20
    )
    db.add(uploaded_video)
    db.commit()
    db.refresh(uploaded_video)

    # Trigger async background job
    background_tasks.add_task(process_hybrid_video_background, uploaded_video.id)

    log_audit("UPLOAD_VIDEO", "user", f"Uploaded video {filename} for analysis", db)

    return {
        "video_id": uploaded_video.id,
        "filename": filename,
        "status": uploaded_video.status,
        "processing_stage": uploaded_video.processing_stage,
        "file_url": file_url,
        "created_at": uploaded_video.created_at.isoformat()
    }


@app.get("/api/hybrid/status/{video_id}")
async def get_hybrid_video_status(video_id: int, db: Session = Depends(get_db)):
    video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    checklist = [
        {"stage": "Uploaded", "completed": True},
        {"stage": "Extracting audio", "completed": video.processing_progress >= 30},
        {"stage": "Transcribing speech", "completed": video.processing_progress >= 45},
        {"stage": "Detecting scenes & pauses", "completed": video.processing_progress >= 60},
        {"stage": "Finding highlights & hooks", "completed": video.processing_progress >= 75},
        {"stage": "Planning semantic B-roll", "completed": video.processing_progress >= 90},
        {"stage": "Ready in Studio", "completed": video.status == "READY"}
    ]

    return {
        "video_id": video.id,
        "filename": video.filename,
        "status": video.status,
        "stage": video.processing_stage,
        "progress": video.processing_progress,
        "checklist": checklist,
        "duration": video.duration,
        "aspect_ratio": video.aspect_ratio
    }


@app.get("/api/hybrid/analysis/{video_id}")
async def get_hybrid_analysis(video_id: int, db: Session = Depends(get_db)):
    video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    transcript = db.query(db_models.VideoTranscript).filter(db_models.VideoTranscript.video_id == video.id).first()
    segments = db.query(db_models.VideoSegment).filter(db_models.VideoSegment.video_id == video.id).all()
    edits = db.query(db_models.VideoEdit).filter(db_models.VideoEdit.video_id == video.id).all()
    render = db.query(db_models.VideoRender).filter(db_models.VideoRender.video_id == video.id).first()

    analysis_service = VideoAnalysisService()
    formatted_segments = [
        {
            "id": s.id,
            "start": s.start_time,
            "end": s.end_time,
            "duration": round(s.end_time - s.start_time, 1),
            "type": s.segment_type,
            "importance": s.importance_score,
            "keep": s.keep,
            "suggested_action": s.suggested_action,
            "broll_query": s.broll_query,
            "text_overlay": s.text_overlay
        } for s in segments
    ]

    hook_analysis = analysis_service.analyze_hooks_and_recommend(formatted_segments)
    repurposed_clips = analysis_service.repurpose_into_multi_clips(
        transcript.text if transcript else "", formatted_segments
    )

    return {
        "video_id": video.id,
        "filename": video.filename,
        "original_file": video.original_file,
        "metadata": {
            "duration": video.duration,
            "resolution": video.resolution,
            "aspect_ratio": video.aspect_ratio,
            "file_size": video.file_size
        },
        "transcript": {
            "text": transcript.text if transcript else "",
            "confidence": transcript.confidence if transcript else 0.95,
            "words": transcript.words_json if transcript else []
        },
        "segments": formatted_segments,
        "suggestions": [
            {
                "id": e.id,
                "type": e.edit_type,
                "start": e.start_time,
                "end": e.end_time,
                "description": e.description,
                "status": e.status,
                "configuration": e.configuration
            } for e in edits
        ],
        "hook_analysis": hook_analysis,
        "repurposed_clips": repurposed_clips,
        "provenance": render.provenance if render else {
            "original_footage_pct": 68,
            "stock_broll_pct": 18,
            "ai_graphics_pct": 9,
            "ai_generated_pct": 5
        },
        "timeline_plan": render.composition_data if render else {}
    }


@app.put("/api/hybrid/suggestion/{edit_id}")
async def update_hybrid_suggestion(edit_id: int, payload: SuggestionUpdateSchema, db: Session = Depends(get_db)):
    edit = db.query(db_models.VideoEdit).filter(db_models.VideoEdit.id == edit_id).first()
    if not edit:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    edit.status = payload.status
    db.commit()

    log_audit("UPDATE_SUGGESTION", "user", f"Updated suggestion ID {edit_id} to {payload.status}", db)
    return {"status": "SUCCESS", "edit_id": edit_id, "new_status": edit.status}


@app.post("/api/hybrid/plan/{video_id}")
async def generate_or_update_plan(video_id: int, plan_req: PlanRequestSchema, db: Session = Depends(get_db)):
    video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    company = db.query(db_models.Company).filter(db_models.Company.id == video.company_id).first()
    company_info = {
        "company_name": company.company_name if company else "FounderOS",
        "industry": company.industry if company else "SaaS",
        "brand_voice": company.brand_voice if company else "Authoritative"
    }

    transcript = db.query(db_models.VideoTranscript).filter(db_models.VideoTranscript.video_id == video.id).first()
    segments = db.query(db_models.VideoSegment).filter(db_models.VideoSegment.video_id == video.id).all()
    edits = db.query(db_models.VideoEdit).filter(db_models.VideoEdit.video_id == video.id).all()

    analysis_data = {
        "metadata": {"duration": video.duration, "aspect_ratio": video.aspect_ratio},
        "segments": [
            {
                "start": s.start_time, "end": s.end_time, "type": s.segment_type,
                "importance": s.importance_score, "keep": s.keep,
                "suggested_action": s.suggested_action, "broll_query": s.broll_query,
                "text_overlay": s.text_overlay
            } for s in segments
        ],
        "transcription": {
            "full_transcript": transcript.text if transcript else "",
            "words": transcript.words_json if transcript else []
        },
        "suggestions": [{"type": e.edit_type, "status": e.status} for e in edits]
    }

    import asyncio
    editing_agent = HybridEditingAgent()
    timeline_plan = await editing_agent.generate_hybrid_editing_plan(
        analysis_data=analysis_data,
        company_profile=company_info,
        platform=plan_req.platform or "Instagram Reels"
    )

    # Update or create VideoRender
    render = db.query(db_models.VideoRender).filter(db_models.VideoRender.video_id == video.id).first()
    if not render:
        render = db_models.VideoRender(
            video_id=video.id,
            render_type="MASTER",
            aspect_ratio="9:16",
            output_url=f"/renders/hybrid_master_{video.id}.mp4",
            status="READY",
            composition_data=timeline_plan,
            provenance=timeline_plan["provenance"]
        )
        db.add(render)
    else:
        render.composition_data = timeline_plan
        render.provenance = timeline_plan["provenance"]
    
    db.commit()
    return timeline_plan


@app.post("/api/hybrid/render/{video_id}")
async def render_hybrid_video(
    video_id: int,
    render_req: RenderRequestSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    render = db.query(db_models.VideoRender).filter(db_models.VideoRender.video_id == video.id).first()
    if not render or not render.composition_data:
        raise HTTPException(status_code=400, detail="Editing timeline not generated yet")

    config_dir = "frontend/public/configs"
    os.makedirs(config_dir, exist_ok=True)
    config_path = f"{config_dir}/hybrid_config_{video.id}.json"
    
    comp_data = dict(render.composition_data)
    comp_data["original_video_url"] = video.original_file
    
    with open(config_path, "w") as f:
        json.dump(comp_data, f, indent=2)

    output_dir = "frontend/public/renders"
    os.makedirs(output_dir, exist_ok=True)
    output_path = f"{output_dir}/hybrid_render_{video.id}.mp4"

    renderer = VideoRendererService()
    
    async def run_render():
        await renderer.compile_hybrid_remotion_video(config_path, output_path, "Hybrid")

    background_tasks.add_task(run_render)

    render.output_url = f"/renders/hybrid_render_{video.id}.mp4"
    render.status = "COMPLETED"
    db.commit()

    return {
        "status": "COMPLETED",
        "video_id": video.id,
        "render_url": render.output_url,
        "aspect_ratio": render_req.aspect_ratio or "9:16",
        "platform": render_req.platform or "Instagram Reels",
        "provenance": render.provenance,
        "composition_data": comp_data
    }


@app.post("/api/hybrid/submit-approval/{video_id}")
async def submit_hybrid_for_approval(video_id: int, db: Session = Depends(get_db)):
    video = db.query(db_models.UploadedVideo).filter(db_models.UploadedVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    transcript = db.query(db_models.VideoTranscript).filter(db_models.VideoTranscript.video_id == video.id).first()
    render = db.query(db_models.VideoRender).filter(db_models.VideoRender.video_id == video.id).first()

    # Create or update ContentItem for the Human Approval queue
    title = f"Hybrid Founder Video — {video.filename.replace('.mp4', '').replace('_', ' ').title()}"
    content_item = db_models.ContentItem(
        company_id=video.company_id,
        type="Hybrid Video (Founder + AI)",
        platform="Instagram",
        status="PENDING_APPROVAL",
        scheduled_time=datetime.datetime.utcnow() + datetime.timedelta(days=1),
        title=title
    )
    db.add(content_item)
    db.commit()
    db.refresh(content_item)

    # Attach script
    hook_text = "Most SaaS founders lose over 60% of users right after sign-up."
    script_obj = db_models.Script(
        content_item_id=content_item.id,
        script_text=transcript.text if transcript else "Founder authentic explanation augmented with B-roll.",
        hook=hook_text,
        problem="Onboarding drop-offs bleed ad spend without notice.",
        solution="Automated AI onboarding workflow cuts time to value by 80%.",
        cta="Comment Playbook below or tap the link in bio for the free blueprint.",
        caption="Stop scaling brute-force. How we fixed step-2 onboarding churn and grew retention 40%. 👇",
        hashtags=["FounderLife", "SaaSGrowth", "HybridVideo", "FounderOS"],
        duration=int(video.duration or 65),
        voice_gender="BRAND"
    )
    db.add(script_obj)

    # Attach VideoAsset for backward-compatibility in existing approval cards
    storyboard = []
    if render and render.composition_data:
        tracks = render.composition_data.get("tracks", {})
        for b in tracks.get("broll", []):
            storyboard.append({
                "scene_index": len(storyboard) + 1,
                "visual_url": b.get("url", ""),
                "text_overlay": b.get("text_overlay", "Supporting B-Roll"),
                "duration": b.get("duration", 5)
            })

    video_asset = db_models.VideoAsset(
        content_item_id=content_item.id,
        video_url=render.output_url if render else video.original_file,
        storyboard=storyboard,
        voiceover_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    )
    db.add(video_asset)

    if render:
        render.content_item_id = content_item.id
    
    db.commit()
    log_audit("SUBMIT_HYBRID_APPROVAL", "user", f"Submitted hybrid video {video_id} to Approval Hub as ContentItem {content_item.id}", db)

    return {
        "status": "SUBMITTED",
        "content_item_id": content_item.id,
        "title": content_item.title,
        "provenance": render.provenance if render else {}
    }


# --- Webhooks Simulator ---
@app.post("/api/webhooks/social")
async def social_webhook_receiver(payload: dict, db: Session = Depends(get_db)):
    # Simulates external platform interactions calling back
    post_id = payload.get("post_id")
    event = payload.get("event") # e.g. "click" or "like"
    
    log_audit("WEBHOOK_RECEIVE", "external", f"Received event '{event}' for post {post_id}", db)
    return {"status": "accepted"}


# --- Strawberry GraphQL Integration ---
@strawberry.type
class CompanyType:
    id: int
    company_name: str
    industry: str
    brand_voice: str
    website: str

@strawberry.type
class Query:
    @strawberry.field
    def get_company(self, company_id: int) -> Optional[CompanyType]:
        db = SessionLocal()
        company = db.query(db_models.Company).filter(db_models.Company.id == company_id).first()
        db.close()
        if company:
            return CompanyType(
                id=company.id,
                company_name=company.company_name,
                industry=company.industry,
                brand_voice=company.brand_voice,
                website=company.website
            )
        return None

schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")
