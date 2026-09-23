import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface ChalkTitleProps {
  badge?: string;
  title: string;
  highlightWord?: string;
  highlightColor?: string; // e.g. '#2dd4bf' (cyan) or '#f59e0b' (amber) or '#f43f5e' (coral)
  subtitle?: string;
  underlineColor?: string;
}

export const ChalkTitle: React.FC<ChalkTitleProps> = ({
  badge,
  title,
  highlightWord,
  highlightColor = '#2dd4bf',
  subtitle,
  underlineColor = '#2dd4bf',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.7 },
  });

  const underlineProgress = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15 },
  });

  const scale = interpolate(entrance, [0, 1], [0.9, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // If a specific word should be highlighted in chalk color
  const renderTitle = () => {
    if (!highlightWord) {
      return <span>{title}</span>;
    }
    const parts = title.split(new RegExp(`(${highlightWord})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={i} style={{ color: highlightColor }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div
      className="flex flex-col items-center text-center select-none mb-6 relative z-10"
      style={{ transform: `scale(${scale})`, opacity }}
    >
      {badge && (
        <div className="font-handwriting text-2xl md:text-3xl text-slate-400 font-bold mb-1 tracking-wider">
          {badge}
        </div>
      )}

      {/* Main Chalk Title */}
      <h1 className="font-marker text-4xl md:text-6xl text-white tracking-wide uppercase px-4 leading-tight drop-shadow-lg">
        {renderTitle()}
      </h1>

      {/* Hand-drawn Chalk Underline SVG */}
      <div className="w-64 md:w-80 h-4 mt-1 overflow-hidden">
        <svg
          viewBox="0 0 300 20"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M 5 12 Q 75 4, 150 11 T 295 8"
            fill="none"
            stroke={underlineColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="300"
            strokeDashoffset={interpolate(underlineProgress, [0, 1], [300, 0])}
          />
        </svg>
      </div>

      {subtitle && (
        <div className="font-handwriting text-2xl md:text-3xl text-slate-300 italic mt-3 font-semibold">
          {subtitle}
        </div>
      )}
    </div>
  );
};
