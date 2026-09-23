import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MathVisualizerProps } from '../types';
import katex from 'katex';
import { Variable } from 'lucide-react';

export const MathVisualizer: React.FC<
  MathVisualizerProps & { aspectRatio: '9:16' | '16:9' }
> = ({ title, formula, explanation, variables = [], aspectRatio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.9 },
  });

  const isVertical = aspectRatio === '9:16';

  let formulaHtml = '';
  try {
    formulaHtml = katex.renderToString(formula, {
      displayMode: true,
      throwOnError: false,
    });
  } catch (err) {
    formulaHtml = formula;
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8 relative z-10"
      style={{
        transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
        opacity: interpolate(entrance, [0, 1], [0, 1]),
      }}
    >
      {/* Title */}
      {title && (
        <h2
          className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-400 mb-6 text-center drop-shadow-md ${
            isVertical ? 'text-3xl max-w-sm' : 'text-4xl'
          }`}
        >
          {title}
        </h2>
      )}

      {/* Formula Glass Card */}
      <div
        className={`w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(56,189,248,0.25)] flex flex-col items-center justify-center mb-6 text-center ${
          isVertical ? 'max-w-md py-8' : 'max-w-3xl py-10'
        }`}
      >
        <div
          className={`text-cyan-200 overflow-x-auto max-w-full font-serif ${
            isVertical ? 'text-2xl' : 'text-4xl'
          }`}
          dangerouslySetInnerHTML={{ __html: formulaHtml }}
        />

        {explanation && (
          <p className="text-slate-300 text-sm md:text-base mt-4 max-w-xl font-sans">
            {explanation}
          </p>
        )}
      </div>

      {/* Variables Breakdown */}
      {variables && variables.length > 0 && (
        <div
          className={`grid gap-3 w-full ${
            isVertical ? 'grid-cols-1 max-w-md' : 'grid-cols-3 max-w-3xl'
          }`}
        >
          {variables.map((item, idx) => {
            let symbolHtml = item.symbol;
            try {
              symbolHtml = katex.renderToString(item.symbol, {
                displayMode: false,
                throwOnError: false,
              });
            } catch {
              symbolHtml = item.symbol;
            }

            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3 shadow-sm"
              >
                <div
                  className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold font-serif text-lg shrink-0"
                  dangerouslySetInnerHTML={{ __html: symbolHtml }}
                />
                <div className="text-left leading-tight">
                  <div className="text-xs text-slate-400 font-sans">{item.meaning}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
