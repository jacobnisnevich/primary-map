import { ChromaStatic } from 'chroma-js';

export type State = string;
export type Candidate = string;
export type Election = 'caucus' | 'primary';
export type PollType = 'state' | 'national';

export type CandidateResults = Record<Candidate, number>;
export type StatePollingData = Record<State, Poll[]>;
export type AveragedPollingData = Record<State, CandidateResults>;
export type Palette = Record<Candidate, ChromaStatic>;

export interface Poll {
  state?: State;
  pollingSource?: string;
  date?: Date;
  sampleSize?: number;
  marginOfError?: number;
  candidateResults: CandidateResults;
}

export interface ExpandedPoll extends Poll {
  state?: State;
}

export type FlatPoll = Record<string, any>;

export interface TableDefinition {
  candidates: Candidate[];
  columnCount: number;
}

export interface MapData {
  averagedPollingData: AveragedPollingData;
  palette: Palette;
}

export interface TrendData {
  candidateResults: CandidateResults[];
  days: Date[];
}

export type CandidateFinancialData = Record<Candidate, FinancialData>;

export interface FinancialData {
  raised: number;
  spent: number;
}

export interface PollFilter {
  limit?: number;
  offset?: number;
  sortCriteria?: SortCriteria;
  columnFilters?: ColumnFilter[];
}

export interface SortCriteria {
  field: string;
  direction: SortDirection;
}

export type SortDirection = 'Desc' | 'Asc';

export interface ColumnFilter {
  field: string;
  operator: ColumnFilterOperator;
  operand: any;
}

export type ColumnFilterOperator =
  | 'EqualTo'
  | 'NotEqualTo'
  | 'GreaterThan'
  | 'GreaterThanOrEqualTo'
  | 'LessThan'
  | 'LessThanOrEqualTo'
  | 'In'
  | 'NotIn';
