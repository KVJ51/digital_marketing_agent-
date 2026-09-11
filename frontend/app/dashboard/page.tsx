"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProvenanceBar } from "../../components/ProvenanceBar";
import { 
  TrendingUp, 
  TrendingDown, 
  Check, 
  Loader2, 
  Linkedin, 
  Instagram, 
  Play,
  ArrowRight,
  Sparkles,
  Clapperboard,
  Film
} from "lucide-react";

export default function DashboardOverview() {
  const [pipelineState, setPipelineState] = useState("Scripting");
  const [approvalsCount, setApprovalsCount] = useState(3);
  
  // Pending approvals state
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: "app-1",
      platform: "LinkedIn",
      title: "Founder's Journey — Automation Playbook",
      duration: "00:01:00:00",
      founderPct: 60,
      brollPct: 20,
      graphicsPct: 15,
      aiPct: 5,
      icon: Linkedin,
      iconColor: "text-[#E8A33D] bg-[#E8A33D]/10 border-[#E8A33D]/25"
    },
    {
      id: "app-2",
      platform: "Instagram",
      title: "Product Demo — 30s Churn Breakdown",
      duration: "00:00:30:00",
      founderPct: 45,
      brollPct: 30,
      graphicsPct: 15,
      aiPct: 10,
      icon: Instagram,
      iconColor: "text-[#7FA37A] bg-[#7FA37A]/10 border-[#7FA37A]/25"
    }
  ]);

  const handleApprove = (id: string) => {
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    setApprovalsCount(c => Math.max(0, c - 1));
  };

  const handleReject = (id: string) => {
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    setApprovalsCount(c => Math.max(0, c - 1));
  };

  return (
    <div className="space-y-6">
      {/* Hero: Editing Bay Run-of-Show & Screen-Time Composition */}
      <div className="card bg-[#232019] border border-[#3A3427] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#3A3427]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E8A33D] animate-pulse" />
              <h2 className="text-base font-semibold text-[#F3EFE6]">Current Cycle: Week 2 Run of Show</h2>
            </div>
            <p className="text-xs text-[#A79E8E] mt-0.5">
              Production suite active · 5 short-form reels queued · 9 AI subagents coordinated
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/studio" className="btn-ghost">
              <Clapperboard size={14} className="text-[#E8A33D]" />
              <span>Open Studio bay</span>
            </Link>
          </div>
        </div>

        {/* Global Hero ProvenanceBar */}
        <div className="mt-4 pt-1">
          <ProvenanceBar 
            founder={55} 
            broll={25} 
            graphics={12} 
            aiVisuals={8} 
          />
        </div>
      </div>

      {/* Metrics Row in IBM Plex Mono Tabular Figures */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Total cuts rendered</div>
          <div className="metric-val">47</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> +12 this cycle
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Published posts</div>
          <div className="metric-val">31</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> 3 scheduled today
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Audience impressions</div>
          <div className="metric-val">284.5K</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block" /> +18.4%
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Average CTR</div>
          <div className="metric-val">3.4%</div>
          <div className="metric-delta delta-dn">
            <TrendingDown className="w-3.5 h-3.5 inline-block" /> -0.2%
          </div>
        </div>
      </div>

      {/* Grid: Autonomous NLE Track Pipeline & Pending Approvals */}
      <div className="grid2">
        {/* Reel Pipeline */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">
              <Film size={15} className="text-[#E8A33D]" />
              Autonomous production pipeline
            </span>
            <span className="pill pill-warn">
              <span className="dot dot-tally" />
              Live rendering
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 overflow-x-auto py-3 px-1">
            {[
              { name: "Onboarded", status: "done" },
              { name: "Analysis", status: "done" },
              { name: "Strategy", status: "done" },
              { name: "Scripting", status: "active" },
              { name: "Render bay", status: "pending" },
              { name: "Publish", status: "pending" },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.name}>
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border text-xs whitespace-nowrap ${
                  step.status === "done" 
                    ? "border-[#7FA37A]/40 bg-[#7FA37A]/10 text-[#7FA37A]" 
                    : step.status === "active"
                    ? "border-[#E8A33D] bg-[#E8A33D]/10 text-[#E8A33D] font-medium"
                    : "border-[#3A3427] bg-[#1A1712] text-[#766E5F]"
                }`}>
                  {step.status === "done" && <Check className="w-3 h-3 text-[#7FA37A]" />}
                  {step.status === "active" && <Loader2 className="w-3 h-3 animate-spin text-[#E8A33D]" />}
                  <span>{step.name}</span>
                </div>
                {idx < arr.length - 1 && (
                  <span className="text-[#3A3427] font-mono text-xs select-none">›</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-[#3A3427] flex items-center justify-between text-xs text-[#A79E8E]">
            <span>Script Writer Agent drafting Scene 3 hooks</span>
            <span className="font-mono text-[#E8A33D]">94% complete</span>
          </div>
        </div>

        {/* Pending Approvals Queue */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">
              Pending human sign-off
            </span>
            <Link href="/approvals" className="text-xs text-[#E8A33D] hover:underline flex items-center gap-1">
              <span>View queue ({pendingApprovals.length})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-0 divide-y divide-[#3A3427]">
            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#766E5F]">
                All cuts reviewed and approved for publication!
              </div>
            ) : (
              pendingApprovals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="hairline-row flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-[4px] border ${item.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#F3EFE6]">{item.title}</div>
                          <div className="font-mono text-[11px] text-[#A79E8E]">
                            Timecode: <span className="text-[#E8A33D]">{item.duration}</span> · {item.platform}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="btn-approve px-2.5 py-1 text-xs border font-medium flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="btn-reject px-2.5 py-1 text-xs border font-medium flex items-center gap-1 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    {/* Compact Provenance Indicator */}
                    <div className="pl-8">
                      <ProvenanceBar 
                        founder={item.founderPct} 
                        broll={item.brollPct} 
                        graphics={item.graphicsPct} 
                        aiVisuals={item.aiPct}
                        showTitle={false}
                        compact={true}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid: Platform Distribution & Category Breakdown */}
      <div className="grid2">
        {/* Platform Performance Chart */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Platform audience reach</span>
            <span className="font-mono text-xs text-[#A79E8E]">Total: 284K</span>
          </div>
          <div className="h-44 w-full flex items-end justify-between px-2 pt-6 pb-2 gap-3">
            {[
              { label: "LinkedIn", views: 98000, value: "98K", color: "bg-[#E8A33D]" },
              { label: "Instagram", views: 74000, value: "74K", color: "bg-[#7FA37A]" },
              { label: "YouTube", views: 62000, value: "62K", color: "bg-[#A79E8E]" },
              { label: "X / Twitter", views: 34000, value: "34K", color: "bg-[#C0453B]" },
              { label: "Facebook", views: 16000, value: "16K", color: "bg-[#766E5F]" }
            ].map((bar, idx, arr) => {
              const maxViews = Math.max(...arr.map(b => b.views));
              const barHeight = `${(bar.views / maxViews) * 100}%`;
              
              return (
                <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-1 group">
                  <span className="font-mono text-[10px] text-[#A79E8E] opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.value}
                  </span>
                  <div className="flex-1 w-full flex items-end justify-center min-h-[80px]">
                    <div 
                      style={{ height: barHeight }}
                      className={`w-full max-w-[36px] rounded-t-[2px] ${bar.color} transition-all duration-300 opacity-80 hover:opacity-100`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#A79E8E] truncate w-14 text-center mt-1">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Type Balance */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Editorial theme balance</span>
            <span className="font-mono text-xs text-[#7FA37A]">Optimal mix</span>
          </div>
          <div className="space-y-3 pt-2">
            {[
              { label: "Founder Story (Authentic)", pct: 35, color: "bg-[#E8A33D]", note: "High trust & retention" },
              { label: "Product Capability Demo", pct: 30, color: "bg-[#7FA37A]", note: "High conversion" },
              { label: "Market Insights & Data", pct: 20, color: "bg-[#A79E8E]", note: "Viral shares & saves" },
              { label: "Tactical Founder Tips", pct: 15, color: "bg-[#C0453B]", note: "Broad top-of-funnel" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F3EFE6] font-medium">{item.label}</span>
                  <span className="font-mono text-[#A79E8E]">{item.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-[2px] bg-[#1A1712] border border-[#3A3427] overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
                <div className="text-[10px] text-[#766E5F]">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
