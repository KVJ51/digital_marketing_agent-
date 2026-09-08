import React from "react";
import { Audio, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface SubtitleWord {
  text: string;
  start: number;
  end: number;
  highlight?: boolean;
}

export interface VideoSlice {
  start: number;
  end: number;
  duration: number;
  source: string;
  zoom?: number;
  crop?: string;
  type?: string;
}

export interface BrollSlice {
  start: number;
  end: number;
  duration: number;
  url: string;
  query?: string;
  source?: string;
  transition?: string;
  text_overlay?: string;
}

export interface GraphicCard {
  start: number;
  end: number;
  duration: number;
  type: string;
  headline: string;
  value: string;
  subtext: string;
  badge?: string;
  bg_style?: string;
  color?: string;
}

export interface HybridCompositionProps {
  original_video_url?: string;
  tracks: {
    video: VideoSlice[];
    broll: BrollSlice[];
    graphics: GraphicCard[];
    captions: SubtitleWord[];
    audio?: {
      original_speech?: { source: string; volume: number };
      background_music?: { url: string; volume: number };
    };
    cta?: {
      start: number;
      end: number;
      headline: string;
      button_text: string;
      offer?: string;
      url?: string;
    };
    branding?: {
      company_name: string;
      logo_url?: string;
      colors?: { primary: string; accent: string; text: string };
    };
    progress_bar?: {
      style?: string;
      color?: string;
      height?: number;
    };
  };
  duration: number;
  aspect_ratio?: string;
}

export const HybridVideoComposition: React.FC<HybridCompositionProps> = ({
  original_video_url = "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
  tracks,
  duration = 60,
  aspect_ratio = "9:16",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const currentTime = frame / fps;

  const primaryColor = tracks?.branding?.colors?.primary || "#534AB7";
  const accentColor = tracks?.branding?.colors?.accent || "#0F6E56";
  const companyName = tracks?.branding?.company_name || "FounderOS";

  // Top Progress Bar calculation
  const progressPercent = Math.min(100, Math.max(0, (frame / totalFrames) * 100));

  // Determine active subtitles in 3-word window
  const captions = tracks?.captions || [];
  const activeSubIndex = captions.findIndex(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );
  const startSubIdx = Math.max(0, activeSubIndex - 1);
  const endSubIdx = Math.min(captions.length, activeSubIndex + 2);
  const wordWindow = activeSubIndex !== -1 ? captions.slice(startSubIdx, endSubIdx) : [];

  // Check if any B-roll is actively cutting away over founder video
  const activeBroll = (tracks?.broll || []).find(
    (b) => currentTime >= b.start && currentTime <= b.end
  );

  // Check if any Graphic card is active
  const activeGraphic = (tracks?.graphics || []).find(
    (g) => currentTime >= g.start && currentTime <= g.end
  );

  // Check if CTA is active
  const cta = tracks?.cta;
  const isCtaActive = cta && currentTime >= cta.start && currentTime <= cta.end;

  // Zoom interpolation on founder video
  const baseScale = interpolate(frame % (fps * 5), [0, fps * 5], [1.0, 1.06], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#090d16",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* 1. AUDIO TRACK: Background Music */}
      {tracks?.audio?.background_music?.url && (
        <Audio
          src={tracks.audio.background_music.url}
          volume={tracks.audio.background_music.volume || 0.12}
        />
      )}

      {/* 2. BASE VIDEO TRACK (Founder's Authentic Footage) */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          transform: `scale(${baseScale})`,
          transition: "transform 0.1s ease-out",
          filter: activeBroll ? "brightness(0.3)" : "none",
        }}
      >
        <video
          src={original_video_url}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          autoPlay
          loop
          muted={false}
          playsInline
        />
      </div>

      {/* Subtle vignette / gradient protection for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10,15,30,0.88) 0%, rgba(10,15,30,0.2) 50%, rgba(10,15,30,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 3. B-ROLL CUTAWAY TRACK */}
      {activeBroll && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <video
            src={activeBroll.url}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            autoPlay
            loop
            muted
            playsInline
          />
          {/* B-roll Indicator badge */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(8px)",
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#a855f7",
              }}
            />
            <span
              style={{
                color: "#e2e8f0",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Supporting B-Roll: {activeBroll.query || "Context"}
            </span>
          </div>

          {activeBroll.text_overlay && (
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "10%",
                right: "10%",
                textAlign: "center",
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(14px)",
                padding: "16px 24px",
                borderRadius: "16px",
                border: `1px solid ${primaryColor}`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "26px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {activeBroll.text_overlay}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. MOTION GRAPHICS & STAT CARDS TRACK */}
      {activeGraphic && (
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: "8%",
            right: "8%",
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.90)",
              backdropFilter: "blur(18px)",
              border: `2px solid ${accentColor}`,
              borderRadius: "20px",
              padding: "24px 32px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              maxWidth: "460px",
              width: "100%",
            }}
          >
            {activeGraphic.badge && (
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(15, 110, 86, 0.25)",
                  color: "#34d399",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {activeGraphic.badge}
              </div>
            )}
            <div
              style={{
                fontSize: "44px",
                fontWeight: 900,
                color: "#10b981",
                letterSpacing: "-0.02em",
                margin: "4px 0",
                textShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
              }}
            >
              {activeGraphic.value}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#f8fafc",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {activeGraphic.headline}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginTop: "6px",
              }}
            >
              {activeGraphic.subtext}
            </div>
          </div>
        </div>
      )}

      {/* 5. BRANDING & WATERMARK */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(10px)",
          padding: "6px 14px",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            background: primaryColor,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "10px",
            fontWeight: 900,
          }}
        >
          F
        </span>
        <span
          style={{
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {companyName}
        </span>
      </div>

      {/* 6. TOP PROGRESS BAR */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${tracks?.progress_bar?.height || 4}px`,
          backgroundColor: "rgba(255,255,255,0.15)",
          zIndex: 40,
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            backgroundColor: primaryColor,
            boxShadow: `0 0 10px ${primaryColor}`,
            transition: "width 0.05s linear",
          }}
        />
      </div>

      {/* 7. KINETIC WORD-LEVEL ACTIVE SUBTITLES */}
      {wordWindow.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: isCtaActive ? "26%" : "12%",
            left: "6%",
            right: "6%",
            zIndex: 35,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              padding: "10px 20px",
              borderRadius: "12px",
              background: "rgba(10, 15, 30, 0.4)",
              backdropFilter: "blur(6px)",
              textShadow: "0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            {wordWindow.map((word, idx) => {
              const isWordActive = startSubIdx + idx === activeSubIndex;
              const isHighlight = word.highlight || false;
              
              let textColor = "#FFFFFF";
              if (isWordActive) {
                textColor = isHighlight ? "#fbbf24" : "#c084fc"; // Amber for highlighted keywords, Purple for active words
              }

              return (
                <span
                  key={idx}
                  style={{
                    color: textColor,
                    transform: isWordActive ? "scale(1.18)" : "scale(1.0)",
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
      )}

      {/* 8. CTA OVERLAY TRACK */}
      {isCtaActive && cta && (
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "8%",
            right: "8%",
            zIndex: 45,
            animation: "slideUp 0.4s ease-out",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(16px)",
              border: `2px solid ${primaryColor}`,
              borderRadius: "18px",
              padding: "18px 24px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {cta.headline}
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "inline-block",
                background: `linear-gradient(135deg, ${primaryColor} 0%, #7c3aed 100%)`,
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "14px",
                padding: "10px 24px",
                borderRadius: "30px",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.5)",
              }}
            >
              {cta.button_text}
            </div>
            {cta.url && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginTop: "8px",
                  letterSpacing: "0.04em",
                }}
              >
                {cta.url}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
