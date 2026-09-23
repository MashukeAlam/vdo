import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SummaryListProps } from '../types';
import { CheckCircle2, BookmarkCheck } from 'lucide-react';

export const SummaryList: React.FC<
  SummaryListProps & { aspectRatio: '9:16' | '16:9' }
> = ({ title, items, aspectRatio }) => {
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
      <div className="flex items-center gap-3 mb-8">
        <div className={`rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 ${
          isVertical ? 'p-3' : 'p-2'
        }`}>
          <BookmarkCheck className={`${isVertical ? 'w-8 h-8' : 'w-6 h-6'}`} />
        </div>
        <h2
          className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-400 drop-shadow-md ${
            isVertical ? 'text-4xl max-w-xl' : 'text-4xl'
          }`}
        >
          {title}
        </h2>
      </div>

      {/* Items Container */}
      <div
        className={`w-full flex flex-col gap-4 ${
          isVertical ? 'max-w-[940px] w-[94%]' : 'max-w-2xl'
        }`}
      >
        {items.map((item, idx) => {
          // Stagger each item entrance
          const itemSpring = spring({
            frame: frame - idx * 8,
            fps,
            config: { damping: 12 },
          });

          const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
          const itemTranslateX = interpolate(itemSpring, [0, 1], [-20, 0]);

          return (
            <div
              key={idx}
              className={`bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl flex items-center shadow-lg ${
                isVertical ? 'p-6 gap-5' : 'p-4 gap-4'
              }`}
              style={{
                opacity: itemOpacity,
                transform: `translateX(${itemTranslateX}px)`,
              }}
            >
              <div className={`rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 ${
                isVertical ? 'w-10 h-10' : 'w-8 h-8'
              }`}>
                <CheckCircle2 className={`${isVertical ? 'w-6 h-6' : 'w-5 h-5'}`} />
              </div>
              <p
                className={`text-slate-200 font-medium leading-snug ${
                  isVertical ? 'text-xl' : 'text-lg'
                }`}
              >
                {item}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
