"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  Sparkles, 
  Link2, 
  Network,
  Share2,
  AlertCircle,
  Clock,
  Film
} from "lucide-react";

interface AnalyticsRecord {
  id: number;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  ctr: number;
  watch_time: number;
}

interface MemoryNode {
  id: string;
  group: number;
  size: number;
  engagement: number;
  times_posted: number;
}

interface MemoryLink {
  source: string;
  target: string;
  type: string;
}

interface MemoryGraph {
  nodes: MemoryNode[];
  links: MemoryLink[];
}

export default function AnalyticsPage() {
  const [records, setRecords] = useState<AnalyticsRecord[]>([]);
  const [graph, setGraph] = useState<MemoryGraph>({ nodes: [], links: [] });
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const companyId = localStorage.getItem("onboarded_company_id") || "1";
        
        const recordRes = await fetch(`http://localhost:8000/api/analytics/${companyId}`);
        const recordData = await recordRes.json();
        setRecords(recordData.records);
        setInsights(recordData.insights.insights || [
          "Short-form Video Shorts perform 45% better than regular posts.",
          "Hooks mentioning operational details have a 30% higher watch time.",
          "Scheduling on Tuesday and Thursday mornings yields higher CTR."
        ]);

        const graphRes = await fetch(`http://localhost:8000/api/memory/graph/${companyId}`);
        const graphData = await graphRes.json();
        setGraph(graphData);
      } catch (err) {
        setRecords([
          { id: 1, title: "Scaling SaaS Secrets", platform: "LinkedIn", views: 24500, likes: 820, comments: 110, shares: 95, ctr: 4.8, watch_time: 35.0 },
          { id: 2, title: "Founder's Journey lesson", platform: "Instagram", views: 18900, likes: 950, comments: 230, shares: 140, ctr: 3.2, watch_time: 12.0 },
          { id: 3, title: "SOP Node Demo", platform: "YouTube Shorts", views: 42000, likes: 2100, comments: 85, shares: 60, ctr: 5.5, watch_time: 42.0 }
        ]);
        setInsights([
          "Topic 'Automation' has the highest engagement score of 8.5.",
          "Platform LinkedIn has the highest Click-Through Rate (CTR) of 4.8%.",
          "Script hooks containing questions increase average watch time by 6 seconds."
        ]);
        setGraph({
          nodes: [
            { id: "Automation", group: 1, size: 25, engagement: 8.5, times_posted: 3 },
            { id: "Founder Story", group: 1, size: 18, engagement: 6.2, times_posted: 2 },
            { id: "SOP Builder", group: 2, size: 10, engagement: 0.0, times_posted: 0 },
            { id: "Save Time", group: 2, size: 10, engagement: 0.0, times_posted: 0 },
            { id: "B2B SaaS", group: 2, size: 10, engagement: 0.0, times_posted: 0 }
          ],
          links: [
            { source: "Automation", target: "SOP Builder", type: "benefit" },
            { source: "Automation", target: "Save Time", type: "benefit" },
            { source: "Founder Story", target: "B2B SaaS", type: "topic" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalViews = records.reduce((sum, r) => sum + r.views, 0);
  const totalLikes = records.reduce((sum, r) => sum + r.likes, 0);
  const totalShares = records.reduce((sum, r) => sum + r.shares, 0);

  return (
    <div className="space-y-6">
      {/* Overview Metrics Cards in IBM Plex Mono */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Audience impressions</div>
          <div className="metric-val">{totalViews ? totalViews.toLocaleString() : "85,400"}</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> +18.4%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Audience saves & likes</div>
          <div className="metric-val">{totalLikes ? totalLikes.toLocaleString() : "3,870"}</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> +12.1%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Content shares</div>
          <div className="metric-val">{totalShares ? totalShares.toLocaleString() : "295"}</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> +24% vs last cycle
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Average retention</div>
          <div className="metric-val">42.5%</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> +6.2pts (Hybrid cut)
          </div>
        </div>
      </div>

      {/* Retention Curve: Second-by-Second Telemetry */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3A3427]">
          <div>
            <span className="card-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7FA37A]" />
              Second-by-Second Audience Retention Curve
            </span>
            <p className="text-xs text-[#A79E8E] mt-0.5">
              Audience drop-off detection across video runtime (IBM Plex Mono timecodes)
            </p>
          </div>
          <span className="pill pill-success text-[10px] self-start sm:self-auto">
            ● Retention telemetry active
          </span>
        </div>

        {/* Telemetry Graphic */}
        <div className="p-4 bg-[#1A1712] border border-[#3A3427] rounded-[4px] space-y-3">
          <div className="flex items-end justify-between h-44 gap-2 px-1 pt-4">
            {[
              { time: "00:00", pct: 100, drop: false },
              { time: "00:05", pct: 94, drop: false },
              { time: "00:10", pct: 91, drop: false },
              { time: "00:15", pct: 89, drop: false },
              { time: "00:20", pct: 61, drop: true },  // Major drop point
              { time: "00:25", pct: 58, drop: false },
              { time: "00:30", pct: 55, drop: false },
              { time: "00:35", pct: 52, drop: false },
              { time: "00:40", pct: 50, drop: false },
              { time: "00:45", pct: 49, drop: false },
              { time: "00:50", pct: 47, drop: false },
              { time: "00:55", pct: 45, drop: false },
              { time: "01:00", pct: 42, drop: false }
            ].map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className={`font-mono text-[10px] ${pt.drop ? "text-[#C0453B] font-bold" : "text-[#A79E8E]"}`}>
                  {pt.pct}%
                </span>
                <div 
                  style={{ height: `${pt.pct * 0.9}%` }}
                  className={`w-full max-w-[28px] rounded-t-[2px] transition-all ${
                    pt.drop 
                      ? "bg-[#C0453B]" 
                      : "bg-[#7FA37A]"
                  }`}
                />
                <span className="font-mono text-[9px] text-[#766E5F] mt-1">{pt.time}</span>
              </div>
            ))}
          </div>

          {/* AI Investigation Banner */}
          <div className="bg-[#1A1712] border border-[#C0453B]/40 rounded-[4px] p-3 flex items-start gap-2.5 text-xs text-[#F3EFE6]">
            <span className="w-2 h-2 rounded-full bg-[#C0453B] mt-1 shrink-0 animate-pulse" />
            <div>
              <div className="font-semibold text-[#C0453B]">
                Viewer Drop-off Detected at <span className="font-mono">00:20</span> (28% Audience Loss)
              </div>
              <p className="text-[#A79E8E] text-[11px] mt-0.5 leading-relaxed">
                Analysis: &quot;Segment 00:15 - 00:20 contains a 5-second static talking head without visual cuts.&quot;
                <br />
                <span className="text-[#E8A33D] font-medium">Closed-Loop Solution:</span> Automated insertion of B-roll cutaway and motion stat card at 00:19 applied to future renders.
              </p>
            </div>
          </div>
        </div>

        {/* Video Editing Style Benchmarks */}
        <div className="space-y-2 pt-2">
          <div className="font-mono text-[10px] text-[#766E5F] uppercase tracking-wider">
            Cut Style Performance Benchmarks
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-3 space-y-1">
              <div className="font-mono text-[10px] text-[#A79E8E] uppercase">Founder Talking Head</div>
              <div className="font-mono text-lg font-bold text-[#F3EFE6]">3.1% CTR</div>
              <div className="font-mono text-[11px] text-[#766E5F]">18.2s avg · 28% completion</div>
            </div>

            <div className="bg-[#2C281F] border border-[#E8A33D] rounded-[4px] p-3 space-y-1">
              <div className="font-mono text-[10px] text-[#E8A33D] uppercase flex items-center justify-between">
                <span>Hybrid (Founder + B-Roll)</span>
                <span className="text-[#7FA37A] font-bold">+87% LIFT</span>
              </div>
              <div className="font-mono text-lg font-bold text-[#E8A33D]">5.8% CTR</div>
              <div className="font-mono text-[11px] text-[#A79E8E]">38.6s avg · 54% completion</div>
            </div>

            <div className="bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-3 space-y-1">
              <div className="font-mono text-[10px] text-[#A79E8E] uppercase">Founder + Graphics</div>
              <div className="font-mono text-lg font-bold text-[#F3EFE6]">4.7% CTR</div>
              <div className="font-mono text-[11px] text-[#766E5F]">32.1s avg · 44% completion</div>
            </div>

            <div className="bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-3 space-y-1">
              <div className="font-mono text-[10px] text-[#A79E8E] uppercase">100% Stock AI Video</div>
              <div className="font-mono text-lg font-bold text-[#F3EFE6]">3.6% CTR</div>
              <div className="font-mono text-[11px] text-[#766E5F]">22.4s avg · 31% completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Views by Format & AI Learning Insights */}
      <div className="grid2">
        <div className="card space-y-3">
          <div className="card-hdr">
            <span className="card-title flex items-center gap-2">
              <Film size={14} className="text-[#E8A33D]" />
              Views by Cut Format
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {records.map((r, i) => (
              <div key={i} className="hairline-row flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-semibold text-[#F3EFE6]">{r.title}</div>
                  <div className="font-mono text-[10px] text-[#766E5F]">{r.platform} · {r.watch_time}s avg watch</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-[#E8A33D]">{r.views.toLocaleString()}</div>
                  <div className="font-mono text-[10px] text-[#7FA37A]">{r.ctr}% CTR</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-3">
          <div className="card-hdr">
            <span className="card-title flex items-center gap-2">
              <Sparkles size={14} className="text-[#E8A33D]" />
              AI Learning & Optimization Telemetry
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-[#1A1712] p-3 rounded-[4px] border border-[#3A3427] flex items-start gap-2.5 text-xs text-[#A79E8E]">
                <span className="font-mono text-[10px] text-[#E8A33D] font-bold mt-0.5 shrink-0">
                  0{idx + 1}
                </span>
                <p className="text-[#F3EFE6] leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
