import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { ACHIEVEMENTS_LIST } from '../../data/curriculum';
import { LANGUAGES } from '../../data/languages';
import { playSound } from '../../utils/audio';
import {
  TrendingUp,
  Flame,
  Award,
  Clock,
  BookOpen,
  Zap,
  Target,
  Shield,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ProgressHubProps {
  user: UserProfile;
  onClaimAchievement: (achievementId: string, rewardXp: number) => void;
  onToggleStreakFreeze: () => void;
}

export const ProgressHub: React.FC<ProgressHubProps> = ({
  user,
  onClaimAchievement,
  onToggleStreakFreeze,
}) => {
  const [selectedDayTooltip, setSelectedDayTooltip] = useState<number | null>(null);

  // Weekly study data
  const weeklyData = [
    { day: 'Mon', minutes: 12, date: 'Nov 4' },
    { day: 'Tue', minutes: 18, date: 'Nov 5' },
    { day: 'Wed', minutes: 15, date: 'Nov 6' },
    { day: 'Thu', minutes: 22, date: 'Nov 7' },
    { day: 'Fri', minutes: 14, date: 'Nov 8' },
    { day: 'Sat', minutes: 25, date: 'Nov 9' },
    { day: 'Sun', minutes: user.minutesSpentToday || 16, date: 'Nov 10' },
  ];

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 30);
  const totalWeeklyMinutes = weeklyData.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgMinutes = Math.round(totalWeeklyMinutes / 7);

  // Accuracy calculation
  const accuracyPercent =
    user.quizzesTakenCount > 0
      ? Math.round((user.quizzesCorrectCount / user.quizzesTakenCount) * 100)
      : 88;

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Growth & Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Learning Progress & Milestones
          </h1>
        </div>

        {/* Streak Freeze Status Banner */}
        <div className="flex items-center gap-3 p-2 bg-amber-50 border border-amber-200/60 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900">
              {user.streak}-Day Streak Active
            </div>
            <div className="text-[11px] text-amber-700">
              {user.streakFreezeCount} Freeze Shield Available
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onToggleStreakFreeze();
            }}
            className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-[11px] font-bold text-amber-800 hover:bg-amber-100/50 transition-colors shadow-2xs"
          >
            {user.streakFreezeCount > 0 ? '+ Add Shield' : 'Refill Shield'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-500">
            <Zap className="w-5 h-5 fill-rose-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total XP</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{user.xp}</div>
          <div className="text-xs text-slate-500">Level {Math.floor(user.xp / 150) + 1} Pioneer</div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Longest Streak</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {user.longestStreak} <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <div className="text-xs text-slate-500">{user.streak} days current</div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-sky-500">
            <BookOpen className="w-5 h-5" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Words Learned</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {user.wordsLearnedCount}
          </div>
          <div className="text-xs text-slate-500">{user.masteredVocabIds.length} fully mastered</div>
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-500">
            <Target className="w-5 h-5" />
            <span className="text-[11px] font-bold text-slate-400 uppercase">Quiz Accuracy</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{accuracyPercent}%</div>
          <div className="text-xs text-slate-500">{user.quizzesTakenCount} quizzes taken</div>
        </div>
      </div>

      {/* Interactive Weekly Study Time Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Weekly Study Activity</h2>
            <p className="text-xs text-slate-500">Minutes practiced per day this week</p>
          </div>
          <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            Weekly total: <span className="text-slate-900 font-bold">{totalWeeklyMinutes} mins</span> · Avg: <span className="text-slate-900 font-bold">{avgMinutes} min/day</span>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="relative pt-6 pb-2">
          <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-44 border-b border-slate-100 pb-2">
            {weeklyData.map((d, index) => {
              const heightPercent = Math.round((d.minutes / maxMinutes) * 100);
              const isToday = index === 6;

              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setSelectedDayTooltip(index)}
                  onMouseLeave={() => setSelectedDayTooltip(null)}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  {/* Tooltip */}
                  {selectedDayTooltip === index && (
                    <div className="absolute -top-3 bg-slate-900 text-white text-[11px] px-2 py-1 rounded-lg shadow-md whitespace-nowrap animate-scaleUp z-20">
                      {d.date}: {d.minutes} minutes
                    </div>
                  )}

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-2xl h-36 flex items-end overflow-hidden p-1">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-rose-500 to-amber-500'
                          : 'bg-gradient-to-t from-sky-400 to-indigo-400 group-hover:from-sky-500 group-hover:to-indigo-500'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className={`text-xs font-semibold ${isToday ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {d.day}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">{d.minutes}m</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multilingual Exploration Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Multilingual Explorer Balance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['fr', 'de', 'id', 'en'] as const).map((langCode) => {
            const lang = LANGUAGES[langCode];
            const isCurrent = user.currentLanguage === langCode;
            const progress = langCode === 'fr' ? 65 : langCode === 'de' ? 40 : langCode === 'id' ? 35 : 20;

            return (
              <div
                key={langCode}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent ? 'bg-rose-50/40 border-rose-200 shadow-2xs' : 'bg-slate-50/60 border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-bold text-xs text-slate-900">{lang.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                      Active
                    </span>
                  )}
                </div>

                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200/50 mb-1.5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Fluency Progress</span>
                  <span className="font-semibold text-slate-700">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements & Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Achievement Trophies</span>
            </h2>
            <p className="text-xs text-slate-500">Unlock milestones as you expand your language mastery</p>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            {user.claimedAchievementIds.length} / {ACHIEVEMENTS_LIST.length} Claimed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const currentVal = ach.currentValue(user);
            const isUnlocked = currentVal >= ach.targetValue;
            const isClaimed = user.claimedAchievementIds.includes(ach.id);
            const percent = Math.min(100, Math.round((currentVal / ach.targetValue) * 100));

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isClaimed
                    ? 'bg-gradient-to-br from-amber-50/50 to-white border-amber-200 shadow-xs'
                    : isUnlocked
                    ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                        isClaimed
                          ? 'bg-amber-400 text-white'
                          : isUnlocked
                          ? 'bg-emerald-500 text-white animate-bounce'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isClaimed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isUnlocked ? (
                        <Sparkles className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-xl border border-slate-100 shadow-2xs">
                      +{ach.rewardXp} XP
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{ach.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{ach.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Progress</span>
                    <span className="font-bold text-slate-700">
                      {currentVal} / {ach.targetValue}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isClaimed ? 'bg-amber-400' : isUnlocked ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {isUnlocked && !isClaimed ? (
                    <button
                      onClick={() => onClaimAchievement(ach.id, ach.rewardXp)}
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      Claim +{ach.rewardXp} XP
                    </button>
                  ) : isClaimed ? (
                    <div className="text-center text-[11px] font-bold text-amber-700 py-1">
                      ✓ Claimed
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
