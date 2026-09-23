import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { StickFigure } from './StickFigure';
import { ChalkTitle } from './ChalkTitle';

export interface TerminalLine {
  lineNum?: number | string;
  text: string;
  type?: 'command' | 'normal' | 'add' | 'remove' | 'drift' | 'comment';
}

export interface TerminalPane {
  title: string;
  command?: string;
  lines: TerminalLine[];
  caption?: string;
  stickFigure?: {
    pose?: 'laptop-night' | 'standing' | 'confused' | 'pointing';
    label?: string;
  };
}

export interface ClusterStatus {
  title?: string;
  badge?: string;
  nodes?: {
    name: string;
    pods: { id: string; color: string }[];
  }[];
}

export interface TerminalSplitProps {
  title?: string;
  badge?: string;
  highlightWord?: string;
  underlineColor?: string;
  cluster?: ClusterStatus;
  leftPane: TerminalPane;
  rightPane?: TerminalPane;
  bottomText?: string;
  bottomSubtext?: string;
  aspectRatio: '9:16' | '16:9';
}

export const TerminalSplit: React.FC<TerminalSplitProps> = ({
  title,
  badge,
  highlightWord,
  underlineColor = '#f43f5e',
  cluster,
  leftPane,
  rightPane,
  bottomText,
  bottomSubtext,
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVertical = aspectRatio === '9:16';

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const renderTerminalWindow = (pane: TerminalPane, paneIndex: number) => {
    const paneSpring = spring({
      frame: frame - paneIndex * 6,
      fps,
      config: { damping: 13 },
    });

    const translateY = interpolate(paneSpring, [0, 1], [30, 0]);
    const opacity = interpolate(paneSpring, [0, 1], [0, 1]);

    return (
      <div
        className="flex-1 flex flex-col bg-[#12161f] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl"
        style={{ transform: `translateY(${translateY}px)`, opacity }}
      >
        {/* Terminal Header Bar */}
        <div className="bg-[#1a202c] px-4 py-2.5 flex items-center gap-2 border-b border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/90" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
            <div className="w-3 h-3 rounded-full bg-green-500/90" />
          </div>
          <span className="font-mono text-xs md:text-sm text-slate-300 ml-2 font-medium tracking-tight">
            {pane.title}
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-4 font-mono text-xs md:text-sm flex flex-col gap-1.5 flex-1 bg-[#0b0e14]">
          {pane.command && (
            <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
              <span className="text-pink-500">$</span> {pane.command}
            </div>
          )}

          {pane.lines.map((line, idx) => {
            const isDrift = line.type === 'drift';
            const isAdd = line.type === 'add';
            const isRemove = line.type === 'remove';
            const isComment = line.type === 'comment';

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                  isDrift
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : isAdd
                    ? 'bg-emerald-950/50 text-emerald-300'
                    : isRemove
                    ? 'bg-red-950/40 text-red-400'
                    : isComment
                    ? 'text-slate-500 italic'
                    : 'text-slate-200'
                }`}
              >
                {line.lineNum && (
                  <span className="text-slate-600 select-none w-5 text-right font-mono text-xs">
                    {line.lineNum}
                  </span>
                )}
                <span className="flex-1 whitespace-pre-wrap">{line.text}</span>
              </div>
            );
          })}
        </div>

        {pane.caption && (
          <div className="px-3 py-1.5 bg-[#1a202c]/50 text-right font-handwriting text-base text-amber-300">
            {pane.caption}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-between p-6 relative z-10"
      style={{ opacity: interpolate(entrance, [0, 1], [0, 1]) }}
    >
      {/* 1. Chalk Title */}
      {title && (
        <ChalkTitle
          badge={badge}
          title={title}
          highlightWord={highlightWord}
          underlineColor={underlineColor}
        />
      )}

      {/* 2. Optional Cluster Status Header Box (Node 1, 2, 3) */}
      {cluster && (
        <div className="w-full max-w-[940px] bg-[#1a1424] border border-pink-500/40 rounded-2xl p-3 mb-4 shadow-lg flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {cluster.title || 'PROD CLUSTER'}
            </span>
            {cluster.badge && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-xs px-2 py-0.5 rounded font-bold">
                {cluster.badge}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {cluster.nodes?.map((node, i) => (
              <div
                key={i}
                className="bg-[#12161f] border border-slate-700/60 rounded-xl p-2 flex flex-col items-center"
              >
                <span className="text-slate-400 font-mono text-xs mb-1.5 font-medium">
                  {node.name}
                </span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {node.pods.map((pod, pIdx) => (
                    <div
                      key={pIdx}
                      className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow"
                      style={{ backgroundColor: pod.color, color: '#fff' }}
                    >
                      {pod.id}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Stick Figures Row (Optional) */}
      {(leftPane.stickFigure || rightPane?.stickFigure) && (
        <div className="w-full max-w-[940px] flex justify-around items-center px-4 mb-2">
          {leftPane.stickFigure ? (
            <StickFigure
              pose={leftPane.stickFigure.pose}
              label={leftPane.stickFigure.label}
              scale={0.9}
            />
          ) : (
            <div className="w-20" />
          )}

          {rightPane?.stickFigure ? (
            <StickFigure
              pose={rightPane.stickFigure.pose}
              label={rightPane.stickFigure.label}
              scale={0.9}
            />
          ) : (
            <div className="w-20" />
          )}
        </div>
      )}

      {/* 4. Terminal Panes Container */}
      <div
        className={`w-full max-w-[940px] flex gap-4 my-auto ${
          isVertical ? 'flex-col' : 'flex-row'
        }`}
      >
        {renderTerminalWindow(leftPane, 0)}
        {rightPane && renderTerminalWindow(rightPane, 1)}
      </div>

      {/* 5. Bottom Chalk Commentary */}
      {bottomText && (
        <div className="mt-4 text-center select-none">
          <div className="font-marker text-2xl md:text-3xl text-amber-300 uppercase tracking-wide drop-shadow">
            {bottomText}
          </div>
          {bottomSubtext && (
            <div className="font-handwriting text-xl md:text-2xl text-rose-400 italic mt-1 font-semibold">
              {bottomSubtext}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
