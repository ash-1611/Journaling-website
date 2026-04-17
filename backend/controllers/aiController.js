// backend/controllers/aiController.js
const AIInsight = require('../models/AIInsight');
const aiService = require('../services/aiService');

// ── Mood → Playlist mapping ─────────────────────────────────────────────────
const MOOD_PLAYLIST_MAP = {
  stressed:  'Soft Relaxation',
  anxious:   'Meditation Bowls',
  tired:     'Night Rain & Calm',
  sad:       'Morning Energy',
  happy:     'Feel-Good Vibes',
  calm:      'Deep Focus',
  motivated: 'Energy Boost',
  neutral:   'Ambient Calm',
};

// ── Mood → Activity mapping ──────────────────────────────────────────────────
const MOOD_ACTIVITY_MAP = {
  stressed:  'Breathing Exercise',
  anxious:   'Guided Meditation',
  tired:     'Gentle Yoga',
  sad:       'Light Walk',
  happy:     'Gratitude Journaling',
  calm:      'Deep Focus Session',
  motivated: 'Goal Setting',
  neutral:   'Mindful Stretching',
};

const MOOD_SCORE = { happy: 5, motivated: 5, calm: 4, neutral: 3, tired: 2, stressed: 1, anxious: 1, sad: 1 };

// ── Fallback data tables ─────────────────────────────────────────────────────
const SUGGESTIONS = {
  stressed:  ['Try a 4-7-8 breathing exercise', 'Take a 10-minute walk outdoors', 'Write down your top 3 priorities', 'Listen to calming music', 'Practice progressive muscle relaxation'],
  anxious:   ['Try box breathing: inhale 4s, hold 4s, exhale 4s', 'Ground yourself with the 5-4-3-2-1 technique', 'Listen to Meditation Bowls playlist', 'Write about what is making you anxious', 'Do a gentle body scan meditation'],
  sad:       ['Reach out to a friend or loved one', 'Listen to uplifting music', 'Go for a short walk in nature', 'Write 3 things you are grateful for', 'Watch something that makes you smile'],
  tired:     ['Take a 20-minute power nap', 'Listen to Night Rain & Calm', 'Do light stretching', 'Hydrate and have a healthy snack', 'Step outside for fresh air'],
  happy:     ['Channel this energy into journaling', 'Share your joy with someone', 'Set a new goal while motivated', 'Do a creative activity', 'Practice gratitude journaling'],
  calm:      ['Deepen this calm with a meditation session', 'Do a gentle yoga flow', 'Listen to Deep Focus playlist', 'Journal your thoughts freely', 'Read something inspiring'],
  motivated: ['Channel energy into your top goal', 'Create a focused work session', 'Listen to Energy Boost playlist', 'Set a new challenge for yourself', 'Help someone else with their goals'],
  neutral:   ['Try a short meditation to check in with yourself', 'Write freely in your journal', 'Listen to Ambient Calm', 'Do light stretching', 'Take a mindful walk'],
};

const AFFIRMATIONS = {
  stressed:  ['I can handle one thing at a time.', 'I release what I cannot control.', 'I am stronger than any challenge I face.'],
  anxious:   ['I am safe, calm, and capable of handling today.', 'I breathe in peace and exhale worry.', 'This feeling is temporary and I am okay.'],
  sad:       ['My feelings are valid and I am growing stronger every day.', 'I deserve love, joy, and healing.', 'Each day brings new possibility.'],
  tired:     ["Rest is productive. I honour my body's needs.", 'I will wake refreshed and renewed.', "It's okay to slow down."],
  happy:     ['I am grateful for this feeling and share it freely.', 'I attract more of what makes me happy.', 'Joy is my natural state.'],
  calm:      ['I am at peace with myself and the world.', 'Stillness gives me clarity and strength.', 'I deserve this moment of calm.'],
  motivated: ['I am capable of achieving my dreams.', 'My energy and focus are unlimited.', 'I take inspired action every day.'],
  neutral:   ['I am open to what this day brings.', 'I am enough, exactly as I am.', 'I embrace the present moment.'],
};

