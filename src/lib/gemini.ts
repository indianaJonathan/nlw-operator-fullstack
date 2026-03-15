import { GoogleGenAI } from "@google/genai";

let instance: GoogleGenAI | null = null;

/**
 * Returns a lazy-initialized GoogleGenAI client.
 * Avoids "API key should be set" warnings during build time
 * when the env var is not available.
 */
function getAI(): GoogleGenAI {
  if (!instance) {
    instance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return instance;
}

export { getAI };
