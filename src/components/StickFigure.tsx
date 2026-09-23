import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface StickFigureProps {
  pose?: 'laptop-night' | 'standing' | 'confused' | 'pointing';
  label?: string;
  color?: string;
  scale?: number;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  pose = 'laptop-night',
  label,
  color = '#f59e0b',
  scale = 1,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing / typing jitter
  const typingJitter = Math.sin(frame * 0.8) * 1.5;
  const screenGlow = Math.sin(frame * 0.2) * 0.15 + 0.85;

  return (
    <div className="flex flex-col items-center justify-center select-none" style={{ transform: `scale(${scale})` }}>
      {label && (
        <div className="font-handwriting text-xl text-amber-300 font-bold mb-1 tracking-wide">
          {label}
        </div>
      )}

      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {pose === 'laptop-night' ? (
          <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="40" cy="22" r="9" />
            {/* Torso */}
            <line x1="40" y1="31" x2="40" y2="52" />
            {/* Legs (seated) */}
            <line x1="40" y1="52" x2="26" y2="60" />
            <line x1="26" y1="60" x2="26" y2="76" />
            <line x1="40" y1="52" x2="52" y2="60" />
            <line x1="52" y1="60" x2="52" y2="76" />
            {/* Arms typing on laptop */}
            <line x1="40" y1="38" x2="50" y2={46 + typingJitter} />
            <line x1="50" y1={46 + typingJitter} x2="58" y2={50} />
            {/* Desk line */}
            <line x1="15" y1="65" x2="70" y2="65" stroke="#475569" strokeWidth="2" />
            {/* Laptop Base */}
            <line x1="52" y1="62" x2="68" y2="62" stroke="#94a3b8" strokeWidth="2" />
            {/* Laptop Screen */}
            <line x1="65" y1="62" x2="72" y2="48" stroke="#38bdf8" strokeWidth="2.5" />
            {/* Screen Glow */}
            <polygon
              points="72,48 52,62 38,45"
              fill="#38bdf8"
              opacity={screenGlow * 0.15}
              stroke="none"
            />
          </g>
        ) : pose === 'confused' ? (
          <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="40" cy="22" r="9" />
            {/* Torso */}
            <line x1="40" y1="31" x2="40" y2="54" />
            {/* Legs */}
            <line x1="40" y1="54" x2="28" y2="74" />
            <line x1="40" y1="54" x2="52" y2="74" />
            {/* Left Arm to hip */}
            <line x1="40" y1="38" x2="26" y2="46" />
            <line x1="26" y1="46" x2="34" y2="52" />
            {/* Right Arm scratching head */}
            <line x1="40" y1="38" x2="54" y2="28" />
            <line x1="54" y1="28" x2="48" y2="18" />
            {/* Question Mark */}
            <text x="56" y="20" fill="#f43f5e" fontSize="18" fontWeight="bold" fontFamily="sans-serif" stroke="none">?</text>
          </g>
        ) : pose === 'pointing' ? (
          <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="40" cy="22" r="9" />
            {/* Torso */}
            <line x1="40" y1="31" x2="40" y2="54" />
            {/* Legs */}
            <line x1="40" y1="54" x2="30" y2="74" />
            <line x1="40" y1="54" x2="50" y2="74" />
            {/* Pointing Right Arm */}
            <line x1="40" y1="38" x2="68" y2="34" />
            {/* Left Arm on hip */}
            <line x1="40" y1="38" x2="28" y2="48" />
          </g>
        ) : (
          <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Standing Default */}
            <circle cx="40" cy="22" r="9" />
            <line x1="40" y1="31" x2="40" y2="54" />
            <line x1="40" y1="54" x2="30" y2="74" />
            <line x1="40" y1="54" x2="50" y2="74" />
            <line x1="40" y1="38" x2="24" y2="50" />
            <line x1="40" y1="38" x2="56" y2="50" />
          </g>
        )}
      </svg>
    </div>
  );
};
