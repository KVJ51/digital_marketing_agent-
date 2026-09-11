import React from "react";

export interface ProvenanceBarProps {
  founder: number;
  broll: number;
  graphics: number;
  aiVisuals: number;
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

/**
 * Screen-time composition bar — the hero metric across FounderOS.
 * Proportional timeline composition with globally fixed track colors:
 * - Amber (#E8A33D) = Authentic founder footage
 * - Moss (#7FA37A) = B-roll
 * - Ash (#A79E8E) = Motion graphics
 * - Tally Red (#C0453B) = AI visuals & synthesis
 */
export function ProvenanceBar({ 
  founder, 
  broll, 
  graphics, 
  aiVisuals,
  className = "",
  showTitle = true,
  compact = false
}: ProvenanceBarProps) {
  const segments = [
    { pct: founder, color: "bg-[#E8A33D]", label: "founder" },
    { pct: broll, color: "bg-[#7FA37A]", label: "b-roll" },
    { pct: graphics, color: "bg-[#A79E8E]", label: "graphics" },
    { pct: aiVisuals, color: "bg-[#C0453B]", label: "AI" },
  ];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#A79E8E]">Screen-time composition</span>
          <span className="font-mono text-[10px] text-[#766E5F] uppercase tracking-wider">Provenance</span>
        </div>
      )}
      <div 
        className={`flex ${compact ? "h-2" : "h-3.5"} overflow-hidden rounded-[3px] bg-[#1A1712] border border-[#3A3427]`}
        role="img" 
        aria-label={`${founder}% founder video, ${broll}% b-roll, ${graphics}% motion graphics, ${aiVisuals}% AI visuals`}
      >
        {segments.map((s) => (
          <div 
            key={s.label} 
            className={`${s.color} transition-all duration-300`} 
            style={{ width: `${s.pct}%` }} 
            title={`${s.label}: ${s.pct}%`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-[#A79E8E]">
        <span className="tabular-nums">
          <span className="text-[#E8A33D] font-medium">{founder}%</span> founder · {" "}
          <span className="text-[#7FA37A] font-medium">{broll}%</span> b-roll · {" "}
          <span className="text-[#A79E8E] font-medium">{graphics}%</span> graphics · {" "}
          <span className="text-[#C0453B] font-medium">{aiVisuals}%</span> AI
        </span>
      </div>
    </div>
  );
}
