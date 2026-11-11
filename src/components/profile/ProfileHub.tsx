import React, { useState } from 'react';
import { UserProfile, LanguageCode } from '../../types';
import { LANGUAGES } from '../../data/languages';
import { LEADERBOARD_USERS } from '../../data/curriculum';
import { playSound } from '../../utils/audio';
import {
  User,
  Settings,
  Bell,
  Volume2,
  Clock,
  Award,
  Users,
  Trophy,
  Flame,
  Globe,
  RotateCcw,
  Sparkles,
  Check,
  Shield,
} from 'lucide-react';

interface ProfileHubProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenOnboarding: () => void;
  onResetProgress: () => void;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=FreyExplorer',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jonas',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aulia',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Liam',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Elena',
];

export const ProfileHub: React.FC<ProfileHubProps> = ({
  user,
  onUpdateUser,
  onOpenOnboarding,
  onResetProgress,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [nudgedFriendIds, setNudgedFriendIds] = useState<string[]>([]);
  const [friendModalSuccess, setFriendModalSuccess] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  const currentLang = LANGUAGES[user.currentLanguage];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateUser({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleNudgeFriend = (friendId: string) => {
    playSound('click');
    setNudgedFriendIds([...nudgedFriendIds, friendId]);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendEmail.trim()) {
      playSound('correct');
      setFriendModalSuccess(true);
      setFriendEmail('');
      setTimeout(() => setFriendModalSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-100 to-amber-100 border-2 border-rose-300 p-1 shadow-md overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>

            {/* Name & Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-2 py-1 text-sm font-bold border border-rose-300 rounded-lg focus:outline-rose-500"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Native: {user.nativeLanguage}</span>
                <span>·</span>
                <span>Learning {currentLang.flag} {currentLang.name}</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-700">
                <Sparkles className="w-3 h-3 fill-rose-500" />
                <span>Level {Math.floor(user.xp / 150) + 1} Pioneer</span>
              </div>
            </div>
          </div>

          {/* Quick Retake Onboarding */}
          <button
            onClick={() => {
              playSound('click');
              onOpenOnboarding();
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-center"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Customize Goals & Level</span>
          </button>
        </div>

        {/* Avatar Picker Row */}
        <div className="pt-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Avatar</div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {AVATAR_OPTIONS.map((avatarUrl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playSound('click');
                  onUpdateUser({ avatar: avatarUrl });
                }}
                className={`w-12 h-12 rounded-2xl border-2 p-0.5 overflow-hidden transition-all ${
                  user.avatar === avatarUrl
                    ? 'border-rose-500 ring-2 ring-rose-200 scale-105'
                    : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diamond League Leaderboard & Friends */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Diamond League · Week 46</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Weekly Leaderboard</h3>
          </div>
          <div className="text-xs text-slate-400">Top 3 advance to Master League</div>
        </div>

        {/* Leaderboard rows */}
        <div className="space-y-2">
          {LEADERBOARD_USERS.map((lUser) => {
            const isNudged = nudgedFriendIds.includes(lUser.id);
            return (
              <div
                key={lUser.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  lUser.rank === 1
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black tabular-nums ${
                      lUser.rank === 1
                        ? 'bg-amber-400 text-white'
                        : lUser.rank === 2
                        ? 'bg-slate-300 text-slate-700'
                        : lUser.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {lUser.rank}
                  </div>

                  <img
                    src={lUser.avatar}
                    alt={lUser.name}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{lUser.name}</span>
                      <span className="text-sm">{lUser.flag}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {lUser.streak}d streak
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-rose-600 tabular-nums">
                    {lUser.xp} XP
                  </span>

                  <button
                    onClick={() => handleNudgeFriend(lUser.id)}
                    disabled={isNudged}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isNudged
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                    }`}
                  >
                    {isNudged ? 'High Five! 🙌' : 'Challenge 🥊'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Current User Row */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-rose-300 bg-rose-50/60 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black">
                6
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl bg-white border border-rose-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-rose-900">{user.name} (You)</span>
                  <span className="text-sm">{currentLang.flag}</span>
                </div>
                <div className="text-[11px] text-rose-700 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {user.streak}d streak
                </div>
              </div>
            </div>

            <span className="text-xs font-black text-rose-700 tabular-nums">{user.xp} XP</span>
          </div>
        </div>

        {/* Add Friend Form */}
        <div className="pt-4 border-t border-slate-100">
          <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Enter friend's email to study together..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-rose-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Invite Friend
            </button>
          </form>

          {friendModalSuccess && (
            <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              Study invite sent! Your friend will receive a companion link.
            </div>
          )}
        </div>
      </div>

      {/* Learning Preferences & Notifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Notification & Learning Preferences</span>
        </h3>

        <div className="space-y-4">
          {/* Daily Target */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50">
            <div>
              <div className="text-xs font-bold text-slate-800">Daily Study Target</div>
              <div className="text-[11px] text-slate-500">How many minutes per day you aim to learn</div>
            </div>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    playSound('click');
                    onUpdateUser({ targetMinutes: mins as 5 | 10 | 15 | 30 });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    user.targetMinutes === mins
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
            <div>
              <div className="text-xs font-bold text-slate-800">Daily Streak Reminders</div>
              <div className="text-[11px] text-slate-500">Friendly alerts before streak expires</div>
            </div>
            <button
              onClick={() => {
                playSound('click');
                onUpdateUser({ dailyReminderEnabled: !user.dailyReminderEnabled });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                user.dailyReminderEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  user.dailyReminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Audio Sounds */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
            <div>
              <div className="text-xs font-bold text-slate-800">Sound Effects & Chimes</div>
              <div className="text-[11px] text-slate-500">Interactive tones for answers, flips & level-ups</div>
            </div>
            <button
              onClick={() => {
                playSound('click');
                onUpdateUser({ soundEnabled: !user.soundEnabled });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                user.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  user.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Data Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400">Want to start your journey fresh?</div>
          <button
            onClick={() => {
              if (confirm('Reset your learning progress and restart?')) {
                onResetProgress();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
};
