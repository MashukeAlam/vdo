import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Background: React.FC<{ aspectRatio: '9:16' | '16:9' }> = ({ aspectRatio }) => {
  const frame = useCurrentFrame();

  // Subtle floating ambient motion
  const glowY = interpolate(frame, [0, 300], [0, 40], {
    extrapolateRight: 'wrap',
  });
  const glowX = interpolate(frame, [0, 300], [0, -30], {
    extrapolateRight: 'wrap',
  });

  return (
    <div className="absolute inset-0 w-full h-full bg-[#080c14] overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #38bdf8 1px, transparent 1px),
            linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
          `,
          backgroundSize: aspectRatio === '9:16' ? '40px 40px' : '60px 60px',
        }}
      />

      {/* Top-Right Cyan Radial Glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #38bdf8 0%, rgba(56, 189, 248, 0) 70%)',
          top: `-100px`,
          right: `-100px`,
          transform: `translate(${glowX}px, ${glowY}px)`,
        }}
      />

      {/* Bottom-Left Violet Radial Glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, #818cf8 0%, rgba(129, 140, 248, 0) 70%)',
          bottom: `-100px`,
          left: `-100px`,
          transform: `translate(${-glowX}px, ${-glowY}px)`,
        }}
      />

      {/* Subtle vignette border */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none border border-cyan-900/30" />
    </div>
  );
};
