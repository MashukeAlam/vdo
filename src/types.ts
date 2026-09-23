export type AspectRatio = '9:16' | '16:9';

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export type SceneType =
  | 'TitleCard'
  | 'CodeExplainer'
  | 'ArchitectureFlow'
  | 'MathVisualizer'
  | 'ComparisonCard'
  | 'SummaryList';

export interface TitleCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  tags?: string[];
}

export interface CodeExplainerProps {
  language: string;
  filename?: string;
  code: string;
  previousCode?: string; // for diff morphing
  highlightLines?: number[];
  lineNotes?: { line: number; note: string }[];
}

export interface FlowStep {
  title: string;
  desc?: string;
  icon?: string;
}

export interface ArchitectureFlowProps {
  title: string;
  steps: FlowStep[];
  activeStepIndex: number;
}

export interface MathVisualizerProps {
  title?: string;
  formula: string; // LaTeX
  explanation?: string;
  variables?: { symbol: string; meaning: string }[];
}

export interface ComparisonCardProps {
  title: string;
  leftTitle: string;
  leftPoints: string[];
  rightTitle: string;
  rightPoints: string[];
}

export interface SummaryListProps {
  title: string;
  items: string[];
}

export type SceneProps =
  | TitleCardProps
  | CodeExplainerProps
  | ArchitectureFlowProps
  | MathVisualizerProps
  | ComparisonCardProps
  | SummaryListProps;

export interface SceneData {
  id: string;
  type: SceneType;
  narration: string;
  audioFile?: string;
  durationSec?: number;
  durationInFrames?: number;
  startFrame?: number;
  words?: WordTimestamp[];
  props: SceneProps;
}

export interface ProjectData {
  title: string;
  aspectRatio: AspectRatio;
  voice?: string;
  theme?: 'dark-cyan' | 'cyberpunk' | 'minimal-dark';
  totalDurationFrames?: number;
  totalDurationSec?: number;
  scenes: SceneData[];
}
