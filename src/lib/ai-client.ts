import OpenAI from 'openai';

// Allow running without OpenAI API key for testing
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';

// Check if we have a valid OpenAI API key (not placeholder)
const isValidApiKey = process.env.OPENAI_API_KEY && 
  process.env.OPENAI_API_KEY !== 'your_openai_api_key' &&
  process.env.OPENAI_API_KEY.startsWith('sk-');

export const openai = isValidApiKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export const AI_MODELS = {
  GPT_4O: 'gpt-4o',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_4: 'gpt-4',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];
