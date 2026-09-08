import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface SubtitleWord {
  text: string;
  start: number;
  end: number;
}

interface SubtitlesProps {
  subtitles: SubtitleWord[];
}

export const Subtitles: React.FC<SubtitlesProps> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find the active index
  const activeIndex = subtitles.findIndex(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  if (activeIndex === -1) {
    return null;
  }

  // Get a window of 3 words around the active word
  const startIdx = Math.max(0, activeIndex - 1);
  const endIdx = Math.min(subtitles.length, activeIndex + 2);
  const wordWindow = subtitles.slice(startIdx, endIdx);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "8%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          fontSize: "36px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "8px 24px",
          borderRadius: "8px",
          textShadow: "0px 0px 8px rgba(0, 0, 0, 0.8), 2px 2px 2px rgba(0, 0, 0, 1)",
        }}
      >
        {wordWindow.map((word, idx) => {
          const isWordActive = startIdx + idx === activeIndex;
          return (
            <span
              key={idx}
              style={{
                color: isWordActive ? "#a855f7" : "#ffffff", // Purple for active, white for inactive
                transform: isWordActive ? "scale(1.2)" : "scale(1.0)",
                transition: "transform 0.05s ease-out, color 0.05s ease-out",
                display: "inline-block",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
