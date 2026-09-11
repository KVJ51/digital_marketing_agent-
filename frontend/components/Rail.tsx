"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Target,
  Calendar, 
  Sparkles,
  Scissors,
  Wand2, 
  ListChecks, 
  BarChart3, 
  Network,
  Bot,
  Settings,
  Film
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  badge?: number;
}

const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Run of show", icon: LayoutDashboard },
  { href: "/strategy", label: "Strategy hub", icon: Target },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/studio?mode=AI_GENERATED", label: "Mode A: AI Studio", icon: Sparkles },
  { href: "/editor", label: "Mode B: Manual Multi-Clip", icon: Scissors },
  { href: "/studio?mode=HYBRID", label: "Mode C: AI Copilot Bay", icon: Wand2 },
  { href: "/approvals", label: "Approvals", icon: ListChecks, badge: 3 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/memory", label: "Memory graph", icon: Network },
  { href: "/agents", label: "Agent status", icon: Bot },
];

export function Rail() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Editing bay navigation"
      className="flex w-16 flex-col items-center justify-between border-r border-[#3A3427] bg-[#232019] py-3.5 select-none shrink-0"
    >
      {/* Top Reel Logo Mark */}
      <div className="flex flex-col items-center gap-4 w-full">
        <Link 
          href="/dashboard"
          className="group relative flex h-9 w-9 items-center justify-center rounded border border-[#3A3427] bg-[#1A1712] transition-colors hover:border-[#E8A33D]"
          title="FounderOS — The Editing Bay"
        >
          <span className="font-mono text-sm font-bold text-[#E8A33D]">F</span>
          <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />
        </Link>

        {/* Navigation Reel Rack */}
        <nav className="flex w-full flex-col items-center gap-2 mt-1">
          {ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const baseHref = href.split("?")[0];
            const active = pathname === href || (baseHref !== "/" && pathname === baseHref && !href.includes("?")) || (href.includes("/studio") && pathname === "/studio");
            return (
              <div key={href} className="relative group w-full flex justify-center">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex w-full items-center justify-center py-2.5 transition-all ${
                    active
                      ? "border-y-2 border-[#E8A33D] bg-[#2C281F]/60 text-[#E8A33D]"
                      : "text-[#A79E8E] hover:text-[#F3EFE6] hover:bg-[#2C281F]/30"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {badge && (
                    <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />
                  )}
                </Link>

                {/* Micro Tooltip */}
                <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden rounded border border-[#3A3427] bg-[#1A1712] px-2 py-1 text-[11px] font-medium text-[#F3EFE6] shadow-lg whitespace-nowrap group-hover:block">
                  {label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings Link */}
      <div className="relative group w-full flex justify-center border-t border-[#3A3427] pt-3">
        <Link
          href="/"
          aria-label="Setup & Configuration"
          className={`flex w-full items-center justify-center py-2 transition-all ${
            pathname === "/" || pathname === "/onboarding"
              ? "border-y-2 border-[#E8A33D] text-[#E8A33D]"
              : "text-[#766E5F] hover:text-[#F3EFE6]"
          }`}
        >
          <Settings size={17} strokeWidth={1.75} />
        </Link>
        <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden rounded border border-[#3A3427] bg-[#1A1712] px-2 py-1 text-[11px] font-medium text-[#F3EFE6] shadow-lg whitespace-nowrap group-hover:block">
          Company setup
        </div>
      </div>
    </aside>
  );
}
