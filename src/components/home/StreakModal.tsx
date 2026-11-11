import React from 'react';
import { UserProfile } from '../../types';
import { playSound } from '../../utils/audio';
import { Flame, Shield, X, Calendar, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onToggleStreakFreeze: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  user,
  onToggleStreakFreeze,
}) => {
  if (!isOpen) return null;

  // Generate last 14 days
  const today = new Date();
  const pastDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (13 - i));
    const str = d.toISOString().split('T')[0];
    const isCompleted = user.historyDates.includes(str);
    const isToday = i === 13;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dateNum = d.getDate();
    return { str, isCompleted, isToday, dayLabel, dateNum };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-100 animate-scaleUp space-y-6">
        <button
          onClick={onClose}
          aria-label="Close Streak Modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Flame Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Flame className="w-10 h-10 fill-white animate-pulse" />
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {user.streak} Day Streak!
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Practice every day to keep your flame blazing and accelerate your language memory retention.
          </p>
        </div>

        {/* 14-Day Calendar Grid */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Activity History (Last 14 Days)</span>
            </span>
            <span className="text-[11px] text-amber-700 font-semibold">{user.longestStreak}d Record</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {pastDays.map((d) => (
              <div key={d.str} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] ${d.isToday ? 'font-bold text-amber-700' : 'text-slate-400'}`}>
                  {d.dayLabel}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    d.isCompleted
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : d.isToday
                      ? 'border-2 border-dashed border-amber-400 text-amber-600'
                      : 'bg-white border border-slate-200 text-slate-300'
                  }`}
                  title={`${d.str}: ${d.isCompleted ? 'Completed' : 'Missed'}`}
                >
                  {d.isCompleted ? '🔥' : d.dateNum}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Freeze Feature Card */}
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Shield className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-900">
                Streak Freeze: {user.streakFreezeCount} Available
              </div>
              <div className="text-[11px] text-sky-700">
                Protects your streak if you miss a day of practice.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onToggleStreakFreeze();
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-700 text-xs font-bold hover:bg-sky-100/50 shadow-2xs transition-colors shrink-0"
          >
            Refill Shield
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99]"
        >
          Keep Learning
        </button>
      </div>
    </div>
  );
};
