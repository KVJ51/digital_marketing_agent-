"use client";

import React from "react";
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
  Sparkles
} from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
    "/approvals": "Approvals",
    "/analytics": "Analytics",
    "/memory": "Memory graph",
    "/agents": "Agent status",
    "/": "Company setup",
    "/onboarding": "Company setup"
  };
  const pageTitle = titles[pathname] || "Dashboard";

  return (
    <html lang="en">
      <head>
        <title>FounderOS AI Digital Marketing Agent</title>
        <meta name="description" content="AI Multi-Agent Marketing Team for Founders" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen p-2.5">
        <div className="shell">
          {/* Sidebar */}
          {!isOnboarding && (
            <nav className="nav" role="navigation" aria-label="Main navigation">
              <div className="nav-logo">
                <div className="logo-mark">F</div>
                <div>
                  <div className="logo-text">FounderOS</div>
                  <div className="logo-sub">AI Marketing Agent</div>
                </div>
              </div>

              <div className="nav-section">Command</div>
              {categories[0].items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="nav-section">Production</div>
              {categories[1].items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                    {item.badge !== undefined && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </Link>
                );
              })}

              <div className="nav-section">Intelligence</div>
              {categories[2].items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="nav-footer">
                <Link
                  href="/"
                  className={`nav-item ${pathname === "/" ? "active" : ""}`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  Company setup
                </Link>
              </div>
            </nav>
          )}

          {/* Main Area */}
          <main className="main">
            {!isOnboarding && (
              <div className="topbar">
                <span className="topbar-title">{pageTitle}</span>
                <span className="pill pill-success">
                  <span className="dot" />
                  9 agents online
                </span>
                <button 
                  onClick={() => alert("Prompt sent: Generate a new weekly marketing strategy for week 2")}
                  className="btn btn-primary"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  New week ↗
                </button>
              </div>
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
