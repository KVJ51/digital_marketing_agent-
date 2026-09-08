import random
import datetime
import json
from backend.app.agents.base import BaseAgent

# 1. Business Analysis Agent
class BusinessAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Business Analysis Agent",
            role_prompt=(
                "You are an expert SaaS business consultant. Your task is to analyze company details, "
                "industry segment, target audience, products, and features to construct a cohesive "
                "business profile, audience profile, and identify core marketing opportunities."
            )
        )

    def analyze(self, company_data: dict) -> dict:
        prompt = f"Analyze this company configuration:\n{json.dumps(company_data, indent=2)}"
        schema = {
            "type": "object",
            "properties": {
                "business_summary": {"type": "string"},
                "audience_summary": {"type": "string"},
                "opportunities": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            },
            "required": ["business_summary", "audience_summary", "opportunities"]
        }
        return self.generate_json_response(prompt, schema)

    def _generate_fallback(self, user_prompt: str) -> dict:
        try:
            data = json.loads(user_prompt.split(":\n")[1])
        except Exception:
            data = {
                "company_name": "SaaS Startup",
                "industry": "Tech",
                "target_audience": "Professionals",
                "products": ["Software"],
                "features": ["Automation"]
            }

        name = data.get("company_name", "the company")
        industry = data.get("industry", "tech industry")
        audience = data.get("target_audience", "B2B professionals")
        products = ", ".join(data.get("products", ["solutions"]))
        features = ", ".join(data.get("features", ["high performance"]))

        return {
            "business_summary": f"{name} is a leading innovator in the {industry} sector, delivering robust products such as {products} that focus on {features}.",
            "audience_summary": f"Primarily targets {audience} who need to streamline operations, cut costs, and improve productivity.",
            "opportunities": [
                f"Highlight the automation of {features} to attract busy {audience}.",
                f"Position {name} as a thought leader in {industry} through data-driven case studies.",
                f"Leverage video product demos showing {products} resolving core client pain points."
            ]
        }


# 2. Marketing Strategy Agent
class MarketingStrategyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Marketing Strategy Agent",
            role_prompt=(
                "You are a Chief Marketing Officer. Your task is to look at the business profile, marketing summaries, "
                "and current topic memory to plan a high-impact marketing strategy with themes and campaigns."
            )
        )

    def generate_strategy(self, company_name: str, profile: dict, memory_topics: list, week: int) -> dict:
        prompt = (
            f"Company: {company_name}\n"
            f"Marketing Profile: {json.dumps(profile)}\n"
            f"Already published / remembered topics: {json.dumps(memory_topics)}\n"
            f"Week number: {week}\n"
            "Create a strategy outlining campaigns and themes for this week."
        )
        schema = {
            "type": "object",
            "properties": {
                "weekly_strategy": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "theme": {"type": "string"},
                            "focus": {"type": "string"},
                            "description": {"type": "string"}
                        },
                        "required": ["theme", "focus", "description"]
                    }
                }
            },
            "required": ["weekly_strategy"]
        }
        return self.generate_json_response(prompt, schema)

    def _generate_fallback(self, user_prompt: str) -> dict:
        # Default strategy elements
        themes = [
            {"theme": "The Founder's Journey", "focus": "Brand trust and relatability", "description": "Share the core challenges, vision, and lightbulb moments that led to creating the company."},
            {"theme": "Product Capability Deep Dive", "focus": "Product education & utility value", "description": "Highlight a single product feature and demonstrate its immediate impact on time savings."},
            {"theme": "Industry Trends & Future-Proofing", "focus": "Thought leadership and credibility", "description": "Examine current shifts in the sector and offer actionable advice on how organizations can prepare."}
        ]
        return {"weekly_strategy": themes}


