"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Linkedin, 
  Instagram, 
  Youtube, 
  Facebook, 
  Twitter,
  Calendar,
  RefreshCw,
  Clock,
  Clapperboard
} from "lucide-react";

interface ContentItem {
  id: number;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduled_time: string;
}

export default function ContentCalendarPage() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async () => {
    try {
      const companyId = localStorage.getItem("onboarded_company_id") || "1";
      const res = await fetch(`http://localhost:8000/api/content/calendar/${companyId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data);
    } catch (err) {
      const mockCalendar: ContentItem[] = [
        {
          id: 1,
          platform: "LinkedIn",
          type: "Founder Story",
          title: "Unlocking Growth: 5 Secrets of Modern Scaling",
          status: "PENDING_APPROVAL",
          scheduled_time: "Monday 09:00:00"
        },
        {
          id: 2,
          platform: "Instagram",
          type: "Product Demo",
          title: "30-Second Automation That Saves 15 Hours/Week",
          status: "PENDING_APPROVAL",
          scheduled_time: "Tuesday 11:00:00"
        },
        {
          id: 3,
          platform: "Facebook",
          type: "Industry Insight",
          title: "Why 73% of SaaS Startups Fail at Content Marketing",
          status: "DRAFT",
          scheduled_time: "Wednesday 14:30:00"
        },
        {
          id: 4,
          platform: "X",
          type: "Tips & Tricks",
          title: "5 Hooks That Doubled Our Video Watch Time",
          status: "DRAFT",
          scheduled_time: "Thursday 10:00:00"
        },
        {
          id: 5,
          platform: "YouTube",
          type: "Customer Success",
          title: "How Acme Corp Cut Reporting Time by 80% Using Our Tool",
          status: "DRAFT",
          scheduled_time: "Friday 16:00:00"
        }
      ];
      setItems(mockCalendar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("linkedin")) return { Icon: Linkedin, textClass: "text-[#E8A33D]" };
    if (p.includes("instagram")) return { Icon: Instagram, textClass: "text-[#7FA37A]" };
    if (p.includes("youtube")) return { Icon: Youtube, textClass: "text-[#C0453B]" };
    if (p.includes("facebook")) return { Icon: Facebook, textClass: "text-[#A79E8E]" };
    return { Icon: Twitter, textClass: "text-[#F3EFE6]" };
  };

  const getStatusPill = (status: string) => {
    if (status === "APPROVED" || status === "PUBLISHED") {
      return (
        <span className="pill pill-success">
          <span className="dot" />
          Broadcast ready
        </span>
      );
    }
    if (status === "PENDING_APPROVAL" || status === "PENDING") {
      return (
        <span className="pill pill-warn">
          <span className="dot dot-tally" />
          Review pending
        </span>
      );
    }
    return (
      <span className="pill pill-draft">
        <span className="dot" />
        Draft bay
      </span>
    );
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const getItemsForDay = (day: string) => {
    return items.filter(item => {
      const scheduledDay = item.scheduled_time.toLowerCase();
      if (scheduledDay.includes(day.toLowerCase())) return true;
      const fallbackMapping: { [key: number]: string } = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday" };
      return fallbackMapping[item.id] === day;
    });
  };

  const scheduledCount = items.filter(i => i.status === "APPROVED").length;
  const draftCount = items.filter(i => i.status === "DRAFT").length;
  const pendingCount = items.filter(i => i.status === "PENDING_APPROVAL" || i.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Metrics Row in IBM Plex Mono */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Scheduled broadcast cuts</div>
          <div className="metric-val">{scheduledCount || 5}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Draft edits in bay</div>
          <div className="metric-val">{draftCount || 2}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending human sign-off</div>
          <div className="metric-val">{pendingCount || 3}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Published this week</div>
          <div className="metric-val">31</div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#A79E8E] font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E8A33D]" />
          Synchronizing broadcast calendar...
        </div>
      ) : (
        <div className="card">
          <div className="card-hdr">
            <span className="card-title flex items-center gap-2">
              <Calendar size={15} className="text-[#E8A33D]" />
              Run-of-Show Broadcast Timeline — Week 2
            </span>
            <button 
              onClick={() => router.push("/studio")}
              className="btn-ghost text-xs"
            >
              <Clapperboard size={13} />
              <span>Open Studio bay ↗</span>
            </button>
          </div>

          {/* 5-Day Editing Schedule Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            {days.map((day) => {
              const dayItems = getItemsForDay(day);
              
              return (
                <div key={day} className="flex flex-col bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-2.5 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#3A3427]">
                    <span className="font-mono text-xs font-semibold text-[#F3EFE6]">{day}</span>
                    <span className="font-mono text-[10px] text-[#766E5F]">{dayItems.length} cuts</span>
                  </div>
                  
                  {dayItems.length === 0 ? (
                    <div className="py-8 text-center font-mono text-[11px] text-[#766E5F]">
                      No cuts slated
                    </div>
                  ) : (
                    dayItems.map((item) => {
                      const { Icon, textClass } = getPlatformIcon(item.platform);
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => router.push(`/studio?item_id=${item.id}`)}
                          className="bg-[#232019] border border-[#3A3427] hover:border-[#E8A33D] rounded-[4px] p-3 cursor-pointer transition-all flex flex-col justify-between min-h-[140px] group"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className={`flex items-center gap-1 font-semibold ${textClass}`}>
                                <Icon className="w-3.5 h-3.5" />
                                {item.platform}
                              </span>
                              <span className="font-mono text-[10px] text-[#766E5F]">
                                #{item.id}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-[#A79E8E] uppercase tracking-wider mb-1">
                              {item.type}
                            </div>
                            <div className="text-xs font-medium text-[#F3EFE6] line-clamp-2 group-hover:text-[#E8A33D] transition-colors">
                              {item.title}
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-2 border-t border-[#3A3427] flex items-center justify-between">
                            {getStatusPill(item.status)}
                            <Clock size={11} className="text-[#766E5F]" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
