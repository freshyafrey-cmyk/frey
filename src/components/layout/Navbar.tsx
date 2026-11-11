import React, { useState } from 'react';
import { UserProfile, LanguageCode } from '../../types';
import { LANGUAGES } from '../../data/languages';
import { playSound } from '../../utils/audio';
import {
  Compass,
  Home,
  BookOpen,
  Sparkles,
  TrendingUp,
  User,
  Flame,
  Volume2,
  VolumeX,
  ChevronDown,
  Shield,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile;
  onLanguageChange: (lang: LanguageCode) => void;
  onToggleSound: () => void;
  onOpenStreakModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  onLanguageChange,
  onToggleSound,
  onOpenStreakModal,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const currentLangInfo = LANGUAGES[user.currentLanguage];

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Sparkles },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleSelectTab = (tabId: string) => {
    playSound('click');
    onTabChange(tabId);
  };

  const handleSelectLang = (lang: LanguageCode) => {
    playSound('click');
    onLanguageChange(lang);
    setLangDropdownOpen(false);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark & Mascot */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleSelectTab('home')}
              className="flex items-center gap-2.5 text-left focus-visible:outline-hidden group"
              aria-label="FREY Home"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-100 to-amber-100 p-0.5 overflow-hidden border border-rose-200/60 shadow-xs group-hover:scale-105 transition-transform">
                <img
                  src="/src/assets/images/frey_mascot_friendly_1794365987499.jpg"
                  alt="Frey Mascot"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">
                  FREY
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                  · Learn languages. Explore worlds.
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs scale-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Language Switcher, Streak, XP, Sound */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                aria-label={`Current language: ${currentLangInfo.name}`}
              >
                <span className="text-base leading-none">{currentLangInfo.flag}</span>
                <span className="hidden sm:inline-block font-medium">{currentLangInfo.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scaleUp">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Language
                    </div>
                    {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
                      const lang = LANGUAGES[code];
                      const isCurrent = user.currentLanguage === code;
                      return (
                        <button
                          key={code}
                          onClick={() => handleSelectLang(code)}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors ${
                            isCurrent
                              ? 'bg-rose-50 text-rose-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">{lang.nativeName}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Streak Counter */}
            <button
              onClick={onOpenStreakModal}
              title="Daily Streak"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 text-amber-800 text-xs font-bold transition-transform active:scale-95 shadow-xs"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span className="tabular-nums">{user.streak}</span>
              {user.streakFreezeCount > 0 && (
                <span title="Streak Freeze Active" className="hidden sm:inline-flex">
                  <Shield className="w-3 h-3 text-sky-500 fill-sky-200" />
                </span>
              )}
            </button>

            {/* XP Points */}
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-700 text-xs font-bold shadow-xs">
              <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="tabular-nums">{user.xp} XP</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              aria-label={user.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/70 transition-colors shadow-xs"
            >
              {user.soundEnabled ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg pb-safe">
        <div className="grid grid-cols-5 items-center h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] rounded-xl transition-all ${
                  isActive ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