// ── Helper: smart keyword fallback for journal analysis ──────────────────────
function fallbackAnalysis(journalText) {
  const lower = journalText.toLowerCase();
  let mood = 'neutral';
  let confidence = 0.5;

  const moodKeywords = {
    stressed:  ['stress', 'overwhelm', 'pressure', 'deadline', 'burden', 'too much', 'tension', 'tight', 'difficult', 'struggle', 'hard', 'tense'],
    anxious:   ['anxious', 'anxiety', 'worry', 'nervous', 'panic', 'fear', 'scared', 'afraid', 'dread', 'uneasy', 'uncertain'],
    sad:       ['sad', 'unhappy', 'cry', 'grief', 'lonely', 'miss', 'lost', 'depressed', 'down', 'blue', 'heartbreak', 'miserable'],
    tired:     ['tired', 'exhausted', 'fatigue', 'sleepy', 'drained', 'worn out', 'depleted', 'weak', 'listless', 'sluggish'],
    happy:     ['happy', 'joy', 'great', 'wonderful', 'excited', 'love', 'grateful', 'amazing', 'fantastic', 'delighted', 'ecstatic', 'blessed'],
    calm:      ['calm', 'peaceful', 'relax', 'serene', 'quiet', 'still', 'content', 'peaceful', 'soothed', 'tranquil', 'ease', 'gentle'],
    motivated: ['motivat', 'inspired', 'productive', 'accomplish', 'achieve', 'goal', 'driven', 'energized', 'focused', 'determined', 'ambitious'],
  };

  // Count keyword matches with weighted scoring
  let best = 0;
  for (const [m, keywords] of Object.entries(moodKeywords)) {
    const hits = keywords.filter(k => lower.includes(k)).length;
    if (hits > best) { 
      best = hits; 
      mood = m; 
      // Confidence: base 0.6 + (0.08 per keyword match, capped at 0.9)
      confidence = Math.min(0.6 + hits * 0.08, 0.9); 
    }
  }

  // Default to neutral mood analysis if no strong matches
  if (best === 0) {
    confidence = 0.55;
  }

  // Sentiment modifiers for more nuanced analysis
  const negativeModifiers = ['no', 'not', "don't", "can't", "won't", 'never', 'nothing'];
  const hasNegation = negativeModifiers.some(neg => lower.includes(neg));
  
  // If we detected happy but there's negation, adjust
  if (mood === 'happy' && hasNegation) {
    mood = 'calm'; // neutral positive state
    confidence *= 0.85;
  }

  const TOMORROW_MAP = { 
    stressed: 'calm', 
    anxious: 'calm', 
    sad: 'neutral', 
    tired: 'calm', 
    happy: 'happy', 
    calm: 'calm', 
    motivated: 'motivated', 
    neutral: 'calm' 
  };

  return {
    mood,
    confidence: parseFloat(confidence.toFixed(2)),
    explanation: `Based on your journal entry, you appear to be feeling ${mood}. Your reflective writing shows important emotional awareness.`,
    suggestions: (SUGGESTIONS[mood] || SUGGESTIONS.neutral).slice(0, 4),
    affirmations: (AFFIRMATIONS[mood] || AFFIRMATIONS.neutral).slice(0, 3),
    recommendedPlaylist: MOOD_PLAYLIST_MAP[mood] || 'Ambient Calm',
    recommendedActivity: MOOD_ACTIVITY_MAP[mood] || 'Mindful Stretching',
    dailySummary: `You wrote today with ${mood} energy. Your commitment to self-reflection is building emotional resilience and self-awareness.`,
    predictedMoodTomorrow: TOMORROW_MAP[mood] || 'calm',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/analyze-journal
// Body: { journalText, journalEntryId? }
// ─────────────────────────────────────────────────────────────────────────────
const analyzeJournal = async (req, res) => {
  try {
    const { journalText, journalEntryId } = req.body;

    if (!journalText || journalText.trim().length < 10) {
      return res.status(400).json({ message: 'Please provide a journal entry with at least 10 characters.' });
    }

    let result;
    let usedAI = false;

    try {
      const hasKey = aiService.hasApiKey();
      if (!hasKey) {
        console.warn('[AI] No API key configured, using fallback analysis');
      }

      const parsed = hasKey
        ? await aiService.analyzeJournal(journalText)
        : null;

      if (parsed && parsed.mood) {
        usedAI = true;
        console.log('[AI] ✅ Successfully analyzed journal with AI');
        result = {
          mood: parsed.mood || 'neutral',
          confidence: parseFloat((parsed.confidence || 0.5).toFixed(2)),
          explanation: parsed.explanation || '',
          suggestions: (parsed.suggestions || []).slice(0, 5),
          affirmations: (parsed.affirmations || []).slice(0, 3),
          recommendedPlaylist: parsed.recommendedPlaylist || MOOD_PLAYLIST_MAP[parsed.mood] || 'Ambient Calm',
          recommendedActivity: parsed.recommendedActivity || MOOD_ACTIVITY_MAP[parsed.mood] || 'Mindful Stretching',
          dailySummary: parsed.dailySummary || '',
          predictedMoodTomorrow: parsed.predictedMoodTomorrow || 'calm',
        };
      } else {
        console.warn('[AI] AI returned null/invalid response, using fallback analysis');
        result = fallbackAnalysis(journalText);
      }
    } catch (aiErr) {
      console.warn('[AI] OpenRouter API error:', aiErr.message);
      console.log('[AI] Falling back to keyword-based analysis');
      result = fallbackAnalysis(journalText);
    }

    // Persist insight to DB
    const insight = await AIInsight.create({
      user: req.user._id,
      journalText: journalText.slice(0, 3000),
      journalEntry: journalEntryId || null,
      detectedMood: result.mood,
      confidence: result.confidence,
      explanation: result.explanation,
      suggestions: result.suggestions,
      affirmations: result.affirmations,
      recommendedPlaylist: result.recommendedPlaylist,
      moodPrediction: { predictedMood: result.predictedMoodTomorrow, confidence: result.confidence },
      dailySummary: { summary: result.dailySummary, tomorrowActivity: result.recommendedActivity },
    });

    return res.status(200).json({
      insightId: insight._id,
      mood: result.mood,
      confidence: result.confidence,
      explanation: result.explanation,
      suggestions: result.suggestions,
      affirmations: result.affirmations,
      recommendedPlaylist: result.recommendedPlaylist,
      recommendedActivity: result.recommendedActivity,
      dailySummary: result.dailySummary,
      predictedMoodTomorrow: result.predictedMoodTomorrow,
    });
  } catch (err) {
    console.error('[AI] analyzeJournal error:', err.message);
    return res.status(500).json({ message: 'AI analysis failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/smart-playlist
// Body: { mood, genre, energyLevel, timeOfDay }
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/smart-playlist
// Body: { mood, genre, energyLevel, timeOfDay }
// ─────────────────────────────────────────────────────────────────────────────
const generateSmartPlaylist = async (req, res) => {
  try {
    const { mood = 'calm', genre = 'ambient', energyLevel = 'low', timeOfDay = 'evening' } = req.body;

    const FALLBACK_PLAYLISTS = {
      stressed: { playlistName: 'Tension Release', songs: ['Soft wind chimes', 'Deep breathing tones', 'Ocean wave ambience', 'Gentle piano lullaby', 'Slow waterfall sounds'] },
      anxious:  { playlistName: 'Safe Space', songs: ['432Hz healing tones', 'Tibetan singing bowls', 'Slow binaural beats', 'Distant rain sounds', 'Soft om chanting'] },
      tired:    { playlistName: 'Gentle Restoration', songs: ['Soft delta waves', 'Night forest ambience', 'Slow acoustic guitar', 'Warm piano notes', 'Crickets and calm'] },
      sad:      { playlistName: 'Gentle Uplift', songs: ['Hopeful piano melody', 'Morning birdsong', 'Soft strings arrangement', 'Sunrise ambient tones', 'Warm cello piece'] },
      happy:    { playlistName: 'Joyful Flow', songs: ['Upbeat acoustic pop', 'Bright ukulele melody', 'Feel-good indie folk', 'Sunny morning vibes', 'Light percussion groove'] },
      calm:     { playlistName: 'Deep Stillness', songs: ['Theta wave meditation', 'Soft nature sounds', 'Flowing water ambience', 'Gentle bell tones', 'Distant ocean waves'] },
      motivated:{ playlistName: 'Power Focus', songs: ['Motivational orchestral', 'Driving lo-fi beats', 'Epic background score', 'Energetic ambient', 'Upbeat cinematic'] },
      neutral:  { playlistName: 'Balanced Mind', songs: ['Neutral alpha waves', 'Soft background hum', 'Mindful breath rhythm', 'Calm instrumental', 'Ambient piano loop'] },
    };

    let playlist;
    try {
      const aiResult = aiService.hasApiKey()
        ? await aiService.generateSmartPlaylist(mood, genre, energyLevel, timeOfDay)
        : null;
      playlist = (aiResult && aiResult.playlistName) ? aiResult : (FALLBACK_PLAYLISTS[mood] || FALLBACK_PLAYLISTS.neutral);
    } catch (aiErr) {
      console.warn('[AI] SmartPlaylist OpenRouter failed, using fallback:', aiErr.message);
      playlist = FALLBACK_PLAYLISTS[mood] || FALLBACK_PLAYLISTS.neutral;
    }

    return res.status(200).json(playlist);
  } catch (err) {
    console.error('[AI] generateSmartPlaylist error:', err.message);
    return res.status(500).json({ message: 'Playlist generation failed.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/daily-summary
// ─────────────────────────────────────────────────────────────────────────────
const getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const insights = await AIInsight.find({
      user: req.user._id,
      createdAt: { $gte: today },
    }).sort({ createdAt: 1 });

    let summary;

    if (insights.length === 0) {
      summary = {
        summary: 'No journal entries recorded today yet. Start writing to get your daily wellness summary!',
        positiveHighlights: [
          "You're here, and that already counts. 💙",
          'Tracking your emotions helps build long-term resilience.',
          'Consistency is key — keep journaling daily.',
        ],
        tomorrowActivity: 'Start tomorrow with a 5-minute morning gratitude journal entry.',
      };
    } else {
      const moodList = insights.map(i => i.detectedMood);
      const uniqueMoods = [...new Set(moodList)];
      const moodContext = insights.map((i, idx) =>
        `Entry ${idx + 1} (${new Date(i.createdAt).toLocaleTimeString()}): mood=${i.detectedMood}, confidence=${i.confidence}`
      ).join('\n');

      try {
        const aiResult = aiService.hasApiKey()
          ? await aiService.getDailySummary(moodContext)
          : null;

        summary = (aiResult && aiResult.summary) ? aiResult : {
          summary: `Today you experienced ${uniqueMoods.join(', ')} emotions across ${insights.length} journal entry(s). Your self-reflection practice is building emotional awareness.`,
          positiveHighlights: [
            "You took time to journal today — that's a powerful act of self-care.",
            'Tracking your emotions helps build long-term resilience.',
            insights.length > 1 ? 'Multiple check-ins show great mindfulness commitment.' : 'Consistency is key — keep journaling daily.',
          ],
          tomorrowActivity: 'Start tomorrow with a 5-minute morning gratitude journal entry.',
        };
      } catch (aiErr) {
        console.warn('[AI] DailySummary OpenRouter failed, using fallback:', aiErr.message);
        temperature: 0.7,
                summary = {
          summary: `Today you reflected on ${uniqueMoods.join(', ')} emotions. Great work checking in with yourself.`,
          positiveHighlights: [
            "You took time to journal today — that's a powerful act of self-care.",
            'Emotional awareness is a superpower you are developing.',
            'Every entry brings you closer to your best self.',
          ],
          tomorrowActivity: 'Try a 5-minute breathing exercise first thing tomorrow morning.',
        };
      }
    }

    // Persist summary to the most recent insight
    if (insights.length > 0) {
      await AIInsight.findByIdAndUpdate(insights[insights.length - 1]._id, { dailySummary: summary });
    }

    return res.status(200).json(summary);
  } catch (err) {
    console.error('[AI] getDailySummary error:', err.message);
    return res.status(500).json({ message: 'Failed to generate daily summary.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/mood-prediction
// ─────────────────────────────────────────────────────────────────────────────
const getMoodPrediction = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInsights = await AIInsight.find({
      user: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: -1 }).limit(14);

    if (recentInsights.length < 2) {
      return res.status(200).json({
        predictedMood: 'calm',
        confidence: 0.5,
        recommendation: 'Keep journaling daily to unlock personalised mood predictions.',
      });
    }

    const REC_MAP = {
      stressed:  'Try a daily 5-minute meditation to reduce baseline stress.',
      anxious:   'Practice box breathing each morning to build calm.',
      sad:       'Schedule something joyful — connect with a friend or go outside.',
      tired:     'Prioritise 7-8 hours of sleep and reduce screen time before bed.',
      happy:     'Maintain this positive streak with daily gratitude journaling.',
      calm:      "Continue your mindfulness practice — it's working beautifully.",
      motivated: 'Channel this drive into a meaningful project or new habit.',
      neutral:   'Add variety to your routine with a new wellness activity.',
    };

    let prediction;

    try {
      const moodHistoryStr = recentInsights.map(i => `${i.detectedMood} (${i.confidence})`).join(', ');
      const aiResult = aiService.hasApiKey()
        ? await aiService.getMoodPrediction(moodHistoryStr)
        : null;

      if (aiResult && aiResult.predictedMood) {
        prediction = aiResult;
      } else {
        throw new Error('No AI result');
      }
    } catch {
      // Frequency-based fallback
      const moodCounts = {};
      recentInsights.forEach(i => { moodCounts[i.detectedMood] = (moodCounts[i.detectedMood] || 0) + 1; });
      const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
      const topMood = sortedMoods[0][0];
      const conf = parseFloat((sortedMoods[0][1] / recentInsights.length).toFixed(2));
      prediction = {
        predictedMood: topMood,
        confidence: conf,
        recommendation: REC_MAP[topMood] || 'Continue journaling and relaxation music.',
      };
    }

    return res.status(200).json(prediction);
  } catch (err) {
    console.error('[AI] getMoodPrediction error:', err.message);
    return res.status(500).json({ message: 'Mood prediction failed.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/analytics
// ─────────────────────────────────────────────────────────────────────────────
const getEmotionalAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const insights = await AIInsight.find({
      user: req.user._id,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 });

    // Mood frequency distribution
    const moodFrequency = {};
    insights.forEach(i => { moodFrequency[i.detectedMood] = (moodFrequency[i.detectedMood] || 0) + 1; });

    // Weekly mood score
    const weeklyData = {};
    insights.forEach(i => {
      const weekNum = Math.floor((new Date() - new Date(i.createdAt)) / (7 * 24 * 60 * 60 * 1000));
      const label = weekNum === 0 ? 'This Week' : weekNum === 1 ? 'Last Week' : `${weekNum}w ago`;
      if (!weeklyData[label]) weeklyData[label] = { total: 0, count: 0 };
      weeklyData[label].total += MOOD_SCORE[i.detectedMood] || 3;
      weeklyData[label].count += 1;
    });

    const weeklyTrend = Object.entries(weeklyData).reverse().map(([label, d]) => ({
      label,
      avgScore: parseFloat((d.total / d.count).toFixed(2)),
    }));

    // Daily mood trend (last 14 days)
    const dailyTrend = [];
    for (let d = 13; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayInsights = insights.filter(i => {
        const iDate = new Date(i.createdAt);
        return iDate.toDateString() === date.toDateString();
      });
      const avgScore = dayInsights.length > 0
        ? parseFloat((dayInsights.reduce((s, i) => s + (MOOD_SCORE[i.detectedMood] || 3), 0) / dayInsights.length).toFixed(2))
        : null;
      dailyTrend.push({ date: dateStr, score: avgScore, mood: dayInsights[0]?.detectedMood || null });
    }

    // Top recommended playlists
    const playlistUsage = {};
    insights.forEach(i => {
      if (i.recommendedPlaylist) {
        playlistUsage[i.recommendedPlaylist] = (playlistUsage[i.recommendedPlaylist] || 0) + 1;
      }
    });

    // Improvement score (compare last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const recentWeek  = insights.filter(i => new Date(i.createdAt) >= sevenDaysAgo);
    const previousWeek = insights.filter(i => new Date(i.createdAt) >= fourteenDaysAgo && new Date(i.createdAt) < sevenDaysAgo);

    const avgRecent   = recentWeek.length   ? recentWeek.reduce((s, i)   => s + (MOOD_SCORE[i.detectedMood] || 3), 0) / recentWeek.length   : 3;
    const avgPrevious = previousWeek.length ? previousWeek.reduce((s, i) => s + (MOOD_SCORE[i.detectedMood] || 3), 0) / previousWeek.length : 3;
    const improvementPct = previousWeek.length ? parseFloat((((avgRecent - avgPrevious) / avgPrevious) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      totalEntries: insights.length,
      moodFrequency,
      weeklyTrend,
      dailyTrend,
      playlistUsage,
      improvementScore: {
        recentAvg: parseFloat(avgRecent.toFixed(2)),
        previousAvg: parseFloat(avgPrevious.toFixed(2)),
        changePercent: improvementPct,
        isImproving: improvementPct >= 0,
      },
    });
  } catch (err) {
    console.error('[AI] getEmotionalAnalytics error:', err.message);
    return res.status(500).json({ message: 'Analytics fetch failed.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat
// Body: { message, history? }  OR  { messages: [{role, content}] }  (both supported)
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mindi, a calm, empathetic AI wellness companion designed to support users emotionally. Your responses should feel warm, understanding, and human-like.

Rules:
- Always acknowledge the user's feelings first.
- Respond directly to what the user said.
- Avoid generic motivational quotes unless relevant.
- Use supportive language, not clinical or robotic language.
- Keep responses short and conversational (2–4 sentences).
- Aim for ~80–120 words maximum.
- Offer small practical suggestions when appropriate (breathing, journaling, grounding, reflection).
- Ask gentle follow-up questions to continue the conversation.
- Never claim to be a therapist or medical professional.
- If a user expresses distress, validate feelings and encourage supportive coping steps.

Safety:
- If a user expresses severe distress (e.g., self-harm, suicide, abuse, immediate danger), respond with empathy and encourage them to seek real-world help immediately (trusted person, local emergency number, or crisis hotline).

Tone:
calm, supportive, empathetic, and friendly.`;

function detectSevereDistress(text = '') {
  const t = String(text).toLowerCase();
  const patterns = [
    'suicide', 'kill myself', 'end my life', 'self harm', 'self-harm', 'hurt myself',
    'want to die', "don't want to live", 'abuse', 'assault', 'rape',
    'overdose', 'cutting', 'cut myself', 'plan to', 'i have a plan',
    'immediate danger', 'in danger', 'cannot go on', "can't go on"
  ];
  return patterns.some(p => t.includes(p));
}

const SAFETY_REPLY = "I'm really sorry you're feeling this way, and I'm glad you told me. You deserve support right now. If you're in immediate danger or feel like you might hurt yourself, please call your local emergency number right now, or reach out to a trusted person who can stay with you. If you’re in the U.S., you can call or text 988 for the Suicide & Crisis Lifeline — if you’re elsewhere, I can help you look up a local crisis number. Are you safe right now?";

const CHAT_FALLBACKS = {
  overwhelm:  "I'm really glad you shared that. 💙 When things feel overwhelming, it can help to slow down for just a moment. Try taking three slow breaths with me — would you like a quick breathing exercise to ease things?",
  anxious:    "Anxiety can feel so heavy, and I hear you. 💙 Try this with me: inhale slowly for 4 counts, hold for 4, then exhale for 4. You're safe right now. What's weighing on your mind?",
  anxiet:     "Anxiety can feel so heavy, and I hear you. 💙 Try this with me: inhale slowly for 4 counts, hold for 4, then exhale for 4. You're safe right now. What's weighing on your mind?",
  sad:        "I hear you, and your feelings are completely valid. 💙 Sadness sometimes asks us to slow down and be gentle with ourselves. Would you like to talk a little more about what's bringing you down?",
  stress:     "Stress is often a sign that something really matters to you. Let's work through it together. Can you tell me what's feeling most urgent right now?",
  happy:      "That's really wonderful to hear! 🌟 Holding onto moments of joy is so important. What's been making you feel good today?",
  tired:      "Rest is not giving up — it's how we recharge. 💙 Is this tiredness more physical, emotional, or both? That'll help me suggest the best way to support you.",
  sleep:      "That sounds frustrating. Calming the mind before bed can make a real difference. You might try listening to soft rain sounds or a short breathing exercise. Would you like me to guide you through one?",
  motivat:    "You are more capable than you realise. 🌟 Every small step forward counts, even on the hard days. What's one tiny thing you could do right now that would feel like progress?",
  breath:     "Let's do this together. Inhale slowly through your nose for 4 counts… hold for 4 counts… now exhale gently through your mouth for 4 counts. Repeat this 3–4 times and notice how your body begins to relax. 💙",
  medit:      "Let's take a short moment together. 🌿 Close your eyes if you can. Take a slow breath in through your nose… and gently exhale through your mouth. With each breath, let your shoulders soften and your mind grow a little quieter.",
  music:      "Music can be such a powerful comfort. 🎵 I'd suggest opening the Music section in Mindful and trying the 'Soft Relaxation' or 'Night Rain & Calm' playlist — both are perfect for finding a moment of peace.",
  default:    "I'm here with you. 💙 Whatever you're feeling right now is completely valid. Can you tell me a little more about what's on your mind today?",
};

const chatWithTherapist = async (req, res) => {
  try {
    // Support both { message, history } and legacy { messages: [{role, content}] }
    let conversationMessages;

    if (req.body.message !== undefined) {
      const { message, history = [] } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'No message provided.' });
      }
      conversationMessages = [...history, { role: 'user', content: message }];
    } else if (Array.isArray(req.body.messages) && req.body.messages.length > 0) {
      conversationMessages = req.body.messages;
    } else {
      return res.status(400).json({ message: 'No messages provided.' });
    }

    const lastUserText = (conversationMessages[conversationMessages.length - 1]?.content || '').toString();

    // Safety handling for severe distress
    if (detectSevereDistress(lastUserText)) {
      return res.status(200).json({ reply: SAFETY_REPLY });
    }

    let reply;

    try {
      // Keep continuity: include the most recent N messages.
      // Add a small steering message to reduce repetition and keep it concise.
      const steeringMsg = {
        role: 'system',
        content: 'Maintain continuity with the conversation. Do not repeat the same coping suggestion if it was just given. Keep it to 2–4 sentences and stay under ~120 words.'
      };

      const aiReply = aiService.hasApiKey()
        ? await aiService.chatWithMindi([
            { role: 'system', content: SYSTEM_PROMPT },
            steeringMsg,
            ...conversationMessages.slice(-14),
          ])
        : null;
      reply = aiReply || null;
    } catch (aiErr) {
      console.warn('[AI] Chat OpenRouter failed, using fallback:', aiErr.message);
      reply = null;
    }

    // Keyword fallback when AI unavailable
    if (!reply) {
      const lastMsg = lastUserText.toLowerCase();
      let matched = false;
      for (const [key, resp] of Object.entries(CHAT_FALLBACKS)) {
        if (key !== 'default' && lastMsg.includes(key)) {
          reply = resp;
          matched = true;
          break;
        }
      }
      if (!matched) reply = CHAT_FALLBACKS.default;
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[AI] chatWithTherapist error:', err.message);
    return res.status(500).json({ message: 'Chat failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/insights  — fetch past insights for current user
// ─────────────────────────────────────────────────────────────────────────────
const getUserInsights = async (req, res) => {
  try {
    const insights = await AIInsight.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-journalText -__v');
    return res.status(200).json(insights);
  } catch (err) {
    console.error('[AI] getUserInsights error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch insights.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/health
// Diagnostic endpoint to check AI system status and API connectivity
// ─────────────────────────────────────────────────────────────────────────────
const healthCheck = async (req, res) => {
  try {
    const hasApiKey = aiService.hasApiKey();
    const apiKey = process.env.AI_API_KEY || '';
    const maskedKey = apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET';

    let apiStatus = 'unknown';
    let apiError = null;

    if (!hasApiKey) {
      apiStatus = 'not_configured';
      apiError = 'AI_API_KEY environment variable is not set';
    } else {
      try {
        // Try a simple test call with minimal message
        const testResult = await aiService.analyzeJournal('Test mood analysis');
        if (testResult && testResult.mood) {
          apiStatus = 'ok';
        } else {
          apiStatus = 'error_invalid_response';
          apiError = 'API returned invalid response structure';
        }
      } catch (testErr) {
        apiStatus = 'error_api_call';
        apiError = testErr.message || 'Unknown error during API test';
      }
    }

    return res.status(200).json({
      status: apiStatus,
      apiKeyConfigured: hasApiKey,
      apiKeyMasked: maskedKey,
      fallbackMode: apiStatus !== 'ok',
      message: apiStatus === 'ok'
        ? 'AI system is healthy and operational'
        : apiStatus === 'not_configured'
          ? 'AI system disabled: No API key configured. Using keyword-based fallback.'
          : `AI system error: ${apiError}. Using keyword-based fallback.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[AI] healthCheck error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: err.message,
    });
  }
};

module.exports = {
  analyzeJournal,
  generateSmartPlaylist,
  getDailySummary,
  getMoodPrediction,
  getEmotionalAnalytics,
  chatWithTherapist,
  getUserInsights,
  healthCheck,
};
