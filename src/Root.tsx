import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import defaultProject from './defaultProject.json';
import { ProjectData } from './types';
import './styles/global.css';

export const RemotionRoot: React.FC = () => {
  const landscapeProject = { ...defaultProject, aspectRatio: '16:9' } as ProjectData;
  const shortsProject = { ...defaultProject, aspectRatio: '9:16' } as ProjectData;

  const totalLandscapeFrames = landscapeProject.scenes.reduce(
    (acc, s) => acc + (s.durationInFrames || 90),
    0
  );

  const totalShortsFrames = shortsProject.scenes.reduce(
    (acc, s) => acc + (s.durationInFrames || 90),
    0
  );

  return (
    <>
      {/* 16:9 Landscape Composition */}
      <Composition
        id="Landscape"
        component={VideoComposition}
        durationInFrames={totalLandscapeFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          project: landscapeProject,
        }}
      />

      {/* 9:16 Shorts / Reels / TikTok Composition */}
      <Composition
        id="Shorts"
        component={VideoComposition}
        durationInFrames={totalShortsFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          project: shortsProject,
        }}
      />
    </>
  );
};