# 3. Content Planner Agent
class ContentPlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Content Planner Agent",
            role_prompt=(
                "You are a Content Director. Your job is to translate a marketing strategy into a structured "
                "calendar scheduling post types (Founder Story, Product Demo, Industry Insight) across different "
                "platforms (LinkedIn, Instagram, Facebook, X, YouTube Shorts)."
            )
        )

    def create_calendar(self, weekly_strategy: list) -> dict:
        prompt = f"Strategy elements: {json.dumps(weekly_strategy)}\nGenerate a 5-day content calendar."
        schema = {
            "type": "object",
            "properties": {
                "calendar": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "day": {"type": "string"},
                            "type": {"type": "string"},
                            "platform": {"type": "string"},
                            "title": {"type": "string"}
                        },
                        "required": ["day", "type", "platform", "title"]
                    }
                }
            },
            "required": ["calendar"]
        }
        return self.generate_json_response(prompt, schema)

    def _generate_fallback(self, user_prompt: str) -> dict:
        # Simple weekly calendar list
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        types = ["Founder Story", "Product Demo", "Industry Insight", "Tips & Tricks", "Customer Success Story"]
        platforms = ["LinkedIn", "Instagram", "Facebook", "X", "YouTube Shorts"]
        
        calendar = []
        for i in range(5):
            calendar.append({
                "day": days[i],
                "type": types[i],
                "platform": platforms[i],
                "title": f"Unlocking Growth: 5 Secrets of successful modern scaling ({types[i]} format)"
            })
        return {"calendar": calendar}


# 4. Script Writer Agent
class ScriptWriterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Script Writer Agent",
            role_prompt=(
                "You are a high-converting Video Copywriter. Generate video scripts that are engaging, "
                "following a strict layout: Hook, Problem, Solution, CTA. Provide caption, hashtags, and timing specs."
            )
        )

    def write_script(self, content_type: str, platform: str, title: str, brand_voice: str) -> dict:
        prompt = (
            f"Content Type: {content_type}\n"
            f"Platform: {platform}\n"
            f"Title: {title}\n"
            f"Brand Voice: {brand_voice}\n"
            "Create the copy, captions, hook, problem, solution, and Call to Action (CTA)."
        )
        schema = {
            "type": "object",
            "properties": {
                "hook": {"type": "string"},
                "problem": {"type": "string"},
                "solution": {"type": "string"},
                "cta": {"type": "string"},
                "script": {"type": "string"},
                "caption": {"type": "string"},
                "hashtags": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "duration": {"type": "integer"},
                "voice_gender": {"type": "string"}
            },
            "required": ["hook", "problem", "solution", "cta", "script", "caption", "hashtags", "duration", "voice_gender"]
        }
        return self.generate_json_response(prompt, schema)

    def _generate_fallback(self, user_prompt: str) -> dict:
        # Generate dynamic scripts
        hook = "Stop wasting hours on manual tasks that can be automated in seconds."
        problem = "Every business owner reaches a limit. You want to scale, but manual workflows are keeping you bogged down in micro-details."
        solution = "With automated systems, your core operations run 24/7 without needing your constant attention, saving over 15 hours every single week."
        cta = "Go to our link to copy our automation handbook for free!"
        
        script = f"[HOOK] {hook} [PROBLEM] {problem} [SOLUTION] {solution} [CTA] {cta}"
        
        return {
            "hook": hook,
            "problem": problem,
            "solution": solution,
            "cta": cta,
            "script": script,
            "caption": "The number one bottleneck in your business isn't talent, it's outdated workflows. Here is how we fixed it. 👇",
            "hashtags": ["Productivity", "Automation", "FounderLife", "StartupGrowth", "MarketingAgent"],
            "duration": 60,
            "voice_gender": "FEMALE"
        }


