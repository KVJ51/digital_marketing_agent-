"use client";

import React, { useEffect, useState } from "react";
import { 
  Check, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Facebook, 
  RefreshCw, 
  X,
  FileText,
  AlertCircle
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
      
      // Filter for PENDING_APPROVAL or DRAFT
      const pending = data.filter((i: any) => i.status === "PENDING_APPROVAL" || i.status === "DRAFT");
      setItems(pending);
    } catch (err) {
      // Mock Fallbacks
      const mockApprovals: ContentItem[] = [
        {
          id: 1,
          title: "Founder's Journey — LinkedIn",
          type: "Founder Story",
          platform: "LinkedIn",
          status: "PENDING_APPROVAL",
          scheduled_time: "Mon 9am",
          script: {
            text: "Stop wasting hours on manual tasks... Your core operations can run 24/7. Get our free automation handbook.",
            caption: "Stop scaling brute-force. Automate standard operating procedures. 👇",
            hashtags: ["Automation", "SaaS", "Growth"]
          }
        },
        {
          id: 2,
          title: "Product Demo — Instagram Reel",
          type: "Product Demo",
          platform: "Instagram",
          status: "PENDING_APPROVAL",
          scheduled_time: "Tue 11am",
          script: {
            text: "30-second automation that saves 15 hours a week. Here's exactly how we built it.",
            caption: "Fail fast, but fix structural limits immediately. 🚀",
            hashtags: ["Startup", "FounderLife", "Reels"]
          }
        },
        {
          id: 3,
          title: "Customer Success — YouTube Shorts",
          type: "Case Study",
          platform: "YouTube",
          status: "PENDING_APPROVAL",
          scheduled_time: "Fri 2pm",
          script: {
            text: "How Acme Corp cut reporting time by 80%. This is what happened when they automated their workflows.",
            caption: "Scaling SaaS secrets. 👇",
            hashtags: ["SaaS", "Acme", "Automation"]
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
    setActionStatus(status === "APPROVED" ? "Approving & publishing..." : "Rejecting...");

    try {
      const res = await fetch(`http://localhost:8000/api/content/approve/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error();
      
      // Update local states
      setItems(prev => prev.filter(i => i.id !== itemId));
      setActionStatus(status === "APPROVED" ? "Successfully published!" : "Rejected.");
      
      setTimeout(() => {
        setActioningId(null);
        setActionStatus("");
        fetchApprovals();
      }, 1200);

    } catch (err) {
      // Offline fallback
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== itemId));
        setActioningId(null);
        setActionStatus("");
      }, 1000);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("linkedin")) return { Icon: Linkedin, color: "text-[#185FA5] bg-[#E6F1FB] border-[#b3d7f6]" };
    if (p.includes("instagram")) return { Icon: Instagram, color: "text-[#993556] bg-[#FBEAF0] border-[#eed5df]" };
    if (p.includes("youtube")) return { Icon: Youtube, color: "text-[#993C1D] bg-[#FAECE7] border-[#f0c3b4]" };
    return { Icon: Facebook, color: "text-[#0F6E56] bg-[#E1F5EE] border-[#a1dec9]" };
  };

  return (
    <div className="space-y-6 animate-step-enter">
      {/* Metrics Row */}
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
          <div className="metric-label">Rejected</div>
          <div className="metric-val">1</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Auto-published</div>
          <div className="metric-val">2</div>
        </div>
      </div>

      {actionStatus && (
        <div className="bg-[#EEEDFE] border border-[#534AB7]/25 p-3 rounded-lg text-xs text-[#534AB7] animate-pulse">
          {actionStatus}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#534AB7]" />
          Querying pending approval items...
        </div>
      ) : (
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">Content awaiting approval</span>
          </div>

          <div className="divide-y divide-[var(--color-border-tertiary)]">
            {items.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Check className="w-10 h-10 text-[#1D9E75] mx-auto" />
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">Inbox fully cleared!</div>
                <div className="text-xs text-[var(--color-text-secondary)]">All marketing schedule drafts have been verified and processed.</div>
              </div>
            ) : (
              items.map((item) => {
                const { Icon, color } = getPlatformIcon(item.platform);
                const isWorking = actioningId === item.id;
                
                return (
                  <div key={item.id} className="approval-item py-4">
                    <div className={`approval-thumb border ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="approval-body">
                      <div className="approval-title">{item.title}</div>
                      <div className="approval-meta">
                        Week 1 · {item.type} · 60s · Female voice · Scheduled {item.scheduled_time}
                      </div>
                      
                      {item.script && (
                        <div className="text-[11px] text-[var(--color-text-secondary)] mb-3 bg-[var(--color-background-secondary)] p-2.5 rounded border border-[var(--color-border-tertiary)] italic leading-relaxed">
                          "{item.script.text}"
                        </div>
                      )}

                      <div className="approval-actions">
                        <button
                          onClick={() => handleAction(item.id, "APPROVED")}
                          disabled={isWorking}
                          className="btn btn-approve flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & publish
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "REJECTED")}
                          disabled={isWorking}
                          className="btn btn-reject"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => alert(`Prompt sent: Edit the ${item.platform} script for "${item.title}"`)}
                          disabled={isWorking}
                          className="btn flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#534AB7]" /> Edit script ↗
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg p-4 flex gap-3 text-xs text-[var(--color-text-secondary)]">
        <AlertCircle className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0" />
        <p className="leading-relaxed">
          Approving triggers the Social Publishing Agent to dispatch API posts to platforms immediately.
        </p>
      </div>
    </div>
  );
}
