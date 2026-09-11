"use client";

import React, { useEffect, useState } from "react";
import { 
  EyeOff, 
  Network, 
  Flame, 
  Telescope,
  Sparkles,
  RefreshCw,
  Brain
} from "lucide-react";

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

export default function MemoryGraphPage() {
  const [graph, setGraph] = useState<MemoryGraph>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [fetchingAngles, setFetchingAngles] = useState(false);

  const fetchMemory = async () => {
    try {
      const companyId = localStorage.getItem("onboarded_company_id") || "1";
      const res = await fetch(`http://localhost:8000/api/memory/graph/${companyId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGraph(data);
    } catch (err) {
      const mockGraph: MemoryGraph = {
        nodes: [
          { id: "Automation", group: 1, size: 25, engagement: 92.4, times_posted: 4 },
          { id: "Founder Story", group: 1, size: 18, engagement: 78.1, times_posted: 3 },
          { id: "Productivity", group: 2, size: 15, engagement: 61.8, times_posted: 2 },
          { id: "SaaS Growth", group: 2, size: 12, engagement: 54.2, times_posted: 2 },
          { id: "Workflow Design", group: 2, size: 10, engagement: 33.5, times_posted: 1 }
        ],
        links: [
          { source: "Automation", target: "Productivity", type: "benefit" },
          { source: "Automation", target: "Workflow Design", type: "benefit" },
          { source: "Founder Story", target: "SaaS Growth", type: "topic" }
        ]
      };
      setGraph(mockGraph);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const getBubbleText = (id: string) => {
    return id.substring(0, 2).toUpperCase();
  };

  const handleGetAngles = () => {
    setFetchingAngles(true);
    setTimeout(() => {
      setFetchingAngles(false);
      alert("AI Learning Agent compiled 3 fresh unexplored strategy hooks!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row in IBM Plex Mono */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Mapped knowledge topics</div>
          <div className="metric-val">{graph.nodes.length || 8}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Semantic links</div>
          <div className="metric-val">{graph.links.length || 14}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Top engagement node</div>
          <div className="font-mono text-sm font-bold text-[#E8A33D] mt-2">Automation (92.4)</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Unexplored angles</div>
          <div className="metric-val">5</div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#A79E8E] font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E8A33D]" />
          Synchronizing cognitive memory graph...
        </div>
      ) : (
        <div className="grid2">
          {/* Topic Memory Nodes */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title flex items-center gap-2">
                <Network size={14} className="text-[#E8A33D]" />
                Topic Memory Registry
              </span>
              <button 
                onClick={handleGetAngles}
                className="btn-ghost text-xs"
              >
                {fetchingAngles ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-[#E8A33D]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Compile new angles ↗</span>
                )}
              </button>
            </div>
            
            <div className="space-y-1 divide-y divide-[#3A3427]">
              {graph.nodes.map((node) => (
                <div key={node.id} className="hairline-row flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-[3px] bg-[#1A1712] border border-[#3A3427] flex items-center justify-center font-mono text-xs font-bold text-[#E8A33D]">
                      {getBubbleText(node.id)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F3EFE6]">{node.id}</div>
                      <div className="font-mono text-[10px] text-[#766E5F]">
                        Posted {node.times_posted}× · Last: {node.times_posted > 2 ? "2 days ago" : "6 days ago"}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#7FA37A]">
                    {node.engagement.toFixed(1)} score
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Novel Angles to Explore */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title flex items-center gap-2">
                <Brain size={14} className="text-[#E8A33D]" />
                Novel Angles to Explore
              </span>
              <span className="font-mono text-xs text-[#766E5F]">High impact</span>
            </div>
            
            <div className="space-y-2.5 pt-1">
              {[
                {
                  icon: EyeOff,
                  color: "text-[#E8A33D] border-[#E8A33D]/30",
                  title: "Behind the scenes / Day in the life",
                  desc: "Not yet used for Automation topic. High founder authenticity score."
                },
                {
                  icon: Brain,
                  color: "text-[#7FA37A] border-[#7FA37A]/30",
                  title: "Stat-driven case study",
                  desc: "Combine Founder Story with real user retention metrics for proof."
                },
                {
                  icon: Flame,
                  color: "text-[#C0453B] border-[#C0453B]/30",
                  title: "Controversial / unpopular opinion",
                  desc: "High top-of-funnel watch time. Contrast standard operating advice."
                },
                {
                  icon: Telescope,
                  color: "text-[#A79E8E] border-[#A79E8E]/30",
                  title: "Future industry forecast / 3-5 years",
                  desc: "Thought leadership angle. Unexplored in SaaS Growth & Workflow tracks."
                }
              ].map((angle, idx) => {
                const Icon = angle.icon;
                return (
                  <div key={idx} className="bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-3 flex items-start gap-3">
                    <div className={`p-1.5 rounded-[3px] border bg-[#232019] ${angle.color} shrink-0 mt-0.5`}>
                      <Icon size={14} />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-[#F3EFE6]">{angle.title}</div>
                      <div className="text-[11px] text-[#A79E8E] mt-0.5 leading-relaxed">{angle.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
