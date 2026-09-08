"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

interface StrategyTheme {
  theme: string;
  focus: string;
  description: string;
}

interface MarketingProfile {
  company_summary: string;
  audience_summary: string;
  opportunities: string[];
}

export default function StrategyPage() {
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [strategy, setStrategy] = useState<StrategyTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchStrategy = async () => {
    try {
      const companyId = localStorage.getItem("onboarded_company_id") || "1";
      
      // Fetch company profile
      const profileRes = await fetch(`http://localhost:8000/api/business/analyze/${companyId}`, { method: "POST" });
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch strategy
      const strategyRes = await fetch(`http://localhost:8000/api/strategy/weekly/${companyId}?week=1`, { method: "POST" });
      const strategyData = await strategyRes.json();
      setStrategy(strategyData.weekly_strategy);
    } catch (err) {
      // Mock fallback data
      setProfile({
        company_summary: "A leading SaaS innovator delivering robust automation products that focus on workflow optimization, helping B2B professionals save 15+ hours every week.",
        audience_summary: "Startup founders and B2B operators looking to scale without hiring",
        opportunities: [
          "Highlight automation features to attract time-pressed startup founders",
          "Position company as thought leader via data-driven case studies",
          "Leverage product demos resolving core client pain points",
          "Run social proof campaigns with customer success stories",
          "Cross-platform retargeting using short-form video hooks"
        ]
      });
      setStrategy([
        {
          theme: "The Founder's Journey",
          focus: "Brand trust",
          description: "Share the core challenges, vision, and lightbulb moments that led to creating the company. Build relatability and authentic connection."
        },
        {
          theme: "Product Capability Deep Dive",
          focus: "Product education",
          description: "Highlight a single product feature and demonstrate its immediate impact on time savings and operational efficiency."
        },
        {
          theme: "Industry Trends & Future-Proofing",
          focus: "Thought leadership",
          description: "Examine current shifts in the sector and offer actionable advice on how organizations can prepare for the next 12 months."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategy();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const companyId = localStorage.getItem("onboarded_company_id") || "1";
      const strategyRes = await fetch(`http://localhost:8000/api/strategy/weekly/${companyId}?week=1`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true })
      });
      if (strategyRes.ok) {
        const strategyData = await strategyRes.json();
        setStrategy(strategyData.weekly_strategy);
      }
    } catch (err) {
      console.error("Strategy regeneration failed. Using offline state.");
    } finally {
      setRegenerating(false);
    }
  };

  // Border theme classes to match founderos_dashboard.html
  const themeColors = [
    { border: "border-l-3 border-[#534AB7]", labelColor: "text-[#534AB7]" },
    { border: "border-l-3 border-[#0F6E56]", labelColor: "text-[#0F6E56]" },
    { border: "border-l-3 border-[#993C1D]", labelColor: "text-[#993C1D]" }
  ];

  return (
    <div className="space-y-6 animate-step-enter">
      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#534AB7]" />
          Compiling strategy profiles...
        </div>
      ) : (
        <>
          {/* Metrics row */}
          <div className="metrics">
            <div className="metric-card">
              <div className="metric-label">Active week</div>
              <div className="metric-val">Week 1</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Themes planned</div>
              <div className="metric-val">{strategy.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Opportunities</div>
              <div className="metric-val">{profile?.opportunities.length || 0}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Memory topics</div>
              <div className="metric-val">8</div>
            </div>
          </div>

          {/* Grid section */}
          <div className="grid2">
            {/* Left Card: Campaign Themes */}
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">Weekly campaign themes</span>
                <span 
                  className="card-action flex items-center gap-1"
                  onClick={handleRegenerate}
                >
                  {regenerating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate ↗"
                  )}
                </span>
              </div>
              <div className="space-y-3">
                {strategy.map((theme, idx) => {
                  const style = themeColors[idx % themeColors.length];
                  return (
                    <div 
                      key={idx} 
                      className={`strategy-theme ${style.border}`}
                    >
                      <div className={`theme-label ${style.labelColor}`}>
                        Theme {idx + 1} — {theme.focus}
                      </div>
                      <div className="theme-title">{theme.theme}</div>
                      <div className="theme-desc">{theme.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Business Analysis */}
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">Business analysis output</span>
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
                {profile?.company_summary || "Acme Corp is an automated software builder targeting fast-growth startups."}
              </div>
              
              <div className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                Core opportunities
              </div>
              <div className="divide-y divide-[var(--color-border-tertiary)]">
                {profile?.opportunities.map((opp, idx) => (
                  <div key={idx} className="opp-item">
                    <ArrowRight className="w-3.5 h-3.5 text-[#534AB7] mt-0.5 shrink-0" />
                    <span>{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
