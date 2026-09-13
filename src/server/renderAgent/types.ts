// src/server/renderAgent/types.ts
export type RenderJobKind = 'fabric_swap' | 'room_stage';
export type JobStatus = 'queued' | 'running' | 'done' | 'needs_review' | 'failed';
export type JobStage = 'prompt' | 'generate' | 'grade' | 'lock' | 'store';

export interface Bbox { x: number; y: number; width: number; height: number } // percent 0-100

export interface ZoneInput {
  id: string;
  display_name: string;
  description: string;
  location: string;
  polygon_coords: Array<{ x: number; y: number }>; // percent
}

export interface ZoneChange {
  regionId: string;
  fabricName: string;
  weave: string;
  colorHex: string;
  category: string;
  swatch: string; // data URL, raster
}

export interface FabricSwapInput {
  kind: 'fabric_swap';
  brandId: string;
  templateName: string;
  templatePhoto: string; // data URL, raster
  zones: ZoneInput[];
  changes: ZoneChange[];
  curtainMask?: string; // optional data URL override; derived from polygons when absent
}

export interface RoomStageInput {
  kind: 'room_stage';
  brandId: string;
  roomPhoto: string; // data URL
  curtainImage: string; // data URL
}

export type RenderJobInput = FabricSwapInput | RoomStageInput;

export interface GradeItem { key: string; score: number; reason: string }

export interface Candidate {
  id: string;
  round: number;
  image: string; // data URL
  scores: GradeItem[];
  total: number;
  passed: boolean;
}

/** The chosen, pixel-locked image. Candidates live on the job itself, never duplicated here. */
export interface RenderResult {
  finalImage: string;
  chosenId: string;
  prompt: string;
}

export interface RenderJob {
  id: string;
  kind: RenderJobKind;
  brandId: string;
  status: JobStatus;
  stage: JobStage;
  round: number;
  candidates: Candidate[];
  /** Detected window for a room_stage job; kept so a later candidate choice can rebuild the same mask. */
  windowBbox?: Bbox;
  result?: RenderResult;
  error?: string;
  createdAt: number;
  finishedAt?: number;
  input: RenderJobInput;
  apiKey: string | null;
}

export interface BuiltPrompt { text: string; images: string[] }
