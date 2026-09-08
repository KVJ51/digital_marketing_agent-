import os
import datetime
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Security, BackgroundTasks
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
from backend.app.services.memory_service import ContentMemorySystem
from backend.app.services.video_renderer import VideoRendererService

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
        "insights": learn_insights
    }

@app.get("/api/memory/graph/{company_id}")
async def get_memory_graph(company_id: int, db: Session = Depends(get_db)):
    memory_sys = ContentMemorySystem(db)
    # Re-calculate engagement scores
    memory_sys.update_engagement_scores(company_id)
    return memory_sys.fetch_knowledge_graph(company_id)


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
