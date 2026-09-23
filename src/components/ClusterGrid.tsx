import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChalkTitle } from './ChalkTitle';
import { StickFigure } from './StickFigure';

export interface NodeItem {
  id: string;
  label?: string;
  status?: 'healthy' | 'upgrading' | 'offline';
}

export interface ClusterGridProps {
  title?: string;
  badge?: string;
  highlightWord?: string;
  underlineColor?: string;
  mode?: 'hex-grid' | 'layers';
  // Hex Grid options
  clusterName?: string;
  nodeCount?: number; // e.g. 40
  activeNodeIndex?: number;
  stickFigureCaption?: string;
  // Layer Mode options
  controlPlane?: {
    title?: string;
    subtitle?: string;
    components: { name: string; iconLabel: string }[];
  };
  workerNodes?: {
    title?: string;
    subtitle?: string;
    racks: { rackName: string; pods: { name: string; color: string }[] }[];
  };
  aspectRatio: '9:16' | '16:9';
}

export const ClusterGrid: React.FC<ClusterGridProps> = ({
  title = 'THE INTERVIEW QUESTION',
  badge,
  highlightWord,
  underlineColor = '#f59e0b',
  mode = 'hex-grid',
  clusterName = 'KUBERNETES CLUSTER',
  nodeCount = 40,
  activeNodeIndex = 12,
  stickFigureCaption = 'UPGRADE ALL 40 NODES',
  controlPlane,
  workerNodes,
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const renderK8sHexagon = (index: number) => {
    const isUpgrading = index === activeNodeIndex;
    const isDone = index < activeNodeIndex;
    
    // Wave animation across nodes
    const nodeSpring = spring({
      frame: frame - (index % 8) * 2,
      fps,
      config: { damping: 12 },
    });

    const scale = interpolate(nodeSpring, [0, 1], [0.8, 1]);

    const fillColor = isUpgrading
      ? '#f59e0b'
      : isDone
      ? '#10b981'
      : '#2563eb';

    return (
      <div
        key={index}
        className="relative flex items-center justify-center m-1 select-none transition-all"
        style={{ transform: `scale(${scale})` }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          {/* Hexagon shape */}
          <polygon
            points="17,2 31,10 31,24 17,32 3,24 3,10"
            fill={fillColor}
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          {/* Kubernetes Wheel Icon Mini */}
          <circle cx="17" cy="17" r="4" fill="#ffffff" />
          <line x1="17" y1="9" x2="17" y2="13" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="21" x2="17" y2="25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="13" x2="13" y2="15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="21" y1="19" x2="24" y2="21" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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

      {/* 2. Grid Content */}
      {mode === 'hex-grid' ? (
        <div className="w-full max-w-[940px] flex flex-col items-center my-auto">
          {/* Main Cluster Box */}
          <div className="w-full bg-[#0e131f] border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
            {/* Cluster Header */}
            <div className="flex items-center gap-2 mb-4 font-marker text-xl md:text-2xl text-cyan-300 tracking-wider">
              <span className="text-2xl">☸️</span> {clusterName}
            </div>

            {/* 40 Nodes Grid (8 columns x 5 rows) */}
            <div className="flex flex-wrap justify-center max-w-[400px]">
              {Array.from({ length: nodeCount }).map((_, i) =>
                renderK8sHexagon(i)
              )}
            </div>
          </div>

          {/* Stick Figures & Task Caption */}
          {stickFigureCaption && (
            <div className="flex flex-col items-center mt-5">
              <div className="font-marker text-2xl md:text-3xl text-amber-400 uppercase tracking-widest mb-2">
                {stickFigureCaption}
              </div>
              <div className="flex gap-8">
                <StickFigure pose="laptop-night" scale={0.9} color="#38bdf8" />
                <StickFigure pose="standing" scale={0.9} color="#f59e0b" />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Layer Mode: Control Plane (Brain) vs Worker Nodes (Muscle) */
        <div className="w-full max-w-[940px] flex flex-col gap-4 my-auto">
          {/* Top: Control Plane */}
          <div className="bg-[#14120b] border-2 border-amber-500/80 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="font-marker text-xl md:text-2xl text-amber-400 uppercase tracking-wide">
                {controlPlane?.title || 'CONTROL PLANE'}
              </span>
              <span className="font-handwriting text-lg text-slate-400 font-bold">
                {controlPlane?.subtitle || '— THE BRAIN'}
              </span>
            </div>

            <div className="flex justify-around py-3">
              {(controlPlane?.components || [
                { name: 'API SERVER', iconLabel: 'api' },
                { name: 'SCHEDULER', iconLabel: 'sched' },
              ]).map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center text-white font-mono text-xs font-bold shadow-lg shadow-blue-500/30">
                    {c.iconLabel}
                  </div>
                  <span className="font-marker text-sm text-slate-200 uppercase tracking-tight">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Worker Nodes */}
          <div className="bg-[#0b1419] border-2 border-cyan-500/80 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="font-marker text-xl md:text-2xl text-cyan-400 uppercase tracking-wide">
                {workerNodes?.title || 'WORKER NODES'}
              </span>
              <span className="font-handwriting text-lg text-slate-400 font-bold">
                {workerNodes?.subtitle || '— THE MUSCLE'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 h-48 py-2">
              {(workerNodes?.racks || [
                { rackName: 'NODE 1', pods: [{ name: 'app', color: '#2563eb' }] },
                { rackName: 'NODE 2', pods: [{ name: 'db', color: '#10b981' }] },
                { rackName: 'NODE 3', pods: [{ name: 'cache', color: '#ec4899' }] },
              ]).map((rack, rIdx) => (
                <div
                  key={rIdx}
                  className="border border-slate-700/80 rounded-xl bg-[#080d12] p-2 flex flex-col justify-start items-center"
                >
                  <span className="font-mono text-xs text-slate-400 mb-2">
                    {rack.rackName}
                  </span>
                  <div className="flex flex-col gap-2 w-full items-center">
                    {rack.pods.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-mono text-xs font-bold shadow"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
