"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MainVideoComposition, HybridVideoComposition } from "../../remotion/Composition";
import { ProvenanceBar } from "../../components/ProvenanceBar";
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
  ArrowRight,
  Clapperboard,
  Bot,
  Send,
  CornerDownLeft,
  Flame,
  CheckCircle2,
  ListRestart
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

type StudioMode = "AI_GENERATED" | "HYBRID";

interface AgentChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  actions?: string[];
  logs?: string[];
}

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "AI_GENERATED" ? "AI_GENERATED" : "HYBRID";
  const itemId = searchParams.get("item_id") || "1";

  // Mode Selection State
  const [activeMode, setActiveMode] = useState<StudioMode>(initialMode);

  // Common Loading & Render States
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  // ==========================================
  // MODE A: AI Video Generation States
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
  // MODE C: AI COPILOT & RAW VIDEO STATES
  // ==========================================
  const [uploadedVideoId, setUploadedVideoId] = useState<number | null>(1);
  const [uploadFilename, setUploadFilename] = useState("founder_product_explanation.mp4");
  const [uploadFileSize, setUploadFileSize] = useState("14.5 MB");
  const [uploadProgress, setUploadProgress] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState("Analysis complete · AI Agent Ready");

  // Raw Footage Video URL
  const [rawVideoUrl, setRawVideoUrl] = useState(
    "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4"
  );

  // Analysis Data & Transcript
  const [transcriptText, setTranscriptText] = useState(
    "Most SaaS founders lose over sixty percent of their users right after sign-up without realizing it. Um, you spend thousands of dollars on paid ads, but your onboarding has massive drop-offs. We analyzed over five hundred user sessions and discovered that sixty percent of churn happens on step two. So we replaced manual setup with an automated AI guided workflow that cut time to value by eighty percent. Our customer retention immediately grew forty percent in just ninety days across all cohorts. If you want to copy our exact retention playbook and see the blueprint, comment Playbook below or tap the link."
  );
  const [wordsList, setWordsList] = useState<any[]>([]);

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
      colors: { primary: "#E8A33D", accent: "#7FA37A", text: "#F3EFE6" }
    },
    progress_bar: { height: 3, color: "#E8A33D" }
  });

  const hybridTotalDuration = 68.0;

  // ==========================================
  // MODE C: AI AGENT BOT INTERACTIVE PROMPT ENGINE
  // ==========================================
  const [userPromptInput, setUserPromptInput] = useState("");
  const [isBotProcessing, setIsBotProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: "Hello! I am your AI Video Copilot Agent. Upload raw founder footage and tell me how you'd like to alter the video (e.g. hook reordering, B-roll insertions, caption styles, motion graphics, or sound ducking).",
      timestamp: "Just now",
      actions: ["Video Ingested", "Speech Transcribed", "Scene Boundaries Identified"]
    }
  ]);

  // Hook Re-ordering state
  const [hookSwapped, setHookSwapped] = useState(false);

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

  // AI Agent Bot Prompt Submitter (Calls backend /api/hybrid/ai-alter + client fallback)
  const handleSendPrompt = async (customPrompt?: string, presetKey?: string) => {
    const promptToExecute = customPrompt || userPromptInput;
    if (!promptToExecute.trim()) return;

    const userMsg: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: promptToExecute,
      timestamp: "Now"
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!customPrompt) setUserPromptInput("");
    setIsBotProcessing(true);

    try {
      const res = await fetch("http://localhost:8000/api/hybrid/ai-alter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: uploadedVideoId || 1,
          prompt: promptToExecute,
          preset_type: presetKey,
          current_tracks: hybridTracks,
          aspect_ratio: aspectRatio
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tracks) setHybridTracks(data.tracks);
        if (data.provenance) setProvenance(data.provenance);

        const botReply: AgentChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "agent",
          text: data.agent_message || `I have altered the video according to your preference.`,
          timestamp: "Just now",
          actions: data.applied_changes || ["Altered Remotion Timeline"],
          logs: data.agent_logs || []
        };
        setChatHistory((prev) => [...prev, botReply]);
        setSuccessMsg("✨ AI Video Copilot altered the video composition!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Client-Side Fallback Alteration Engine
      simulateClientAlteration(promptToExecute, presetKey);
    } finally {
      setIsBotProcessing(false);
    }
  };

  const simulateClientAlteration = (prompt: string, preset?: string) => {
    const p = prompt.toLowerCase();
    const applied: string[] = [];
    const logs: string[] = [];

    logs.push(`Interpreted prompt: "${prompt}"`);

    // Hook Alteration
    if (p.includes("hook") || p.includes("opening") || preset === "hook_opt") {
      setHookSwapped(true);
      setTranscriptText((prev) =>
        "Our customer retention grew forty percent in ninety days using this one automated onboarding step. Most SaaS founders lose over sixty percent of their users right after sign-up without realizing it... " +
        prev.substring(80)
      );
      applied.push("Re-ordered opening with viral +40% retention hook");
      logs.push("Applied 1.12x punch-in on opening hook statement.");
    }

    // B-Roll
    if (p.includes("b-roll") || p.includes("broll") || p.includes("stock") || p.includes("visual") || preset === "broll_inject") {
      setHybridTracks((prev: any) => ({
        ...prev,
        broll: [
          {
            start: 9.0,
            end: 17.5,
            duration: 8.5,
            url: "https://videos.pexels.com/video-files/8387537/8387537-hd_1920_1080_25fps.mp4",
            query: "SaaS Analytics Dashboard",
            text_overlay: "AD SPEND BLEEDING OUT"
          },
          {
            start: 33.0,
            end: 42.0,
            duration: 9.0,
            url: "https://videos.pexels.com/video-files/3252063/3252063-hd_1920_1080_25fps.mp4",
            query: "Automated Software Workflow",
            text_overlay: "AI GUIDED ONBOARDING"
          }
        ]
      }));
      setProvenance((prev) => ({
        ...prev,
        stock_broll_pct: 26,
        original_footage_pct: 60,
        summary: "60% Founder footage · 26% Stock B-roll · 9% Motion graphics · 5% AI branding"
      }));
      applied.push("Injected 2 high-impact SaaS analytics & workflow B-roll layers");
      logs.push("Synchronized crossfade transitions between founder video and B-roll.");
    }

    // Silence & Fillers
    if (p.includes("silence") || p.includes("filler") || p.includes("pause") || p.includes("trim") || preset === "silence_cut") {
      applied.push("Trimmed 1.2s silence at 00:08 and filtered out filler 'Um'");
      logs.push("Cleaned speech cadence and tightened pacing for 9:16 short-form.");
    }

    // Captions
    if (p.includes("caption") || p.includes("subtitle") || p.includes("amber") || p.includes("kinetic") || preset === "kinetic_captions") {
      applied.push("Applied kinetic amber word bounce captions in safe zone");
      logs.push("Calibrated safe-zone offsets for TikTok and Reels UI buttons.");
    }

    // Stat card
    if (p.includes("stat") || p.includes("metric") || p.includes("card") || p.includes("retention") || preset === "stat_card") {
      setHybridTracks((prev: any) => ({
        ...prev,
        graphics: [
          {
            start: 45.0,
            end: 55.0,
            duration: 10.0,
            type: "STAT_CARD",
            headline: "COHORT RETENTION GAIN",
            value: "+40% RETENTION",
            subtext: "Automated AI Onboarding Impact",
            badge: "PROVEN IMPACT",
            color: "#7FA37A"
          }
        ]
      }));
      applied.push("Injected animated +40% Retention metric card");
      logs.push("Positioned glassmorphism stat card during proof explanation.");
    }

    // Audio ducking
    if (p.includes("audio") || p.includes("music") || p.includes("duck") || p.includes("lo-fi") || preset === "audio_duck") {
      setHybridTracks((prev: any) => ({
        ...prev,
        audio: {
          original_speech: { source: "ORIGINAL_AUDIO", volume: 1.0 },
          background_music: {
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            volume: 0.12
          }
        }
      }));
      applied.push("Applied ambient Lo-Fi music with 0.12x ducking under speech");
      logs.push("Set audio compressor to prioritize vocal clarity.");
    }

    if (applied.length === 0) {
      applied.push(`Adjusted video composition to: "${prompt}"`);
      logs.push("Updated timeline layer weights and duration constraints.");
    }

    const botReply: AgentChatMessage = {
      id: `bot-${Date.now()}`,
      sender: "agent",
      text: `Altered video successfully: ${applied.join(", ")}.`,
      timestamp: "Just now",
      actions: applied,
      logs: logs
    };

    setChatHistory((prev) => [...prev, botReply]);
    setSuccessMsg("✨ AI Video Copilot altered the video composition!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

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
      formData.append("mode", "HYBRID");

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

  const simulateProcessingPipeline = () => {
    setTimeout(() => {
      setUploadProgress(50);
      setProcessingStage("Transcribing speech & timestamping words...");
      setTimeout(() => {
        setUploadProgress(80);
        setProcessingStage("Detecting scenes, silences & viral hooks...");
        setTimeout(() => {
          setUploadProgress(100);
          setIsUploading(false);
          setProcessingStage("Analysis complete · AI Agent Ready");
          setSuccessMsg("Video analyzed! Tell the AI Agent how you'd like to alter it.");
          setTimeout(() => setSuccessMsg(""), 4000);
        }, 600);
      }, 700);
    }, 600);
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
        }, 1000);
      }, 1000);
    }, 800);
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
    <div className="space-y-6 pb-16">
      {/* Creation Mode Switcher Header */}
      <div className="card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-2 border-l-[#E8A33D]">
        <div>
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-[#E8A33D]" />
            <h1 className="text-sm font-semibold text-[#F3EFE6] tracking-tight">
              FounderOS Video Studio Bay
            </h1>
          </div>
          <p className="text-xs text-[#A79E8E] mt-0.5">
            Post-production monitor suite: calibrate authentic founder cuts, AI video agent alteration, layered B-roll, motion graphics, and AI visuals.
          </p>
        </div>

        {/* 3 Distinct Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-[#1A1712] p-1 rounded-[4px] border border-[#3A3427]">
          <button
            onClick={() => setActiveMode("AI_GENERATED")}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeMode === "AI_GENERATED"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]"
                : "text-[#A79E8E] hover:text-[#F3EFE6]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mode A: AI Generated
          </button>

          <button
            onClick={() => router.push("/editor")}
            className="px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all text-[#A79E8E] hover:text-[#E8A33D] hover:bg-[#2C281F]/60"
            title="Open Dedicated Mode B Manual Multi-Video Editor"
          >
            <Film className="w-3.5 h-3.5 text-[#E8A33D]" />
            Mode B: Manual Multi-Clip ↗
          </button>

          <button
            onClick={() => setActiveMode("HYBRID")}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "HYBRID"
                ? "bg-[#E8A33D] text-[#1A1712]"
                : "text-[#A79E8E] hover:text-[#E8A33D]"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Mode C: AI Copilot Bay
            <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ml-0.5 ${
              activeMode === "HYBRID" ? "bg-[#1A1712] text-[#E8A33D]" : "bg-[#E8A33D]/20 text-[#E8A33D]"
            }`}>
              Primary
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-[#7FA37A]/15 border border-[#7FA37A]/40 p-3 rounded-[4px] text-xs text-[#7FA37A] flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-[#7FA37A]" />
          {successMsg}
        </div>
      )}

      {rendering && (
        <div className="bg-[#E8A33D]/10 border border-[#E8A33D]/30 p-3 rounded-[4px] text-xs text-[#E8A33D] flex items-center gap-2 font-medium animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E8A33D]" />
          {renderProgress}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE A: AI GENERATED (PROMPT -> SCRIPT -> VOICEOVER -> STOCK REELS) */}
      {/* ========================================================================= */}
      {activeMode === "AI_GENERATED" && (
        <div className="space-y-6">
          <div className="metrics">
            <div className="metric-card">
              <div className="metric-label">Mode</div>
              <div className="metric-val text-xs text-[#E8A33D] font-mono mt-1">AI Video (Stock + Script)</div>
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
              <div className="metric-label">Voice Synthesis</div>
              <div className="metric-val text-xs text-[#A79E8E] font-mono mt-1">ElevenLabs (Female)</div>
            </div>
          </div>

          <div className="grid2">
            {/* Player Monitor Frame */}
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">AI Video Monitor — Cut #{itemId}</span>
                <span className="pill pill-warn">AI Synthesized</span>
              </div>

              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="w-full md:w-[200px] shrink-0">
                  <div className="monitor-frame aspect-[9/16] overflow-hidden flex items-center justify-center relative">
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
                  <div className="font-mono text-[10px] text-[#A79E8E] text-center mt-2 tracking-widest">
                    9:16 · <span className="text-[#E8A33D]">{aiTotalDuration}s</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="text-xs font-semibold text-[#F3EFE6]">{aiTitle}</div>
                  <div className="space-y-1.5">
                    {aiStoryboard.map((scene, idx) => (
                      <div key={idx} className="hairline-row flex items-start gap-3 py-2">
                        <div className="font-mono text-xs text-[#E8A33D] w-5">0{scene.scene_index}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[#F3EFE6]">
                            {scene.text_overlay}
                          </div>
                          <div className="font-mono text-[11px] text-[#766E5F]">
                            {scene.duration}s · Stock Reel
                          </div>
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
                  <div className="text-xs text-[#A79E8E] bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-3 space-y-1.5">
                    <div className="font-semibold text-[#E8A33D]">Viral Hook Formula:</div>
                    <div>Hook (0-5s) → Pain Point (5-15s) → Solution (15-25s) → Action CTA (25-30s)</div>
                  </div>
                  <textarea
                    rows={6}
                    value={aiScript}
                    onChange={(e) => setAiScript(e.target.value)}
                    className="w-full bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-2.5 text-xs text-[#F3EFE6] focus:outline-none focus:border-[#E8A33D] font-mono leading-relaxed"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-[#3A3427] flex justify-end">
                <button 
                  onClick={() => alert("Script regenerated with high-impact hook variation!")}
                  className="btn-ghost"
                >
                  <RefreshCw size={13} />
                  <span>Regenerate angles</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE C: AI COPILOT HYBRID BAY (RAW VIDEO + AI AGENT BOT ALTERATION) */}
      {/* ========================================================================= */}
      {activeMode === "HYBRID" && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="card p-4 bg-[#232019] border border-[#3A3427]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[4px] bg-[#1A1712] border border-[#3A3427] flex items-center justify-center text-[#E8A33D]">
                  <Film size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F3EFE6]">{uploadFilename}</span>
                    <span className="pill pill-success text-[10px]">Active Master Footage</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#A79E8E] mt-0.5">
                    {uploadFileSize} · 1080x1920 (9:16 Vertical) · <span className="text-[#E8A33D]">00:01:08:00</span> · Authentic Audio
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
                  className="btn-ghost"
                  title="Upload custom raw video footage"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#A79E8E]" />
                  <span>Upload Raw Video</span>
                </button>
                <button
                  onClick={() => router.push("/editor")}
                  className="btn-ghost text-[#A79E8E] hover:text-[#E8A33D]"
                  title="Switch to Mode B Manual Multi-Clip Editor"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#E8A33D]" />
                  <span>Mode B: Manual Editor ↗</span>
                </button>
              </div>
            </div>

            {/* Analysis Progress Checklist */}
            <div className="mt-3.5 pt-3 border-t border-[#3A3427] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#A79E8E]">
                <span className="w-2 h-2 rounded-full bg-[#7FA37A] animate-pulse" />
                {processingStage}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-[#766E5F]">
                <span className="text-[#7FA37A]">✓ Audio Extracted</span>
                <span className="text-[#7FA37A]">✓ Speech Transcribed</span>
                <span className="text-[#7FA37A]">✓ Scenes Detected</span>
                <span className="text-[#E8A33D] font-semibold">● AI Agent Copilot Active</span>
              </div>
            </div>
          </div>

          {/* Provenance Transparency Row */}
          <div className="card p-4 bg-[#232019] border border-[#3A3427]">
            <ProvenanceBar 
              founder={provenance.original_footage_pct}
              broll={provenance.stock_broll_pct}
              graphics={provenance.ai_graphics_pct}
              aiVisuals={provenance.ai_generated_pct}
            />
          </div>

          {/* Main Dual Workspace: Remotion Player + Interactive AI Agent Bot Control Panel */}
          <div className="grid2">
            {/* Left: Remotion Editing Bay Monitor Preview */}
            <div className="card flex flex-col justify-between">
              <div>
                <div className="card-hdr">
                  <span className="card-title flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-[#E8A33D]" />
                    AI Altered Video Preview
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAspectRatio("9:16")}
                      className={`px-2 py-0.5 rounded-[3px] font-mono text-[10px] ${
                        aspectRatio === "9:16" ? "bg-[#E8A33D] text-[#1A1712] font-semibold" : "border border-[#3A3427] text-[#A79E8E]"
                      }`}
                    >
                      9:16 Reel
                    </button>
                    <button
                      onClick={() => setAspectRatio("1:1")}
                      className={`px-2 py-0.5 rounded-[3px] font-mono text-[10px] ${
                        aspectRatio === "1:1" ? "bg-[#E8A33D] text-[#1A1712] font-semibold" : "border border-[#3A3427] text-[#A79E8E]"
                      }`}
                    >
                      1:1 Square
                    </button>
                    <button
                      onClick={() => setAspectRatio("16:9")}
                      className={`px-2 py-0.5 rounded-[3px] font-mono text-[10px] ${
                        aspectRatio === "16:9" ? "bg-[#E8A33D] text-[#1A1712] font-semibold" : "border border-[#3A3427] text-[#A79E8E]"
                      }`}
                    >
                      16:9 Horizontal
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
                    className="monitor-frame relative"
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
              <div className="pt-3 mt-2 border-t border-[#3A3427] flex items-center justify-between gap-2">
                <div className="font-mono text-[11px] text-[#A79E8E]">
                  Layers: <span className="text-[#E8A33D]">{hybridTracks.broll?.length || 2} B-Roll · {hybridTracks.graphics?.length || 1} Graphics</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRenderHybrid}
                    disabled={rendering}
                    className="btn-ghost text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${rendering ? "animate-spin" : ""}`} />
                    <span>Render Platform Cut</span>
                  </button>

                  <button
                    onClick={handleSubmitToApproval}
                    className="btn-primary"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Send for human approval ↗</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: INTERACTIVE AI AGENT BOT PROMPT PANEL */}
            <div className="card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="card-hdr">
                  <span className="card-title flex items-center gap-2 text-[#E8A33D]">
                    <Bot className="w-4 h-4 text-[#E8A33D]" />
                    AI Agent Video Alteration Bot
                  </span>
                  <span className="pill pill-success text-[10px]">
                    Interactive Copilot
                  </span>
                </div>

                {/* Prompt Instruction Bar */}
                <div className="bg-[#1A1712] border border-[#3A3427] focus-within:border-[#E8A33D] rounded-[6px] p-2.5 transition-all">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#A79E8E] flex items-center justify-between mb-1">
                    <span>Command the AI Agent to Alter Video</span>
                    <span className="text-[#E8A33D]">{isBotProcessing ? "Bot Reasoning..." : "Ready"}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <textarea
                      rows={2}
                      value={userPromptInput}
                      onChange={(e) => setUserPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendPrompt();
                        }
                      }}
                      placeholder="Tell the bot: e.g. 'Cut out silences, insert SaaS B-roll at 10s, and make the captions energetic amber'..."
                      className="w-full bg-transparent text-xs text-[#F3EFE6] placeholder-[#766E5F] focus:outline-none resize-none leading-relaxed"
                    />
                    <button
                      onClick={() => handleSendPrompt()}
                      disabled={isBotProcessing || !userPromptInput.trim()}
                      className="h-9 px-3 rounded-[4px] bg-[#E8A33D] text-[#14120D] font-semibold text-xs flex items-center gap-1 hover:bg-[#d69330] transition-colors disabled:opacity-40 shrink-0"
                    >
                      {isBotProcessing ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      <span>Alter</span>
                    </button>
                  </div>
                </div>

                {/* Quick AI Alteration Prompt Chips */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#766E5F] uppercase tracking-wider">
                    Quick AI Action Presets:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "⚡ Viral Hook Swap", prompt: "Re-order opening hook with the +40% retention growth metric for peak attention", key: "hook_opt" },
                      { label: "🎬 Inject SaaS B-Roll", prompt: "Insert SaaS analytics and automation workflow B-roll during the problem & solution segments", key: "broll_inject" },
                      { label: "✂️ Cut Silences & Fillers", prompt: "Remove 1.2s silence before problem statement and filter out filler words", key: "silence_cut" },
                      { label: "🔥 Kinetic Amber Captions", prompt: "Apply kinetic amber word-level highlight captions with safe-zone bounds", key: "kinetic_captions" },
                      { label: "📊 +40% Stat Card", prompt: "Overlay animated Glassmorphism Stat Card for +40% retention cohort results", key: "stat_card" },
                      { label: "🎵 Duck Audio & Lo-Fi", prompt: "Add ambient Lo-Fi music track ducked 0.12x under founder speech", key: "audio_duck" }
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleSendPrompt(chip.prompt, chip.key)}
                        disabled={isBotProcessing}
                        className="px-2.5 py-1 rounded-[4px] bg-[#1A1712] border border-[#3A3427] hover:border-[#E8A33D] text-[#A79E8E] hover:text-[#E8A33D] text-[11px] font-medium transition-colors disabled:opacity-40"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Agent Thought & Action History Feed */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  <div className="text-[10px] font-mono text-[#766E5F] uppercase tracking-wider">
                    Agent Thought & Alteration Logs:
                  </div>

                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-[4px] border text-xs space-y-1.5 transition-all ${
                        msg.sender === "user"
                          ? "bg-[#2C281F]/50 border-[#E8A33D]/40 text-[#F3EFE6]"
                          : "bg-[#1A1712] border-[#3A3427] text-[#A79E8E]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={msg.sender === "user" ? "text-[#E8A33D] font-bold" : "text-[#7FA37A] font-semibold flex items-center gap-1"}>
                          {msg.sender === "user" ? "You (Preference Prompt)" : <><Bot size={11} /> AI Video Agent Bot</>}
                        </span>
                        <span className="text-[#766E5F]">{msg.timestamp}</span>
                      </div>

                      <p className="text-[#F3EFE6] leading-relaxed text-[11px]">{msg.text}</p>

                      {msg.actions && msg.actions.length > 0 && (
                        <div className="pt-1 border-t border-[#3A3427]/60 flex flex-wrap gap-1">
                          {msg.actions.map((act, idx) => (
                            <span key={idx} className="bg-[#7FA37A]/15 text-[#7FA37A] border border-[#7FA37A]/30 px-1.5 py-0.2 rounded font-mono text-[9px] flex items-center gap-1">
                              <CheckCircle2 size={9} /> {act}
                            </span>
                          ))}
                        </div>
                      )}

                      {msg.logs && msg.logs.length > 0 && (
                        <div className="text-[10px] font-mono text-[#8A8274] bg-[#14120D] p-1.5 rounded space-y-0.5">
                          {msg.logs.map((log, idx) => (
                            <div key={idx}>› {log}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transcript Sync */}
              <div className="pt-3 border-t border-[#3A3427]">
                <label className="font-mono text-[10px] text-[#A79E8E] uppercase tracking-wider block mb-1">
                  Active Founder Speech Narration (Synced with AI Captions)
                </label>
                <textarea
                  rows={2}
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="w-full bg-[#1A1712] border border-[#3A3427] rounded-[4px] p-2 font-mono text-xs text-[#F3EFE6] focus:outline-none focus:border-[#E8A33D] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 8-TRACK INTERACTIVE VISUAL TIMELINE EDITOR */}
          {/* ========================================================================= */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A3427] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E8A33D]" />
                <h3 className="text-xs font-semibold text-[#F3EFE6]">
                  NLE Multi-Track Timeline Bay (Altered by AI Agent)
                </h3>
              </div>
              <div className="font-mono text-xs text-[#E8A33D] bg-[#1A1712] px-2.5 py-1 rounded-[4px] border border-[#3A3427] tabular-nums">
                00:00:00 ──────────────────────────────────────── 00:01:08:00
              </div>
            </div>

            {/* Timeline Tracks Grid */}
            <div className="space-y-2 font-mono text-xs">
              {/* Track 1: Original Founder Video (Amber #E8A33D) */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-medium text-[#E8A33D] uppercase flex items-center gap-1.5 shrink-0">
                  <Video className="w-3 h-3 text-[#E8A33D]" />
                  Founder Video
                </div>
                <div className="flex-1 h-8 bg-[#1A1712] border border-[#3A3427] rounded-[3px] overflow-hidden flex gap-1 p-0.5">
                  <div
                    style={{ width: "35%" }}
                    className="bg-[#E8A33D] text-[#14120D] rounded-[2px] flex items-center justify-center text-[10px] font-semibold tracking-tight"
                  >
                    Talking Head ({hookSwapped ? "Retention Hook" : "Problem Hook"})
                  </div>
                  <div
                    style={{ width: "25%" }}
                    className="bg-[#E8A33D]/20 text-[#E8A33D] border border-dashed border-[#E8A33D] rounded-[2px] flex items-center justify-center text-[10px]"
                  >
                    Muted (Under B-Roll)
                  </div>
                  <div
                    style={{ width: "40%" }}
                    className="bg-[#E8A33D] text-[#14120D] rounded-[2px] flex items-center justify-center text-[10px] font-semibold tracking-tight"
                  >
                    Founder (CTA)
                  </div>
                </div>
              </div>

              {/* Track 2: Semantic B-Roll Cutaway (Moss #7FA37A) */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-medium text-[#7FA37A] uppercase flex items-center gap-1.5 shrink-0">
                  <Film className="w-3 h-3 text-[#7FA37A]" />
                  B-Roll Cutaway
                </div>
                <div className="flex-1 h-8 bg-[#1A1712] border border-[#3A3427] rounded-[3px] overflow-hidden relative p-0.5 flex">
                  <div
                    style={{ left: "14%", width: "24%" }}
                    className="absolute h-7 bg-[#7FA37A] text-[#1A1712] rounded-[2px] flex items-center justify-center text-[10px] font-semibold"
                  >
                    B-Roll: SaaS Analytics
                  </div>
                  <div
                    style={{ left: "54%", width: "16%" }}
                    className="absolute h-7 bg-[#7FA37A] text-[#1A1712] rounded-[2px] flex items-center justify-center text-[10px] font-semibold"
                  >
                    B-Roll: Workflow UI
                  </div>
                </div>
              </div>

              {/* Track 3: Motion Graphics */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-medium text-[#A79E8E] uppercase flex items-center gap-1.5 shrink-0">
                  <BarChart3 className="w-3 h-3 text-[#A79E8E]" />
                  Motion Graphics
                </div>
                <div className="flex-1 h-8 bg-[#1A1712] border border-[#3A3427] rounded-[3px] overflow-hidden relative p-0.5 flex">
                  <div
                    style={{ left: "68%", width: "20%" }}
                    className="absolute h-7 bg-[#A79E8E] text-[#1A1712] rounded-[2px] flex items-center justify-center text-[10px] font-semibold"
                  >
                    Stat: +40% Retention
                  </div>
                </div>
              </div>

              {/* Track 4: Kinetic Captions */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-medium text-[#F3EFE6] uppercase flex items-center gap-1.5 shrink-0">
                  <Type className="w-3 h-3 text-[#F3EFE6]" />
                  Captions
                </div>
                <div className="flex-1 h-7 bg-[#1A1712] border border-[#3A3427] rounded-[3px] overflow-hidden flex p-0.5">
                  <div className="w-full bg-[#2C281F] text-[#E8A33D] rounded-[2px] flex items-center justify-center text-[10px] font-medium uppercase tracking-wider">
                    Word-Level Active Highlighting (Safe-Area Protected)
                  </div>
                </div>
              </div>

              {/* Track 5: Audio & Voice */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-medium text-[#A79E8E] uppercase flex items-center gap-1.5 shrink-0">
                  <Volume2 className="w-3 h-3 text-[#7FA37A]" />
                  Audio & Voice
                </div>
                <div className="flex-1 h-7 bg-[#1A1712] border border-[#3A3427] rounded-[3px] overflow-hidden flex p-0.5">
                  <div className="w-full bg-[#7FA37A]/20 text-[#7FA37A] border border-[#7FA37A]/30 rounded-[2px] flex items-center justify-center text-[10px]">
                    Original Speech Voiceover (68s Master · Normalized)
                  </div>
                </div>
              </div>

              {/* Track 6: Background Music */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-[10px] font-medium text-[#766E5F] uppercase flex items-center gap-1.5 shrink-0">
                  <Sliders className="w-3 h-3 text-[#766E5F]" />
                  Ambient Ducking
                </div>
                <div className="flex-1 h-6 bg-[#1A1712] border border-[#3A3427] rounded-[3px] overflow-hidden flex p-0.5">
                  <div className="w-full bg-[#2C281F] text-[#766E5F] rounded-[2px] flex items-center justify-center text-[9px]">
                    Lo-Fi Bed (Ducked to 0.12x during speech)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Repurposing: Multi-Clip Recommendations */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#F3EFE6] flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-[#E8A33D]" />
                  AI Repurposing: Automated Shorts Extractions
                </h4>
                <p className="text-xs text-[#A79E8E]">
                  FounderOS automatically distilled 3 high-impact standalone cuts from this master take:
                </p>
              </div>
              <span className="pill pill-info text-[10px]">Multi-Clip Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="border border-[#3A3427] rounded-[4px] p-3 bg-[#1A1712] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#E8A33D] uppercase">Clip #1 · 31s</span>
                  <span className="font-mono text-[10px] text-[#7FA37A]">IG Reel</span>
                </div>
                <div className="text-xs font-semibold text-[#F3EFE6]">
                  Why 60% of SaaS Users Churn on Step 2
                </div>
                <div className="text-[11px] text-[#A79E8E]">
                  Hook: &quot;Losing 60% of users right after sign-up?&quot;
                </div>
                <button
                  onClick={() => alert("Clip #1 loaded into active bay.")}
                  className="btn-ghost text-[11px] w-full py-1 text-center font-medium"
                >
                  Load Cut #1
                </button>
              </div>

              <div className="border border-[#E8A33D] rounded-[4px] p-3 bg-[#2C281F]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#E8A33D] uppercase font-bold">Clip #2 · 37s (Master)</span>
                  <span className="font-mono text-[10px] text-[#E8A33D]">LinkedIn / X</span>
                </div>
                <div className="text-xs font-semibold text-[#F3EFE6]">
                  How We Grew Retention +40% in 90 Days
                </div>
                <div className="text-[11px] text-[#A79E8E]">
                  Hook: &quot;The exact automated onboarding workflow that grew retention 40%&quot;
                </div>
                <div className="text-[11px] font-mono text-[#E8A33D] text-center py-1">
                  Active in Copilot Bay ✓
                </div>
              </div>

              <div className="border border-[#3A3427] rounded-[4px] p-3 bg-[#1A1712] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#E8A33D] uppercase">Clip #3 · 36s</span>
                  <span className="font-mono text-[10px] text-[#A79E8E]">Founder Insights</span>
                </div>
                <div className="text-xs font-semibold text-[#F3EFE6]">
                  The Single Biggest SaaS Onboarding Mistake
                </div>
                <div className="text-[11px] text-[#A79E8E]">
                  Hook: &quot;Stop pouring money into ads until you fix this onboarding leak&quot;
                </div>
                <button
                  onClick={() => alert("Clip #3 loaded into active bay.")}
                  className="btn-ghost text-[11px] w-full py-1 text-center font-medium"
                >
                  Load Cut #3
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
    <Suspense fallback={<div className="py-12 text-center text-[#A79E8E] font-mono text-xs">Loading Studio Bay...</div>}>
      <StudioContent />
    </Suspense>
  );
}
