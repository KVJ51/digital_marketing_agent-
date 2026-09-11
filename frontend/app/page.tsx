"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Radio, 
  Target, 
  Link2, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  MessageSquare,
  Sparkles,
  Loader2
} from "lucide-react";

const STEPS = ["Company", "Brand", "Goals"] as const;

export default function ProductionSuiteSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Step 0: Company
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [website, setWebsite] = useState("");

  // Step 1: Brand
  const [brandVoice, setBrandVoice] = useState("");
  const [products, setProducts] = useState("");
  const [features, setFeatures] = useState("");

  // Step 2: Goals
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [targetViews, setTargetViews] = useState("");

  const handleContinue = async () => {
    if (step === 0) {
      if (!companyName.trim() || !industry.trim() || !targetAudience.trim()) {
        alert("Please fill out Company name, Industry sector, and Target customer persona.");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      setStatusMessage("Calibrating production suite...");

      const body = {
        company_name: companyName || "FounderOS",
        industry: industry || "SaaS / Automation",
        target_audience: targetAudience || "Startup founders and B2B operators",
        products: products ? [products] : ["AI Marketing Agent"],
        features: features ? [features] : ["Multi-agent pipeline", "Video rendering"],
        brand_voice: brandVoice || "Bold, founder-to-founder",
        website: website || "https://founderos.me",
        social_links: ["https://linkedin.com", "https://twitter.com"],
        goals: primaryGoal ? [primaryGoal, targetViews].filter(Boolean) : ["100K organic views/mo"],
      };

      localStorage.setItem("company_name", body.company_name);
      localStorage.setItem("industry", body.industry);
      localStorage.setItem("target_audience", body.target_audience);
      localStorage.setItem("brand_voice", body.brand_voice);
      localStorage.setItem("website", body.website);
      localStorage.setItem("onboarded_company_id", "1");

      try {
        const res = await fetch("http://localhost:8000/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const comp = await res.json();
          localStorage.setItem("onboarded_company_id", comp.id);
          await fetch(`http://localhost:8000/api/business/analyze/${comp.id}`, { method: "POST" }).catch(() => {});
          await fetch(`http://localhost:8000/api/strategy/weekly/${comp.id}?week=1`, { method: "POST" }).catch(() => {});
        }
      } catch (err) {
        // Mock fallback
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 750);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#14120D] p-4 sm:p-6 text-[#F3EFE6]">
      <div 
        className="w-full rounded-md border border-[#2B261D] bg-[#1C1813] p-8 sm:p-10 shadow-2xl"
        style={{ maxWidth: "620px" }}
      >
        {/* Title & Subtitle */}
        <h1 className="text-2xl font-medium text-[#F3EFE6] tracking-tight">
          Production suite setup
        </h1>
        <p className="mt-1 text-sm text-[#8A8274]">
          Configure your brand voice and editorial parameters.
        </p>

        {/* Stepper matching frontend_claude */}
        <div className="mt-8 flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex shrink-0 items-center justify-center rounded-full border text-xs font-mono font-medium transition-colors ${
                    i < step
                      ? "border-[#E8A33D] bg-[#E8A33D] text-[#14120D]"
                      : i === step
                      ? "border-[#E8A33D] text-[#E8A33D] bg-transparent"
                      : "border-[#2D281E] text-[#554D3F] bg-transparent"
                  }`}
                  style={{ width: "28px", height: "28px", minWidth: "28px", minHeight: "28px" }}
                >
                  {i < step ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest font-semibold ${
                    i === step ? "text-[#E8A33D]" : i < step ? "text-[#E8A33D]" : "text-[#554D3F]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div 
                  className={`mx-3 mb-4 h-[1px] flex-1 transition-colors ${
                    i < step ? "bg-[#E8A33D]" : "bg-[#2D281E]"
                  }`} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Company Form */}
        {step === 0 && (
          <div className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">
                Company name <span className="text-[#E8A33D]">*</span>
              </span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Building2 size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">
                Industry sector <span className="text-[#E8A33D]">*</span>
              </span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Radio size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="B2B SaaS / FinTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">
                Target customer persona <span className="text-[#E8A33D]">*</span>
              </span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Target size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="Startup founders, operations leads, tech operators"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">Website URL</span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Link2 size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="https://acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>
          </div>
        )}

        {/* Step 1: Brand Form */}
        {step === 1 && (
          <div className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">
                Brand voice <span className="text-[#E8A33D]">*</span>
              </span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <MessageSquare size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="Bold, founder-to-founder, concise"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">Products offered</span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Building2 size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="AI Marketing Agent, Automated Video Studio"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">Key features & differentiators</span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Sparkles size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="Multi-agent pipeline, Remotion video rendering, Telemetry optimization"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>
          </div>
        )}

        {/* Step 2: Goals Form */}
        {step === 2 && (
          <div className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">
                Primary strategic goal <span className="text-[#E8A33D]">*</span>
              </span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Target size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="Scale organic audience & establish authority"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-[#8A8274]">Target monthly views</span>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[#554D3F] z-10">
                  <Radio size={16} strokeWidth={1.75} />
                </span>
                <input
                  type="text"
                  placeholder="100,000 monthly organic views"
                  value={targetViews}
                  onChange={(e) => setTargetViews(e.target.value)}
                  style={{ paddingLeft: "42px" }}
                  className="h-11 w-full rounded-[4px] border border-[#2B261D] bg-[#14120D] pr-3 text-sm text-[#F3EFE6] placeholder-[#554D3F] focus:border-[#E8A33D] focus:outline-none transition-colors"
                />
              </div>
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 rounded-[4px] border border-[#2B261D] px-4 py-2 text-sm font-medium text-[#F3EFE6] hover:border-[#8A8274] transition-colors"
            >
              <ChevronLeft size={15} strokeWidth={2.2} />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-[4px] bg-[#E8A33D] px-5 py-2 text-sm font-medium text-[#14120D] hover:bg-[#d69330] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>{statusMessage || "Calibrating..."}</span>
              </>
            ) : (
              <>
                <span>{step === 2 ? "Assemble Production Suite" : "Continue"}</span>
                <ChevronRight size={15} strokeWidth={2.2} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
