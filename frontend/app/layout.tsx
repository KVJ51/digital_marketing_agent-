"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Rail } from "../components/Rail";
import { ChevronRight, Sparkles, Circle } from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [timecode, setTimecode] = useState("00:14:32:18");

  // Simulated live running timecode in IBM Plex Mono
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      const f = String(Math.floor((d.getMilliseconds() / 1000) * 30)).padStart(2, "0");
      setTimecode(`${h}:${m}:${s}:${f}`);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // If we are on root landing (onboarding / setup page), allow full view or clean calibration deck
  const isOnboarding = pathname === "/onboarding" || pathname === "/";

  const titles: { [key: string]: { section: string; title: string } } = {
    "/dashboard": { section: "Command", title: "Run of show" },
    "/strategy": { section: "Command", title: "Strategy hub" },
    "/calendar": { section: "Production", title: "Content calendar" },
    "/studio": { section: "Production", title: "Video studio bay" },
    "/editor": { section: "Production", title: "Mode B: Manual Multi-Clip Editor" },
    "/copilot": { section: "Production", title: "Mode C: AI Copilot Bay" },
    "/approvals": { section: "Production", title: "Approvals queue" },
    "/analytics": { section: "Intelligence", title: "Analytics & telemetry" },
    "/memory": { section: "Intelligence", title: "Memory knowledge graph" },
    "/agents": { section: "Intelligence", title: "Agent status" },
    "/": { section: "Settings", title: "Production calibration" },
    "/onboarding": { section: "Settings", title: "Production calibration" }
  };

  const currentInfo = titles[pathname] || { section: "FounderOS", title: "Editing Bay" };

  return (
    <html lang="en" className="dark">
      <head>
        <title>FounderOS — The Editing Bay</title>
        <meta name="description" content="AI Multi-Agent Marketing Team & Video Post-Production Suite for Founders" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#1A1712] text-[#F3EFE6] selection:bg-[#E8A33D] selection:text-[#1A1712]">
        {isOnboarding ? (
          children
        ) : (
          <div className="p-2 md:p-3 min-h-screen flex flex-col">
            <div className="shell flex-1">
              {/* Editing Bay Left Rail Navigation */}
              <Rail />

              {/* Main Monitor & Stage Area */}
              <main className="main">
                <header className="topbar">
                  {/* View breadcrumb & title */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-[#766E5F] font-medium tracking-wide uppercase">
                      {currentInfo.section}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#3A3427]" />
                    <h1 className="topbar-title">{currentInfo.title}</h1>
                  </div>

                  {/* Right controls: Live Timecode, Agent Status, Single Filled Primary Action */}
                  <div className="flex items-center gap-4 ml-auto">
                    {/* Timecode HUD */}
                    <div className="hidden sm:flex items-center gap-2 border border-[#3A3427] bg-[#1A1712] px-2.5 py-1 rounded-[4px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C0453B] animate-pulse" />
                      <span className="font-mono text-xs text-[#E8A33D] tabular-nums tracking-widest">
                        {timecode}
                      </span>
                    </div>

                    {/* Agents Online Tag */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-[#7FA37A] border border-[#7FA37A]/30 bg-[#7FA37A]/10 px-2.5 py-1 rounded-[4px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7FA37A]" />
                      <span>9 agents online</span>
                    </div>

                    {/* Single Filled Accent Button */}
                    <button 
                      onClick={() => alert("AI Strategy Agent: Generated 5 new campaign angles for the upcoming marketing cycle.")}
                      className="btn-primary"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>New week ↗</span>
                    </button>
                  </div>
                </header>

                <div className="content">
                  {children}
                </div>
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
