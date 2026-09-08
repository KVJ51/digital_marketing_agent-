"use client";

import React from "react";
import { 
  PieChart, 
  Target, 
  Calendar, 
  Edit3, 
  Video, 
  CheckSquare, 
  Send, 
  BarChart3, 
  Brain 
} from "lucide-react";

export default function AgentNetworkPage() {
  const agents = [
    {
      name: "Business Analysis Agent",
      desc: "SaaS Business Consultant · Analyzes company profile, audience & opportunities",
      icon: PieChart,
      colorClass: "ag-purple",
      status: "Idle",
      statusPill: "pill-success"
    },
    {
      name: "Marketing Strategy Agent",
      desc: "Chief Marketing Officer · Plans weekly themes & campaign focus areas",
      icon: Target,
      colorClass: "ag-teal",
      status: "Idle",
      statusPill: "pill-success"
    },
    {
      name: "Content Planner Agent",
      desc: "Content Director · Builds 5-day calendar across LinkedIn, Instagram, X, YouTube",
      icon: Calendar,
      colorClass: "ag-blue",
      status: "Idle",
      statusPill: "pill-success"
    },
    {
      name: "Script Writer Agent",
      desc: "Video Copywriter · Hook → Problem → Solution → CTA · Captions & hashtags",
      icon: Edit3,
      colorClass: "ag-coral",
      status: "Working",
      statusPill: "pill-warn"
    },
    {
      name: "Video Generation Agent",
      desc: "AI Video Director · Storyboards, stock queries, text overlays, scene timing",
      icon: Video,
      colorClass: "ag-pink",
      status: "Working",
      statusPill: "pill-warn"
    },
    {
      name: "Approval Agent",
      desc: "Workflow Controller · Human-in-the-loop review, approve or reject drafts",
      icon: CheckSquare,
      colorClass: "ag-amber",
      status: "Idle",
      statusPill: "pill-success"
    },
    {
      name: "Publishing Agent",
      desc: "Social Media Scheduler · Publishes to all platforms, returns success logs",
      icon: Send,
      colorClass: "ag-green",
      status: "Idle",
      statusPill: "pill-success"
    },
    {
      name: "Analytics Agent",
      desc: "Data Analyst · Views, likes, comments, shares, CTR, watch time per post",
      icon: BarChart3,
      colorClass: "ag-gray",
      status: "Idle",
      statusPill: "pill-success"
    },
    {
      name: "Learning Agent",
      desc: "ML Optimiser · Extracts performance patterns, surfaces content improvements",
      icon: Brain,
      colorClass: "ag-purple",
      status: "Idle",
      statusPill: "pill-success"
    }
  ];

  return (
    <div className="space-y-6 animate-step-enter">
      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric-card"><div className="metric-label">Online agents</div><div className="metric-val">9 / 9</div></div>
        <div className="metric-card"><div className="metric-label">Tasks completed today</div><div className="metric-val">31</div></div>
        <div className="metric-card"><div className="metric-label">Active right now</div><div className="metric-val">2</div></div>
        <div className="metric-card"><div className="metric-label">Fallback mode</div><div className="metric-val" style={{ fontSize: "14px", marginTop: "8px" }}>Rule-based</div></div>
      </div>

      {/* Agent network status list */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Agent network status</span>
        </div>

        <div className="divide-y divide-[var(--color-border-tertiary)]">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            
            return (
              <div key={idx} className="agent-row py-3">
                <div className={`agent-icon ${agent.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="agent-info">
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-desc">{agent.desc}</div>
                </div>
                <span className={`pill ${agent.statusPill}`}>
                  <span className="dot" />
                  {agent.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
