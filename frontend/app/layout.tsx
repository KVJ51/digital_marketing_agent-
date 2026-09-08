"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  Video, 
  CheckSquare, 
  BarChart3, 
  Brain,
  Bot,
  Settings,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("founderos_theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      // Default to dark mode for sleek AI aesthetic
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("founderos_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const categories = [
    {
      title: "Command",
      items: [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Strategy hub", href: "/strategy", icon: Target },
        { name: "Content calendar", href: "/calendar", icon: Calendar },
      ]
    },
    {
      title: "Production",
      items: [
        { name: "Video studio", href: "/studio", icon: Video },
        { name: "Approvals", href: "/approvals", icon: CheckSquare, badge: 3 },
      ]
    },
    {
      title: "Intelligence",
      items: [
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Memory graph", href: "/memory", icon: Brain },
        { name: "Agent status", href: "/agents", icon: Bot },
      ]
    }
  ];

  // If we are on root landing (onboarding page), don't show sidebar or topbar
  const isOnboarding = pathname === "/onboarding" || pathname === "/";

  const titles: { [key: string]: string } = {
    "/dashboard": "Overview",
    "/strategy": "Strategy hub",
    "/calendar": "Content calendar",
    "/studio": "Video studio",
    "/approvals": "Approvals queue",
    "/analytics": "Analytics & insights",
    "/memory": "Memory knowledge graph",
    "/agents": "Agent status",
    "/": "Company setup",
    "/onboarding": "Company setup"
  };
  const pageTitle = titles[pathname] || "Dashboard";

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <title>FounderOS AI Digital Marketing Agent</title>
        <meta name="description" content="AI Multi-Agent Marketing Team for Founders" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen p-2 md:p-3 selection:bg-[#6366f1] selection:text-white">
        <div className="shell">
          {/* Sidebar */}
          {!isOnboarding && (
            <aside className="nav" role="navigation" aria-label="Main navigation">
              <div className="nav-logo">
                <div className="logo-mark">F</div>
                <div className="min-w-0">
                  <div className="logo-text">FounderOS</div>
                  <div className="logo-sub">AI Marketing Agent</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 px-1">
                {categories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="nav-section">{cat.title}</div>
                    {cat.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`nav-item ${isActive ? "active" : ""}`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.name}</span>
                          {item.badge !== undefined && (
                            <span className="nav-badge">{item.badge}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="nav-footer">
                <Link
                  href="/"
                  className={`nav-item ${pathname === "/" ? "active" : ""}`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Company setup</span>
                </Link>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main className="main">
            {!isOnboarding && (
              <header className="topbar">
                {/* Breadcrumb & Title */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-[var(--color-text-tertiary)] hidden sm:inline font-medium">FounderOS</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] hidden sm:inline" />
                  <h1 className="topbar-title">{pageTitle}</h1>
                </div>

                {/* Center / Right controls */}
                <div className="flex items-center gap-3 ml-auto">
                  <span className="pill pill-success hidden md:inline-flex shadow-xs">
                    <span className="dot" />
                    9 agents online
                  </span>

                  {/* Theme Switcher Button */}
                  {mounted && (
                    <button
                      onClick={toggleTheme}
                      className="theme-toggle-btn"
                      title={theme === "dark" ? "Switch to Light theme" : "Switch to Dark theme"}
                      aria-label="Toggle theme"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="hidden sm:inline font-semibold">Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="hidden sm:inline font-semibold">Dark</span>
                        </>
                      )}
                    </button>
                  )}

                  <button 
                    onClick={() => alert("AI Strategy Agent: Generated 5 new campaign angles for the upcoming marketing cycle.")}
                    className="btn btn-primary shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New week ↗</span>
                  </button>
                </div>
              </header>
            )}

            <div className="content">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
