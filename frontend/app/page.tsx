"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Building, 
  Target, 
  Link as LinkIcon, 
  Radio,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Cpu,
  Users,
  Activity,
  Shield,
  Settings,
  RefreshCw
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [website, setWebsite] = useState("");

  const [products, setProducts] = useState([""]);
  const [features, setFeatures] = useState([""]);
  const [goals, setGoals] = useState([""]);

  const [step, setStep] = useState(1);

  useEffect(() => {
    const companyId = localStorage.getItem("onboarded_company_id");
    if (companyId) {
      setHasOnboarded(true);
      // Fetch details from localstorage fallbacks or load initial defaults
      setCompanyName(localStorage.getItem("company_name") || "FounderOS");
      setIndustry(localStorage.getItem("industry") || "SaaS / Automation");
      setTargetAudience(localStorage.getItem("target_audience") || "Startup founders and B2B operators looking to scale");
      setBrandVoice(localStorage.getItem("brand_voice") || "Bold, founder-to-founder");
      setWebsite(localStorage.getItem("website") || "https://founderos.me");
      
      const loadedProducts = localStorage.getItem("products");
      if (loadedProducts) setProducts(JSON.parse(loadedProducts));
      else setProducts(["AI Marketing Agent"]);

      const loadedFeatures = localStorage.getItem("features");
      if (loadedFeatures) setFeatures(JSON.parse(loadedFeatures));
      else setFeatures(["Multi-agent pipeline", "Video rendering", "Auto-publishing", "Analytics"]);

      const loadedGoals = localStorage.getItem("goals");
      if (loadedGoals) setGoals(JSON.parse(loadedGoals));
      else setGoals(["100K organic views per month", "Build brand authority"]);
    }
  }, []);

  const handleAddField = (setter: any, currentList: string[]) => {
    setter([...currentList, ""]);
  };

  const handleListChange = (index: number, val: string, list: string[], setter: any) => {
    const updated = [...list];
    updated[index] = val;
    setter(updated);
  };

  const handleRemoveField = (index: number, list: string[], setter: any) => {
    if (list.length > 1) {
      setter(list.filter((_, idx) => idx !== index));
    }
  };

  const isStep1Valid = companyName.trim() !== "" && industry.trim() !== "" && targetAudience.trim() !== "";

  const nextStep = () => {
    if (step === 1 && !isStep1Valid) {
      alert("Please fill out Company Name, Industry, and Target Audience.");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !industry || !targetAudience) {
      alert("Please fill out Company Name, Industry, and Target Audience.");
      return;
    }

    setLoading(true);
    setStatusMessage("Storing company credentials in database...");

    const body = {
      company_name: companyName,
      industry: industry,
      target_audience: targetAudience,
      products: products.filter(Boolean),
      features: features.filter(Boolean),
      brand_voice: brandVoice || "Professional & Inspiring",
      website: website || "https://example.com",
      social_links: ["https://linkedin.com", "https://twitter.com"],
      goals: goals.filter(Boolean),
    };

    // Keep state values in localStorage for the read-only view
    localStorage.setItem("company_name", companyName);
    localStorage.setItem("industry", industry);
    localStorage.setItem("target_audience", targetAudience);
    localStorage.setItem("brand_voice", brandVoice);
    localStorage.setItem("website", website);
    localStorage.setItem("products", JSON.stringify(products.filter(Boolean)));
    localStorage.setItem("features", JSON.stringify(features.filter(Boolean)));
    localStorage.setItem("goals", JSON.stringify(goals.filter(Boolean)));

    try {
      const res = await fetch("http://localhost:8000/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      const company = await res.json();
      localStorage.setItem("onboarded_company_id", company.id);

      setStatusMessage("AI Business Agent is analyzing industry profiles...");
      await fetch(`http://localhost:8000/api/business/analyze/${company.id}`, { method: "POST" });
      
      setStatusMessage("Assembling weekly marketing schedules...");
      await fetch(`http://localhost:8000/api/strategy/weekly/${company.id}?week=1`, { method: "POST" });

      setStatusMessage("Done! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setStatusMessage("Connecting with local mock configurations...");
      localStorage.setItem("onboarded_company_id", "1");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("onboarded_company_id");
    setHasOnboarded(false);
    setStep(1);
    setCompanyName("");
    setIndustry("");
    setTargetAudience("");
    setBrandVoice("");
    setWebsite("");
    setProducts([""]);
    setFeatures([""]);
    setGoals([""]);
  };

  // If already onboarded, display the read-only profile matching founderos_dashboard.html
  if (hasOnboarded) {
    return (
      <div className="space-y-6 animate-step-enter">
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Company profile</span>
            <span 
              className="card-action flex items-center gap-1 text-[#534AB7]"
              onClick={handleReset}
            >
              <Settings className="w-3.5 h-3.5" />
              Re-configure ↗
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-tertiary)]">
            <div className="onb-step">
              <div className="onb-num">1</div>
              <div className="onb-body">
                <div className="onb-title">Company details</div>
                <div className="onb-sub">
                  {companyName} · {industry} · Est. June 2026
                </div>
                <div className="tag-wrap">
                  <span className="tag">Stage: Seed</span>
                  <span className="tag">Region: Global</span>
                  <span className="tag">Website: {website || "https://founderos.me"}</span>
                </div>
              </div>
            </div>

            <div className="onb-step">
              <div className="onb-num">2</div>
              <div className="onb-body">
                <div className="onb-title">Target audience</div>
                <div className="onb-sub">{targetAudience}</div>
                <div className="tag-wrap">
                  <span className="tag">Founders</span>
                  <span className="tag">Solo operators</span>
                  <span className="tag">Marketing leads</span>
                </div>
              </div>
            </div>

            <div className="onb-step">
              <div className="onb-num">3</div>
              <div className="onb-body">
                <div className="onb-title">Products & features</div>
                <div className="onb-sub">
                  {products.filter(Boolean).join(", ") || "AI Marketing Agent"}
                </div>
                <div className="tag-wrap">
                  {features.filter(Boolean).map((feat, i) => (
                    <span key={i} className="tag">{feat}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="onb-step" style={{ borderBottom: "none" }}>
              <div className="onb-num">4</div>
              <div className="onb-body">
                <div className="onb-title">Brand voice & goals</div>
                <div className="onb-sub">Voice: {brandVoice || "Bold, founder-to-founder"}</div>
                <div className="tag-wrap">
                  {goals.filter(Boolean).map((goal, i) => (
                    <span key={i} className="tag">{goal}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => router.push("/dashboard")}
            className="btn btn-primary"
          >
            Go to Overview dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // Get agent statuses based on step
  const getAgentStatuses = () => {
    if (loading) {
      return {
        strategist: { status: "Active", text: statusMessage || "Processing company credentials...", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", pulse: true },
        copy: { status: "Active", text: "Assembling weekly marketing schedules...", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", pulse: true },
        seo: { status: "Active", text: "AI Business Agent analyzing industry profiles...", color: "text-pink-400 bg-pink-500/10 border-pink-500/20", pulse: true }
      };
    }

    switch (step) {
      case 1:
        return {
          strategist: { status: "Idle", text: "Awaiting onboarding details to assemble custom strategy...", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", pulse: false },
          copy: { status: "Standby", text: "Ready to generate campaign threads and copy...", color: "text-slate-500 bg-slate-500/5 border-slate-800", pulse: false },
          seo: { status: "Standby", text: "Waiting for target audience parameters...", color: "text-slate-500 bg-slate-500/5 border-slate-800", pulse: false }
        };
      case 2:
        return {
          strategist: { status: "Analyzing", text: "Reading brand voice and product settings...", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", pulse: true },
          copy: { status: "Awaiting", text: "Preparing tone models for brand voice...", color: "text-blue-400/70 bg-blue-500/5 border-blue-900/30", pulse: false },
          seo: { status: "Standby", text: "Awaiting final strategic goals...", color: "text-slate-500 bg-slate-500/5 border-slate-800", pulse: false }
        };
      case 3:
      default:
        return {
          strategist: { status: "Ready", text: "Onboarding compiled. Strategy ready to generate...", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", pulse: false },
          copy: { status: "Ready", text: "Brand voice models loaded. Ready to build campaign assets...", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", pulse: false },
          seo: { status: "Ready", text: "Target keywords identified. Ready to map content hubs...", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", pulse: false }
        };
    }
  };

  const agentStates = getAgentStatuses();

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-40px)] relative overflow-hidden bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] rounded-lg border border-[var(--color-border-tertiary)]">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[80px] pointer-events-none animate-glow-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-pink-600/5 rounded-full blur-[80px] pointer-events-none animate-glow-2" />

      {/* Left Column - Showcase (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 relative z-10 border-r border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg logo-mark flex items-center justify-center font-bold">F</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Founder<span className="text-[#534AB7]">OS</span></h1>
            <p className="text-[9px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Marketing Agent Platform</p>
          </div>
        </div>

        {/* Dynamic visual mockup */}
        <div className="my-auto space-y-6 max-w-md">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              Autonomous Agent Workspace Active
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Scale your brand with an autonomous AI marketing team
            </h2>
            <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed">
              Define your brand goals once. Our suite of specialized agents will continuously analyze your market, design social strategies, write content, and track metrics.
            </p>
          </div>

          {/* Simulated Active Agents */}
          <div className="space-y-3">
            {/* Agent 1 */}
            <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] p-3.5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200 shadow-sm">
              <div className={`w-9 h-9 rounded-lg bg-purple-600/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0 relative ${agentStates.strategist.pulse ? 'ring-2 ring-purple-500/30 animate-pulse' : ''}`}>
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[var(--color-text-primary)]">AI Strategist</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border transition-colors duration-300 ${agentStates.strategist.color}`}>
                    {agentStates.strategist.status}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5 transition-all duration-300">{agentStates.strategist.text}</p>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] p-3.5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200 shadow-sm">
              <div className={`w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 relative ${agentStates.copy.pulse ? 'ring-2 ring-blue-500/30 animate-pulse' : ''}`}>
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Social Media & Copy Agent</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border transition-colors duration-300 ${agentStates.copy.color}`}>
                    {agentStates.copy.status}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5 transition-all duration-300">{agentStates.copy.text}</p>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] p-3.5 rounded-xl flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200 shadow-sm">
              <div className={`w-9 h-9 rounded-lg bg-pink-600/10 border border-pink-500/25 flex items-center justify-center text-pink-400 shrink-0 relative ${agentStates.seo.pulse ? 'ring-2 ring-pink-500/30 animate-pulse' : ''}`}>
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[var(--color-text-primary)]">SEO & Market Intel Agent</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border transition-colors duration-300 ${agentStates.seo.color}`}>
                    {agentStates.seo.status}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5 transition-all duration-300">{agentStates.seo.text}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          Secure sandboxed environment • Data encrypted in transit and at rest
        </div>
      </div>

      {/* Right Column - Form / Onboarding */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 z-10">
        {loading ? (
          <div className="text-center bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] p-8 rounded-2xl max-w-sm w-full shadow-sm animate-step-enter">
            <Loader2 className="w-10 h-10 text-[#534AB7] animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-1">Analyzing Brand Assets</h2>
            <p className="text-[var(--color-text-secondary)] text-xs animate-pulse">{statusMessage}</p>
          </div>
        ) : (
          <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] p-8 rounded-2xl max-w-xl w-full shadow-sm my-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg logo-mark flex items-center justify-center font-bold lg:hidden">F</div>
              <div>
                <h2 className="text-xl font-extrabold text-[var(--color-text-primary)]">Get Started with FounderOS</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Configure your digital marketing team in under 2 minutes.</p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 relative px-2">
              <div className="absolute top-1/2 left-6 right-6 h-[1.5px] bg-[var(--color-border-tertiary)] -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-6 right-6 h-[1.5px] bg-[#534AB7] -translate-y-1/2 z-0 transition-all duration-300 origin-left"
                style={{ transform: `scaleX(${(step - 1) / 2})` }}
              />
              
              {[1, 2, 3].map((num) => {
                const isCompleted = step > num;
                const isActive = step === num;
                return (
                  <div key={num} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 border ${
                        isCompleted 
                          ? "bg-[#534AB7] border-[#534AB7] text-white" 
                          : isActive 
                            ? "bg-[var(--color-background-primary)] border-[#534AB7] text-[#534AB7] shadow-sm shadow-[#534AB7]/10" 
                            : "bg-[var(--color-background-primary)] border-[var(--color-border-tertiary)] text-[var(--color-text-tertiary)]"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : num}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-1.5 transition-colors duration-250 ${
                      isActive ? "text-[#534AB7]" : isCompleted ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
                    }`}>
                      {num === 1 ? "Company" : num === 2 ? "Brand" : "Goals"}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Company Profile */}
              {step === 1 && (
                <div className="space-y-4 animate-step-enter">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Company Name <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Acme Corp"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Industry Sector <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Radio className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="B2B SaaS / FinTech"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Target Customer Persona <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <Target className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Startup Founders, Operations Leads, Tech Professionals"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="w-full h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Website URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                        <input
                          type="url"
                          placeholder="https://acme.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStep1Valid}
                      className="btn btn-primary flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Brand & Products */}
              {step === 2 && (
                <div className="space-y-4 animate-step-enter">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">Brand Voice</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Professional, educational, witty (Default: Professional & Inspiring)"
                        value={brandVoice}
                        onChange={(e) => setBrandVoice(e.target.value)}
                        className="w-full h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg pl-9 pr-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Products Offered</label>
                        <button 
                          type="button" 
                          onClick={() => handleAddField(setProducts, products)} 
                          className="text-[10px] text-[#534AB7] font-semibold hover:opacity-80 transition-opacity"
                        >
                          + Add Product
                        </button>
                      </div>
                      {products.map((p, idx) => (
                        <div key={idx} className="flex gap-2 mb-1.5 items-center">
                          <input
                            type="text"
                            placeholder={`Product #${idx+1}`}
                            value={p}
                            onChange={(e) => handleListChange(idx, e.target.value, products, setProducts)}
                            className="flex-1 h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg px-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                          />
                          {products.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveField(idx, products, setProducts)}
                              className="h-10 w-10 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Key Features</label>
                        <button 
                          type="button" 
                          onClick={() => handleAddField(setFeatures, features)} 
                          className="text-[10px] text-[#534AB7] font-semibold hover:opacity-80 transition-opacity"
                        >
                          + Add Feature
                        </button>
                      </div>
                      {features.map((f, idx) => (
                        <div key={idx} className="flex gap-2 mb-1.5 items-center">
                          <input
                            type="text"
                            placeholder={`Core Feature #${idx+1}`}
                            value={f}
                            onChange={(e) => handleListChange(idx, e.target.value, features, setFeatures)}
                            className="flex-1 h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg px-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                          />
                          {features.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveField(idx, features, setFeatures)}
                              className="h-10 w-10 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[var(--color-border-tertiary)]">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-primary flex items-center justify-center gap-1"
                    >
                      Continue
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Strategy & Goals */}
              {step === 3 && (
                <div className="space-y-4 animate-step-enter">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Strategic Goals</label>
                      <button 
                        type="button" 
                        onClick={() => handleAddField(setGoals, goals)} 
                        className="text-[10px] text-[#534AB7] font-semibold hover:opacity-80 transition-opacity"
                      >
                        + Add Goal
                      </button>
                    </div>
                    {goals.map((g, idx) => (
                      <div key={idx} className="flex gap-2 mb-1.5 items-center">
                        <input
                          type="text"
                          placeholder={`Goal #${idx+1} (e.g. Increase signups by 20%)`}
                          value={g}
                          onChange={(e) => handleListChange(idx, e.target.value, goals, setGoals)}
                          className="flex-1 h-10 bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg px-3 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] transition-all duration-200"
                        />
                        {goals.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveField(idx, goals, setGoals)}
                            className="h-10 w-10 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[var(--color-border-tertiary)] gap-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn flex items-center justify-center gap-1 shrink-0"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn btn-primary flex items-center justify-center gap-1"
                    >
                      Assemble Team Strategy
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
