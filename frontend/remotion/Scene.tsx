import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SceneProps {
  visualUrl: string;
  textOverlay: string;
  duration: number;
}

export const Scene: React.FC<SceneProps> = ({ visualUrl, textOverlay, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom / Ken Burns effect animation
  const scale = interpolate(frame, [0, duration * fps], [1.0, 1.15], {
    extrapolateRight: "clamp",
  });

  // Text slide-up & fade-in animation
  const springValue = spring({
    frame,
    fps,
    config: { damping: 12 },
  });
  
  const textTranslateY = interpolate(springValue, [0, 1], [40, 0]);
  const textOpacity = interpolate(springValue, [0, 1], [0, 1]);

  const isVideo = visualUrl.endsWith(".mp4") || visualUrl.includes("video-files");

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Background Media */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: "transform 0.1s linear",
        }}
      >
        {isVideo ? (
          <video
            src={visualUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={visualUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="scene media"
          />
        )}
      </div>

      {/* Dim overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Kinetic Text Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "8%",
          right: "8%",
          display: "flex",
          justifyContent: "center",
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "16px",
            padding: "16px 24px",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          {textOverlay}
        </div>
      </div>
    </div>
  );
};
