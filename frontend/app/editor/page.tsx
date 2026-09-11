"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Sliders,
  Sparkles,
  Scissors,
  Type,
  Volume2,
  VolumeX,
  Upload,
  Layers,
  Sun,
  Contrast,
  Palette,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Film,
  Video,
  Plus,
  Trash2,
  ArrowLeftRight,
  MoveLeft,
  MoveRight,
  Split,
  Clapperboard,
  Wand2,
  Clock,
  Download
} from "lucide-react";

type MediaType = "video" | "photo";
type ToolTab = "clips" | "crop" | "adjust" | "filters" | "trim" | "text" | "branding";
type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5" | "original";

interface VideoClip {
  id: string;
  name: string;
  url: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  speed: number;
  volume: number;
  muted: boolean;
  type: "founder" | "broll" | "screen" | "outro";
}

interface FilterPreset {
  id: string;
  name: string;
  category: string;
  brightness: number;
  contrast: number;
  saturate: number;
  warmth: number;
  sepia: number;
  hueRotate: number;
  vignette: number;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: "original", name: "Original", category: "Standard", brightness: 100, contrast: 100, saturate: 100, warmth: 0, sepia: 0, hueRotate: 0, vignette: 0 },
  { id: "tungsten", name: "Tungsten Gold", category: "FounderOS Signature", brightness: 105, contrast: 115, saturate: 120, warmth: 25, sepia: 20, hueRotate: -10, vignette: 25 },
  { id: "cinematic", name: "Cinematic Moody", category: "Teal & Orange", brightness: 95, contrast: 130, saturate: 110, warmth: 15, sepia: 15, hueRotate: 15, vignette: 40 },
  { id: "noir", name: "B&W High Noir", category: "Monochrome", brightness: 105, contrast: 150, saturate: 0, warmth: 0, sepia: 0, hueRotate: 0, vignette: 50 },
  { id: "vintage", name: "Vintage 35mm", category: "Film Aesthetic", brightness: 102, contrast: 95, saturate: 85, warmth: 30, sepia: 35, hueRotate: 5, vignette: 30 },
  { id: "cyber", name: "Cyber Neon", category: "Electric", brightness: 110, contrast: 140, saturate: 160, warmth: 0, sepia: 10, hueRotate: 60, vignette: 35 },
  { id: "studio", name: "Clean Studio", category: "Clarity & Crisp", brightness: 108, contrast: 108, saturate: 105, warmth: 5, sepia: 0, hueRotate: 0, vignette: 10 },
  { id: "sunset", name: "Golden Sunset", category: "Warm Glow", brightness: 104, contrast: 112, saturate: 130, warmth: 45, sepia: 30, hueRotate: -15, vignette: 20 }
];

const DEFAULT_CLIPS: VideoClip[] = [
  {
    id: "clip-1",
    name: "01_founder_hook_statement.mp4",
    url: "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
    duration: 18.0,
    trimStart: 0,
    trimEnd: 18.0,
    speed: 1.0,
    volume: 1.0,
    muted: false,
    type: "founder"
  },
  {
    id: "clip-2",
    name: "02_broll_analytics_dropoff.mp4",
    url: "https://videos.pexels.com/video-files/8387537/8387537-hd_1920_1080_25fps.mp4",
    duration: 15.0,
    trimStart: 0,
    trimEnd: 15.0,
    speed: 1.0,
    volume: 0.8,
    muted: true,
    type: "broll"
  },
  {
    id: "clip-3",
    name: "03_software_workflow_demo.mp4",
    url: "https://videos.pexels.com/video-files/3252063/3252063-hd_1920_1080_25fps.mp4",
    duration: 14.0,
    trimStart: 0,
    trimEnd: 14.0,
    speed: 1.0,
    volume: 1.0,
    muted: false,
    type: "screen"
  }
];

function CreativeEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Multi-Clip Sequence State
  const [clips, setClips] = useState<VideoClip[]>(DEFAULT_CLIPS);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ToolTab>("clips");

  const activeClip = clips[activeClipIndex] || clips[0];

  // Video Transport State
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Compute Total Sequence Duration
  const totalSequenceDuration = clips.reduce((acc, c) => acc + (c.trimEnd - c.trimStart) / c.speed, 0);

  // Crop & Transform State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [showSafeZones, setShowSafeZones] = useState(true);

  // Color Adjustments State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [warmth, setWarmth] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [blur, setBlur] = useState(0);

  // Filter Preset State
  const [selectedFilter, setSelectedFilter] = useState<string>("original");

  // Text Overlay State
  const [showTextOverlay, setShowTextOverlay] = useState(true);
  const [overlayText, setOverlayText] = useState("Scale Your SaaS Without Ad Spend");
  const [overlayStyle, setOverlayStyle] = useState<"bold" | "clean" | "mono" | "cyber">("bold");
  const [overlayPosition, setOverlayPosition] = useState<"top" | "center" | "lower">("lower");
  const [overlayColor, setOverlayColor] = useState<"amber" | "white" | "cyan">("amber");
  const [overlayBg, setOverlayBg] = useState(true);

  // Branding Badges State
  const [showBranding, setShowBranding] = useState(true);
  const [founderRole, setFounderRole] = useState("Founder & CEO · Manual Master Cut");

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Video Transport Listeners
  const handleTimeUpdate = () => {
    if (videoRef.current && activeClip) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Loop within active clip trim bounds or advance to next clip
      if (cur >= activeClip.trimEnd) {
        if (activeClipIndex < clips.length - 1) {
          // Advance to next attached clip in sequence
          const nextIdx = activeClipIndex + 1;
          setActiveClipIndex(nextIdx);
          showToast(`Playing Clip ${nextIdx + 1}: ${clips[nextIdx].name}`);
        } else {
          // Loop back to first clip
          videoRef.current.currentTime = activeClip.trimStart;
          if (!isPlaying) videoRef.current.pause();
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && activeClip) {
      const dur = videoRef.current.duration || activeClip.duration;
      if (activeClip.duration !== dur) {
        setClips((prev) =>
          prev.map((c, idx) =>
            idx === activeClipIndex
              ? { ...c, duration: dur, trimEnd: Math.min(c.trimEnd, dur) }
              : c
          )
        );
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= activeClip.trimEnd) {
        videoRef.current.currentTime = activeClip.trimStart;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Attach New Video File to Clip Library
  const handleAddVideoClip = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const newClip: VideoClip = {
      id: `clip-${Date.now()}`,
      name: file.name,
      url: objectUrl,
      duration: 15.0,
      trimStart: 0,
      trimEnd: 15.0,
      speed: 1.0,
      volume: 1.0,
      muted: false,
      type: file.name.toLowerCase().includes("broll") ? "broll" : "founder"
    };

    setClips((prev) => [...prev, newClip]);
    setActiveClipIndex(clips.length);
    showToast(`Attached "${file.name}" to sequence timeline (${clips.length + 1} total clips)`);
  };

  // Re-order Clips
  const moveClip = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index > 0) {
      const updated = [...clips];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      setClips(updated);
      setActiveClipIndex(index - 1);
      showToast("Re-ordered clip sequence");
    } else if (direction === "right" && index < clips.length - 1) {
      const updated = [...clips];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      setClips(updated);
      setActiveClipIndex(index + 1);
      showToast("Re-ordered clip sequence");
    }
  };

  // Delete Clip
  const removeClip = (index: number) => {
    if (clips.length <= 1) {
      alert("At least one video clip is required in the editing sequence.");
      return;
    }
    const updated = clips.filter((_, idx) => idx !== index);
    setClips(updated);
    setActiveClipIndex(Math.max(0, index - 1));
    showToast("Removed clip from timeline");
  };

  // Update Active Clip Parameters
  const updateActiveClip = (partial: Partial<VideoClip>) => {
    setClips((prev) =>
      prev.map((c, idx) => (idx === activeClipIndex ? { ...c, ...partial } : c))
    );
  };

  // 1-Click Auto Enhance
  const handleAutoEnhance = () => {
    setBrightness(106);
    setContrast(118);
    setSaturation(115);
    setWarmth(15);
    setExposure(5);
    setVignette(15);
    showToast("✨ Applied FounderOS AI Auto-Enhance");
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setExposure(0);
    setVignette(0);
    setBlur(0);
    setSelectedFilter("original");
    showToast("Reset color & adjustments to default");
  };

  // Reset Crop & Transform
  const handleResetTransform = () => {
    setAspectRatio("9:16");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(100);
    setPanX(0);
    setPanY(0);
    showToast("Reset framing & crop to 9:16 vertical");
  };

  // Apply Filter Preset
  const applyFilter = (f: FilterPreset) => {
    setSelectedFilter(f.id);
    setBrightness(f.brightness);
    setContrast(f.contrast);
    setSaturation(f.saturate);
    setWarmth(f.warmth);
    setVignette(f.vignette);
    showToast(`Applied ${f.name} filter preset`);
  };

  // Format timecode helper
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
  };

  // Save to Approvals Queue
  const handleSaveToApprovals = () => {
    showToast("Saved multi-clip master to Approvals Queue! Opening queue...");
    setTimeout(() => {
      router.push("/approvals");
    }, 1200);
  };

  // Computed filter & transform
  const computedFilterString = `
    brightness(${brightness}%)
    contrast(${contrast}%)
    saturate(${saturation}%)
    sepia(${warmth}%)
    ${blur > 0 ? `blur(${blur}px)` : ""}
  `.trim();

  const computedTransformString = `
    scale(${zoom / 100})
    rotate(${rotation}deg)
    scaleX(${flipH ? -1 : 1})
    scaleY(${flipV ? -1 : 1})
    translate(${panX}px, ${panY}px)
  `.trim();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-[#14120D] text-[#F3EFE6] select-none space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#232019] border border-[#E8A33D] px-4 py-2.5 rounded shadow-2xl text-xs font-medium text-[#E8A33D] flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Mode Selector & Mode B Demarcation */}
      <div className="card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-2 border-l-[#E8A33D]">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#E8A33D]" />
            <h1 className="text-sm font-semibold text-[#F3EFE6] tracking-tight">
              Mode B: Manual Multi-Video Editing Bay (Self-Serve)
            </h1>
            <span className="bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-bold">
              100% Hands-on
            </span>
          </div>
          <p className="text-xs text-[#A79E8E] mt-0.5">
            Import raw videos, attach multiple video clips, stitch timeline sequences, trim in/out, grade color, and edit fully for yourself.
          </p>
        </div>

        {/* 3 Modes Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-[#1A1712] p-1 rounded-[4px] border border-[#3A3427]">
          <button
            onClick={() => router.push("/studio?mode=AI_GENERATED")}
            className="px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all text-[#A79E8E] hover:text-[#F3EFE6]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A79E8E]" />
            Mode A: AI Generated
          </button>

          <button
            className="px-3.5 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 transition-all bg-[#E8A33D] text-[#1A1712]"
          >
            <Film className="w-3.5 h-3.5" />
            Mode B: Manual Multi-Clip
          </button>

          <button
            onClick={() => router.push("/studio?mode=HYBRID")}
            className="px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all text-[#A79E8E] hover:text-[#E8A33D]"
            title="Switch to Mode C AI Copilot Bay"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#E8A33D]" />
            Mode C: AI Copilot Bay ↗
          </button>
        </div>
      </div>

      {/* Main Studio Frame: Left Tools + Center Stage + Right Inspector */}
      <div className="flex-1 flex border border-[#2B261D] rounded bg-[#181510] overflow-hidden min-h-[580px]">
        {/* Tool Navigation Column */}
        <nav className="w-16 bg-[#181510] border-r border-[#2B261D] flex flex-col items-center py-3 gap-3 shrink-0">
          <button
            onClick={() => setActiveTab("clips")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "clips"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Multi-Clip Library & Video Attachment"
          >
            <Layers size={16} />
            <span>Clips ({clips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("crop")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "crop"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Crop, aspect ratio & rotate"
          >
            <Crop size={16} />
            <span>Crop</span>
          </button>

          <button
            onClick={() => setActiveTab("adjust")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "adjust"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Brightness, contrast & color grading"
          >
            <Sliders size={16} />
            <span>Adjust</span>
          </button>

          <button
            onClick={() => setActiveTab("filters")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "filters"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Aesthetic filter presets & LUTs"
          >
            <Palette size={16} />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setActiveTab("trim")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "trim"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Trim in/out points & clip speed"
          >
            <Scissors size={16} />
            <span>Trim</span>
          </button>

          <button
            onClick={() => setActiveTab("text")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "text"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Add text & titles overlay"
          >
            <Type size={16} />
            <span>Text</span>
          </button>

          <button
            onClick={() => setActiveTab("branding")}
            className={`w-11 h-11 rounded flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "branding"
                ? "bg-[#2C281F] text-[#E8A33D] border border-[#E8A33D]/50"
                : "text-[#8A8274] hover:text-[#F3EFE6] hover:bg-[#2C281F]/40"
            }`}
            title="Lower thirds & branding badges"
          >
            <ShieldCheck size={16} />
            <span>Brand</span>
          </button>
        </nav>

        {/* Left Tool Settings Drawer */}
        <aside className="w-80 bg-[#1C1813] border-r border-[#2B261D] p-4 overflow-y-auto shrink-0 flex flex-col gap-5">
          {/* TAB: MULTI-CLIP ATTACHMENT & LIBRARY */}
          {activeTab === "clips" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono block">
                    Attached Video Clips
                  </span>
                  <span className="text-[10px] text-[#8A8274]">
                    {clips.length} clips · {formatTimecode(totalSequenceDuration)} total sequence
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/mov,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAddVideoClip(e.target.files[0]);
                    }
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1"
                  title="Import & attach more raw videos"
                >
                  <Plus size={13} />
                  <span>Attach Video</span>
                </button>
              </div>

              {/* Clip List Cards */}
              <div className="space-y-2.5">
                {clips.map((clip, idx) => {
                  const isActive = idx === activeClipIndex;
                  const clipDuration = (clip.trimEnd - clip.trimStart) / clip.speed;

                  return (
                    <div
                      key={clip.id}
                      onClick={() => setActiveClipIndex(idx)}
                      className={`p-3 rounded-[4px] border cursor-pointer transition-all ${
                        isActive
                          ? "bg-[#2C281F] border-[#E8A33D]"
                          : "bg-[#14120D] border-[#2B261D] hover:border-[#8A8274]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                            isActive ? "bg-[#E8A33D] text-[#14120D]" : "bg-[#2B261D] text-[#8A8274]"
                          }`}>
                            0{idx + 1}
                          </span>
                          <span className="text-xs font-medium text-[#F3EFE6] truncate max-w-[140px]">
                            {clip.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveClip(idx, "left");
                            }}
                            disabled={idx === 0}
                            className="p-1 text-[#8A8274] hover:text-[#F3EFE6] disabled:opacity-30"
                            title="Move clip up in sequence"
                          >
                            <MoveLeft size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveClip(idx, "right");
                            }}
                            disabled={idx === clips.length - 1}
                            className="p-1 text-[#8A8274] hover:text-[#F3EFE6] disabled:opacity-30"
                            title="Move clip down in sequence"
                          >
                            <MoveRight size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeClip(idx);
                            }}
                            className="p-1 text-[#C0453B] hover:text-red-400"
                            title="Remove clip"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#8A8274]">
                        <span className="capitalize">{clip.type} Clip</span>
                        <span className="text-[#E8A33D]">{clipDuration.toFixed(1)}s (Trimmed)</span>
                        <span>{clip.speed}x speed</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Demo Clip Button */}
              <div className="pt-2 border-t border-[#2B261D] flex justify-between items-center text-xs">
                <span className="text-[#8A8274]">Need more footage?</span>
                <button
                  onClick={() => {
                    const sample: VideoClip = {
                      id: `clip-${Date.now()}`,
                      name: `0${clips.length + 1}_additional_footage.mp4`,
                      url: "https://videos.pexels.com/video-files/5082565/5082565-hd_1920_1080_30fps.mp4",
                      duration: 12.0,
                      trimStart: 0,
                      trimEnd: 12.0,
                      speed: 1.0,
                      volume: 1.0,
                      muted: false,
                      type: "broll"
                    };
                    setClips((prev) => [...prev, sample]);
                    showToast("Added sample video asset to sequence");
                  }}
                  className="btn-ghost text-xs py-1"
                >
                  <Plus size={12} />
                  <span>Add Sample Clip</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: CROP & TRANSFORM */}
          {activeTab === "crop" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono">Aspect Ratio</span>
                <button onClick={handleResetTransform} className="text-[10px] text-[#E8A33D] hover:underline font-mono">
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "9:16", sub: "Reels/TikTok", id: "9:16" },
                  { label: "16:9", sub: "YouTube", id: "16:9" },
                  { label: "1:1", sub: "Square", id: "1:1" },
                  { label: "4:5", sub: "Portrait", id: "4:5" },
                  { label: "Original", sub: "Raw Source", id: "original" }
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as AspectRatio)}
                    className={`p-2 rounded border text-center transition-colors ${
                      aspectRatio === ar.id
                        ? "border-[#E8A33D] bg-[#E8A33D]/15 text-[#E8A33D]"
                        : "border-[#2B261D] bg-[#14120D] text-[#8A8274] hover:text-[#F3EFE6]"
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{ar.label}</div>
                    <div className="text-[9px] text-[#8A8274] truncate">{ar.sub}</div>
                  </button>
                ))}
              </div>

              {/* Rotate & Flip */}
              <div className="space-y-2 pt-2 border-t border-[#2B261D]">
                <span className="text-xs font-semibold text-[#F3EFE6] block">Orientation & Flip</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setRotation((r) => (r - 90) % 360)}
                    className="p-2 rounded border border-[#2B261D] bg-[#14120D] text-[#A79E8E] hover:text-[#F3EFE6] flex items-center justify-center"
                    title="Rotate -90°"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded border border-[#2B261D] bg-[#14120D] text-[#A79E8E] hover:text-[#F3EFE6] flex items-center justify-center"
                    title="Rotate +90°"
                  >
                    <RotateCw size={15} />
                  </button>
                  <button
                    onClick={() => setFlipH((f) => !f)}
                    className={`p-2 rounded border transition-colors flex items-center justify-center ${
                      flipH ? "border-[#E8A33D] bg-[#E8A33D]/20 text-[#E8A33D]" : "border-[#2B261D] bg-[#14120D] text-[#A79E8E]"
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal size={15} />
                  </button>
                  <button
                    onClick={() => setFlipV((f) => !f)}
                    className={`p-2 rounded border transition-colors flex items-center justify-center ${
                      flipV ? "border-[#E8A33D] bg-[#E8A33D]/20 text-[#E8A33D]" : "border-[#2B261D] bg-[#14120D] text-[#A79E8E]"
                    }`}
                    title="Flip Vertical"
                  >
                    <FlipVertical size={15} />
                  </button>
                </div>
              </div>

              {/* Scale / Zoom Slider */}
              <div className="space-y-2 pt-2 border-t border-[#2B261D]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A79E8E]">Scale / Zoom</span>
                  <span className="font-mono text-[#E8A33D]">{zoom}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#E8A33D]"
                />
              </div>

              {/* Safe Zones Toggle */}
              <div className="pt-2 border-t border-[#2B261D] flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[#F3EFE6]">Safe Zone Guidelines</div>
                  <div className="text-[10px] text-[#8A8274]">TikTok & IG Reels UI boundary overlay</div>
                </div>
                <input
                  type="checkbox"
                  checked={showSafeZones}
                  onChange={(e) => setShowSafeZones(e.target.checked)}
                  className="accent-[#E8A33D] w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB: ADJUST (COLOR & LIGHT) */}
          {activeTab === "adjust" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono">Color Grading</span>
                <button onClick={handleResetAdjustments} className="text-[10px] text-[#E8A33D] hover:underline font-mono">
                  Reset
                </button>
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A79E8E] flex items-center gap-1.5"><Sun size={13} /> Brightness</span>
                  <span className="font-mono text-[#E8A33D]">{brightness - 100}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#E8A33D]"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A79E8E] flex items-center gap-1.5"><Contrast size={13} /> Contrast</span>
                  <span className="font-mono text-[#E8A33D]">{contrast - 100}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="170"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#E8A33D]"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A79E8E]">Saturation</span>
                  <span className="font-mono text-[#E8A33D]">{saturation - 100}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-[#E8A33D]"
                />
              </div>

              {/* Warmth */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A79E8E]">Warmth (Tungsten)</span>
                  <span className="font-mono text-[#E8A33D]">+{warmth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={warmth}
                  onChange={(e) => setWarmth(Number(e.target.value))}
                  className="w-full accent-[#E8A33D]"
                />
              </div>

              {/* Vignette */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A79E8E]">Edge Vignette</span>
                  <span className="font-mono text-[#E8A33D]">{vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={vignette}
                  onChange={(e) => setVignette(Number(e.target.value))}
                  className="w-full accent-[#E8A33D]"
                />
              </div>
            </div>
          )}

          {/* TAB: FILTER PRESETS */}
          {activeTab === "filters" && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono block">
                Aesthetic Film LUTs
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => applyFilter(f)}
                    className={`p-2.5 rounded border text-left transition-all ${
                      selectedFilter === f.id
                        ? "border-[#E8A33D] bg-[#2C281F] text-[#F3EFE6]"
                        : "border-[#2B261D] bg-[#14120D] text-[#8A8274] hover:text-[#F3EFE6]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{f.name}</span>
                      {selectedFilter === f.id && <Check size={12} className="text-[#E8A33D]" />}
                    </div>
                    <div className="text-[9px] text-[#8A8274]">{f.category}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TRIM & SPEED FOR ACTIVE CLIP */}
          {activeTab === "trim" && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono block">
                  Trimming Clip #{activeClipIndex + 1}
                </span>
                <span className="text-[10px] text-[#E8A33D] font-mono">{activeClip.name}</span>
              </div>

              {/* In & Out Points */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A79E8E]">Start In-Point</span>
                    <span className="font-mono text-[#E8A33D]">{formatTimecode(activeClip.trimStart)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={activeClip.trimEnd - 1}
                    value={activeClip.trimStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveClip({ trimStart: val });
                      handleSeek(val);
                    }}
                    className="w-full accent-[#E8A33D]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A79E8E]">End Out-Point</span>
                    <span className="font-mono text-[#E8A33D]">{formatTimecode(activeClip.trimEnd)}</span>
                  </div>
                  <input
                    type="range"
                    min={activeClip.trimStart + 1}
                    max={activeClip.duration}
                    value={activeClip.trimEnd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveClip({ trimEnd: val });
                    }}
                    className="w-full accent-[#E8A33D]"
                  />
                </div>
              </div>

              {/* Playback Speed */}
              <div className="space-y-2 pt-3 border-t border-[#2B261D]">
                <span className="text-xs font-medium text-[#F3EFE6] block">Clip Speed</span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        updateActiveClip({ speed: spd });
                        if (videoRef.current) videoRef.current.playbackRate = spd;
                      }}
                      className={`py-1.5 rounded border transition-colors ${
                        activeClip.speed === spd
                          ? "border-[#E8A33D] bg-[#E8A33D] text-[#14120D] font-bold"
                          : "border-[#2B261D] bg-[#14120D] text-[#A79E8E] hover:text-[#F3EFE6]"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEXT OVERLAY */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono">Text Overlay</span>
                <input
                  type="checkbox"
                  checked={showTextOverlay}
                  onChange={(e) => setShowTextOverlay(e.target.checked)}
                  className="accent-[#E8A33D] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A79E8E]">Headline / Hook Text</label>
                <textarea
                  rows={3}
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="w-full bg-[#14120D] border border-[#2B261D] rounded p-2 text-xs text-[#F3EFE6] focus:border-[#E8A33D] focus:outline-none"
                  placeholder="Enter video hook or subtitle..."
                />
              </div>

              {/* Typography Style */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A79E8E]">Typography Style</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(["bold", "clean", "mono", "cyber"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOverlayStyle(st)}
                      className={`p-2 rounded border uppercase font-mono text-[11px] ${
                        overlayStyle === st
                          ? "border-[#E8A33D] bg-[#E8A33D]/20 text-[#E8A33D]"
                          : "border-[#2B261D] bg-[#14120D] text-[#8A8274]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Position */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A79E8E]">Position</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(["top", "center", "lower"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setOverlayPosition(pos)}
                      className={`py-1.5 rounded border capitalize ${
                        overlayPosition === pos
                          ? "border-[#E8A33D] bg-[#E8A33D] text-[#14120D] font-bold"
                          : "border-[#2B261D] bg-[#14120D] text-[#8A8274]"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F3EFE6] uppercase tracking-wider font-mono">Founder Lower Third</span>
                <input
                  type="checkbox"
                  checked={showBranding}
                  onChange={(e) => setShowBranding(e.target.checked)}
                  className="accent-[#E8A33D] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#A79E8E]">Lower-Third Title</label>
                <input
                  type="text"
                  value={founderRole}
                  onChange={(e) => setFounderRole(e.target.value)}
                  className="w-full h-9 bg-[#14120D] border border-[#2B261D] rounded px-2.5 text-xs text-[#F3EFE6] focus:border-[#E8A33D] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#14120D] border border-[#2B261D] rounded space-y-1.5">
                <div className="text-xs font-medium text-[#E8A33D] flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Verified Founder Badge</span>
                </div>
                <p className="text-[10px] text-[#8A8274] leading-relaxed">
                  Watermarks and attaches manual sign-off provenance metadata to the exported run-of-show file.
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Center Preview Stage */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 bg-[#0E0C09] relative overflow-hidden">
          {/* Aspect Ratio Bounded Frame */}
          <div
            className={`relative rounded border border-[#2B261D] bg-[#000000] overflow-hidden flex items-center justify-center shadow-2xl transition-all ${
              aspectRatio === "9:16"
                ? "w-[280px] h-[497px] sm:w-[310px] sm:h-[550px]"
                : aspectRatio === "16:9"
                ? "w-[540px] h-[304px]"
                : aspectRatio === "1:1"
                ? "w-[360px] h-[360px]"
                : aspectRatio === "4:5"
                ? "w-[320px] h-[400px]"
                : "w-[460px] h-[360px]"
            }`}
          >
            {/* Active Video Player with Transformations */}
            <div
              className="w-full h-full relative flex items-center justify-center overflow-hidden transition-transform duration-100"
              style={{
                transform: computedTransformString,
                filter: computedFilterString
              }}
            >
              <video
                ref={videoRef}
                key={activeClip.url}
                src={activeClip.url}
                muted={activeClip.muted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Vignette Overlay Layer */}
            {vignette > 0 && (
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  boxShadow: `inset 0 0 ${vignette * 1.5}px rgba(0,0,0,${vignette / 90})`
                }}
              />
            )}

            {/* Safe Zones Overlay for 9:16 */}
            {showSafeZones && aspectRatio === "9:16" && (
              <div className="pointer-events-none absolute inset-0 z-20 border border-dashed border-[#E8A33D]/30 flex flex-col justify-between p-3">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#E8A33D]/60">
                  <span>TOP SAFE ZONE</span>
                  <span>9:16 REELS</span>
                </div>
                <div className="self-end text-[9px] font-mono text-[#E8A33D]/60 bg-[#1A1712]/70 px-1.5 py-0.5 rounded">
                  RIGHT UI BUTTONS AREA
                </div>
                <div className="text-[9px] font-mono text-[#E8A33D]/60">
                  BOTTOM CAPTION ZONE
                </div>
              </div>
            )}

            {/* Text Overlay */}
            {showTextOverlay && overlayText && (
              <div
                className={`absolute left-4 right-4 z-30 flex justify-center pointer-events-none ${
                  overlayPosition === "top"
                    ? "top-8"
                    : overlayPosition === "center"
                    ? "top-1/2 -translate-y-1/2"
                    : "bottom-14"
                }`}
              >
                <div
                  className={`text-center max-w-[90%] px-3 py-1.5 rounded ${
                    overlayBg ? "bg-[#14120D]/85 border border-[#3A3427] backdrop-blur-sm" : ""
                  }`}
                >
                  <p
                    className={`leading-tight ${
                      overlayColor === "amber"
                        ? "text-[#E8A33D]"
                        : overlayColor === "cyan"
                        ? "text-[#4EE2EC]"
                        : "text-[#F3EFE6]"
                    } ${
                      overlayStyle === "bold"
                        ? "font-extrabold text-xs sm:text-sm uppercase tracking-tight"
                        : overlayStyle === "mono"
                        ? "font-mono font-bold text-xs"
                        : overlayStyle === "cyber"
                        ? "font-mono font-black text-xs tracking-wider"
                        : "font-medium text-xs"
                    }`}
                  >
                    {overlayText}
                  </p>
                </div>
              </div>
            )}

            {/* Branding Lower Third */}
            {showBranding && (
              <div className="absolute bottom-3 left-3 z-30 pointer-events-none flex items-center gap-1.5 bg-[#14120D]/90 border border-[#2B261D] px-2 py-1 rounded backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse" />
                <span className="font-mono text-[9px] text-[#F3EFE6] font-medium">{founderRole}</span>
              </div>
            )}
          </div>

          {/* Video Transport Controls Bar */}
          <div className="w-full max-w-xl mt-3 bg-[#1C1813] border border-[#2B261D] rounded px-4 py-2 flex items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#E8A33D] text-[#14120D] flex items-center justify-center hover:bg-[#d69330] transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <div className="font-mono text-xs text-[#E8A33D] tabular-nums">
                {formatTimecode(currentTime)} <span className="text-[#8A8274]">/ {formatTimecode(activeClip.duration)}</span>
              </div>
            </div>

            {/* Scrubber */}
            <input
              type="range"
              min="0"
              max={activeClip.duration || 1}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 accent-[#E8A33D] cursor-pointer"
            />

            {/* Volume & Auto Enhance */}
            <div className="flex items-center gap-2 text-[#8A8274]">
              <button
                onClick={() => updateActiveClip({ muted: !activeClip.muted })}
                className="hover:text-[#F3EFE6]"
                title={activeClip.muted ? "Unmute" : "Mute"}
              >
                {activeClip.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={handleAutoEnhance}
                className="btn-ghost text-xs py-1 px-2 text-[#E8A33D]"
                title="AI Auto Enhance"
              >
                <Sparkles size={12} />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Multi-Clip Sequence Timeline Strip */}
      <footer className="bg-[#1C1813] border border-[#2B261D] rounded p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#8A8274] shrink-0">
            <Film size={14} className="text-[#E8A33D]" />
            <span>STITCHED TIMELINE ({clips.length} CLIPS):</span>
          </div>

          <div className="flex items-center gap-2">
            {clips.map((c, idx) => {
              const isActive = idx === activeClipIndex;
              const clipDur = ((c.trimEnd - c.trimStart) / c.speed).toFixed(1);
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveClipIndex(idx)}
                  className={`px-3 py-1.5 rounded border text-xs font-mono cursor-pointer flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? "bg-[#E8A33D] text-[#14120D] font-bold border-[#E8A33D]"
                      : "bg-[#14120D] text-[#8A8274] border-[#2B261D] hover:text-[#F3EFE6]"
                  }`}
                >
                  <span>0{idx + 1}. {c.name.substring(0, 12)}...</span>
                  <span className={`text-[10px] ${isActive ? "text-[#14120D]" : "text-[#E8A33D]"}`}>
                    {clipDur}s
                  </span>
                </div>
              );
            })}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded border border-dashed border-[#3A3427] hover:border-[#E8A33D] text-[#8A8274] hover:text-[#E8A33D] text-xs font-mono flex items-center gap-1 shrink-0"
              title="Attach another video clip"
            >
              <Plus size={12} />
              <span>Attach Clip</span>
            </button>
          </div>
        </div>

        {/* Right Footer Export Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="font-mono text-xs text-[#8A8274]">
            Total Master: <span className="text-[#E8A33D]">{formatTimecode(totalSequenceDuration)}</span>
          </div>
          <button
            onClick={handleSaveToApprovals}
            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Save & Approve ↗</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function CreativeEditorPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#14120D] flex items-center justify-center font-mono text-xs text-[#E8A33D]">Loading Manual Editing Bay...</div>}>
      <CreativeEditorContent />
    </React.Suspense>
  );
}
