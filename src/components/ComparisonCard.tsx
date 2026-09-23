import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ComparisonCardProps } from '../types';
import { Check, X, Zap } from 'lucide-react';

export const ComparisonCard: React.FC<
  ComparisonCardProps & { aspectRatio: '9:16' | '16:9' }
> = ({ title, leftTitle, leftPoints, rightTitle, rightPoints, aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.9 },
  });

  const isVertical = aspectRatio === '9:16';

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10"
      style={{
        transform: `scale(${interpolate(entrance, [0, 1], [0.92, 1])})`,
        opacity: interpolate(entrance, [0, 1], [0, 1]),
      }}
    >
      {/* Title */}
      <h2
        className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-400 mb-8 text-center drop-shadow-md ${
          isVertical ? 'text-4xl max-w-xl' : 'text-4xl'
        }`}
      >
        {title}
      </h2>

      {/* Columns Container */}
      <div
        className={`flex gap-5 w-full ${
          isVertical ? 'flex-col max-w-[940px] w-[94%]' : 'flex-row max-w-4xl'
        }`}
      >
        {/* Left Column */}
        <div className={`flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl flex flex-col ${
          isVertical ? 'p-6' : 'p-6'
        }`}>
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-800">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <h3 className={`font-bold text-slate-200 ${isVertical ? 'text-2xl' : 'text-xl'}`}>{leftTitle}</h3>
          </div>
          <ul className="space-y-2.5">
            {leftPoints.map((point, idx) => (
              <li key={idx} className={`flex items-start gap-3 text-slate-300 ${isVertical ? 'text-lg' : 'text-sm'}`}>
                <span className="mt-2 w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column (Highlighted) */}
        <div className={`flex-1 bg-gradient-to-b from-cyan-950/60 to-slate-900/90 border border-cyan-400/50 rounded-3xl shadow-[0_0_40px_rgba(56,189,248,0.25)] flex flex-col ${
          isVertical ? 'p-6' : 'p-6'
        }`}>
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-cyan-900/60">
            <Zap className="w-6 h-6 text-cyan-400" />
            <h3 className={`font-bold text-cyan-200 ${isVertical ? 'text-2xl' : 'text-xl'}`}>{rightTitle}</h3>
          </div>
          <ul className="space-y-2.5">
            {rightPoints.map((point, idx) => (
              <li key={idx} className={`flex items-start gap-3 text-cyan-100 font-medium ${isVertical ? 'text-lg' : 'text-sm'}`}>
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
