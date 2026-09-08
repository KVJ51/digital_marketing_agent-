"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Check, 
  Loader2, 
  Linkedin, 
  Instagram, 
  Youtube,
  Facebook
} from "lucide-react";

export default function DashboardOverview() {
  const [pipelineState, setPipelineState] = useState("Scripting");
  const [approvalsCount, setApprovalsCount] = useState(3);
  
  // Pending approvals mock state
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: "app-1",
      platform: "LinkedIn",
      title: "Founder's Journey — LinkedIn",
      meta: "Script ready · 60s · Female voice",
      icon: Linkedin,
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/25"
    },
    {
      id: "app-2",
      platform: "Instagram",
      title: "Product Demo — Instagram Reel",
      meta: "Script ready · 30s · Female voice",
      icon: Instagram,
      iconColor: "text-pink-500 bg-pink-500/10 border-pink-500/25"
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
      {/* Overview Metrics Cards */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Total content items</div>
          <div className="metric-val">47</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block mr-0.5" /> +12 this week
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Published posts</div>
          <div className="metric-val">31</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block mr-0.5" /> 3 today
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total views</div>
          <div className="metric-val">284K</div>
          <div className="metric-delta delta-up">
            <TrendingUp className="w-3.5 h-3.5 inline-block mr-0.5" /> +18% vs last week
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg. CTR</div>
          <div className="metric-val">3.4%</div>
          <div className="metric-delta delta-dn">
            <TrendingDown className="w-3.5 h-3.5 inline-block mr-0.5" /> –0.2pts
          </div>
        </div>
      </div>

      {/* Grid Content Section 1 */}
      <div className="grid2">
        {/* Autonomous Pipeline */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Autonomous pipeline</span>
            <span className="pill pill-success">
              <span className="dot" />
              Running
            </span>
          </div>
          <div className="flow-wrap">
            <div className="flow-step done">
              <Check className="w-3 h-3 text-[#0F6E56]" />
              Onboarded
            </div>
            <div className="flow-arrow">›</div>
            <div className="flow-step done">
              <Check className="w-3 h-3 text-[#0F6E56]" />
              Analyzed
            </div>
            <div className="flow-arrow">›</div>
            <div className="flow-step done">
              <Check className="w-3 h-3 text-[#0F6E56]" />
              Strategy
            </div>
            <div className="flow-arrow">›</div>
            <div className="flow-step active-step">
              <Loader2 className="w-3 h-3 animate-spin text-[#534AB7]" />
              Scripting
            </div>
            <div className="flow-arrow">›</div>
            <div className="flow-step">Render</div>
            <div className="flow-arrow">›</div>
            <div className="flow-step">Publish</div>
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            Script Writer Agent is generating 5 new scripts for Week 2
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Pending approvals</span>
            <Link href="/approvals" className="card-action">
              View all →
            </Link>
          </div>
          <div className="space-y-1">
            {pendingApprovals.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--color-text-tertiary)]">
                No pending approvals remaining!
              </div>
            ) : (
              pendingApprovals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="approval-item">
                    <div className={`approval-thumb ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="approval-body">
                      <div className="approval-title">{item.title}</div>
                      <div className="approval-meta">{item.meta}</div>
                      <div className="approval-actions">
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="btn btn-approve"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="btn btn-reject"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid Content Section 2 */}
      <div className="grid2">
        {/* Platform Performance Chart */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Platform performance</span>
          </div>
          <div className="h-44 w-full flex items-end justify-between px-2 pt-6 pb-2">
            {[
              { label: "LinkedIn", views: 98000, value: "98K", color: "bg-[#185FA5]" },
              { label: "Instagram", views: 74000, value: "74K", color: "bg-[#993556]" },
              { label: "YouTube", views: 62000, value: "62K", color: "bg-[#993C1D]" },
              { label: "X", views: 34000, value: "34K", color: "bg-[#2C2C2A] border border-[var(--color-border-secondary)]" },
              { label: "Facebook", views: 16000, value: "16K", color: "bg-[#0F6E56]" }
            ].map((bar, idx, arr) => {
              const maxViews = Math.max(...arr.map(b => b.views));
              const barHeight = `${(bar.views / maxViews) * 100}%`;
              
              return (
                <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-1 group">
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {bar.views.toLocaleString()}
                  </span>
                  <div className="flex-1 w-full flex items-end justify-center min-h-[80px]">
                    <div 
                      style={{ height: barHeight }}
                      className={`w-7 sm:w-10 rounded-t ${bar.color} transition-all duration-300 hover:opacity-90`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[var(--color-text-secondary)] truncate w-14 text-center mt-1">
                    {bar.label} ({bar.value})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Type Breakdown */}
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Content type breakdown</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* Native SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Segment 1: Founder Story (35%) -> color: #534AB7 */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#534AB7"
                  strokeWidth="11"
                  strokeDasharray="87.96 251.32"
                  strokeDashoffset="0"
                />
                {/* Segment 2: Product Demo (28%) -> color: #993556 */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#993556"
                  strokeWidth="11"
                  strokeDasharray="70.37 251.32"
                  strokeDashoffset="-87.96"
                />
                {/* Segment 3: Industry Insight (22%) -> color: #0F6E56 */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#0F6E56"
                  strokeWidth="11"
                  strokeDasharray="55.29 251.32"
                  strokeDashoffset="-158.33"
                />
                {/* Segment 4: Tips (15%) -> color: #854F0B */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#854F0B"
                  strokeWidth="11"
                  strokeDasharray="37.70 251.32"
                  strokeDashoffset="-213.62"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider leading-none">Mix</span>
                <span className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5 leading-none">100%</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-1.5 flex-1 w-full">
              {[
                { label: "Founder Story", pct: "35%", color: "bg-[#534AB7]" },
                { label: "Product Demo", pct: "28%", color: "bg-[#993556]" },
                { label: "Industry Insight", pct: "22%", color: "bg-[#0F6E56]" },
                { label: "Tips & Tricks", pct: "15%", color: "bg-[#854F0B]" }
              ].map((segment) => (
                <div key={segment.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${segment.color} shrink-0`} />
                    <span className="text-[var(--color-text-secondary)] font-medium">{segment.label}</span>
                  </div>
                  <span className="font-bold text-[var(--color-text-primary)]">{segment.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
