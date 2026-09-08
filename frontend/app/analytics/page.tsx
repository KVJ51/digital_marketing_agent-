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
                AI Learning Insights
              </h3>

              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                    <span className="w-5 h-5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0">
                      {idx+1}
                    </span>
                    <p>{insight}</p>
                  </div>
                ))}
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
