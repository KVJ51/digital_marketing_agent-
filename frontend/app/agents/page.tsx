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
  Brain,
  Bot
} from "lucide-react";

export default function AgentNetworkPage() {
  const agents = [
    {
      name: "Business Analysis Agent",
      desc: "SaaS Business Consultant · Analyzes company profile, audience & opportunities",
      icon: PieChart,
      color: "text-[#E8A33D] border-[#E8A33D]/30",
      status: "Idle · Standby",
      isWorking: false
    },
    {
      name: "Marketing Strategy Agent",
      desc: "Chief Marketing Officer · Plans weekly themes & campaign focus areas",
      icon: Target,
      color: "text-[#7FA37A] border-[#7FA37A]/30",
      status: "Idle · Standby",
      isWorking: false
    },
    {
      name: "Content Planner Agent",
      desc: "Content Director · Builds 5-day calendar across LinkedIn, Instagram, X, YouTube",
      icon: Calendar,
      color: "text-[#E8A33D] border-[#E8A33D]/30",
      status: "Idle · Standby",
      isWorking: false
    },
    {
      name: "Script Writer Agent",
      desc: "Video Copywriter · Hook → Problem → Solution → CTA · Captions & hashtags",
      icon: Edit3,
      color: "text-[#C0453B] border-[#C0453B]/40",
      status: "Working · Scene 3",
      isWorking: true
    },
    {
      name: "Video Generation Agent",
      desc: "AI Video Director · Storyboards, stock queries, text overlays, scene timing",
      icon: Video,
      color: "text-[#C0453B] border-[#C0453B]/40",
      status: "Rendering · Layer 4",
      isWorking: true
    },
    {
      name: "Approval Agent",
      desc: "Workflow Controller · Human-in-the-loop review, approve or reject drafts",
      icon: CheckSquare,
      color: "text-[#7FA37A] border-[#7FA37A]/30",
      status: "Idle · Standby",
      isWorking: false
    },
    {
      name: "Publishing Agent",
      desc: "Social Media Scheduler · Publishes to all platforms, returns success logs",
      icon: Send,
      color: "text-[#A79E8E] border-[#A79E8E]/30",
      status: "Idle · Standby",
      isWorking: false
    },
    {
      name: "Analytics Agent",
      desc: "Data Analyst · Views, likes, comments, shares, CTR, watch time per post",
      icon: BarChart3,
      color: "text-[#A79E8E] border-[#A79E8E]/30",
      status: "Idle · Standby",
      isWorking: false
    },
    {
      name: "Learning Agent",
      desc: "ML Optimiser · Extracts performance patterns, surfaces content improvements",
      icon: Brain,
      color: "text-[#E8A33D] border-[#E8A33D]/30",
      status: "Idle · Standby",
      isWorking: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row in IBM Plex Mono */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Online subagents</div>
          <div className="metric-val">9 / 9</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Tasks completed today</div>
          <div className="metric-val">31</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active right now</div>
          <div className="metric-val text-[#E8A33D]">2</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Autonomous mode</div>
          <div className="font-mono text-sm font-bold text-[#7FA37A] mt-2">Human Approval Gate</div>
        </div>
      </div>

      {/* Agent Network Status List */}
      <div className="card">
        <div className="card-hdr">
          <span className="card-title flex items-center gap-2">
            <Bot size={15} className="text-[#E8A33D]" />
            Multi-Agent Autonomous Production Rack
          </span>
          <span className="font-mono text-xs text-[#7FA37A]">
            ● 9 Subagents Synced
          </span>
        </div>

        <div className="space-y-0 divide-y divide-[#3A3427]">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            
            return (
              <div key={idx} className="hairline-row flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[3px] border bg-[#1A1712] ${agent.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F3EFE6]">{agent.name}</div>
                    <div className="text-[11px] text-[#A79E8E] mt-0.5">{agent.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`pill ${agent.isWorking ? "pill-warn" : "pill-success"}`}>
                    <span className={`dot ${agent.isWorking ? "dot-tally" : ""}`} />
                    <span className="font-mono text-[10px]">{agent.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
