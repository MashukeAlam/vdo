import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeExplainerProps } from '../types';
import { Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { createHighlighter, Highlighter } from 'shiki';

let cachedHighlighter: Highlighter | null = null;

export const CodeExplainer: React.FC<CodeExplainerProps & { aspectRatio: '9:16' | '16:9' }> = ({
  code,
  language = 'python',
  filename = 'main.py',
  highlightLines = [],
  lineNotes = [],
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [highlighter, setHighlighter] = useState<Highlighter | null>(cachedHighlighter);
  const [handle] = useState(() => (cachedHighlighter ? null : delayRender('Shiki highlighter loading')));

  useEffect(() => {
    if (cachedHighlighter) return;

    createHighlighter({
      themes: ['github-dark-default'],
      langs: ['python', 'javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'c', 'cpp', 'rust'],
    })
      .then((h) => {
        cachedHighlighter = h;
        setHighlighter(h);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error('Highlighter error:', err);
        if (handle !== null) continueRender(handle);
      });
  }, [handle]);

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.9 },
  });

  const scale = interpolate(entrance, [0, 1], [0.92, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const lines = code.trim().split('\n');

  // Progressive reveal of lines based on frame
  const visibleLineCount = Math.min(
    lines.length,
    Math.floor(interpolate(frame, [0, Math.min(lines.length * 4, 30)], [1, lines.length], {
      extrapolateRight: 'clamp',
    }))
  );

  const isVertical = aspectRatio === '9:16';

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10"
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Code Editor Window */}
      <div
        className={`w-full bg-[#0d1117] rounded-3xl border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col ${
          isVertical ? 'max-w-[940px] w-[94%]' : 'max-w-4xl'
        }`}
      >
        {/* Editor Title Bar */}
        <div className={`bg-[#161b22] px-6 py-4 border-b border-slate-800 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500/90" />
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90" />
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/90" />
          </div>

          <div className={`flex items-center gap-2 text-slate-300 font-mono px-3.5 py-1.5 rounded-lg bg-[#0d1117] border border-slate-800 ${
            isVertical ? 'text-base' : 'text-xs'
          }`}>
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>{filename}</span>
          </div>

          <div className={`font-mono text-slate-400 uppercase tracking-wider ${
            isVertical ? 'text-sm' : 'text-[11px]'
          }`}>
            {language}
          </div>
        </div>

        {/* Code Content Area */}
        <div className={`font-mono leading-relaxed overflow-x-auto ${
          isVertical ? 'p-8 text-xl space-y-1' : 'p-6 text-sm'
        }`}>
          {lines.slice(0, visibleLineCount).map((rawLine, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            const lineNote = lineNotes.find((n) => n.line === lineNum);

            let lineHtml = '';
            if (highlighter) {
              try {
                lineHtml = highlighter.codeToHtml(rawLine, {
                  lang: language,
                  theme: 'github-dark-default',
                });
                // Extract inner pre/code content
                const match = lineHtml.match(/<code>([\s\S]*?)<\/code>/);
                if (match) lineHtml = match[1];
              } catch {
                lineHtml = rawLine;
              }
            }

            return (
              <div
                key={idx}
                className={`relative flex items-center px-3 py-1 rounded-md transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-cyan-500/15 border-l-4 border-cyan-400 font-semibold'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Line number */}
                <span
                  className={`select-none text-right pr-4 font-mono ${
                    isVertical ? 'w-10 text-base' : 'w-8 text-xs'
                  } ${isHighlighted ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}
                >
                  {lineNum}
                </span>

                {/* Line text */}
                <span
                  className={`flex-1 ${isHighlighted ? 'text-cyan-100' : 'text-slate-200'}`}
                  dangerouslySetInnerHTML={{
                    __html: lineHtml || rawLine.replace(/ /g, '&nbsp;'),
                  }}
                />

                {/* Optional Line Note / Tooltip */}
                {lineNote && (
                  <div className={`ml-3 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-sans flex items-center gap-1.5 shadow-md ${
                    isVertical ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-[11px]'
                  }`}>
                    <CheckCircle2 className={`${isVertical ? 'w-4 h-4' : 'w-3 h-3'} text-cyan-400`} />
                    <span>{lineNote.note}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
