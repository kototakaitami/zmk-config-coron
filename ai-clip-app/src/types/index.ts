export type AISource =
  | 'claude'
  | 'chatgpt'
  | 'gemini'
  | 'perplexity'
  | 'copilot'
  | 'grok'
  | 'other';

export interface Clip {
  id: string;
  content: string;
  url?: string;
  aiSource: AISource;
  project?: string;
  tags: string[];
  title: string;
  note?: string;
  savedAt: number;
}

export interface FilterState {
  aiSource?: AISource;
  project?: string;
  query?: string;
  dateFrom?: number;
  dateTo?: number;
}
