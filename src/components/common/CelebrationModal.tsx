import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../../utils/audio';
import { Sparkles, X, Flame, Trophy } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  xpEarned: number;
  streakDays?: number;
  badgeUnlocked?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  xpEarned,
  streakDays,
  badgeUnlocked,
}) => {
  useEffect(() => {
    if (isOpen) {
      playSound('levelup');
      // Fire vibrant confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FB7185', '#38BDF8', '#34D399', '#FBBF24', '#A78BFA'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 text-center transform transition-all animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy / Star illustration */}
        <div className="mx-auto w-24 h-24 mb-4 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-rose-200 rounded-full blur-xl opacity-70 animate-pulse"></div>
          <img
            src="/src/assets/images/achievement_trophy_badge_1794365988356.jpg"
            alt="Achievement Trophy"
            className="relative w-20 h-20 object-contain drop-shadow-md rounded-2xl"
            onError={(e) => {
              // fallback if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Rewards Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-3 flex items-center gap-3 justify-center">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs text-rose-600 font-medium">Earned</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">+{xpEarned} XP</div>
            </div>
          </div>

          {streakDays ? (
            <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3 flex items-center gap-3 justify-center">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-amber-700 font-medium">Streak</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">{streakDays} Days</div>
              </div>
            </div>
          ) : (
            <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-3 flex items-center gap-3 justify-center">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-sky-700 font-medium">Milestone</div>
                <div className="text-sm font-bold text-slate-900">Completed!</div>
              </div>
            </div>
          )}
        </div>

        {badgeUnlocked && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-center gap-2">
            <span>🎉 Badge Unlocked:</span>
            <span className="font-bold">{badgeUnlocked}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 active:scale-[0.99] transition-all"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
};
