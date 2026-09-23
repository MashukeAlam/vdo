import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { OutroCardProps } from '../types';
import { ThumbsUp, Bell, Sparkles, Heart, Share2 } from 'lucide-react';

export const OutroCard: React.FC<
  OutroCardProps & { aspectRatio: '9:16' | '16:9' }
> = ({
  title = 'Thanks for Watching!',
  subtitle = 'Drop a like & subscribe for more tech deep dives',
  twitterHandle = '@mashukjim',
  youtubePrompt = 'Like & Subscribe',
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const isVertical = aspectRatio === '9:16';

  const scale = interpolate(entrance, [0, 1], [0.88, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Pulsing glow effect
  const pulse = Math.sin(frame / 6) * 0.15 + 0.85;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10 text-center"
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-400/40 text-red-300 font-mono text-sm tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
        <span>SUPPORT THE CREATOR</span>
      </div>

      {/* Main Title */}
      <h1
        className={`font-black tracking-tight leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-red-400 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] ${
          isVertical ? 'text-5xl px-2' : 'text-6xl'
        }`}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`text-slate-300 font-medium max-w-2xl mt-4 mb-8 leading-relaxed ${
            isVertical ? 'text-xl px-4' : 'text-2xl'
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Action Cards Container */}
      <div
        className={`flex flex-col gap-4 w-full ${
          isVertical ? 'max-w-[940px] w-[94%]' : 'max-w-2xl'
        }`}
      >
        {/* YouTube Subscribe Card */}
        <div
          className={`bg-gradient-to-r from-red-950/70 via-slate-900/90 to-red-950/70 border border-red-500/40 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.25)] transition-all ${
            isVertical ? 'p-6' : 'p-5'
          }`}
          style={{ transform: `scale(${pulse})` }}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50">
              <ThumbsUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-2xl tracking-tight">
                {youtubePrompt}
              </div>
              <div className="text-red-300 text-sm font-medium">
                Tap the Like button & turn on notifications
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-wider shadow-md">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Subscribe</span>
          </div>
        </div>

        {/* Twitter / X Follow Card */}
        <div
          className={`bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-cyan-950/70 border border-cyan-500/40 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.2)] ${
            isVertical ? 'p-6' : 'p-5'
          }`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-600/50">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-2xl tracking-tight">
                Follow on Twitter / X
              </div>
              <div className="text-cyan-300 font-mono text-base font-semibold">
                {twitterHandle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4 text-cyan-400" />
            <span>Follow</span>
          </div>
        </div>
      </div>
    </div>
  );
};
