import React from 'react';
import { useCurrentFrame } from 'remotion';
import { WordTimestamp } from '../types';

interface SubtitleOverlayProps {
  words?: WordTimestamp[];
  aspectRatio: '9:16' | '16:9';
  narrationFallback?: string;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  words,
  aspectRatio,
  narrationFallback,
}) => {
  const frame = useCurrentFrame();
  const currentSec = frame / 30;

  if (!words || words.length === 0) {
    if (!narrationFallback) return null;
    return (
      <div
        className={`absolute w-full px-8 flex justify-center text-center pointer-events-none z-30 ${
          aspectRatio === '9:16' ? 'bottom-28' : 'bottom-12'
        }`}
      >
        <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700/60 shadow-2xl">
          <p className="text-white text-xl md:text-2xl font-semibold tracking-wide">
            {narrationFallback}
          </p>
        </div>
      </div>
    );
  }

  // Find active word index
  let activeIndex = -1;
  for (let i = 0; i < words.length; i++) {
    if (currentSec >= words[i].start && currentSec <= words[i].end + 0.1) {
      activeIndex = i;
      break;
    }
  }

  // Group into chunks of 5-7 words for high readability (especially on vertical screens)
  const chunkSize = aspectRatio === '9:16' ? 5 : 8;
  const chunkIndex = activeIndex >= 0 ? Math.floor(activeIndex / chunkSize) : 0;
  const currentChunk = words.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);

  return (
    <div
      className={`absolute w-full px-6 flex justify-center text-center pointer-events-none z-30 ${
        aspectRatio === '9:16' ? 'bottom-28' : 'bottom-10'
      }`}
    >
      <div className="bg-slate-950/85 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-center gap-2 max-w-[90%]">
        {currentChunk.map((w, idx) => {
          const globalIdx = chunkIndex * chunkSize + idx;
          const isActive = globalIdx === activeIndex;
          const isPast = globalIdx < activeIndex;

          return (
            <span
              key={globalIdx}
              className={`transition-all duration-75 px-1.5 py-0.5 rounded font-bold ${
                aspectRatio === '9:16' ? 'text-2xl' : 'text-xl'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 scale-110 shadow-lg shadow-yellow-500/40'
                  : isPast
                  ? 'text-cyan-200'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