# 5. Video Generation Agent
class VideoGenerationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Video Generation Agent",
            role_prompt=(
                "You are an AI Video Director. Create detailed storyboards with scenes matching scripts. "
                "Provide visual prompts, keyword queries for stock media, text overlays, and segment times."
            )
        )

    def generate_storyboard(self, script_data: dict) -> dict:
        prompt = f"Script details: {json.dumps(script_data)}\nGenerate a detailed storyboard with at least 4 scenes."
        schema = {
            "type": "object",
            "properties": {
                "video_url": {"type": "string"},
                "storyboard": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "scene_index": {"type": "integer"},
                            "visual_prompt": {"type": "string"},
                            "stock_search_query": {"type": "string"},
                            "text_overlay": {"type": "string"},
                            "duration": {"type": "integer"}
                        },
                        "required": ["scene_index", "visual_prompt", "stock_search_query", "text_overlay", "duration"]
                    }
                }
            },
            "required": ["video_url", "storyboard"]
        }
        return self.generate_json_response(prompt, schema)

    def _generate_fallback(self, user_prompt: str) -> dict:
        # Create a set of storyboard scenes
        storyboard = [
            {
                "scene_index": 1,
                "visual_prompt": "A busy office worker looking frustrated at a screen full of charts.",
                "stock_search_query": "frustrated office laptop",
                "text_overlay": "Stop wasting hours on manual tasks!",
                "duration": 5
            },
            {
                "scene_index": 2,
                "visual_prompt": "A clock spinning rapidly, representing running out of time.",
                "stock_search_query": "spinning clock time",
                "text_overlay": "Manual workflows hold you back",
                "duration": 5
            },
            {
                "scene_index": 3,
                "visual_prompt": "A modern automation sequence or code running smoothly on a tablet.",
                "stock_search_query": "automation software dashboard",
                "text_overlay": "Automations work 24/7",
                "duration": 5
            },
            {
                "scene_index": 4,
                "visual_prompt": "A smiling young professional celebrating, looking out of a window.",
                "stock_search_query": "happy entrepreneur office",
                "text_overlay": "Get our free automation blueprint now!",
                "duration": 5
            }
        ]
        return {
            "video_url": "/api/video/render-sample",
            "storyboard": storyboard
        }


# 6. Approval Agent
class ApprovalAgent:
    def approve(self, content_item) -> str:
        content_item.status = "APPROVED"
        return "APPROVED"

    def reject(self, content_item) -> str:
        content_item.status = "REJECTED"
        return "REJECTED"

    def update_script(self, script_obj, new_text: str) -> str:
        script_obj.script_text = new_text
        return "UPDATED"


# 7. Publishing Agent
class PublishingAgent:
    def publish_content(self, content_item) -> dict:
        # Simulate publishing to social media APIs
        platform = content_item.platform
        title = content_item.title
        
        # Mocks actual publishing logs
        publish_log = {
            "success": True,
            "platform": platform,
            "post_id": f"pub_{platform.lower()}_{random.randint(100000, 999999)}",
            "published_at": datetime.datetime.utcnow().isoformat(),
            "details": f"Successfully published post '{title}' to {platform}."
        }
        
        content_item.status = "PUBLISHED"
        return publish_log


# 8. Analytics Agent
class AnalyticsAgent:
    def fetch_metrics(self, content_item_id: int, platform: str) -> dict:
        # Simulate engagement metrics
        views = random.randint(1000, 50000)
        likes = int(views * random.uniform(0.02, 0.08))
        comments = int(likes * random.uniform(0.05, 0.15))
        shares = int(likes * random.uniform(0.1, 0.3))
        ctr = round(random.uniform(1.2, 5.8), 2)
        watch_time = round(random.uniform(5.0, 45.0), 1)

        return {
            "views": views,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "ctr": ctr,
            "watch_time": watch_time
        }


# 9. Learning Agent
class LearningAgent:
    def analyze_performance(self, analytics_records: list) -> dict:
        """
        Analyzes performance patterns to learn which formats perform best
        """
        if not analytics_records:
            return {"winning_formats": ["Video demo", "Founder Story"], "improvement_areas": ["Increase Hook length"]}

        # Group by platform/format and extract insights
        total_views = sum(r.views for r in analytics_records)
        avg_ctr = sum(r.ctr for r in analytics_records) / len(analytics_records)

        return {
            "summary": f"Analyzed {len(analytics_records)} posts with total views of {total_views}.",
            "winning_formats": ["Short-form Video Shorts", "B2B Thought Leadership"],
            "insights": [
                "Posts scheduled on Mondays and Wednesdays get 30% higher views.",
                "Hooks mentioning time-savings save 45% more watch time."
            ]
        }
