"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, RefreshCw, Target, Sparkles } from "lucide-react";

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
      
      const profileRes = await fetch(`http://localhost:8000/api/business/analyze/${companyId}`, { method: "POST" });
      const profileData = await profileRes.json();
      setProfile(profileData);

      const strategyRes = await fetch(`http://localhost:8000/api/strategy/weekly/${companyId}?week=1`, { method: "POST" });
      const strategyData = await strategyRes.json();
      setStrategy(strategyData.weekly_strategy);
    } catch (err) {
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
      console.error("Strategy regeneration fallback used.");
    } finally {
      setRegenerating(false);
    }
  };

  // Fixed track theme colors matching Editing Bay legend
  const themeColors = [
    { border: "border-l-2 border-[#E8A33D]", labelColor: "text-[#E8A33D]" },
    { border: "border-l-2 border-[#7FA37A]", labelColor: "text-[#7FA37A]" },
    { border: "border-l-2 border-[#A79E8E]", labelColor: "text-[#A79E8E]" }
  ];

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="py-12 text-center text-[#A79E8E] font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E8A33D]" />
          Compiling strategy profiles...
        </div>
      ) : (
        <>
          {/* Metrics row in IBM Plex Mono */}
          <div className="metrics">
            <div className="metric-card">
              <div className="metric-label">Active cycle</div>
              <div className="metric-val text-[#E8A33D]">Week 2</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Themes planned</div>
              <div className="metric-val">{strategy.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Strategic opportunities</div>
              <div className="metric-val">{profile?.opportunities.length || 0}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Memory topics</div>
              <div className="metric-val">8</div>
            </div>
          </div>

          {/* Grid section */}
          <div className="grid2">
            {/* Weekly Campaign Themes */}
            <div className="card space-y-3">
              <div className="card-hdr">
                <span className="card-title flex items-center gap-2">
                  <Target size={15} className="text-[#E8A33D]" />
                  Weekly Editorial Themes
                </span>
                <button 
                  onClick={handleRegenerate}
                  className="btn-ghost text-xs"
                >
                  {regenerating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-[#E8A33D]" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <span>Regenerate themes ↗</span>
                  )}
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {strategy.map((theme, idx) => {
                  const style = themeColors[idx % themeColors.length];
                  return (
                    <div 
                      key={idx} 
                      className={`bg-[#1A1712] border border-[#3A3427] p-3.5 rounded-[4px] space-y-1.5 ${style.border}`}
                    >
                      <div className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${style.labelColor}`}>
                        Theme 0{idx + 1} · {theme.focus}
                      </div>
                      <div className="text-xs font-semibold text-[#F3EFE6]">{theme.theme}</div>
                      <div className="text-[11px] text-[#A79E8E] leading-relaxed">{theme.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Analysis */}
            <div className="card space-y-3">
              <div className="card-hdr">
                <span className="card-title flex items-center gap-2">
                  <Sparkles size={15} className="text-[#E8A33D]" />
                  Strategic Opportunity Matrix
                </span>
              </div>
              <div className="text-xs text-[#A79E8E] bg-[#1A1712] p-3 rounded-[4px] border border-[#3A3427] leading-relaxed">
                {profile?.company_summary || "Automated SaaS builder targeting fast-growth operators and scale-ups."}
              </div>
              
              <div className="font-mono text-[10px] uppercase text-[#766E5F] pt-2">
                Identified Growth Angles
              </div>
              <div className="space-y-0 divide-y divide-[#3A3427]">
                {profile?.opportunities.map((opp, idx) => (
                  <div key={idx} className="hairline-row flex items-start gap-2.5 text-xs text-[#F3EFE6] py-2.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#E8A33D] mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{opp}</span>
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
