// questions.ts

export type Option = { text: string; score: number };

export type Dimension =
  | "sleep"
  | "stress"
  | "anxiety"
  | "focus"
  | "rumination"
  | "screen_time"
  | "nature"
  | "gratitude"
  | "mood"
  | "energy"
  | "meaning"
  | "time"; // time available right now

export const DIMENSIONS: Dimension[] = [
  "sleep",
  "stress",
  "anxiety",
  "focus",
  "rumination",
  "screen_time",
  "nature",
  "gratitude",
  "mood",
  "energy",
  "meaning",
  "time",
];

export type Activity =
  | "meditation"
  | "yoga"
  | "walking"
  | "no phone"
  | "puzzle"
  | "journaling"
  | "bubble popping"
  | "mindfulness video"
  | "square breathing"
  | "sleep tracker"
  | "mood journaling"
  | "gratitude journaling"
  | "book reading";

export type Question = {
  id: string;
  question: string;
  options: Option[]; // scores always 1..5
  invert?: boolean; // if true, higher option means you already do the healthy thing → invert score as (6 - score)
  weights: Partial<Record<Dimension, number>>; // how much this Q loads on each dimension
};

// Unified 5-option scale helpers
const OFTEN_SCALE: Option[] = [
  { text: "Rarely or never", score: 1 },
  { text: "Occasionally", score: 2 },
  { text: "Sometimes", score: 3 },
  { text: "Often", score: 4 },
  { text: "Always", score: 5 },
];

const SLEEP_QUALITY: Option[] = [
  { text: "Very well", score: 1 },
  { text: "Fairly well", score: 2 },
  { text: "Not too well", score: 3 },
  { text: "Poorly", score: 4 },
  { text: "Terribly", score: 5 },
];

const SLEEP_LATENCY: Option[] = [
  { text: "Under 15 minutes", score: 1 },
  { text: "15–30 minutes", score: 2 },
  { text: "30–45 minutes", score: 3 },
  { text: "45–60 minutes", score: 4 },
  { text: "Over an hour", score: 5 },
];

