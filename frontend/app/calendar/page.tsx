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
  RefreshCw
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
      // Mock Fallbacks matching founderos_dashboard.html calendar exactly
      const mockCalendar: ContentItem[] = [
        {
          id: 1,
          platform: "LinkedIn",
          type: "Founder Story",
          title: "Unlocking Growth: 5 Secrets of Modern Scaling",
          status: "PENDING_APPROVAL",
          scheduled_time: "Monday"
        },
        {
          id: 2,
          platform: "Instagram",
          type: "Product Demo",
          title: "30-Second Automation That Saves 15 Hours/Week",
          status: "PENDING_APPROVAL",
          scheduled_time: "Tuesday"
        },
        {
          id: 3,
          platform: "Facebook",
          type: "Industry Insight",
          title: "Why 73% of SaaS Startups Fail at Content Marketing",
          status: "DRAFT",
          scheduled_time: "Wednesday"
        },
        {
          id: 4,
          platform: "X",
          type: "Tips & Tricks",
          title: "5 Hooks That Doubled Our Video Watch Time",
          status: "DRAFT",
          scheduled_time: "Thursday"
        },
        {
          id: 5,
          platform: "YouTube",
          type: "Customer Success",
          title: "How Acme Corp Cut Reporting Time by 80% Using Our Tool",
          status: "DRAFT",
          scheduled_time: "Friday"
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
    if (p.includes("linkedin")) return { Icon: Linkedin, className: "ci-linkedin" };
    if (p.includes("instagram")) return { Icon: Instagram, className: "ci-instagram" };
    if (p.includes("youtube")) return { Icon: Youtube, className: "ci-youtube" };
    if (p.includes("facebook")) return { Icon: Facebook, className: "ci-facebook" };
    return { Icon: Twitter, className: "ci-x" };
  };

  const getStatusPill = (status: string) => {
    if (status === "APPROVED" || status === "PUBLISHED") {
      return (
        <span className="pill pill-success">
          <span className="dot" />
          Published
        </span>
      );
    }
    if (status === "PENDING_APPROVAL" || status === "PENDING") {
      return (
        <span className="pill pill-warn">
          <span className="dot" />
          Pending
        </span>
      );
    }
    return (
      <span className="pill pill-draft">
        <span className="dot" />
        Draft
      </span>
    );
  };

  // Group items by day of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const getItemsForDay = (day: string) => {
    return items.filter(item => {
      const scheduledDay = item.scheduled_time.toLowerCase();
      // check if it contains the day name (e.g. "monday" or matched index)
      if (scheduledDay.includes(day.toLowerCase())) return true;
      
      // Fallback index mapping if backend uses dates
      const date = new Date(item.scheduled_time);
      if (!isNaN(date.getTime())) {
        const dayIdx = date.getDay(); // 0 is Sunday, 1 is Monday
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return dayNames[dayIdx] === day;
      }
      
      // fallback matching by order
      const fallbackMapping: { [key: number]: string } = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday" };
      return fallbackMapping[item.id] === day;
    });
  };

  const scheduledCount = items.filter(i => i.status === "APPROVED").length;
  const draftCount = items.filter(i => i.status === "DRAFT").length;
  const pendingCount = items.filter(i => i.status === "PENDING_APPROVAL" || i.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-step-enter">
      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Scheduled this week</div>
          <div className="metric-val">{scheduledCount || 5}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">In draft</div>
          <div className="metric-val">{draftCount || 2}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending review</div>
          <div className="metric-val">{pendingCount || 3}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Published</div>
          <div className="metric-val">0</div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#534AB7]" />
          Loading content calendar...
        </div>
      ) : (
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">5-day content calendar — Week 1</span>
            <span 
              className="card-action"
              onClick={() => router.push("/studio")}
            >
              View scripts ↗
            </span>
          </div>

          <div className="cal-grid">
            {days.map((day) => {
              const dayItems = getItemsForDay(day);
              
              return (
                <div key={day} className="space-y-2">
                  <div className="cal-col-hdr">{day}</div>
                  
                  {dayItems.length === 0 ? (
                    <div className="border border-dashed border-[var(--color-border-tertiary)] rounded-md p-4 text-center text-[10px] text-[var(--color-text-tertiary)]">
                      Empty
                    </div>
                  ) : (
                    dayItems.map((item) => {
                      const { Icon, className } = getPlatformIcon(item.platform);
                      return (
                        <div 
                          key={item.id} 
                          className="cal-item flex flex-col justify-between min-h-[140px]"
                          onClick={() => router.push(`/studio?item_id=${item.id}`)}
                        >
                          <div>
                            <div className={`cal-platform ${className} flex items-center gap-1`}>
                              <Icon className="w-3.5 h-3.5" />
                              {item.platform}
                            </div>
                            <div className="cal-type">{item.type}</div>
                            <div className="cal-title">{item.title}</div>
                          </div>
                          
                          <div className="mt-4">
                            {getStatusPill(item.status)}
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
