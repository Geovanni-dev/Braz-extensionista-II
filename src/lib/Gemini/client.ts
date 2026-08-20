import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

export const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