const TIME_NOW: Option[] = [
  { text: "~2 minutes", score: 1 },
  { text: "3–5 minutes", score: 2 },
  { text: "5–10 minutes", score: 3 },
  { text: "10–20 minutes", score: 4 },
  { text: "20+ minutes", score: 5 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Insightful question bank (20). Each loads different dimensions.
// For positive habits (gratitude, nature time, etc.) we set invert: true
// so lower frequency raises the "need" score.
// ─────────────────────────────────────────────────────────────────────────────
export const questionBank: Question[] = [
  {
    id: "sleep_quality",
    question: "How well do you sleep at night?",
    options: SLEEP_QUALITY,
    weights: { sleep: 1, energy: 0.5, mood: 0.3 },
  },
  {
    id: "sleep_latency",
    question: "How long does it usually take you to fall asleep?",
    options: SLEEP_LATENCY,
    weights: { sleep: 1 },
  },
  {
    id: "daytime_fatigue",
    question: "How often do you feel tired or fatigued during the day?",
    options: OFTEN_SCALE,
    weights: { energy: 1, sleep: 0.5 },
  },
  {
    id: "focus_drift",
    question: "How often do you struggle to focus or finish tasks?",
    options: OFTEN_SCALE,
    weights: { focus: 1, screen_time: 0.4, rumination: 0.3 },
  },
  {
    id: "mind_racing",
    question: "How often do you get stuck in looping thoughts or rumination?",
    options: OFTEN_SCALE,
    weights: { rumination: 1, anxiety: 0.4, mood: 0.3 },
  },
  {
    id: "on_edge",
    question: "How often do you feel on edge, restless, or panicky?",
    options: OFTEN_SCALE,
    weights: { anxiety: 1, stress: 0.5 },
  },
  {
    id: "body_tension",
    question:
      "How often do you notice physical tension or short, shallow breathing?",
    options: OFTEN_SCALE,
    weights: { anxiety: 0.8, stress: 0.6 },
  },
  {
    id: "screens_before_bed",
    question:
      "How often are you on your phone or screens in the hour before bed?",
    options: OFTEN_SCALE,
    weights: { screen_time: 1, sleep: 0.4 },
  },
  {
    id: "nature_time",
    question: "How frequently do you spend time outdoors or in nature?",
    options: OFTEN_SCALE,
    invert: true, // less nature → higher need
    weights: { nature: 1, mood: 0.3, energy: 0.3 },
  },
  {
    id: "gratitude_practice",
    question:
      "How often do you write about or reflect on what you're grateful for?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { gratitude: 1, mood: 0.4, meaning: 0.4 },
  },
  {
    id: "mood_checkins",
    question: "How often do you pause to name your feelings during the day?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { mood: 1, rumination: 0.3 },
  },
  {
    id: "meaning_progress",
    question:
      "How often do you feel you’re moving toward goals that matter to you?",
    options: OFTEN_SCALE,
    invert: true, // less progress → higher need
    weights: { meaning: 1, mood: 0.3 },
  },
  {
    id: "social_disconnection",
    question:
      "How often do you feel disconnected from people or the present moment?",
    options: OFTEN_SCALE,
    weights: { rumination: 0.6, mood: 0.6, anxiety: 0.3 },
  },
  {
    id: "activation_energy",
    question: "Right now, how willing does your body feel to move?",
    options: [
      { text: "Not at all—prefer stillness", score: 1 },
      { text: "Low", score: 2 },
      { text: "Neutral", score: 3 },
      { text: "Somewhat willing", score: 4 },
      { text: "Very willing to move", score: 5 },
    ],
    weights: { energy: 1 },
  },
  {
    id: "time_available",
    question: "How much time can you spare right now?",
    options: TIME_NOW,
    weights: { time: 1 }, // used later to time-fit the activity
  },
  {
    id: "screen_breaks",
    question: "How often do you take intentional breaks from your phone?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { screen_time: 1, focus: 0.4, sleep: 0.3 },
  },
  {
    id: "calming_sounds",
    question: "How often do you use music or calming sounds to help your mood?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { mood: 0.6, anxiety: 0.3 },
  },
  {
    id: "reading_refocus",
    question: "When you need to unwind, how often does quiet reading help?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { mood: 0.4, focus: 0.6 },
  },
  {
    id: "breath_awareness",
    question: "How often do you notice your breath deepen when stressed?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { anxiety: 0.8, stress: 0.6 },
  },
  {
    id: "present_moment",
    question:
      "How often do you feel grounded in the present moment during the day?",
    options: OFTEN_SCALE,
    invert: true,
    weights: { rumination: 0.6, mood: 0.6 },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Session picking: randomly select 7–10 questions (no repeats).
// ─────────────────────────────────────────────────────────────────────────────
export function pickQuestions(
  min = 7,
  max = 10,
  bank: Question[] = questionBank
): Question[] {
  const count = Math.max(
    min,
    Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min)
  );
  const pool = [...bank];
  // Fisher–Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity model: map dimensions → activities (weights are tunable)
// ─────────────────────────────────────────────────────────────────────────────
export const activityWeights: Record<
  Activity,
  Partial<Record<Dimension, number>>
> = {
  "square breathing": { anxiety: 1, stress: 0.6, sleep: 0.3 },
  meditation: { rumination: 0.8, anxiety: 0.6, stress: 0.5, mood: 0.4 },
  "mindfulness video": { rumination: 0.5, mood: 0.4, stress: 0.3 },
  yoga: { energy: 0.7, stress: 0.5, anxiety: 0.4 },
  walking: { nature: 0.8, mood: 0.5, energy: 0.4 },
  "no phone": { screen_time: 1, focus: 0.6, sleep: 0.3 },
  puzzle: { focus: 0.7, rumination: 0.3 },
  "mood journaling": { mood: 0.9, rumination: 0.4 },
  "gratitude journaling": { gratitude: 1, mood: 0.4, meaning: 0.4 },
  "sleep tracker": { sleep: 1, screen_time: 0.3, anxiety: 0.2 },
  "book reading": { screen_time: 0.6, focus: 0.5, mood: 0.3 },
  "bubble popping": { anxiety: 0.3, stress: 0.2 },
  journaling: { meaning: 0.6, mood: 0.5, rumination: 0.4 }, // general journaling
};

// How much time activities typically ask for (coarse buckets 1..5)
export const activityTimeNeed: Record<Activity, number> = {
  "square breathing": 1,
  "mindfulness video": 2,
  "bubble popping": 1,
  "mood journaling": 2,
  "gratitude journaling": 2,
  journaling: 3,
  meditation: 3,
  yoga: 4,
  walking: 4,
  "book reading": 3,
  "sleep tracker": 2,
  "no phone": 2,
  puzzle: 2,
};

// Compute recommendation from responses.
export function gradeResponses(
  questions: Question[],
  selected: string[],
  lastGoal?: Activity
) {
  // 1) Aggregate dimension means (1..5 scale)
  const totals: Partial<Record<Dimension, number>> = {};
  const weights: Partial<Record<Dimension, number>> = {};

  questions.forEach((q, idx) => {
    const answerText = selected[idx];
    if (!answerText) return;
    const opt = q.options.find((o) => o.text === answerText);
    if (!opt) return;

    const raw = opt.score; // 1..5
    const score = q.invert ? 6 - raw : raw; // 1..5 need

    Object.entries(q.weights).forEach(([dim, w]) => {
      const d = dim as Dimension;
      totals[d] = (totals[d] ?? 0) + score * (w as number);
      weights[d] = (weights[d] ?? 0) + (w as number);
    });
  });

  const dimensionMeans = Object.fromEntries(
    DIMENSIONS.map((d) => [d, 0])
  ) as Record<Dimension, number>;
  for (const d of DIMENSIONS) {
    const t = totals[d] ?? 0;
    const w = weights[d] ?? 0;
    dimensionMeans[d] = w ? t / w : 0;
  }

  // Extract time available if present (1..5)
  const timeAvailable = dimensionMeans.time || 3;

  // 2) Map to activities via dot product weights
  const activityScores = Object.fromEntries(
    (Object.keys(activityWeights) as Activity[]).map((a) => [a, 0])
  ) as Record<Activity, number>;
  (Object.keys(activityWeights) as Activity[]).forEach((a) => {
    const w = activityWeights[a];
    let s = 0;
    Object.entries(w).forEach(([dim, weight]) => {
      s += (dimensionMeans[dim as Dimension] || 0) * (weight as number);
    });

    // 2a) Time fit penalty/boost
    const need = activityTimeNeed[a] || 2;
    // If you have less time than the activity needs, apply a 20–35% penalty
    if (timeAvailable < need) {
      const gap = need - timeAvailable; // 1..3
      s *= 1 - Math.min(0.35, 0.15 + 0.1 * gap);
    } else if (timeAvailable >= need + 1) {
      // slight boost if you have extra time (encourage deeper work)
      s *= 1.08;
    }

    activityScores[a] = s;
  });

  // 3) Diversity: cool-down last goal so we don’t recommend it over and over
  if (lastGoal && activityScores[lastGoal] !== undefined) {
    activityScores[lastGoal] *= 0.88; // ~12% penalty
  }

  // 4) Sort and return top activities
  const sorted = (Object.keys(activityScores) as Activity[]).sort(
    (a, b) => activityScores[b] - activityScores[a]
  );

  return {
    dimensionMeans,
    activityScores,
    top3: sorted.slice(0, 3),
    top: sorted[0],
  };
}
