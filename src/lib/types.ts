export type Market = 'NASDAQ' | 'KOSPI';
export type Direction = 'UP' | 'DOWN' | 'NEUTRAL';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OracleEvent {
  id: number;
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  market: Market;
  prediction: Direction;
  confidence: number;
  rationale: string;
  reviewStatus: ReviewStatus;
  sessionDate: string;
  open: number;
  close: number;
  marketReturn: number;
  actual: 'UP' | 'DOWN';
  outcome: 'SAME' | 'OPPOSITE';
}
