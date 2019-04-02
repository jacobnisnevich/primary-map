import { ChromaStatic } from 'chroma-js';

export type State = string;
export type Candidate = string;
export type Election = 'caucus' | 'primary';

export type CandidateResults = Record<Candidate, number>;
export type PollingData = Record<State, Poll[]>;
export type AveragedPollingData = Record<State, CandidateResults>;
export type Palette = Record<Candidate, ChromaStatic>;

export interface Poll {
  date?: Date;
  sampleSize?: number;
  marginOfError?: number;
  candidateResults: CandidateResults;
}

export interface TableDefinition {
  candidates: Candidate[];
  columnCount: number;
}

export interface MapData {
  averagedPollingData: AveragedPollingData;
  palette: Palette;
}
