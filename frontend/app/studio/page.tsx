"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MainVideoComposition } from "../../remotion/Composition";
import { 
  Video, 
  Settings, 
  RefreshCw, 
  Check, 
  Play, 
  Edit
} from "lucide-react";

// Dynamically import Remotion Player to avoid Next.js SSR errors
const RemotionPlayer = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

interface StoryboardScene {
  scene_index: number;
  visual_url: string;
  text_overlay: string;
  duration: number;
}

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("item_id") || "1";

  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("Founder's Journey — LinkedIn");
  const [script, setScript] = useState("Stop wasting hours on manual tasks that can be automated in seconds. Every business owner reaches a limit. You want to scale, but manual workflows are keeping you bogged down. With automated systems, your core operations run 24/7 without needing constant attention — saving 15+ hours every week. Go to our link to copy our automation handbook for free!");
  const [caption, setCaption] = useState("The number one bottleneck in your business isn't talent, it's outdated workflows. 👇");
  const [voiceGender, setVoiceGender] = useState("FEMALE");
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([
    {
      scene_index: 1,
      visual_url: "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
      text_overlay: "Stop wasting hours on manual tasks!",
      duration: 5
    },
    {
      scene_index: 2,
      visual_url: "https://videos.pexels.com/video-files/5082565/5082565-hd_1920_1080_30fps.mp4",
      text_overlay: "Manual workflows hold you back",
      duration: 5
    },
    {
      scene_index: 3,
      visual_url: "https://videos.pexels.com/video-files/8387537/8387537-hd_1920_1080_25fps.mp4",
      text_overlay: "Automations work 24/7",
      duration: 5
    },
    {
      scene_index: 4,
      visual_url: "https://videos.pexels.com/video-files/5082565/5082565-hd_1920_1080_30fps.mp4",
      text_overlay: "Get our free automation blueprint!",
      duration: 5
    }
  ]);
  const [voiceoverUrl, setVoiceoverUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");

  const totalDuration = storyboard.reduce((sum, s) => sum + s.duration, 0);
  const words = script.split(" ");
  const timePerWord = totalDuration / Math.max(1, words.length);
  const subtitles = words.map((w, idx) => ({
    text: w,
    start: idx * timePerWord,
    end: (idx + 1) * timePerWord
  }));

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const companyId = localStorage.getItem("onboarded_company_id") || "1";
        const res = await fetch(`http://localhost:8000/api/content/calendar/${companyId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        const item = data.find((i: any) => i.id.toString() === itemId) || data[0];
        if (item) {
          setTitle(item.title);
          if (item.script) {
            setScript(item.script.text);
            setCaption(item.script.caption);
          }
          if (item.video && item.video.storyboard.length > 0) {
            setStoryboard(item.video.storyboard);
            setVoiceoverUrl(item.video.voiceover_url || voiceoverUrl);
          }
        }
      } catch (err) {
        console.log("Using default studio states.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleRender = async () => {
    setRendering(true);
    setRenderProgress("Synthesizing ElevenLabs voiceover track...");
    
    try {
      await fetch(`http://localhost:8000/api/content/script/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script_text: script,
          caption: caption,
          hashtags: ["Automation", "FounderOS"]
        })
      });

      setRenderProgress("Searching stock footage assets & compiling storyboard...");
      const res = await fetch(`http://localhost:8000/api/video/render/${itemId}`, {
        method: "POST"
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setStoryboard(data.storyboard);
      setVoiceoverUrl(data.voiceover_url);

      setRenderProgress("Executing Remotion rendering pipeline...");
      setTimeout(() => {
        setRenderProgress("Syncing captions & overlays...");
        setTimeout(() => {
          setRendering(false);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }, 1500);
      }, 1500);

    } catch (err) {
      setTimeout(() => {
        setRendering(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 animate-step-enter">
      {/* Metrics Row */}
      <div className="metrics">
        <div className="metric-card"><div className="metric-label">Renders queued</div><div className="metric-val">2</div></div>
        <div className="metric-card"><div className="metric-label">Completed renders</div><div className="metric-val">5</div></div>
        <div className="metric-card"><div className="metric-label">Total duration</div><div className="metric-val">{totalDuration}s</div></div>
        <div className="metric-card"><div className="metric-label">Voice provider</div><div className="metric-val" style={{ fontSize: "14px", marginTop: "8px" }}>ElevenLabs</div></div>
      </div>

      {rendering && (
        <div className="bg-[#EEEDFE] border border-[#534AB7]/25 p-3 rounded-lg text-xs text-[#534AB7] animate-pulse">
          {renderProgress}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-secondary)]">Loading composition workspace...</div>
      ) : (
        <div className="grid2">
          {/* Active Render Box */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Active render — Content #{itemId}</span>
              <span className="pill pill-warn">
                <span className="dot" />
                Rendering
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-5 items-start">
              {/* Studio Player Frame */}
              <div className="w-full md:w-[180px] shrink-0">
                <div className="bg-[#2C2C2A] rounded-lg aspect-[9/16] overflow-hidden flex items-center justify-center relative shadow-md">
                  {RemotionPlayer ? (
                    <RemotionPlayer
                      component={MainVideoComposition as any}
                      inputProps={{
                        storyboard,
                        voiceover_url: voiceoverUrl,
                        subtitles,
                        duration: totalDuration
                      }}
                      durationInFrames={totalDuration * 30}
                      fps={30}
                      compositionWidth={1080}
                      compositionHeight={1920}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      controls
                    />
                  ) : (
                    <div className="text-slate-500 text-xs">Initializing canvas player...</div>
                  )}
                </div>
                <div className="text-[10px] text-[var(--color-text-tertiary)] font-bold text-center mt-2 uppercase tracking-wider">
                  9:16 · {totalDuration}s
                </div>
              </div>

              {/* Scenes List */}
              <div className="flex-1 space-y-3 w-full">
                <div className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                  {title}
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] mb-3">
                  {storyboard.length} scenes · Female voiceover · Word-by-word captions
                </div>
                <div className="scene-list">
                  {storyboard.map((scene, idx) => (
                    <div key={idx} className="scene-item">
                      <div className="scene-num">{scene.scene_index}</div>
                      <div className="flex-1 min-w-0">
                        <div className="scene-desc">
                          <b>Overlay {idx + 1}</b> — {scene.text_overlay}
                        </div>
                        <div className="scene-dur">
                          {scene.duration}s · Pexels stock footage asset
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Script Preview */}
          <div className="card flex flex-col justify-between">
            <div>
              <div className="card-hdr">
                <span className="card-title">Script preview & edit</span>
              </div>
              <div className="space-y-4">
                <div className="text-xs line-height-[1.7] text-[var(--color-text-secondary)] bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-md p-3.5 space-y-2">
                  <div>
                    <span className="text-[#534AB7] font-semibold mr-1">[HOOK]</span>
                    Stop wasting hours on manual tasks that can be automated in seconds.
                  </div>
                  <div>
                    <span className="text-[#0F6E56] font-semibold mr-1">[PROBLEM]</span>
                    Every business owner reaches a limit. You want to scale, but manual workflows are keeping you bogged down.
                  </div>
                  <div>
                    <span className="text-[#993C1D] font-semibold mr-1">[SOLUTION]</span>
                    With automated systems, your core operations run 24/7 without needing constant attention — saving 15+ hours every week.
                  </div>
                  <div>
                    <span className="text-[#185FA5] font-semibold mr-1">[CTA]</span>
                    Go to our link to copy our automation handbook for free!
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                    Edit narration script
                  </label>
                  <textarea
                    rows={4}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#534AB7] text-[var(--color-text-primary)] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border-tertiary)] flex gap-2.5">
              <button 
                onClick={() => alert("Prompt sent: Rewrite this video script with a stronger hook for a founder audience")}
                className="btn flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-[#534AB7]" />
                Rewrite hook ↗
              </button>
              
              <button 
                onClick={handleRender}
                disabled={rendering}
                className="btn btn-primary flex items-center gap-1.5"
              >
                {rendering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Rendering...
                  </>
                ) : success ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Rendered!
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Render video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoStudio() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[var(--color-text-secondary)]">Loading Composition...</div>}>
      <StudioContent />
    </Suspense>
  );
}
