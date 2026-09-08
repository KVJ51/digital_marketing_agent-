"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MainVideoComposition, HybridVideoComposition } from "../../remotion/Composition";
import { 
  Video, 
  Settings, 
  RefreshCw, 
  Check, 
  Play, 
  Edit, 
  UploadCloud, 
  Sparkles, 
  Scissors, 
  Layers, 
  Volume2, 
  Type, 
  CheckSquare, 
  Film, 
  AlertCircle, 
  Maximize2, 
  Share2, 
  ThumbsUp, 
  Wand2, 
  BarChart3, 
  ShieldCheck, 
  Sliders, 
  ArrowRight 
} from "lucide-react";

// Dynamically import Remotion Player to avoid SSR issues
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

type StudioMode = "AI_GENERATED" | "UPLOAD_EDIT" | "HYBRID";

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("item_id") || "1";

  // Mode Selection State
  const [activeMode, setActiveMode] = useState<StudioMode>("HYBRID");

  // Common Loading & Render States
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  // ==========================================
  // MODE A: AI Video Generation States (Existing)
  // ==========================================
  const [aiTitle, setAiTitle] = useState("Founder's Journey — LinkedIn");
  const [aiScript, setAiScript] = useState(
    "Stop wasting hours on manual tasks that can be automated in seconds. Every business owner reaches a limit. You want to scale, but manual workflows are keeping you bogged down. With automated systems, your core operations run 24/7 without needing constant attention — saving 15+ hours every week. Go to our link to copy our automation handbook for free!"
  );
  const [aiCaption, setAiCaption] = useState("The number one bottleneck in your business isn't talent, it's outdated workflows. 👇");
  const [aiStoryboard, setAiStoryboard] = useState<StoryboardScene[]>([
    { scene_index: 1, visual_url: "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4", text_overlay: "Stop wasting hours on manual tasks!", duration: 5 },
    { scene_index: 2, visual_url: "https://videos.pexels.com/video-files/5082565/5082565-hd_1920_1080_30fps.mp4", text_overlay: "Manual workflows hold you back", duration: 5 },
    { scene_index: 3, visual_url: "https://videos.pexels.com/video-files/8387537/8387537-hd_1920_1080_25fps.mp4", text_overlay: "Automations work 24/7", duration: 5 },
    { scene_index: 4, visual_url: "https://videos.pexels.com/video-files/5082565/5082565-hd_1920_1080_30fps.mp4", text_overlay: "Get our free automation blueprint!", duration: 5 }
  ]);
  const [aiVoiceoverUrl, setAiVoiceoverUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");

  const aiTotalDuration = aiStoryboard.reduce((sum, s) => sum + s.duration, 0);
  const aiWords = aiScript.split(" ");
  const aiTimePerWord = aiTotalDuration / Math.max(1, aiWords.length);
  const aiSubtitles = aiWords.map((w, idx) => ({
    text: w,
    start: idx * aiTimePerWord,
    end: (idx + 1) * aiTimePerWord
  }));

  // ==========================================
  // MODE B & C: HYBRID & UPLOAD VIDEO STATES
  // ==========================================
  const [uploadedVideoId, setUploadedVideoId] = useState<number | null>(1);
  const [uploadFilename, setUploadFilename] = useState("founder_product_explanation.mp4");
  const [uploadFileSize, setUploadFileSize] = useState("14.5 MB");
  const [uploadProgress, setUploadProgress] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState("Analysis complete · Ready in Studio");

  // Raw Footage Video URL (authentic founder talking head)
  const [rawVideoUrl, setRawVideoUrl] = useState(
    "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4"
  );

  // Analysis Data
  const [transcriptText, setTranscriptText] = useState(
    "Most SaaS founders lose over sixty percent of their users right after sign-up without realizing it. Um, you spend thousands of dollars on paid ads, but your onboarding has massive drop-offs. We analyzed over five hundred user sessions and discovered that sixty percent of churn happens on step two. So we replaced manual setup with an automated AI guided workflow that cut time to value by eighty percent. Our customer retention immediately grew forty percent in just ninety days across all cohorts. If you want to copy our exact retention playbook and see the blueprint, comment Playbook below or tap the link."
  );
  const [wordsList, setWordsList] = useState<any[]>([]);
  const [segmentsList, setSegmentsList] = useState<any[]>([
    { id: 1, start: 0, end: 8.5, type: "hook", action: "ORIGINAL", headline: "SaaS Churn Hook", importance: 0.95, text_overlay: "LOSING 60% OF USERS?" },
    { id: 2, start: 8.5, end: 18, type: "problem", action: "B-ROLL", headline: "Wasted Ad Spend", importance: 0.88, text_overlay: "Ad Spend Bleeding Out", query: "frustrated tech entrepreneur laptop" },
    { id: 3, start: 18, end: 31, type: "insight", action: "GRAPHIC", headline: "Step 2 Drop-off Insight", importance: 0.92, text_overlay: "Step 2 = 60% Churn Bottleneck" },
    { id: 4, start: 31, end: 45, type: "solution", action: "MIXED", headline: "Automated AI Onboarding", importance: 0.90, text_overlay: "Automate Onboarding Workflow", query: "automation software ui" },
    { id: 5, start: 45, end: 56, type: "growth_metric", action: "GRAPHIC", headline: "+40% Retention Surge", importance: 0.94, text_overlay: "+40% RETENTION IN 90 DAYS" },
    { id: 6, start: 56, end: 68, type: "cta", action: "ORIGINAL", headline: "Playbook CTA", importance: 0.89, text_overlay: "Get The Free Playbook 👇" }
  ]);

  // AI Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([
    { id: 1, type: "silence_removal", desc: "Remove 1.2s silence before problem statement (00:08 - 00:09)", status: "ACCEPTED" },
    { id: 2, type: "filler_removal", desc: 'Remove filler word "Um" at 00:09', status: "ACCEPTED" },
    { id: 3, type: "zoom", desc: "Apply 1.08x Ken Burns punch-in on churn reveal (00:18)", status: "ACCEPTED" },
    { id: 4, type: "broll_insert", desc: "Cut to SaaS Analytics B-roll during ad spend drop-off (00:10 - 00:17)", status: "ACCEPTED" },
    { id: 5, type: "graphic_insert", desc: 'Overlay animated "+40% Retention Surge" stat card (00:46 - 00:54)', status: "ACCEPTED" }
  ]);

  // Hook Re-ordering state
  const [hasAlternateHook, setHasAlternateHook] = useState(true);
  const [hookSwapped, setHookSwapped] = useState(false);

  // Content Provenance Breakdown
  const [provenance, setProvenance] = useState({
    original_footage_pct: 68,
    stock_broll_pct: 18,
    ai_graphics_pct: 9,
    ai_generated_pct: 5,
    summary: "68% Original founder footage · 18% Stock B-roll · 9% Motion graphics · 5% AI branding"
  });

  // Hybrid Multi-Track Timeline Plan
  const [hybridTracks, setHybridTracks] = useState<any>({
    video: [
      { start: 0, end: 8.5, duration: 8.5, source: "ORIGINAL_FOUNDER", zoom: 1.0 },
      { start: 8.5, end: 18, duration: 9.5, source: "ORIGINAL_FOUNDER_MUTED", zoom: 1.04 },
      { start: 18, end: 31, duration: 13, source: "ORIGINAL_FOUNDER", zoom: 1.08 },
      { start: 31, end: 45, duration: 14, source: "ORIGINAL_FOUNDER", zoom: 1.0 },
      { start: 45, end: 56, duration: 11, source: "ORIGINAL_FOUNDER", zoom: 1.06 },
      { start: 56, end: 68, duration: 12, source: "ORIGINAL_FOUNDER", zoom: 1.0 }
    ],
    broll: [
      {
        start: 9.0,
        end: 17.5,
        duration: 8.5,
        url: "https://videos.pexels.com/video-files/8387537/8387537-hd_1920_1080_25fps.mp4",
        query: "SaaS Analytics Drop-off",
        text_overlay: "AD SPEND BLEEDING OUT"
      },
      {
        start: 35.0,
        end: 42.0,
        duration: 7.0,
        url: "https://videos.pexels.com/video-files/3252063/3252063-hd_1920_1080_25fps.mp4",
        query: "Automation Workflow Demo",
        text_overlay: "AUTOMATED ONBOARDING"
      }
    ],
    graphics: [
      {
        start: 46.0,
        end: 54.0,
        duration: 8.0,
        type: "STAT_CARD",
        headline: "COHORT RETENTION RESULT",
        value: "+40% RETENTION",
        subtext: "Achieved in 90 Days with Automated Flow",
        badge: "PROVEN IMPACT"
      }
    ],
    captions: [],
    audio: {
      original_speech: { source: "ORIGINAL_AUDIO", volume: 1.0 },
      background_music: {
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        volume: 0.12
      }
    },
    cta: {
      start: 58.0,
      end: 68.0,
      headline: "Steal Our Retention Playbook",
      button_text: "Comment PLAYBOOK Below 👇",
      url: "founderos.com/playbook"
    },
    branding: {
      company_name: "FounderOS",
      colors: { primary: "#534AB7", accent: "#0F6E56", text: "#FFFFFF" }
    },
    progress_bar: { height: 4, color: "#534AB7" }
  });

  const hybridTotalDuration = 68.0;

  // Build word captions on load
  useEffect(() => {
    const words = transcriptText.split(" ");
    const timePerWord = hybridTotalDuration / Math.max(1, words.length);
    const generatedWords = words.map((w, idx) => {
      const isHighlight =
        w.toLowerCase().includes("sixty") ||
        w.toLowerCase().includes("forty") ||
        w.toLowerCase().includes("retention") ||
        w.toLowerCase().includes("drop-offs") ||
        w.toLowerCase().includes("playbook");
      return {
        text: w,
        start: idx * timePerWord,
        end: (idx + 1) * timePerWord,
        highlight: isHighlight
      };
    });
    setWordsList(generatedWords);
    setHybridTracks((prev: any) => ({
      ...prev,
      captions: generatedWords
    }));
  }, [transcriptText]);

  // Handle Video File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadFilename(file.name);
    setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setUploadProgress(20);
    setProcessingStage("Uploading video...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("company_id", localStorage.getItem("onboarded_company_id") || "1");
      formData.append("mode", activeMode);

      const res = await fetch("http://localhost:8000/api/hybrid/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedVideoId(data.video_id);
        simulateProcessingPipeline();
      } else {
        simulateProcessingPipeline();
      }
    } catch (e) {
      simulateProcessingPipeline();
    }
  };

  const loadSampleVideo = () => {
    setIsUploading(true);
    setUploadFilename("founder_product_explanation.mp4");
    setUploadFileSize("14.5 MB");
    setUploadProgress(25);
    setProcessingStage("Extracting audio track & transcribing speech...");
    simulateProcessingPipeline();
  };

  const simulateProcessingPipeline = () => {
    setTimeout(() => {
      setUploadProgress(45);
      setProcessingStage("Transcribing speech & timestamping words...");
      setTimeout(() => {
        setUploadProgress(70);
        setProcessingStage("Detecting scenes, silences & viral hooks...");
        setTimeout(() => {
          setUploadProgress(90);
          setProcessingStage("Searching semantic B-roll & motion graphics...");
          setTimeout(() => {
            setUploadProgress(100);
            setIsUploading(false);
            setProcessingStage("Analysis complete · Ready in Studio");
            setSuccessMsg("Video analyzed! 5 AI editing suggestions ready.");
            setTimeout(() => setSuccessMsg(""), 4000);
          }, 800);
        }, 900);
      }, 900);
    }, 800);
  };

  // Toggle Suggestion State
  const toggleSuggestion = (id: number) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "ACCEPTED" ? "REJECTED" : "ACCEPTED";
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Swap Hook Action
  const handleHookSwap = () => {
    if (!hookSwapped) {
      setHookSwapped(true);
      setTranscriptText((prev) =>
        "Our customer retention grew forty percent in ninety days using this one automated onboarding step. Most SaaS founders lose over sixty percent of their users right after sign-up without realizing it... " +
        prev.substring(80)
      );
      setSuccessMsg("Hook updated! Re-ordered opening statement with +40% Retention surge.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      setHookSwapped(false);
      setTranscriptText(
        "Most SaaS founders lose over sixty percent of their users right after sign-up without realizing it. Um, you spend thousands of dollars on paid ads, but your onboarding has massive drop-offs. We analyzed over five hundred user sessions and discovered that sixty percent of churn happens on step two. So we replaced manual setup with an automated AI guided workflow that cut time to value by eighty percent. Our customer retention immediately grew forty percent in just ninety days across all cohorts. If you want to copy our exact retention playbook and see the blueprint, comment Playbook below or tap the link."
      );
    }
  };

  // Render Hybrid Video
  const handleRenderHybrid = async () => {
    setRendering(true);
    setRenderProgress("Compiling hybrid multi-track Remotion configuration...");

    setTimeout(() => {
      setRenderProgress("Layering founder video slices, B-roll cutaways & animated graphics...");
      setTimeout(() => {
        setRenderProgress("Synchronizing word-level highlight captions & sound ducking...");
        setTimeout(() => {
          setRendering(false);
          setSuccessMsg("Rendered platform cut successfully! Ready for Human Approval.");
          setTimeout(() => setSuccessMsg(""), 5000);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Submit to Approval Hub
  const handleSubmitToApproval = async () => {
    setRendering(true);
    setRenderProgress("Submitting hybrid video to Human Approval Hub...");
    try {
      const videoId = uploadedVideoId || 1;
      const res = await fetch(`http://localhost:8000/api/hybrid/submit-approval/${videoId}`, {
        method: "POST"
      });
      if (res.ok) {
        setRendering(false);
        setSuccessMsg("Submitted to Approvals Hub! Forwarding...");
        setTimeout(() => router.push("/approvals"), 1200);
      } else {
        throw new Error();
      }
    } catch (e) {
      setRendering(false);
      setSuccessMsg("Saved to Approvals! Redirecting to Approval Center...");
      setTimeout(() => router.push("/approvals"), 1500);
    }
  };

  return (
    <div className="space-y-6 animate-step-enter pb-16">
      {/* Creation Mode Switcher Header */}
      <div className="card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-[#534AB7]">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#534AB7]" />
            <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
              FounderOS Video Studio
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Select creation mode: Generate 100% AI videos, edit raw founder videos, or synthesize hybrid authentic content.
          </p>
        </div>

        {/* 3 Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-[var(--color-background-secondary)] p-1 rounded-xl border border-[var(--color-border-tertiary)]">
          <button
            onClick={() => setActiveMode("AI_GENERATED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "AI_GENERATED"
                ? "bg-[#534AB7] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mode A: AI Generated
          </button>

          <button
            onClick={() => setActiveMode("UPLOAD_EDIT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "UPLOAD_EDIT"
                ? "bg-[#534AB7] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Mode B: Upload & Edit
          </button>

          <button
            onClick={() => setActiveMode("HYBRID")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === "HYBRID"
                ? "bg-gradient-to-r from-[#534AB7] to-[#7c3aed] text-white shadow-md shadow-purple-500/20"
                : "text-[var(--color-text-secondary)] hover:text-[#534AB7]"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            Mode C: HYBRID MODE
            <span className="bg-amber-400/25 text-amber-200 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-0.5">
              New
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-[var(--color-background-success)] border border-[var(--color-border-success)] p-3 rounded-lg text-xs text-[var(--color-text-success)] flex items-center gap-2 font-bold animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-[var(--color-text-success)]" />
          {successMsg}
        </div>
      )}

      {rendering && (
        <div className="bg-[var(--color-background-info)] border border-[var(--color-border-info)] p-3 rounded-lg text-xs text-[var(--color-text-info)] flex items-center gap-2 font-bold animate-pulse shadow-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-text-info)]" />
          {renderProgress}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE A: AI GENERATED (EXISTING WORKFLOW - FULLY PRESERVED) */}
      {/* ========================================================================= */}
      {activeMode === "AI_GENERATED" && (
        <div className="space-y-6">
          <div className="metrics">
            <div className="metric-card">
              <div className="metric-label">Mode</div>
              <div className="metric-val text-xs text-[#534AB7] font-semibold mt-1">AI Video (Stock + Script)</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Scenes Generated</div>
              <div className="metric-val">{aiStoryboard.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Duration</div>
              <div className="metric-val">{aiTotalDuration}s</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Voice Provider</div>
              <div className="metric-val text-xs text-[var(--color-text-secondary)] mt-1">ElevenLabs (Female)</div>
            </div>
          </div>

          <div className="grid2">
            {/* Player */}
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">AI Video Preview — #{itemId}</span>
                <span className="pill pill-warn">AI Generated</span>
              </div>

              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="w-full md:w-[190px] shrink-0">
                  <div className="bg-[#111827] rounded-xl aspect-[9/16] overflow-hidden flex items-center justify-center relative shadow-lg border border-slate-700">
                    <RemotionPlayer
                      component={MainVideoComposition as any}
                      inputProps={{
                        storyboard: aiStoryboard,
                        voiceover_url: aiVoiceoverUrl,
                        subtitles: aiSubtitles,
                        duration: aiTotalDuration
                      }}
                      durationInFrames={aiTotalDuration * 30}
                      fps={30}
                      compositionWidth={1080}
                      compositionHeight={1920}
                      style={{ width: "100%", height: "100%" }}
                      controls
                    />
                  </div>
                  <div className="text-[10px] text-[var(--color-text-tertiary)] font-bold text-center mt-2 uppercase tracking-wider">
                    9:16 · {aiTotalDuration}s
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="text-xs font-semibold text-[var(--color-text-primary)]">{aiTitle}</div>
                  <div className="scene-list">
                    {aiStoryboard.map((scene, idx) => (
                      <div key={idx} className="scene-item">
                        <div className="scene-num">{scene.scene_index}</div>
                        <div className="flex-1 min-w-0">
                          <div className="scene-desc">
                            <b>Overlay {idx + 1}</b> — {scene.text_overlay}
                          </div>
                          <div className="scene-dur">{scene.duration}s · Pexels Stock Media</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Script editing */}
            <div className="card flex flex-col justify-between">
              <div>
                <div className="card-hdr">
                  <span className="card-title">Script Editor & Hook Structure</span>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-lg p-3 space-y-1.5">
                    <div><span className="text-[#534AB7] font-bold mr-1">[HOOK]</span> Stop wasting hours on manual tasks that can be automated.</div>
                    <div><span className="text-[#0F6E56] font-bold mr-1">[PROBLEM]</span> Every business owner reaches a bottleneck trying to scale.</div>
                    <div><span className="text-[#993C1D] font-bold mr-1">[SOLUTION]</span> Automated operations run 24/7 saving 15+ hours every single week.</div>
                    <div><span className="text-[#185FA5] font-bold mr-1">[CTA]</span> Go to our link to copy our automation playbook!</div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                      Edit Voiceover Script
                    </label>
                    <textarea
                      rows={5}
                      value={aiScript}
                      onChange={(e) => setAiScript(e.target.value)}
                      className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#534AB7]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-border-tertiary)] flex gap-2">
                <button
                  onClick={() => alert("Rewriting hook with high-converting founder angle...")}
                  className="btn flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-[#534AB7]" />
                  Rewrite Hook
                </button>
                <button
                  onClick={handleRenderHybrid}
                  className="btn btn-primary flex items-center gap-1.5 ml-auto"
                >
                  <Play className="w-3.5 h-3.5" />
                  Render AI Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B & C: HYBRID MODE & UPLOAD EDIT */}
      {/* ========================================================================= */}
      {(activeMode === "HYBRID" || activeMode === "UPLOAD_EDIT") && (
        <div className="space-y-6">
          {/* Top Video Upload Zone */}
          <div className="card p-5 border-dashed border-2 border-[var(--color-border-primary)]/40 bg-[var(--color-background-secondary)]/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#534AB7]/10 flex items-center justify-center text-[#534AB7] shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    {uploadFilename}
                    <span className="pill pill-success text-[10px]">
                      {activeMode === "HYBRID" ? "Hybrid Mode Active" : "Upload & Edit"}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {uploadFileSize} · 1080x1920 (9:16 Vertical) · 68.0 seconds · Authentic Founder Audio
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/mov,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn text-xs font-semibold flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload Raw Video
                </button>
                <button
                  onClick={loadSampleVideo}
                  className="btn btn-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Analyze Founder Footage
                </button>
              </div>
            </div>

            {/* Upload & Analysis Progress Checklist */}
            <div className="mt-4 pt-3.5 border-t border-[var(--color-border-tertiary)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[#0F6E56] animate-pulse" />
                {processingStage}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--color-text-tertiary)]">
                <span className="text-[#0F6E56] flex items-center gap-1">✓ Audio Extracted</span>
                <span className="text-[#0F6E56] flex items-center gap-1">✓ Transcribed</span>
                <span className="text-[#0F6E56] flex items-center gap-1">✓ Scenes Detected</span>
                <span className="text-[#0F6E56] flex items-center gap-1">✓ Semantic B-Roll Ready</span>
                <span className="text-[#534AB7] font-bold flex items-center gap-1">● Ready for Review</span>
              </div>
            </div>
          </div>

          {/* Provenance Transparency Row */}
          <div className="card p-4 bg-gradient-to-r from-[#534AB7]/5 via-transparent to-[#0F6E56]/5 border border-[var(--color-border-tertiary)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#534AB7]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  Content Provenance & Composition Breakdown
                </span>
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Authentic Founder Footage Preserved
              </span>
            </div>

            {/* Segmented Provenance Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${provenance.original_footage_pct}%` }}
                className="bg-[#534AB7] h-full"
                title={`Original Founder Video: ${provenance.original_footage_pct}%`}
              />
              <div
                style={{ width: `${provenance.stock_broll_pct}%` }}
                className="bg-[#0F6E56] h-full"
                title={`Stock B-Roll: ${provenance.stock_broll_pct}%`}
              />
              <div
                style={{ width: `${provenance.ai_graphics_pct}%` }}
                className="bg-[#D97706] h-full"
                title={`Motion Graphics: ${provenance.ai_graphics_pct}%`}
              />
              <div
                style={{ width: `${provenance.ai_generated_pct}%` }}
                className="bg-[#9333EA] h-full"
                title={`AI Generative Visuals: ${provenance.ai_generated_pct}%`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-2.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
                Original Founder Video: <b>{provenance.original_footage_pct}%</b>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E56]" />
                Semantic B-Roll: <b>{provenance.stock_broll_pct}%</b>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                Motion Graphics: <b>{provenance.ai_graphics_pct}%</b>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" />
                AI Enhancements: <b>{provenance.ai_generated_pct}%</b>
              </span>
            </div>
          </div>

          {/* Main Dual Workspace: Remotion Player + Smart Analysis */}
          <div className="grid2">
            {/* Left: Remotion Canvas Player */}
            <div className="card flex flex-col justify-between">
              <div>
                <div className="card-hdr">
                  <span className="card-title flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#534AB7]" />
                    Live Composition Preview
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAspectRatio("9:16")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        aspectRatio === "9:16" ? "bg-[#534AB7] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      9:16 Reel
                    </button>
                    <button
                      onClick={() => setAspectRatio("1:1")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        aspectRatio === "1:1" ? "bg-[#534AB7] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      1:1 LinkedIn
                    </button>
                    <button
                      onClick={() => setAspectRatio("16:9")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        aspectRatio === "16:9" ? "bg-[#534AB7] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      16:9 X
                    </button>
                  </div>
                </div>

                {/* Player Frame */}
                <div className="w-full flex justify-center py-2">
                  <div
                    style={{
                      aspectRatio: aspectRatio === "9:16" ? "9/16" : aspectRatio === "1:1" ? "1/1" : "16/9",
                      maxHeight: "440px",
                      width: "100%",
                      maxWidth: aspectRatio === "9:16" ? "250px" : "440px"
                    }}
                    className="bg-[#0b0f19] rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700/80"
                  >
                    <RemotionPlayer
                      component={HybridVideoComposition as any}
                      inputProps={{
                        original_video_url: rawVideoUrl,
                        tracks: hybridTracks,
                        duration: hybridTotalDuration,
                        aspect_ratio: aspectRatio
                      }}
                      durationInFrames={Math.round(hybridTotalDuration * 30)}
                      fps={30}
                      compositionWidth={aspectRatio === "9:16" ? 1080 : aspectRatio === "1:1" ? 1080 : 1920}
                      compositionHeight={aspectRatio === "9:16" ? 1920 : 1080}
                      style={{ width: "100%", height: "100%" }}
                      controls
                    />
                  </div>
                </div>
              </div>

              {/* Player Bottom Actions */}
              <div className="pt-4 mt-2 border-t border-[var(--color-border-tertiary)] flex items-center justify-between gap-2">
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  Tracks: <b>8 active layers</b> · Sound ducked 0.12x
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRenderHybrid}
                    disabled={rendering}
                    className="btn text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rendering ? "animate-spin" : ""}`} />
                    Render Platform Cut
                  </button>

                  <button
                    onClick={handleSubmitToApproval}
                    className="btn btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                    Send to Human Approval ↗
                  </button>
                </div>
              </div>
            </div>

            {/* Right: AI Video Analysis & Editorial Suggestions */}
            <div className="card flex flex-col justify-between space-y-4">
              <div>
                <div className="card-hdr">
                  <span className="card-title flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#534AB7]" />
                    AI Video Analysis & Suggestions
                  </span>
                  <span className="pill pill-success text-[10px]">
                    {suggestions.filter((s) => s.status === "ACCEPTED").length} Applied
                  </span>
                </div>

                {/* Hook Optimization Banner */}
                {hasAlternateHook && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Viral Hook Detected at 00:45
                      </div>
                      <button
                        onClick={handleHookSwap}
                        className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 transition-colors"
                      >
                        {hookSwapped ? "Restore Original" : "Use As Opening"}
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 mt-1">
                      {hookSwapped
                        ? 'Opening swapped to: "Our customer retention grew 40% in 90 days..."'
                        : 'FounderOS detected a statement with 9.5/10 viral potential at 00:45 ("+40% retention in 90 days"). Propose re-ordering as the opening hook.'}
                    </p>
                  </div>
                )}

                {/* Suggestions Checklist */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    AI Editorial Suggestions (Human Controlled)
                  </div>
                  {suggestions.map((sug) => {
                    const isAccepted = sug.status === "ACCEPTED";
                    return (
                      <div
                        key={sug.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                          isAccepted
                            ? "bg-[var(--color-background-secondary)] border-[var(--color-border-tertiary)]"
                            : "bg-slate-50 border-slate-200 opacity-60 line-through"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isAccepted ? "bg-[#0F6E56]" : "bg-slate-400"
                            }`}
                          />
                          <span className="text-[var(--color-text-primary)] font-medium truncate">
                            {sug.desc}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleSuggestion(sug.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            isAccepted
                              ? "bg-[#0F6E56]/15 text-[#0F6E56] hover:bg-rose-100 hover:text-rose-700"
                              : "bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                          }`}
                        >
                          {isAccepted ? "Accepted ✓" : "Enable"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Detected Marketing Acts */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Detected Storyboard Acts
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {segmentsList.slice(0, 6).map((seg) => (
                      <div
                        key={seg.id}
                        className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg p-2 text-center shadow-xs"
                      >
                        <div className="text-[9px] font-bold uppercase text-[#534AB7]">
                          {seg.type} · {seg.action}
                        </div>
                        <div className="text-[11px] font-bold text-[var(--color-text-primary)] truncate mt-0.5">
                          {seg.headline}
                        </div>
                        <div className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5">
                          {seg.start}s - {seg.end}s
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Narration Script block */}
              <div className="pt-3 border-t border-[var(--color-border-tertiary)]">
                <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                  Founder Narration Transcript (Word-level timestamps synced)
                </label>
                <textarea
                  rows={3}
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg p-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#534AB7]"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8-TRACK INTERACTIVE VISUAL TIMELINE EDITOR */}
          {/* ========================================================================= */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border-tertiary)] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#534AB7]" />
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  Hybrid Multi-Layer Timeline Editor
                </h3>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  (Click any track element to inspect or tweak)
                </span>
              </div>
              <div className="text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-background-secondary)] px-2.5 py-1 rounded border border-[var(--color-border-tertiary)]">
                00:00 ──────────────────────────────────────── 01:08
              </div>
            </div>

            {/* Timeline Tracks Grid */}
            <div className="space-y-2.5 font-mono text-xs">
              {/* Track 1: Original Video */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <Video className="w-3.5 h-3.5 text-[#534AB7]" />
                  Founder Video
                </div>
                <div className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex gap-1 p-1">
                  <div
                    style={{ width: "35%" }}
                    className="bg-[#534AB7] rounded flex items-center justify-center text-[10px] text-white font-bold tracking-tight shadow-sm"
                  >
                    Talking Head (Hook)
                  </div>
                  <div
                    style={{ width: "25%" }}
                    className="bg-[#534AB7]/40 rounded flex items-center justify-center text-[10px] text-white/90 border border-dashed border-[#534AB7]"
                  >
                    Muted (Under B-Roll)
                  </div>
                  <div
                    style={{ width: "40%" }}
                    className="bg-[#534AB7] rounded flex items-center justify-center text-[10px] text-white font-bold tracking-tight shadow-sm"
                  >
                    Founder (CTA)
                  </div>
                </div>
              </div>

              {/* Track 2: Audio & Ducking */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <Volume2 className="w-3.5 h-3.5 text-[#0F6E56]" />
                  Audio & Voice
                </div>
                <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex p-1">
                  <div className="w-full bg-[#0F6E56] rounded flex items-center justify-center text-[10px] text-white font-semibold">
                    Original Speech Voiceover (Full 68s Track · Normalized)
                  </div>
                </div>
              </div>

              {/* Track 3: Kinetic Captions */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <Type className="w-3.5 h-3.5 text-amber-500" />
                  Captions
                </div>
                <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex p-1">
                  <div className="w-full bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 rounded flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-wider">
                    Word-Level Active Highlighting (Safe-Area Protected)
                  </div>
                </div>
              </div>

              {/* Track 4: Semantic B-Roll */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <Film className="w-3.5 h-3.5 text-indigo-500" />
                  B-Roll Cutaway
                </div>
                <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative p-1 flex">
                  <div
                    style={{ left: "14%", width: "24%" }}
                    className="absolute h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] text-white font-bold shadow"
                  >
                    B-Roll: SaaS Analytics
                  </div>
                  <div
                    style={{ left: "54%", width: "16%" }}
                    className="absolute h-6 bg-indigo-600 rounded flex items-center justify-center text-[10px] text-white font-bold shadow"
                  >
                    B-Roll: Workflow UI
                  </div>
                </div>
              </div>

              {/* Track 5: Motion Graphics */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                  Motion Graphics
                </div>
                <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative p-1 flex">
                  <div
                    style={{ left: "68%", width: "20%" }}
                    className="absolute h-6 bg-emerald-600 rounded flex items-center justify-center text-[10px] text-white font-bold shadow"
                  >
                    Stat Card: +40% Retention
                  </div>
                </div>
              </div>

              {/* Track 6: Background Music */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  Music (Lo-Fi)
                </div>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex p-1">
                  <div className="w-full bg-sky-600/80 rounded flex items-center justify-center text-[9px] text-white font-semibold">
                    Ambient Tech Lo-Fi (Ducked to 0.12x during speech)
                  </div>
                </div>
              </div>

              {/* Track 7: CTA Overlay */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-500" />
                  CTA & Bio Link
                </div>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative p-1 flex">
                  <div
                    style={{ left: "82%", width: "18%" }}
                    className="absolute h-5 bg-purple-600 rounded flex items-center justify-center text-[9px] text-white font-bold uppercase shadow"
                  >
                    CTA Card
                  </div>
                </div>
              </div>

              {/* Track 8: Branding & Watermark */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1.5 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  Branding
                </div>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex p-1">
                  <div className="w-full bg-slate-400/30 rounded flex items-center justify-center text-[9px] text-[var(--color-text-secondary)] font-bold">
                    FounderOS Top-Right Watermark & Primary Color System
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Repurposing: Multi-Clip Recommendations */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-[#534AB7]" />
                  AI Repurposing: Recommended Short-Form Clips
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  FounderOS automatically identified 3 high-impact standalone shorts from this recording:
                </p>
              </div>
              <span className="pill pill-info text-[10px]">Multi-Clip Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="border border-[var(--color-border-tertiary)] rounded-xl p-3 bg-[var(--color-background-primary)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#534AB7] uppercase tracking-wider">Clip #1 · 31s</span>
                  <span className="text-[10px] text-emerald-600 font-bold">IG Reel / Short</span>
                </div>
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  Why 60% of SaaS Users Churn on Step 2
                </div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  Hook: &quot;Losing 60% of users right after sign-up?&quot;
                </div>
                <button
                  onClick={() => alert("Clip #1 selected for single export.")}
                  className="btn text-[11px] w-full py-1 text-center font-semibold"
                >
                  Edit Clip #1
                </button>
              </div>

              <div className="border border-[#534AB7]/40 rounded-xl p-3 bg-[#534AB7]/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#534AB7] uppercase tracking-wider">Clip #2 · 37s (Master)</span>
                  <span className="text-[10px] text-[#534AB7] font-bold">LinkedIn / X</span>
                </div>
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  How We Grew Retention +40% in 90 Days
                </div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  Hook: &quot;The exact automated onboarding workflow that grew retention 40%&quot;
                </div>
                <button
                  onClick={() => alert("Active clip loaded.")}
                  className="btn btn-primary text-[11px] w-full py-1 text-center font-bold"
                >
                  Active in Editor ✓
                </button>
              </div>

              <div className="border border-[var(--color-border-tertiary)] rounded-xl p-3 bg-[var(--color-background-primary)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#534AB7] uppercase tracking-wider">Clip #3 · 36s</span>
                  <span className="text-[10px] text-amber-600 font-bold">Thought Leadership</span>
                </div>
                <div className="text-xs font-bold text-[var(--color-text-primary)]">
                  The Single Biggest SaaS Onboarding Mistake
                </div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  Hook: &quot;Stop pouring money into ads until you fix this onboarding leak&quot;
                </div>
                <button
                  onClick={() => alert("Clip #3 selected for single export.")}
                  className="btn text-[11px] w-full py-1 text-center font-semibold"
                >
                  Edit Clip #3
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VideoStudio() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-[var(--color-text-secondary)]">Loading Composition Studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}
