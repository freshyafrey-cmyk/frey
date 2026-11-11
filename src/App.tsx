import React, { useState, useEffect } from 'react';
import { UserProfile, LanguageCode, LearningLevel } from './types';
import { getStoredUserProfile, saveStoredUserProfile, DEFAULT_USER } from './utils/storage';
import { playSound } from './utils/audio';
import { Navbar } from './components/layout/Navbar';
import { HomeDashboard } from './components/home/HomeDashboard';
import { LearnHub } from './components/learn/LearnHub';
import { PracticeHub } from './components/practice/PracticeHub';
import { ProgressHub } from './components/progress/ProgressHub';
import { ProfileHub } from './components/profile/ProfileHub';
import { QuizModal } from './components/quiz/QuizModal';
import { CelebrationModal } from './components/common/CelebrationModal';
import { StreakModal } from './components/home/StreakModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => getStoredUserProfile());
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Deep linking into Learn subtabs
  const [learnSubTab, setLearnSubTab] = useState<'path' | 'listening' | 'reading' | 'grammar'>('path');
  const [learnInitialItemId, setLearnInitialItemId] = useState<string | undefined>(undefined);

  // Modals state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!user.onboardingComplete);

  // Celebration state
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    xpEarned: number;
    streakDays?: number;
    badgeUnlocked?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    xpEarned: 0,
  });

  // Sync state changes to storage
  useEffect(() => {
    saveStoredUserProfile(user);
  }, [user]);

  // Tab switching
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Language Switch
  const handleLanguageChange = (lang: LanguageCode) => {
    setUser((prev) => {
      const languages = prev.learningLanguages.includes(lang)
        ? prev.learningLanguages
        : [...prev.learningLanguages, lang];
      return {
        ...prev,
        currentLanguage: lang,
        learningLanguages: languages,
      };
    });
  };

  // Sound toggle
  const handleToggleSound = () => {
    setUser((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // Streak freeze toggle / refill
  const handleToggleStreakFreeze = () => {
    setUser((prev) => ({
      ...prev,
      streakFreezeCount: prev.streakFreezeCount + 1,
    }));
    playSound('correct');
  };

  // Complete lesson / exercise
  const handleCompleteLesson = (lessonId: string, xpEarned: number) => {
    setUser((prev) => {
      const isAlreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const updatedCompleted = isAlreadyCompleted
        ? prev.completedLessonIds
        : [...prev.completedLessonIds, lessonId];

      const newXp = prev.xp + xpEarned;
      const newMinutes = prev.minutesSpentToday + 3;

      return {
        ...prev,
        xp: newXp,
        minutesSpentToday: newMinutes,
        lessonsCompletedCount: prev.lessonsCompletedCount + (isAlreadyCompleted ? 0 : 1),
        completedLessonIds: updatedCompleted,
      };
    });

    setCelebration({
      isOpen: true,
      title: 'Lesson Completed!',
      message: 'Magnificent work. Your memory pathways are strengthening with every phrase.',
      xpEarned,
      streakDays: user.streak,
    });
  };

  // Save / Bookmark Word
  const handleSaveWord = (wordId: string) => {
    setUser((prev) => {
      const exists = prev.savedVocabIds.includes(wordId);
      const updated = exists
        ? prev.savedVocabIds.filter((id) => id !== wordId)
        : [...prev.savedVocabIds, wordId];
      return {
        ...prev,
        savedVocabIds: updated,
      };
    });
  };

  // Mark word as mastered
  const handleMasterWord = (wordId: string) => {
    setUser((prev) => {
      const exists = prev.masteredVocabIds.includes(wordId);
      const updated = exists
        ? prev.masteredVocabIds.filter((id) => id !== wordId)
        : [...prev.masteredVocabIds, wordId];
      return {
        ...prev,
        masteredVocabIds: updated,
        wordsLearnedCount: prev.wordsLearnedCount + (exists ? 0 : 1),
      };
    });
  };

  // Complete Daily Workout
  const handleCompleteDailyWorkout = (xpEarned: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      minutesSpentToday: prev.minutesSpentToday + 5,
    }));

    setCelebration({
      isOpen: true,
      title: 'Daily Workout Mastered! ✨',
      message: 'You crushed today’s vocabulary, phrases, and grammar exercises!',
      xpEarned,
      streakDays: user.streak,
    });
  };

  // Quiz completion
  const handleCompleteQuiz = (scorePercent: number, xpEarned: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      quizzesTakenCount: prev.quizzesTakenCount + 1,
      quizzesCorrectCount: prev.quizzesCorrectCount + (scorePercent >= 70 ? 1 : 0),
      minutesSpentToday: prev.minutesSpentToday + 4,
    }));

    setCelebration({
      isOpen: true,
      title: scorePercent >= 80 ? 'Exceptional Score! 🏆' : 'Quiz Completed! 🧠',
      message: `You achieved ${scorePercent}% accuracy on this quiz challenge.`,
      xpEarned,
      streakDays: user.streak,
      badgeUnlocked: scorePercent === 100 ? 'Perfect Scholar' : undefined,
    });
  };

  // Claim achievement
  const handleClaimAchievement = (achId: string, rewardXp: number) => {
    setUser((prev) => {
      if (prev.claimedAchievementIds.includes(achId)) return prev;
      return {
        ...prev,
        xp: prev.xp + rewardXp,
        claimedAchievementIds: [...prev.claimedAchievementIds, achId],
      };
    });

    setCelebration({
      isOpen: true,
      title: 'Achievement Unlocked! 🎖️',
      message: 'You have earned a milestone trophy for your dedication.',
      xpEarned: rewardXp,
      badgeUnlocked: achId.replace('-', ' ').toUpperCase(),
    });
  };

  // Reset Progress
  const handleResetProgress = () => {
    const freshUser: UserProfile = {
      ...DEFAULT_USER,
      xp: 0,
      streak: 1,
      minutesSpentToday: 0,
      wordsLearnedCount: 0,
      lessonsCompletedCount: 0,
      quizzesTakenCount: 0,
      quizzesCorrectCount: 0,
      savedVocabIds: [],
      masteredVocabIds: [],
      completedLessonIds: [],
      claimedAchievementIds: [],
      onboardingComplete: false,
    };
    setUser(freshUser);
    setIsOnboardingOpen(true);
    setCurrentTab('home');
  };

  // Complete Onboarding
  const handleCompleteOnboarding = (preferences: {
    nativeLanguage: string;
    currentLanguage: LanguageCode;
    level: LearningLevel;
    targetMinutes: 5 | 10 | 15 | 30;
  }) => {
    setUser((prev) => ({
      ...prev,
      ...preferences,
      onboardingComplete: true,
      learningLanguages: prev.learningLanguages.includes(preferences.currentLanguage)
        ? prev.learningLanguages
        : [...prev.learningLanguages, preferences.currentLanguage],
    }));
    setIsOnboardingOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col selection:bg-rose-200 selection:text-rose-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
        onLanguageChange={handleLanguageChange}
        onToggleSound={handleToggleSound}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'home' && (
          <HomeDashboard
            user={user}
            onNavigateTab={handleTabChange}
            onStartQuiz={() => setIsQuizOpen(true)}
            onStartListening={(lessonId) => {
              setLearnSubTab('listening');
              setLearnInitialItemId(lessonId);
              setCurrentTab('learn');
            }}
            onStartReading={(storyId) => {
              setLearnSubTab('reading');
              setLearnInitialItemId(storyId);
              setCurrentTab('learn');
            }}
            onStartDailyPractice={() => {
              setCurrentTab('practice');
            }}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
          />
        )}

        {currentTab === 'learn' && (
          <LearnHub
            user={user}
            initialSubTab={learnSubTab}
            initialItemId={learnInitialItemId}
            onCompleteLesson={handleCompleteLesson}
            onSaveWord={handleSaveWord}
            onStartQuiz={() => setIsQuizOpen(true)}
          />
        )}

        {currentTab === 'practice' && (
          <PracticeHub
            user={user}
            onSaveWord={handleSaveWord}
            onMasterWord={handleMasterWord}
            onCompleteDailyWorkout={handleCompleteDailyWorkout}
            onStartQuiz={() => setIsQuizOpen(true)}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressHub
            user={user}
            onClaimAchievement={handleClaimAchievement}
            onToggleStreakFreeze={handleToggleStreakFreeze}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileHub
            user={user}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        language={user.currentLanguage}
        user={user}
        onCompleteQuiz={handleCompleteQuiz}
      />

      {/* Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        user={user}
        onToggleStreakFreeze={handleToggleStreakFreeze}
      />

      {/* Onboarding Wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
        initialLanguage={user.currentLanguage}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={() => setCelebration((prev) => ({ ...prev, isOpen: false }))}
        title={celebration.title}
        message={celebration.message}
        xpEarned={celebration.xpEarned}
        streakDays={celebration.streakDays}
        badgeUnlocked={celebration.badgeUnlocked}
      />
    </div>
  );
}
