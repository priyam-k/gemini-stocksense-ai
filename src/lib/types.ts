export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  lastUpdate: string;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface PatternOverlayData {
  lines?: Array<{ x1: number; y1: number; x2: number; y2: number; label?: string }>;
  zones?: Array<{ x: number; y: number; width: number; height: number; label?: string }>;
  points?: Array<{ x: number; y: number; label: string }>;
}

export interface TechnicalPattern {
  type: string;
  startIndex: number;
  endIndex: number;
  description: string;
  significance: string;
  patternKey?: string;
  overlayData?: PatternOverlayData;
}

export interface StockInsight {
  id: string;
  type: 'movement' | 'news' | 'technical' | 'sentiment';
  title: string;
  description: string;
  confidence: number;
  sources?: string[];
  relatedNews?: NewsArticle[];
  technicalPattern?: TechnicalPattern;
  timestamp: string;
}

export interface MarketForecast {
  timeHorizon: 'short' | 'medium' | 'long';
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
  keyFactors: string[];
  risks: string[];
  technicalSignals?: string[];
}

export interface TeachingSession {
  id: string;
  stockSymbol: string;
  currentStep: number;
  totalSteps: number;
  messages: TeachingMessage[];
  completed: boolean;
}

export interface TeachingMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  questionId?: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}
