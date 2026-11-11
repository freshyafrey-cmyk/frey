// Pure business logic and gamification calculations for FREY

export interface LevelInfo {
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const LEVEL_TITLES = [
  'Explorer Novice',
  'Curious Wanderer',
  'Word Pathfinder',
  'Language Voyager',
  'Phrase Pioneer',
  'Fluent Nomad',
  'Grammar Cartographer',
  'Dialect Captain',
  'Polyglot Master',
  'Grand Ambassador',
];

/**
 * Calculates level based on XP (each level requires 150 * level XP)
 */
export function calculateLevel(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let accumulatedXp = 0;
  let nextThreshold = 150;

  while (safeXp >= accumulatedXp + nextThreshold) {
    accumulatedXp += nextThreshold;
    level += 1;
    nextThreshold = 150 + (level - 1) * 75; // progressive curve
  }

  const currentLevelXp = safeXp - accumulatedXp;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextThreshold) * 100));
  const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);

  return {
    level,
    levelTitle: LEVEL_TITLES[titleIndex],
    currentXp: currentLevelXp,
    nextLevelXp: nextThreshold,
    progressPercent,
  };
}

/**
 * Calculates XP earned from a lesson or quiz with accuracy and streak bonus
 */
export function calculateLessonXp(
  baseXp: number,
  accuracyRatio: number,
  hasActiveStreak: boolean
): number {
  const clampedAccuracy = Math.max(0, Math.min(1, accuracyRatio));
  const accuracyBonus = Math.round(baseXp * clampedAccuracy);
  const streakBonus = hasActiveStreak ? 5 : 0;
  const perfectBonus = clampedAccuracy === 1.0 ? 10 : 0;

  return Math.max(5, accuracyBonus + streakBonus + perfectBonus);
}

/**
 * Calculates days difference between two YYYY-MM-DD date strings
 */
export function getDaysDifference(dateStrA: string, dateStrB: string): number {
  if (!dateStrA || !dateStrB) return 999;
  const dateA = new Date(dateStrA + 'T00:00:00Z');
  const dateB = new Date(dateStrB + 'T00:00:00Z');
  const diffTime = Math.abs(dateB.getTime() - dateA.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates streak status based on last active date and today's date
 */
export function checkStreakStatus(
  currentStreak: number,
  lastActiveDate: string,
  todayDate: string,
  availableFreezes: number
): {
  newStreak: number;
  streakFrozen: boolean;
  freezesRemaining: number;
  alreadyCompletedToday: boolean;
} {
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      streakFrozen: false,
      freezesRemaining: availableFreezes,
      alreadyCompletedToday: false,
    };
  }

  if (lastActiveDate === todayDate) {
    return {
      newStreak: Math.max(1, currentStreak),
      streakFrozen: false,
      freezesRemaining: availableFreezes,
      alreadyCompletedToday: true,
    };
  }

  const daysDiff = getDaysDifference(lastActiveDate, todayDate);

  if (daysDiff === 1) {
    // Consecutive day
    return {
      newStreak: currentStreak + 1,
      streakFrozen: false,
      freezesRemaining: availableFreezes,
      alreadyCompletedToday: false,
    };
  } else if (daysDiff === 2 && availableFreezes > 0) {
    // Missed 1 day but has a streak freeze!
    return {
      newStreak: currentStreak + 1,
      streakFrozen: true,
      freezesRemaining: availableFreezes - 1,
      alreadyCompletedToday: false,
    };
  } else {
    // Streak reset to 1
    return {
      newStreak: 1,
      streakFrozen: false,
      freezesRemaining: availableFreezes,
      alreadyCompletedToday: false,
    };
  }
}

/**
 * Calculates daily goal progress percentage and completion status
 */
export function calculateDailyGoalProgress(
  minutesSpent: number,
  targetMinutes: number
): {
  progressPercent: number;
  isCompleted: boolean;
  minutesRemaining: number;
} {
  const safeSpent = Math.max(0, minutesSpent);
  const safeTarget = Math.max(1, targetMinutes);
  const progressPercent = Math.min(100, Math.round((safeSpent / safeTarget) * 100));
  const isCompleted = safeSpent >= safeTarget;
  const minutesRemaining = Math.max(0, safeTarget - safeSpent);

  return {
    progressPercent,
    isCompleted,
    minutesRemaining,
  };
}

/**
 * Evaluates spaced repetition interval for vocabulary flashcards
 */
export function getNextSpacedRepetitionInterval(currentIntervalDays: number, remembered: boolean): number {
  if (!remembered) {
    return 1; // Reset to 1 day if forgotten
  }
  if (currentIntervalDays <= 1) {
    return 3;
  }
  if (currentIntervalDays <= 3) {
    return 7;
  }
  if (currentIntervalDays <= 7) {
    return 14;
  }
  return Math.min(60, Math.round(currentIntervalDays * 2.2));
}
