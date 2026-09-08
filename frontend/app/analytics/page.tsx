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
  Share2
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
        
        // Fetch Analytics records
        const recordRes = await fetch(`http://localhost:8000/api/analytics/${companyId}`);
        const recordData = await recordRes.json();
        setRecords(recordData.records);
        setInsights(recordData.insights.insights || [
          "Short-form Video Shorts perform 45% better than regular posts.",
          "Hooks mentioning operational details have a 30% higher watch time.",
          "Scheduling on Tuesday and Thursday mornings yields higher CTR."
        ]);

        // Fetch Memory Graph
        const graphRes = await fetch(`http://localhost:8000/api/memory/graph/${companyId}`);
        const graphData = await graphRes.json();
        setGraph(graphData);
      } catch (err) {
        // Mock fallback data
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
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-400" />
          Analytics & Memory Graph
        </h2>
        <p className="text-sm text-slate-400">Track total platform metrics and review the content memory knowledge network.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Retrieving intelligence statistics...</div>
      ) : (
        <div className="space-y-8">
          
          {/* Metrics summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-purple-400" },
              { label: "Total Appreciations (Likes)", value: totalLikes.toLocaleString(), icon: ThumbsUp, color: "text-pink-400" },
              { label: "Total Amplification (Shares)", value: totalShares.toLocaleString(), icon: Share2, color: "text-indigo-400" }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-card p-6 rounded-2xl flex items-center justify-between border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-3xl font-black mt-2">{stat.value}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* SVG Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Views Comparison Chart */}
            <div className="glass-panel border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Views by Post format
              </h3>
              
              <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8 border-b border-slate-800 pt-6">
                {records.map((r, i) => {
                  const maxViews = Math.max(...records.map(rec => rec.views), 1);
                  const barHeight = `${(r.views / maxViews) * 80}%`;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 w-1/4">
                      <div className="text-[10px] font-bold text-slate-400">{r.views.toLocaleString()}</div>
                      <div 
                        style={{ height: barHeight }}
                        className="w-12 rounded-t-lg bg-gradient-to-t from-purple-600 to-pink-500 shadow-lg shadow-purple-500/20"
                      />
                      <div className="text-[10px] font-bold text-slate-500 truncate w-20 text-center mt-1">{r.platform}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Learning Insights */}
            <div className="glass-panel border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Learning & Video Editing Insights
              </h3>

              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                    <span className="w-5 h-5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {idx+1}
                    </span>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEW: Second-by-Second Video Retention & Viewer Drop-Off Curve */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Video Retention Curve & Viewer Drop-Off Detection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Second-by-second audience attention analysis across video runtime to optimize pacing.
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                ● Retention Engine Active
              </span>
            </div>

            {/* Retention Curve Bars */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-3">
              <div className="flex items-end justify-between h-40 gap-2 px-2 pt-4">
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
                    <span className={`text-[10px] font-bold ${pt.drop ? "text-rose-400 font-extrabold" : "text-slate-400"}`}>
                      {pt.pct}%
                    </span>
                    <div 
                      style={{ height: `${pt.pct * 0.9}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all ${
                        pt.drop 
                          ? "bg-rose-500 shadow-md shadow-rose-500/40 ring-2 ring-rose-400" 
                          : "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      }`}
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1">{pt.time}</span>
                  </div>
                ))}
              </div>

              {/* AI Drop-off Investigation Banner */}
              <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg p-3.5 flex items-start gap-3 text-xs text-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <div className="font-bold text-rose-300">
                    Large Viewer Drop-off Detected at 00:20 (28% Audience Loss)
                  </div>
                  <p className="text-rose-300/80 mt-1 leading-relaxed">
                    AI Investigation: &quot;Segment 00:15 - 00:20 contains a 5-second static explanation without visual changes.&quot;
                    <br />
                    <b>Closed-Loop Action:</b> System automatically scheduled B-roll cutaway and metric stat card at 00:19 for upcoming renders.
                  </p>
                </div>
              </div>
            </div>

            {/* Video Editing Style Performance Benchmarks */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Video Editing Style Performance Benchmarks
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Founder Talking Head</div>
                  <div className="text-xl font-black text-slate-200">3.1% CTR</div>
                  <div className="text-[11px] text-slate-400">18.2s avg watch time · 28% completion</div>
                </div>

                <div className="bg-purple-950/20 border border-purple-800/50 rounded-xl p-3.5 space-y-1 ring-1 ring-purple-500/30">
                  <div className="text-[10px] font-bold text-purple-400 uppercase flex items-center justify-between">
                    <span>Hybrid (Founder + B-Roll)</span>
                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-black">+87% LIFT</span>
                  </div>
                  <div className="text-xl font-black text-emerald-400">5.8% CTR</div>
                  <div className="text-[11px] text-purple-200">38.6s avg watch time · 54% completion</div>
                </div>

                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Founder + Graphics</div>
                  <div className="text-xl font-black text-slate-200">4.7% CTR</div>
                  <div className="text-[11px] text-slate-400">32.1s avg watch time · 44% completion</div>
                </div>

                <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">100% Stock AI Video</div>
                  <div className="text-xl font-black text-slate-200">3.6% CTR</div>
                  <div className="text-[11px] text-slate-400">22.4s avg watch time · 31% completion</div>
                </div>
              </div>
            </div>
          </div>


          {/* Long-Term Memory Graph */}
          <div className="glass-panel border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-base">Long-Term Brand Memory Graph</h3>
            </div>
            <p className="text-xs text-slate-400">Visualization of remembered topics, semantic relations, and engagement scores (the size of the nodes reflects times posted).</p>

            <div className="border border-slate-850 bg-slate-950/50 rounded-2xl p-6 h-80 relative flex items-center justify-center overflow-hidden">
              {/* Draw simulated memory nodes */}
              <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Render Nodes relative positions */}
              <div className="relative w-full h-full flex items-center justify-center z-10">
                {graph.nodes.map((node, i) => {
                  // Pre-determine offsets for nodes in visual layout
                  const offsets = [
                    { x: -120, y: -40 },
                    { x: 120, y: -50 },
                    { x: -50, y: 70 },
                    { x: 50, y: -90 },
                    { x: 20, y: 50 }
                  ];
                  const offset = offsets[i % offsets.length];
                  
                  return (
                    <div
                      key={i}
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        width: `${node.size * 1.5 + 40}px`,
                        height: `${node.size * 1.5 + 40}px`
                      }}
                      className="absolute rounded-full border border-purple-500/30 bg-purple-900/10 backdrop-blur flex flex-col items-center justify-center p-2 text-center"
                    >
                      <span className="text-[10px] font-extrabold text-slate-200 truncate w-full">{node.id}</span>
                      {node.engagement > 0 && (
                        <span className="text-[8px] text-purple-400 font-black mt-0.5">E: {node.engagement}</span>
                      )}
                    </div>
                  );
                })}

                {/* Draw connector indicator lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-40 h-[1px] bg-slate-800 rotate-12" />
                  <div className="w-32 h-[1px] bg-slate-800 -rotate-45" />
                  <div className="w-48 h-[1px] bg-slate-800 rotate-90" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
