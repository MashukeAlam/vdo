import React from 'react';
import { Audio, Series, staticFile } from 'remotion';
import { ProjectData, SceneData } from './types';
import { Background } from './components/Background';
import { TitleCard } from './components/TitleCard';
import { CodeExplainer } from './components/CodeExplainer';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { MathVisualizer } from './components/MathVisualizer';
import { ComparisonCard } from './components/ComparisonCard';
import { SummaryList } from './components/SummaryList';
import { SubtitleOverlay } from './components/SubtitleOverlay';

export const VideoComposition: React.FC<{ project: ProjectData }> = ({ project }) => {
  const { scenes, aspectRatio } = project;

  const renderSceneContent = (scene: SceneData) => {
    switch (scene.type) {
      case 'TitleCard':
        return <TitleCard {...(scene.props as any)} aspectRatio={aspectRatio} />;
      case 'CodeExplainer':
        return <CodeExplainer {...(scene.props as any)} aspectRatio={aspectRatio} />;
      case 'ArchitectureFlow':
        return <ArchitectureFlow {...(scene.props as any)} aspectRatio={aspectRatio} />;
      case 'MathVisualizer':
        return <MathVisualizer {...(scene.props as any)} aspectRatio={aspectRatio} />;
      case 'ComparisonCard':
        return <ComparisonCard {...(scene.props as any)} aspectRatio={aspectRatio} />;
      case 'SummaryList':
        return <SummaryList {...(scene.props as any)} aspectRatio={aspectRatio} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#090d16] font-sans select-none">
      {/* Dynamic Background */}
      <Background aspectRatio={aspectRatio} />

      {/* Sequential Scenes */}
      <Series>
        {scenes.map((scene) => {
          const duration = scene.durationInFrames || 90;

          return (
            <Series.Sequence key={scene.id} durationInFrames={duration}>
              {/* Scene Visual */}
              <div className="w-full h-full relative z-10">
                {renderSceneContent(scene)}
              </div>

              {/* Subtitles Overlay */}
              <SubtitleOverlay
                words={scene.words}
                aspectRatio={aspectRatio}
                narrationFallback={scene.narration}
              />

              {/* Scene Voiceover Audio */}
              {scene.audioFile && (
                <Audio src={staticFile(scene.audioFile)} />
              )}
            </Series.Sequence>
          );
        })}
      </Series>
    </div>
  );
};
