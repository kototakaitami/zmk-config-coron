import { AISource } from '../types';

const URL_PATTERNS: Array<{ pattern: RegExp; source: AISource }> = [
  { pattern: /claude\.ai/i, source: 'claude' },
  { pattern: /anthropic\.com/i, source: 'claude' },
  { pattern: /chat\.openai\.com/i, source: 'chatgpt' },
  { pattern: /chatgpt\.com/i, source: 'chatgpt' },
  { pattern: /gemini\.google\.com/i, source: 'gemini' },
  { pattern: /bard\.google\.com/i, source: 'gemini' },
  { pattern: /perplexity\.ai/i, source: 'perplexity' },
  { pattern: /copilot\.microsoft\.com/i, source: 'copilot' },
  { pattern: /bing\.com\/chat/i, source: 'copilot' },
  { pattern: /grok\.x\.ai/i, source: 'grok' },
  { pattern: /x\.com\/i\/grok/i, source: 'grok' },
];

export function detectAISource(url?: string, content?: string): AISource {
  if (url) {
    for (const { pattern, source } of URL_PATTERNS) {
      if (pattern.test(url)) return source;
    }
  }
  return 'other';
}

export const AI_COLORS: Record<AISource, string> = {
  claude: '#D97706',
  chatgpt: '#10A37F',
  gemini: '#4285F4',
  perplexity: '#20B2AA',
  copilot: '#0078D4',
  grok: '#E7E9EA',
  other: '#6B7280',
};

export const AI_LABELS: Record<AISource, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  copilot: 'Copilot',
  grok: 'Grok',
  other: 'Other',
};

export const ALL_SOURCES: AISource[] = [
  'claude', 'chatgpt', 'gemini', 'perplexity', 'copilot', 'grok', 'other',
];
