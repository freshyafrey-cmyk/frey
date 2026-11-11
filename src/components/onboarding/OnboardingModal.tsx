import React, { useState } from 'react';
import { UserProfile, LanguageCode, LearningLevel } from '../../types';
import { LANGUAGES } from '../../data/languages';
import { playSound } from '../../utils/audio';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  GraduationCap,
  Check,
  Globe,
  Heart,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: {
    nativeLanguage: string;
    currentLanguage: LanguageCode;
    level: LearningLevel;
    targetMinutes: 5 | 10 | 15 | 30;
  }) => void;
  initialLanguage?: LanguageCode;
}

const NATIVE_LANGUAGES = [
  'English',
  'Deutsch (German)',
  'Français (French)',
  'Bahasa Indonesia',
  'Español (Spanish)',
  'Italiano (Italian)',
  '日本語 (Japanese)',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialLanguage = 'fr',
}) => {
  const [step, setStep] = useState(1);
  const [nativeLang, setNativeLang] = useState('English');
  const [targetLang, setTargetLang] = useState<LanguageCode>(initialLanguage);
  const [level, setLevel] = useState<LearningLevel>('beginner');
  const [dailyMinutes, setDailyMinutes] = useState<5 | 10 | 15 | 30>(15);

  if (!isOpen) return null;

  const handleNext = () => {
    playSound('click');
    if (step < 5) {
      setStep(step + 1);
    } else {
      playSound('levelup');
      onComplete({
        nativeLanguage: nativeLang,
        currentLanguage: targetLang,
        level,
        targetMinutes: dailyMinutes,
      });
    }
  };

  const handleBack = () => {
    playSound('click');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 flex flex-col justify-between min-h-[520px] animate-scaleUp">
        {/* Top Header & Progress dots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-gradient-to-r from-rose-500 to-amber-500'
                      : s < step
                      ? 'w-2 bg-emerald-400'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-rose-100 via-amber-100 to-sky-100 p-1 shadow-md overflow-hidden">
                <img
                  src="/src/assets/images/frey_mascot_friendly_1794365987499.jpg"
                  alt="Frey Mascot"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-extrabold text-rose-600 mb-2">
                  Welcome to FREY
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Learn languages. Explore worlds.
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  Embark on an inspiring multilingual journey through English 🇬🇧, German 🇩🇪, French 🇫🇷, and Indonesian 🇮🇩.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-xs mx-auto text-xs text-slate-600 space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Interactive native listening & speech</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Bilingual stories with tap-to-translate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>3D flashcards with Spaced Repetition</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: NATIVE LANGUAGE */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900">What is your mother tongue?</h3>
                <p className="text-xs text-slate-500">We will tailor explanations and translations to your native language.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {NATIVE_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      playSound('click');
                      setNativeLang(lang);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all ${
                      nativeLang === lang
                        ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {lang} {nativeLang === lang && '✓'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TARGET LANGUAGE */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Which language will you explore first?</h3>
                <p className="text-xs text-slate-500">You can add and switch between all four languages at any time!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
                  const lang = LANGUAGES[code];
                  const isSelected = targetLang === code;

                  return (
                    <button
                      key={code}
                      onClick={() => {
                        playSound('click');
                        setTargetLang(code);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{lang.name}</div>
                          <div className="text-xs text-slate-500">{lang.nativeName}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PROFICIENCY LEVEL */}
          {step === 4 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900">What is your current level?</h3>
                <p className="text-xs text-slate-500">We will adjust the vocabulary and quiz difficulty accordingly.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  {
                    id: 'beginner',
                    title: 'Beginner (A1 - A2)',
                    desc: 'New to the language or know a few words and basic greetings.',
                  },
                  {
                    id: 'intermediate',
                    title: 'Intermediate (B1 - B2)',
                    desc: 'Can understand everyday conversations, order meals, and read simple stories.',
                  },
                  {
                    id: 'advanced',
                    title: 'Advanced (C1)',
                    desc: 'Fluent speaker looking to master nuanced expressions, culture, and grammar.',
                  },
                ].map((lvl) => {
                  const isSelected = level === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        playSound('click');
                        setLevel(lvl.id as LearningLevel);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">{lvl.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{lvl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: DAILY TARGET */}
          {step === 5 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Choose your daily learning target</h3>
                <p className="text-xs text-slate-500">Small daily habits build enduring linguistic fluency.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { mins: 5, label: 'Casual', desc: '5 min / day' },
                  { mins: 10, label: 'Steady', desc: '10 min / day' },
                  { mins: 15, label: 'Dedicated', desc: '15 min / day (Recommended)' },
                  { mins: 30, label: 'Intensive', desc: '30 min / day' },
                ].map((target) => {
                  const isSelected = dailyMinutes === target.mins;
                  return (
                    <button
                      key={target.mins}
                      onClick={() => {
                        playSound('click');
                        setDailyMinutes(target.mins as 5 | 10 | 15 | 30);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-lg font-black text-slate-900 tabular-nums">{target.mins} min</div>
                      <div className="text-xs font-bold text-rose-600">{target.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{target.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400">Step {step} of 5</div>
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>{step === 5 ? 'Launch My Journey 🚀' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
