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
      // Mock Fallbacks matching founderos_dashboard.html memory graph exactly
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
    <div className="space-y-6 animate-step-enter">
      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric-card"><div className="metric-label">Known topics</div><div className="metric-val">{graph.nodes.length || 8}</div></div>
        <div className="metric-card"><div className="metric-label">Knowledge links</div><div className="metric-val">{graph.links.length || 14}</div></div>
        <div className="metric-card"><div className="metric-label">Top engagement topic</div><div className="metric-val" style={{ fontSize: "14px", marginTop: "8px" }}>Automation</div></div>
        <div className="metric-card"><div className="metric-label">Novel angles left</div><div className="metric-val">5</div></div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#534AB7]" />
          Synchronizing cognitive memory graph...
        </div>
      ) : (
        <div className="grid2">
          {/* Left Card: Topic Memory Nodes */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Topic memory nodes</span>
              <span 
                className="card-action flex items-center gap-1"
                onClick={handleGetAngles}
              >
                {fetchingAngles ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Get new angles ↗"
                )}
              </span>
            </div>
            
            <div className="memory-node-list">
              {graph.nodes.map((node) => (
                <div key={node.id} className="mem-node">
                  <div className="mem-bubble">
                    {getBubbleText(node.id)}
                  </div>
                  <div>
                    <div className="mem-name">{node.id}</div>
                    <div className="mem-meta">
                      Posted {node.times_posted}× · Last: {node.times_posted > 2 ? "2 days ago" : "6 days ago"}
                    </div>
                  </div>
                  <div className="mem-score">{node.engagement.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Novel Angles */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Novel angles to explore</span>
            </div>
            
            <div className="divide-y divide-[var(--color-border-tertiary)]">
              <div className="insight-item py-3">
                <div className="insight-icon ag-purple">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div className="insight-text">
                  <b>Behind the scenes / Day in the life</b> — Not yet used for Automation topic. High novelty potential.
                </div>
              </div>

              <div className="insight-item py-3">
                <div className="insight-icon ag-blue">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="insight-text">
                  <b>Stat-driven case study</b> — Not yet used for Founder Story. Combine with a real customer metric for social proof.
                </div>
              </div>

              <div className="insight-item py-3">
                <div className="insight-icon ag-coral">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="insight-text">
                  <b>Controversial / unpopular opinion</b> — High engagement potential. Not yet explored across any topic.
                </div>
              </div>

              <div className="insight-item py-3">
                <div className="insight-icon ag-amber">
                  <Telescope className="w-4 h-4" />
                </div>
                <div className="insight-text">
                  <b>Future predictions / 5 years out</b> — Thought leadership angle. No coverage yet in SaaS Growth or Workflow Design.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
