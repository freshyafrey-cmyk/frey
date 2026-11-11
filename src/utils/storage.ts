import { UserProfile, LanguageCode } from '../types';
import { checkStreakStatus } from './gamification';

const STORAGE_KEY = 'frey_user_profile_v2';

export const DEFAULT_USER: UserProfile = {
  id: 'user-frey-01',
  name: 'Alex Rivera',
  email: 'freshyafrey@gmail.com',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FreyExplorer',
  nativeLanguage: 'English',
  currentLanguage: 'fr',
  learningLanguages: ['fr', 'de', 'id'],
  level: 'beginner',
  targetMinutes: 15,
  xp: 320,
  streak: 5,
  longestStreak: 8,
  streakFreezeCount: 1,
  lastActiveDate: '2026-11-10',
  historyDates: ['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'],
  minutesSpentToday: 8,
  wordsLearnedCount: 12,
  lessonsCompletedCount: 4,
  quizzesTakenCount: 6,
  quizzesCorrectCount: 5,
  soundEnabled: true,
  dailyReminderEnabled: true,
  dailyReminderTime: '19:30',
  onboardingComplete: true, // Default to true so app is ready, but user can re-trigger anytime
  savedVocabIds: ['fr-1', 'fr-2', 'de-1', 'id-1'],
  masteredVocabIds: ['fr-1', 'de-2'],
  completedLessonIds: ['listen-fr-1', 'gram-fr-1'],
  claimedAchievementIds: ['first-step'],
};

export function getStoredUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;

  // Check URL parameters: ?autostart=1 or ?onboarding=1
  const searchParams = new URLSearchParams(window.location.search);
  const autostart = searchParams.get('autostart') === '1';
  const showOnboarding = searchParams.get('onboarding') === '1';

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = { ...DEFAULT_USER };
      if (showOnboarding) {
        initial.onboardingComplete = false;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed: UserProfile = JSON.parse(raw);
    if (autostart) {
      parsed.onboardingComplete = true;
    } else if (showOnboarding) {
      parsed.onboardingComplete = false;
    }

    // Check streak against today's date
    const today = new Date().toISOString().split('T')[0];
    const streakCheck = checkStreakStatus(
      parsed.streak,
      parsed.lastActiveDate,
      today,
      parsed.streakFreezeCount
    );

    if (streakCheck.streakFrozen) {
      parsed.streakFreezeCount = streakCheck.freezesRemaining;
      parsed.streak = streakCheck.newStreak;
      parsed.lastActiveDate = today;
      if (!parsed.historyDates.includes(today)) {
        parsed.historyDates.push(today);
      }
      saveStoredUserProfile(parsed);
    }

    return parsed;
  } catch {
    return DEFAULT_USER;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage quota or privacy mode handling
  }
}

export function updateUserProfile(updater: (prev: UserProfile) => UserProfile): UserProfile {
  const current = getStoredUserProfile();
  const updated = updater(current);
  saveStoredUserProfile(updated);
  return updated;
}
