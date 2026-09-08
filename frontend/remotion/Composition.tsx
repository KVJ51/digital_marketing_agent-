import React from "react";
import { Audio, Sequence } from "remotion";
import { Scene } from "./Scene";
import { Subtitles } from "./Subtitles";

interface StoryboardScene {
  scene_index: number;
  visual_url: string;
  text_overlay: string;
  duration: number;
}

interface SubtitleWord {
  text: string;
  start: number;
  end: number;
}

interface CompositionProps {
  storyboard: StoryboardScene[];
  voiceover_url: string;
  subtitles: SubtitleWord[];
  duration: number;
}

export const MainVideoComposition: React.FC<CompositionProps> = ({
  storyboard = [],
  voiceover_url = "",
  subtitles = [],
}) => {
  let currentStartFrame = 0;
  const fps = 30;

  return (
    <div style={{ flex: 1, backgroundColor: "#0f172a", position: "relative" }}>
      {/* Background Audio Voiceover */}
      {voiceover_url && <Audio src={voiceover_url} />}

      {/* Render Scenes in sequence */}
      {storyboard.map((scene, index) => {
        const sceneDurationFrames = Math.round((scene.duration || 5) * fps);
        const sequenceStart = currentStartFrame;
        currentStartFrame += sceneDurationFrames;

        return (
          <Sequence
            key={index}
            from={sequenceStart}
            durationInFrames={sceneDurationFrames}
          >
            <Scene
              visualUrl={scene.visual_url}
              textOverlay={scene.text_overlay}
              duration={scene.duration}
            />
          </Sequence>
        );
      })}

      {/* Subtitles active word highlighting layer */}
      {subtitles.length > 0 && <Subtitles subtitles={subtitles} />}
    </div>
  );
};
