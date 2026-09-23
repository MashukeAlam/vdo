import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TitleCardProps } from '../types';
import { Sparkles, Terminal } from 'lucide-react';

export const TitleCard: React.FC<TitleCardProps & { aspectRatio: '9:16' | '16:9' }> = ({
  title,
  subtitle,
  badge = 'AI & ENGINEERING',
  tags = [],
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10 text-center"
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 font-mono text-sm tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>{badge}</span>
      </div>

      {/* Main Title */}
      <h1
        className={`font-black tracking-tight leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] ${
          aspectRatio === '9:16' ? 'text-5xl md:text-6xl px-2' : 'text-6xl md:text-7xl'
        }`}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`text-slate-300 font-medium max-w-2xl mt-6 leading-relaxed ${
            aspectRatio === '9:16' ? 'text-xl' : 'text-2xl'
          }`}
        >
          {subtitle}
        </p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 max-w-xl">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-cyan-300 font-mono text-xs tracking-wide"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
