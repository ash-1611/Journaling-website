// backend/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// OpenRouter AI Service — free-model chain with automatic fallback.
// No SDK required; uses Node's native fetch (Node 18+).
// Primary model: nvidia/nemotron-3-nano-30b-a3b:free
// Fallbacks tried in order if primary is rate-limited (429) or unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Models tried in order — all free tier on OpenRouter
const MODEL_CHAIN = [
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-27b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'mistralai/mistral-7b-instruct:free',
];

/**
 * Returns true when a valid AI_API_KEY is set in the environment.
 */
function hasApiKey() {
  const key = process.env.AI_API_KEY;
  return !!(key && key.trim() && key !== 'your_openrouter_key_here');
}

/**
 * Core function: send a chat completion request to OpenRouter.
 * Walks MODEL_CHAIN automatically on 429 (rate-limit) or 404 (no endpoint).
 *
 * @param {Array<{role: string, content: string}>} messages  - Full message array
 * @param {number} [temperature=0.7]
 * @param {number} [maxTokens=600]
 * @returns {Promise<string>} Raw text content of the first choice
 */
async function callOpenRouter(messages, temperature = 0.7, maxTokens = 600) {
  const apiKey = process.env.AI_API_KEY;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
    'X-Title': 'Mindful Wellness App',
  };

  let lastError;
  for (const model of MODEL_CHAIN) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
      });

      // On rate-limit or missing endpoint, try next model in chain
      if (response.status === 429 || response.status === 404) {
        const body = await response.text();
        console.warn(`[AI] Model ${model} unavailable (${response.status}), trying next...`);
        lastError = new Error(`${model} returned ${response.status}: ${body}`);
        continue;
      }

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      // Some models (reasoning models) may return content separately from reasoning tokens
      const content = data?.choices?.[0]?.message?.content;
      if (!content || !content.trim()) {
        // Try to extract from reasoning_details as a last resort, then fail
        throw new Error('Empty or null content from OpenRouter');
      }
      console.log(`[AI] ✅ Used model: ${model}`);
      return content;
    } catch (err) {
      // Network-level error — also try next
      lastError = err;
      if (!err.message.includes('returned 429') && !err.message.includes('returned 404')) {
        throw err; // non-recoverable error, stop chain
      }
    }
  }

  throw lastError || new Error('All models in chain exhausted');
}

/**
 * Safely parse the first JSON object found in an AI text response.
 * Handles markdown code fences like ```json ... ```.
 *
 * @param {string} text
 * @returns {object|null}
 */
function safeParseJSON(text) {
  try {
    // Strip markdown fences if present
    const stripped = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    const match = stripped.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

// ── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Analyze a journal entry and return structured mood/wellness data.
 * Extended output includes recommendedActivity, dailySummary, predictedMoodTomorrow.
 */
async function analyzeJournal(journalText) {
  if (!hasApiKey()) return null;

  // Use a system + user split so models don't refuse the JSON-only instruction
  const messages = [
    {
      role: 'system',
      content: 'You are a mental wellness AI. Respond ONLY with valid JSON — no markdown fences, no extra text, no explanation outside the JSON object.',
    },
    {
      role: 'user',
      content: `Analyze this journal entry and return a single JSON object with these exact keys:
mood (one of: happy|calm|anxious|sad|stressed|motivated|tired|neutral),
confidence (0.0-1.0),
explanation (1-2 sentences),
suggestions (array of 4 strings),
affirmations (array of 3 strings),
recommendedPlaylist (string),
recommendedActivity (string),
dailySummary (1 warm sentence),
predictedMoodTomorrow (one of: happy|calm|anxious|sad|stressed|motivated|tired|neutral)

Journal entry: "${journalText.slice(0, 1200)}"`,
    },
  ];

  const raw = await callOpenRouter(messages, 0.7, 800);
  return safeParseJSON(raw);
}

/**
 * Generate a personalised music playlist based on mood & preferences.
 */
async function generateSmartPlaylist(mood, genre, energyLevel, timeOfDay) {
  if (!hasApiKey()) return null;

  const messages = [
    { role: 'system', content: 'You are a music curator AI. Respond ONLY with valid JSON — no markdown, no extra text.' },
    { role: 'user', content: `Create a wellness playlist for someone feeling ${mood}, genre: ${genre}, energy: ${energyLevel}, time: ${timeOfDay}. Return JSON with keys: playlistName (string), songs (array of 5 descriptive song titles).` },
  ];

  const raw = await callOpenRouter(messages, 0.8, 300);
  return safeParseJSON(raw);
}

/**
 * Generate a daily wellness summary from today's mood insights.
 */
async function getDailySummary(moodContext) {
  if (!hasApiKey()) return null;

  const messages = [
    { role: 'system', content: 'You are a mental wellness AI. Respond ONLY with valid JSON — no markdown, no extra text.' },
    { role: 'user', content: `Generate a supportive daily wellness summary. Return JSON with keys: summary (2-3 warm sentences), positiveHighlights (array of 3 strings), tomorrowActivity (one specific activity string). Use these insights: ${moodContext}` },
  ];

  const raw = await callOpenRouter(messages, 0.7, 600);
  return safeParseJSON(raw);
}

/**
 * Predict tomorrow's mood based on recent mood history.
 */
async function getMoodPrediction(moodHistory) {
  if (!hasApiKey()) return null;

  const messages = [
    { role: 'system', content: 'You are a mental wellness AI analyst. You MUST respond with ONLY a raw JSON object. Do not include any explanation, greeting, or markdown. Start your response with { and end with }.' },
    { role: 'user', content: `Given this 7-day mood history: ${moodHistory} — predict tomorrow's mood and return this exact JSON: {"predictedMood":"<happy|calm|anxious|sad|stressed|motivated|tired|neutral>","confidence":<0.0-1.0>,"recommendation":"<one supportive sentence>"}` },
  ];

  const raw = await callOpenRouter(messages, 0.3, 400);
  return safeParseJSON(raw);
}

/**
 * Chat with Mindi — the AI wellness companion.
 * Accepts the full messages array (with system prompt prepended inside the controller).
 * Uses 400 max tokens so guided exercises (breathing, meditation) have room to breathe.
 *
 * @param {Array<{role: string, content: string}>} messages - Includes system message
 * @returns {Promise<string>} Assistant reply text
 */
async function chatWithMindi(messages) {
  if (!hasApiKey()) return null;
  return callOpenRouter(messages, 0.8, 400);
}

module.exports = {
  hasApiKey,
  analyzeJournal,
  generateSmartPlaylist,
  getDailySummary,
  getMoodPrediction,
  chatWithMindi,
  safeParseJSON,   // exported so controller can reuse it
};
