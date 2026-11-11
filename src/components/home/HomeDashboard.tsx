import React from 'react';
import { UserProfile } from '../../types';
import { LANGUAGES } from '../../data/languages';
import { calculateLevel, calculateDailyGoalProgress } from '../../utils/gamification';
import { playSound } from '../../utils/audio';
import {
  Flame,
  Zap,
  Target,
  Sparkles,
  BookOpen,
  Headphones,
  Brain,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { DAILY_MISSIONS, LISTENING_LESSONS, READING_STORIES } from '../../data/curriculum';

interface HomeDashboardProps {
  user: UserProfile;
  onNavigateTab: (tab: string) => void;
  onStartQuiz: () => void;
  onStartListening: (lessonId?: string) => void;
  onStartReading: (storyId?: string) => void;
  onStartDailyPractice: () => void;
  onOpenStreakModal: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  onNavigateTab,
  onStartQuiz,
  onStartListening,
  onStartReading,
  onStartDailyPractice,
  onOpenStreakModal,
}) => {
  const currentLang = LANGUAGES[user.currentLanguage];
  const levelInfo = calculateLevel(user.xp);
  const dailyGoal = calculateDailyGoalProgress(user.minutesSpentToday, user.targetMinutes);

  // Filter recommendations for current language
  const recommendedListening = LISTENING_LESSONS.find((l) => l.language === user.currentLanguage) || LISTENING_LESSONS[0];
  const recommendedReading = READING_STORIES.find((r) => r.language === user.currentLanguage) || READING_STORIES[0];

  // Week days tracker (last 7 days)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Greeting & Language Header */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50/50 to-sky-50 rounded-3xl p-6 sm:p-8 border border-rose-100/80 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-rose-200/60 text-xs font-semibold text-rose-600 shadow-2xs">
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span>Learning {currentLang.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-normal">{currentLang.greeting}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hey {user.name}, ready to learn today?
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              {currentLang.tagline}. Complete your daily goal in {dailyGoal.minutesRemaining} more minutes to protect your {user.streak}-day streak!
            </p>
          </div>

          {/* Quick CTA to start daily practice */}
          <button
            onClick={() => {
              playSound('click');
              onStartDailyPractice();
            }}
            className="self-start md:self-center shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Start Daily Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gamification Stats Row: Streak, Daily Goal, XP & Level */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Streak & Calendar */}
        <div
          onClick={onOpenStreakModal}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</span>
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
              {user.streak} Days 🔥
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 tabular-nums mb-3">
            {user.streak} <span className="text-xs font-medium text-slate-500">consecutive days</span>
          </div>

          {/* Mini 7-day strip */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100">
            {daysOfWeek.map((day, idx) => {
              const isPastOrToday = idx <= todayIndex;
              const isToday = idx === todayIndex;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-medium ${isToday ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {day[0]}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isPastOrToday
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPastOrToday ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Daily Goal */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Goal</span>
            </div>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/60">
              {user.minutesSpentToday} / {user.targetMinutes} mins
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 tabular-nums mb-2">
            {dailyGoal.progressPercent}% <span className="text-xs font-medium text-slate-500">completed</span>
          </div>

          {/* Goal progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${dailyGoal.progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {dailyGoal.isCompleted ? (
              <span className="text-emerald-600 font-medium">Daily goal achieved today! 🎉</span>
            ) : (
              <span>{dailyGoal.minutesRemaining} minutes remaining today</span>
            )}
          </p>
        </div>

        {/* Card 3: Level & XP Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Zap className="w-5 h-5 fill-rose-500" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level {levelInfo.level}</span>
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/60">
              {levelInfo.levelTitle}
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 tabular-nums mb-2">
            {user.xp} <span className="text-xs font-medium text-slate-500">total XP</span>
          </div>

          {/* Level progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-500">
            {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP to Level {levelInfo.level + 1}
          </p>
        </div>
      </div>

      {/* Featured Learning Adventure Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-900 text-white min-h-[220px] flex flex-col justify-end p-6 sm:p-8">
        <img
          src="/src/assets/images/language_culture_landmarks_1794365987665.jpg"
          alt="Explore Worlds with Frey"
          className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-500/90 text-white text-[11px] font-bold uppercase tracking-wider">
            Explore Culture & Story
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Continue Learning: {recommendedReading.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
            Dive into an authentic bilingual story with clickable audio vocabulary and instant translation.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                playSound('click');
                onStartReading(recommendedReading.id);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
            >
              <BookOpen className="w-4 h-4 text-rose-500" />
              <span>Read Story</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                onStartListening(recommendedListening.id);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Headphones className="w-4 h-4 text-sky-300" />
              <span>Listen ({recommendedListening.durationSeconds}s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Learning Modules Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Learning Hub</h2>
          <button
            onClick={() => onNavigateTab('learn')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Listening */}
          <button
            onClick={() => onStartListening()}
            className="text-left bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 rounded-3xl border border-sky-100 shadow-xs hover:shadow-md hover:border-sky-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Listening</h3>
            <p className="text-xs text-slate-500">Audio dialogues with speed controls & quizzes</p>
          </button>

          {/* Reading */}
          <button
            onClick={() => onStartReading()}
            className="text-left bg-gradient-to-br from-rose-50 to-white p-4 sm:p-5 rounded-3xl border border-rose-100 shadow-xs hover:shadow-md hover:border-rose-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Reading</h3>
            <p className="text-xs text-slate-500">Short stories with tap-to-translate keywords</p>
          </button>

          {/* Quiz Arena */}
          <button
            onClick={() => onStartQuiz()}
            className="text-left bg-gradient-to-br from-purple-50 to-white p-4 sm:p-5 rounded-3xl border border-purple-100 shadow-xs hover:shadow-md hover:border-purple-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Quiz Arena</h3>
            <p className="text-xs text-slate-500">Matching, unscramble, multiple choice, & pictures</p>
          </button>

          {/* Daily Practice */}
          <button
            onClick={() => onStartDailyPractice()}
            className="text-left bg-gradient-to-br from-amber-50 to-white p-4 sm:p-5 rounded-3xl border border-amber-100 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Daily Practice</h3>
            <p className="text-xs text-slate-500">5 words, 3 phrases, 1 grammar tip & mini test</p>
          </button>
        </div>
      </div>

      {/* Daily Missions & Challenges Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Missions */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              <span>Today's Missions</span>
            </h2>
            <span className="text-xs text-slate-400">Resets in 5 hrs</span>
          </div>

          <div className="space-y-3">
            {DAILY_MISSIONS.map((mission) => {
              const isDone = mission.currentCount >= mission.targetCount;
              return (
                <div
                  key={mission.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/40 border border-slate-100 transition-colors"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-slate-800">{mission.title}</div>
                    <div className="text-[11px] text-slate-500">{mission.description}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-100 shadow-2xs">
                      +{mission.rewardXp} XP
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 tabular-nums">
                        {mission.currentCount}/{mission.targetCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Challenge Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              Weekly Challenge
            </div>
            <h3 className="text-lg font-bold">Polyglot Word Sprint</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Master 20 words across French, German, and Indonesian to earn the exclusive Gold Compass badge!
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-400/40 flex items-center justify-between">
            <div className="text-xs text-emerald-100">
              <span className="font-bold text-white text-sm">{user.masteredVocabIds.length}</span> / 20 Words Mastered
            </div>
            <button
              onClick={() => onNavigateTab('practice')}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
            >
              Open Vocab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
