"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProvenanceBar } from "../../components/ProvenanceBar";
import { 
  Check, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Facebook, 
  RefreshCw, 
  X, 
  FileText, 
  Clapperboard,
  CheckSquare
} from "lucide-react";

interface ContentItem {
  id: number;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduled_time: string;
  script?: {
    text: string;
    caption: string;
    hashtags: string[];
  };
}

export default function ApprovalCenter() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionStatus, setActionStatus] = useState("");

  const fetchApprovals = async () => {
    try {
      const companyId = localStorage.getItem("onboarded_company_id") || "1";
      const res = await fetch(`http://localhost:8000/api/content/calendar/${companyId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      const pending = data.filter((i: any) => i.status === "PENDING_APPROVAL" || i.status === "DRAFT");
      setItems(pending);
    } catch (err) {
      const mockApprovals: ContentItem[] = [
        {
          id: 101,
          title: "Hybrid Founder Cut — Product Churn Explanation",
          type: "Hybrid Cut (Founder + AI)",
          platform: "Instagram",
          status: "PENDING_APPROVAL",
          scheduled_time: "Today 17:00:00",
          script: {
            text: "Most SaaS founders lose over sixty percent of their users right after sign-up. We analyzed 500 sessions and discovered 60% of churn happens on step two. Our retention grew 40% in 90 days. Comment Playbook below.",
            caption: "Stop scaling brute-force. How we fixed step-2 onboarding churn and grew retention 40%. 👇",
            hashtags: ["FounderLife", "SaaSGrowth", "HybridVideo", "FounderOS"]
          }
        },
        {
          id: 1,
          title: "Founder's Journey — Automation Playbook",
          type: "Founder Story",
          platform: "LinkedIn",
          status: "PENDING_APPROVAL",
          scheduled_time: "Mon 09:00:00",
          script: {
            text: "Stop wasting hours on manual tasks... Your core operations can run 24/7. Get our free automation handbook.",
            caption: "Stop scaling brute-force. Automate standard operating procedures. 👇",
            hashtags: ["Automation", "SaaS", "Growth"]
          }
        },
        {
          id: 2,
          title: "Product Demo — 30-Second Automation Reel",
          type: "Product Demo",
          platform: "Instagram",
          status: "PENDING_APPROVAL",
          scheduled_time: "Tue 11:00:00",
          script: {
            text: "30-second automation that saves 15 hours a week. Here's exactly how we built it.",
            caption: "Fail fast, but fix structural limits immediately. 🚀",
            hashtags: ["Startup", "FounderLife", "Reels"]
          }
        }
      ];
      setItems(mockApprovals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (itemId: number, status: "APPROVED" | "REJECTED") => {
    setActioningId(itemId);
    setActionStatus(status === "APPROVED" ? "Approving cut & committing to schedule..." : "Rejecting cut...");

    try {
      const res = await fetch(`http://localhost:8000/api/content/approve/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error();
      
      setItems(prev => prev.filter(i => i.id !== itemId));
      setActionStatus(status === "APPROVED" ? "Cut approved and queued for broadcast!" : "Cut rejected.");
      
      setTimeout(() => {
        setActioningId(null);
        setActionStatus("");
        fetchApprovals();
      }, 1200);

    } catch (err) {
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== itemId));
        setActioningId(null);
        setActionStatus("");
      }, 1000);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("linkedin")) return { Icon: Linkedin, color: "text-[#E8A33D] bg-[#1A1712] border-[#E8A33D]/30" };
    if (p.includes("instagram")) return { Icon: Instagram, color: "text-[#7FA37A] bg-[#1A1712] border-[#7FA37A]/30" };
    if (p.includes("youtube")) return { Icon: Youtube, color: "text-[#C0453B] bg-[#1A1712] border-[#C0453B]/30" };
    return { Icon: Facebook, color: "text-[#A79E8E] bg-[#1A1712] border-[#A79E8E]/30" };
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row in IBM Plex Mono */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Awaiting review</div>
          <div className="metric-val">{items.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Approved today</div>
          <div className="metric-val">2</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Rejected / revised</div>
          <div className="metric-val">1</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Autopilot queue</div>
          <div className="metric-val">2</div>
        </div>
      </div>

      {actionStatus && (
        <div className="bg-[#2C281F] border border-[#E8A33D]/40 p-3 rounded-[4px] text-xs text-[#E8A33D] font-mono animate-pulse">
          {actionStatus}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[#A79E8E] font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E8A33D]" />
          Synchronizing approval bay...
        </div>
      ) : (
        <div className="card">
          <div className="card-hdr">
            <span className="card-title flex items-center gap-2">
              <CheckSquare size={15} className="text-[#E8A33D]" />
              Footage & Cuts Awaiting Human Sign-off
            </span>
            <span className="font-mono text-xs text-[#A79E8E]">
              Queue length: <span className="text-[#E8A33D]">{items.length}</span>
            </span>
          </div>

          <div className="divide-y divide-[#3A3427]">
            {items.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Check className="w-8 h-8 text-[#7FA37A] mx-auto" />
                <div className="text-sm font-semibold text-[#F3EFE6]">Queue fully cleared</div>
                <div className="text-xs text-[#A79E8E]">All video edits and schedule items have received founder approval.</div>
              </div>
            ) : (
              items.map((item) => {
                const { Icon, color } = getPlatformIcon(item.platform);
                const isWorking = actioningId === item.id;
                const isHybrid = item.type.includes("Hybrid");
                
                return (
                  <div key={item.id} className="hairline-row py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-[4px] border ${color} shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[#F3EFE6]">{item.title}</span>
                            {isHybrid ? (
                              <span className="border border-[#E8A33D]/40 bg-[#E8A33D]/10 text-[#E8A33D] text-[10px] font-mono px-2 py-0.5 rounded-[3px]">
                                ⚡ Hybrid (Founder + AI)
                              </span>
                            ) : (
                              <span className="pill pill-info text-[10px]">{item.type}</span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-[#A79E8E] mt-1">
                            Platform: <span className="text-[#F3EFE6]">{item.platform}</span> · 
                            Duration: <span className="text-[#E8A33D]">{isHybrid ? "00:01:08:00" : "00:00:45:00"}</span> · 
                            Target Broadcast: <span className="text-[#F3EFE6]">{item.scheduled_time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions: Approve (Moss), Reject (Ghost), Open in Bay (Ghost) */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => router.push(`/studio?item_id=${item.id}`)}
                          className="btn-ghost text-xs"
                          title="Open in studio bay"
                        >
                          <Clapperboard size={13} />
                          <span>Inspect in Bay</span>
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "REJECTED")}
                          disabled={isWorking}
                          className="btn-reject px-3 py-1.5 text-xs font-medium border"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "APPROVED")}
                          disabled={isWorking}
                          className="btn-approve px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5"
                        >
                          <Check size={13} />
                          <span>Approve cut</span>
                        </button>
                      </div>
                    </div>

                    {/* Standardized ProvenanceBar */}
                    <div className="bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-3">
                      <ProvenanceBar
                        founder={isHybrid ? 68 : 80}
                        broll={isHybrid ? 18 : 10}
                        graphics={isHybrid ? 9 : 5}
                        aiVisuals={isHybrid ? 5 : 5}
                        showTitle={true}
                        compact={false}
                      />
                    </div>

                    {/* Script Excerpt */}
                    {item.script && (
                      <div className="font-mono text-xs text-[#A79E8E] bg-[#1A1712] p-2.5 rounded-[4px] border border-[#3A3427] leading-relaxed">
                        &quot;{item.script.text}&quot;
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
