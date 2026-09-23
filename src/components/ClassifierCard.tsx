import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChalkTitle } from './ChalkTitle';

export interface ProbabilityBarItem {
  label: string;
  value: number; // 0.0 to 1.0 (e.g. 0.88)
  color?: string;
}

export interface TicketCardData {
  avatarText?: string;
  authorName: string;
  badge?: string;
  message: string;
}

export interface ModelEntity {
  name: string;
  iconType?: 'cube' | 'tree' | 'network' | 'doc';
  accentColor?: string;
  bars: ProbabilityBarItem[];
}

export interface ClassifierCardProps {
  title?: string;
  badge?: string;
  highlightWord?: string;
  underlineColor?: string;
  mode?: 'ticket-flow' | 'comparison';
  ticket?: TicketCardData;
  modelName?: string;
  metricCategory?: string;
  bars?: ProbabilityBarItem[];
  // For comparison mode
  leftModel?: ModelEntity;
  rightModel?: ModelEntity;
  aspectRatio: '9:16' | '16:9';
}

export const ClassifierCard: React.FC<ClassifierCardProps> = ({
  title,
  badge,
  highlightWord,
  underlineColor = '#ec4899',
  mode = 'ticket-flow',
  ticket,
  modelName = 'Jev',
  metricCategory = 'FRUSTRATED?',
  bars = [
    { label: 'YES', value: 0.88, color: '#f43f5e' },
    { label: 'NO', value: 0.12, color: '#94a3b8' },
  ],
  leftModel,
  rightModel,
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

  const renderProgressBar = (
    item: ProbabilityBarItem,
    index: number,
    baseDelay: number = 10
  ) => {
    const barProgress = spring({
      frame: frame - (baseDelay + index * 4),
      fps,
      config: { damping: 15, mass: 0.9 },
    });

    const fillWidth = interpolate(barProgress, [0, 1], [0, item.value * 100]);
    const displayValue = (item.value * interpolate(barProgress, [0, 1], [0, 1])).toFixed(2);

    return (
      <div key={index} className="flex items-center gap-3 w-full my-1.5 font-mono">
        <span className="w-20 text-xs md:text-sm font-bold uppercase text-slate-300 text-right tracking-wider">
          {item.label}
        </span>
        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(fillWidth, 100)}%`,
              backgroundColor: item.color || '#e2e8f0',
            }}
          />
        </div>
        <span className="w-12 text-xs md:text-sm text-slate-300 font-bold">
          {displayValue}
        </span>
      </div>
    );
  };

  const renderModelIcon = (
    name: string,
    type: string = 'cube',
    accentColor: string = '#ec4899'
  ) => {
    return (
      <div className="flex items-center gap-3 bg-[#161224] border border-slate-800 px-6 py-2.5 rounded-2xl shadow-lg">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          {type === 'tree' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="12" cy="4" r="2" />
              <circle cx="6" cy="14" r="2" />
              <circle cx="18" cy="14" r="2" />
              <line x1="12" y1="6" x2="6" y2="12" />
              <line x1="12" y1="6" x2="18" y2="12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          )}
        </div>
        <span className="font-marker text-2xl text-white tracking-wider uppercase">
          {name}
        </span>
      </div>
    );
  };

  const renderDashedArrow = () => (
    <div className="flex flex-col items-center my-1 select-none">
      <div className="w-0.5 h-6 border-l-2 border-dashed border-slate-600" />
      <span className="text-slate-500 text-xs font-mono">▼</span>
    </div>
  );

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6 relative z-10"
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

      {/* Mode A: Ticket to Classification Pipeline */}
      {mode === 'ticket-flow' ? (
        <div className="w-full max-w-[800px] flex flex-col items-center">
          {/* Top User Ticket Box */}
          {ticket && (
            <div className="w-full bg-[#121622] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center font-mono text-sm">
                  {ticket.avatarText || 'EW'}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200 text-sm">
                    {ticket.authorName}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {ticket.badge || 'Pro plan · new ticket'}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 font-sans text-base md:text-lg mt-1 italic pl-1 leading-snug">
                "{ticket.message}"
              </p>
            </div>
          )}

          {/* Animated Connector Arrow */}
          {renderDashedArrow()}

          {/* Central Model Box (e.g. Jev) */}
          {renderModelIcon(modelName, 'cube', '#ec4899')}

          {/* Animated Connector Arrow */}
          {renderDashedArrow()}

          {/* Classification Probability Sliders */}
          <div className="w-full bg-[#121622] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
            {metricCategory && (
              <div className="font-marker text-xl text-pink-400 uppercase tracking-widest mb-3 self-start pl-2">
                {metricCategory}
              </div>
            )}
            <div className="w-full flex flex-col gap-1">
              {bars.map((bar, i) => renderProgressBar(bar, i, 12))}
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: Side-by-side Model Comparison (e.g. Random Forest vs Jev) */
        <div className="w-full max-w-[940px] grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Left Model */}
          {leftModel && (
            <div className="bg-[#121622] border border-slate-800 rounded-2xl p-5 flex flex-col items-center shadow-lg">
              {renderModelIcon(
                leftModel.name,
                leftModel.iconType || 'tree',
                leftModel.accentColor || '#8b5cf6'
              )}
              <div className="w-full mt-6 flex flex-col gap-2">
                {leftModel.bars.map((b, i) => renderProgressBar(b, i, 8))}
              </div>
            </div>
          )}

          {/* Right Model */}
          {rightModel && (
            <div className="bg-[#121622] border border-pink-500/30 rounded-2xl p-5 flex flex-col items-center shadow-lg shadow-pink-950/20">
              {renderModelIcon(
                rightModel.name,
                rightModel.iconType || 'cube',
                rightModel.accentColor || '#ec4899'
              )}
              <div className="w-full mt-6 flex flex-col gap-2">
                {rightModel.bars.map((b, i) => renderProgressBar(b, i, 12))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
