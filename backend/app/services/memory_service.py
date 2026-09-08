import datetime
from sqlalchemy.orm import Session
from backend.app.models.models import ContentMemory, AnalyticsRecord, ContentItem

class ContentMemorySystem:
    def __init__(self, db: Session):
        self.db = db

    def add_or_update_topic(self, company_id: int, topic: str, angle: str, relations: list = None) -> ContentMemory:
        """
        Record a new post topic or update an existing topic's usage metrics in memory.
        """
        if relations is None:
            relations = []

        existing_node = self.db.query(ContentMemory).filter(
            ContentMemory.company_id == company_id,
            ContentMemory.topic == topic
        ).first()

        if existing_node:
            existing_node.times_posted += 1
            existing_node.last_posted_at = datetime.datetime.utcnow()
            # Merge relations without duplicates
            current_rels = existing_node.relations or []
            for r in relations:
                if r not in current_rels:
                    current_rels.append(r)
            existing_node.relations = current_rels
            self.db.commit()
            self.db.refresh(existing_node)
            return existing_node
        else:
            new_node = ContentMemory(
                company_id=company_id,
                topic=topic,
                angle=angle,
                times_posted=1,
                last_posted_at=datetime.datetime.utcnow(),
                relations=relations,
                engagement_score=0.0
            )
            self.db.add(new_node)
            self.db.commit()
            self.db.refresh(new_node)
            return new_node

    def update_engagement_scores(self, company_id: int):
        """
        Scan all content items and aggregate analytics metrics to assign
        an engagement score to each topic.
        """
        # Fetch memory nodes
        nodes = self.db.query(ContentMemory).filter(ContentMemory.company_id == company_id).all()
        for node in nodes:
            # Find all matching content items with analytics
            items = self.db.query(ContentItem).filter(
                ContentItem.company_id == company_id,
                ContentItem.title.like(f"%{node.topic}%")
            ).all()

            if not items:
                continue

            total_score = 0.0
            count = 0
            for item in items:
                records = self.db.query(AnalyticsRecord).filter(AnalyticsRecord.content_item_id == item.id).all()
                for record in records:
                    # Score weight calculation: views (1x), likes (10x), comments (50x), shares (100x)
                    score = (record.views * 0.1) + (record.likes * 1.0) + (record.comments * 5.0) + (record.shares * 10.0)
                    total_score += score
                    count += 1
            
            if count > 0:
                node.engagement_score = round(total_score / count, 2)
        
        self.db.commit()

    def get_novel_angles(self, company_id: int, base_topic: str) -> list:
        """
        Checks what angles have already been used for a topic, and proposes new,
        unexplored angles automatically.
        """
        nodes = self.db.query(ContentMemory).filter(
            ContentMemory.company_id == company_id,
            ContentMemory.topic == base_topic
        ).all()

        used_angles = {n.angle for n in nodes}
        
        all_possible_angles = [
            "Behind the Scenes / Day in the Life",
            "Deep Technical How-To Guide",
            "Controversial / Unpopular Opinion",
            "Stat-Driven Case Study",
            "Beginner Crash Course",
            "Mistakes to Avoid / Common Pitfalls",
            "Future Predictions / 5 Years Out"
        ]

        novel_angles = [angle for angle in all_possible_angles if angle not in used_angles]
        return novel_angles if novel_angles else all_possible_angles

    def fetch_knowledge_graph(self, company_id: int) -> dict:
        """
        Returns a graph dictionary (nodes and links) for displaying the long-term
        marketing knowledge memory graph in the frontend.
        """
        nodes = self.db.query(ContentMemory).filter(ContentMemory.company_id == company_id).all()
        
        graph_nodes = []
        graph_links = []

        # Track seen to avoid duplicates
        seen_topics = set()

        for node in nodes:
            if node.topic not in seen_topics:
                graph_nodes.append({
                    "id": node.topic,
                    "group": 1,
                    "size": min(10 + node.times_posted * 5, 40),
                    "engagement": node.engagement_score,
                    "times_posted": node.times_posted
                })
                seen_topics.add(node.topic)

            for rel in (node.relations or []):
                rel_topic = rel.get("topic")
                rel_type = rel.get("type", "related")
                
                if rel_topic not in seen_topics:
                    graph_nodes.append({
                        "id": rel_topic,
                        "group": 2,
                        "size": 10,
                        "engagement": 0.0,
                        "times_posted": 0
                    })
                    seen_topics.add(rel_topic)

                graph_links.append({
                    "source": node.topic,
                    "target": rel_topic,
                    "type": rel_type
                })

        return {"nodes": graph_nodes, "links": graph_links}
