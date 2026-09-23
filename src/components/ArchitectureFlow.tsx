import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArchitectureFlowProps } from '../types';
import { ArrowDown, ArrowRight, CheckCircle2, CircleDot } from 'lucide-react';

export const ArchitectureFlow: React.FC<
  ArchitectureFlowProps & { aspectRatio: '9:16' | '16:9' }
> = ({ title, steps, activeStepIndex = 0, aspectRatio }) => {
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
        className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-400 mb-8 text-center drop-shadow-md ${
          isVertical ? 'text-4xl max-w-xl' : 'text-4xl'
        }`}
      >
        {title}
      </h2>

      {/* Steps Flow Container */}
      <div
        className={`flex items-center justify-center gap-3.5 w-full ${
          isVertical ? 'flex-col max-w-[940px] w-[94%]' : 'flex-row max-w-5xl'
        }`}
      >
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const isDone = idx < activeStepIndex;
          const isPending = idx > activeStepIndex;

          return (
            <React.Fragment key={idx}>
              {/* Step Card */}
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 text-center ${
                  isVertical ? 'w-full py-5 px-6' : 'flex-1 min-w-[140px] h-32 p-4'
                } ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-900/60 to-slate-900/90 border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.4)] scale-105'
                    : isDone
                    ? 'bg-slate-900/80 border-cyan-700/50 opacity-90'
                    : 'bg-slate-900/40 border-slate-800 opacity-40'
                }`}
              >
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-2">
                  {isDone ? (
                    <CheckCircle2 className={`${isVertical ? 'w-5 h-5' : 'w-4 h-4'} text-emerald-400`} />
                  ) : isActive ? (
                    <CircleDot className={`${isVertical ? 'w-5 h-5' : 'w-4 h-4'} text-cyan-400 animate-spin`} />
                  ) : (
                    <span className={`${isVertical ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-[10px]'} rounded-full border border-slate-600 flex items-center justify-center text-slate-500 font-mono`}>
                      {idx + 1}
                    </span>
                  )}
                  <span
                    className={`font-mono uppercase tracking-wider ${isVertical ? 'text-sm' : 'text-xs'} ${
                      isActive ? 'text-cyan-300 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    Step {idx + 1}
                  </span>
                </div>

                {/* Step Title */}
                <h3
                  className={`font-bold leading-tight ${
                    isVertical ? 'text-2xl' : 'text-base'
                  } ${isActive ? 'text-white' : 'text-slate-300'}`}
                >
                  {step.title}
                </h3>

                {/* Step Description */}
                {step.desc && (
                  <p className={`text-slate-400 mt-1.5 ${isVertical ? 'text-base' : 'text-xs'}`}>{step.desc}</p>
                )}
              </div>

              {/* Connector Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center text-slate-500">
                  {isVertical ? (
                    <ArrowDown className={`w-5 h-5 ${isDone ? 'text-cyan-400' : 'text-slate-600'}`} />
                  ) : (
                    <ArrowRight className={`w-5 h-5 ${isDone ? 'text-cyan-400' : 'text-slate-600'}`} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
