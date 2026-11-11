import React, { useState, useMemo } from 'react';
import { UserProfile, VocabWord, LanguageCode } from '../../types';
import { LANGUAGES } from '../../data/languages';
import { VOCABULARY_LIST, GRAMMAR_LESSONS, LISTENING_LESSONS } from '../../data/curriculum';
import { playSound, speakText } from '../../utils/audio';
import { getNextSpacedRepetitionInterval } from '../../utils/gamification';
import {
  Sparkles,
  BookOpen,
  Search,
  Filter,
  Volume2,
  Bookmark,
  CheckCircle2,
  RotateCw,
  Brain,
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Check,
  Tag,
} from 'lucide-react';

interface PracticeHubProps {
  user: UserProfile;
  onSaveWord: (wordId: string) => void;
  onMasterWord: (wordId: string) => void;
  onCompleteDailyWorkout: (xp: number) => void;
  onStartQuiz: () => void;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({
  user,
  onSaveWord,
  onMasterWord,
  onCompleteDailyWorkout,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'vocab' | 'flashcards'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'saved' | 'mastered'>('all');

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Daily workout interactive completion state
  const [dailyCompletedWords, setDailyCompletedWords] = useState<string[]>([]);
  const [dailyQuizAnswered, setDailyQuizAnswered] = useState<number | null>(null);
  const [dailyWorkoutFinished, setDailyWorkoutFinished] = useState(false);

  const currentLang = LANGUAGES[user.currentLanguage];

  // Vocab list filtered for current language
  const languageWords = useMemo(() => {
    return VOCABULARY_LIST.filter((w) => w.language === user.currentLanguage);
  }, [user.currentLanguage]);

  // Filtered vocabulary list
  const filteredWords = useMemo(() => {
    return languageWords.filter((w) => {
      const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
      const matchesSearch =
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState =
        filterState === 'all'
          ? true
          : filterState === 'saved'
          ? user.savedVocabIds.includes(w.id)
          : user.masteredVocabIds.includes(w.id);

      return matchesCategory && matchesSearch && matchesState;
    });
  }, [languageWords, selectedCategory, searchQuery, filterState, user]);

  // Daily workout content for current language
  const dailyWords = languageWords.slice(0, 5);
  const dailyGrammar = GRAMMAR_LESSONS.find((g) => g.language === user.currentLanguage) || GRAMMAR_LESSONS[0];
  const dailyListening = LISTENING_LESSONS.find((l) => l.language === user.currentLanguage) || LISTENING_LESSONS[0];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'daily', label: 'Daily Conversations' },
    { id: 'food', label: 'Food & Drinks' },
    { id: 'travel', label: 'Travel & Nature' },
    { id: 'education', label: 'Education' },
    { id: 'work', label: 'Work & Career' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'emotions', label: 'Emotions' },
    { id: 'culture', label: 'Culture' },
  ];

  // Current flashcard
  const flashcardDeck = filteredWords.length > 0 ? filteredWords : languageWords;
  const currentCard = flashcardDeck[flashcardIndex % flashcardDeck.length];

  const handleNextCard = () => {
    playSound('flip');
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % flashcardDeck.length);
  };

  const handlePrevCard = () => {
    playSound('flip');
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev - 1 + flashcardDeck.length) % flashcardDeck.length);
  };

  const handleFlipCard = () => {
    playSound('flip');
    setIsFlipped(!isFlipped);
  };

  // Complete Daily Workout
  const handleFinishDailyWorkout = () => {
    playSound('levelup');
    setDailyWorkoutFinished(true);
    onCompleteDailyWorkout(45);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header & Sub-Navigation */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <span>{currentLang.flag}</span>
            <span>{currentLang.name} Practice Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Practice & Vocabulary
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'daily', label: 'Daily Workout', icon: Sparkles },
            { id: 'vocab', label: 'Vocab Builder', icon: BookOpen },
            { id: 'flashcards', label: '3D Flashcards', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('click');
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DAILY PRACTICE WORKOUT */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                <span>Personalized for {user.name}</span>
                <span>·</span>
                <span>Level {user.level}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Today’s Daily Workout</h2>
              <p className="text-xs sm:text-sm text-amber-100">
                A calibrated 5-minute routine: 5 essential words, 3 phrases, 1 grammar spotlight, 1 listening phrase, and a quick quiz.
              </p>
            </div>

            <button
              onClick={handleFinishDailyWorkout}
              disabled={dailyWorkoutFinished}
              className={`px-6 py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 shrink-0 ${
                dailyWorkoutFinished
                  ? 'bg-emerald-500 text-white cursor-default'
                  : 'bg-white text-slate-900 hover:bg-amber-50'
              }`}
            >
              {dailyWorkoutFinished ? '✓ Workout Completed (+45 XP)' : 'Claim Daily Workout (+45 XP)'}
            </button>
          </div>

          {/* 5 Words Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>1. Today’s 5 Words ({dailyCompletedWords.length}/5 Reviewed)</span>
              </h3>
              <span className="text-xs text-slate-400">Click to listen & learn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dailyWords.map((word) => {
                const isMarked = dailyCompletedWords.includes(word.id);
                return (
                  <div
                    key={word.id}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/40 border border-slate-100 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{word.word}</span>
                        <button
                          onClick={() => speakText(word.word, word.language)}
                          className="p-1 rounded text-amber-600 hover:bg-amber-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          playSound('click');
                          if (isMarked) {
                            setDailyCompletedWords(dailyCompletedWords.filter((id) => id !== word.id));
                          } else {
                            setDailyCompletedWords([...dailyCompletedWords, word.id]);
                            onMasterWord(word.id);
                          }
                        }}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isMarked
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 font-medium">{word.translation}</div>
                    <div className="text-[11px] text-slate-400 italic">"{word.exampleSentence}"</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Useful Phrases */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>2. Three Daily Power Phrases</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentLang.samplePhrases.slice(0, 3).map((phrase, pIdx) => (
                <div key={pIdx} className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{phrase}</span>
                    <button
                      onClick={() => speakText(phrase, currentLang.code)}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">Everyday spoken expression</div>
                </div>
              ))}
            </div>
          </div>

          {/* 1 Grammar Nugget & 1 Mini Quiz */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grammar Nugget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                3. Grammar Nugget
              </span>
              <h4 className="text-base font-bold text-slate-900">{dailyGrammar.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{dailyGrammar.ruleSummary}</p>
              {dailyGrammar.formula && (
                <div className="p-3 bg-purple-50 rounded-xl font-mono text-[11px] text-purple-800">
                  {dailyGrammar.formula}
                </div>
              )}
            </div>

            {/* Quick Mini Check */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                4. Mini Quiz Check
              </span>
              <div className="text-xs font-bold text-slate-800">
                {dailyGrammar.practiceQuestion.question}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {dailyGrammar.practiceQuestion.options.slice(0, 3).map((opt, oIdx) => {
                  const isSelected = dailyQuizAnswered === oIdx;
                  const isCorrect = oIdx === dailyGrammar.practiceQuestion.correctIndex;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        playSound(isCorrect ? 'correct' : 'incorrect');
                        setDailyQuizAnswered(oIdx);
                      }}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                        dailyQuizAnswered !== null
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                            : isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-white border-slate-100 text-slate-600'
                          : 'bg-slate-50 border-slate-100 hover:border-amber-300 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOCABULARY BUILDER & LIBRARY */}
      {activeTab === 'vocab' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category, Filter */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search words, translations, or example sentences..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs focus:bg-white focus:outline-rose-400 text-slate-800"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start">
                {[
                  { id: 'all', label: 'All Words' },
                  { id: 'saved', label: 'Saved' },
                  { id: 'mastered', label: 'Mastered' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterState(f.id as typeof filterState)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      filterState === f.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vocabulary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => {
              const isSaved = user.savedVocabIds.includes(word.id);
              const isMastered = user.masteredVocabIds.includes(word.id);

              return (
                <div
                  key={word.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:border-amber-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        {word.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            playSound('click');
                            onSaveWord(word.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSaved ? 'text-rose-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title="Save favorite word"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            playSound('click');
                            onMasterWord(word.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isMastered ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title="Mark mastered"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'fill-emerald-500 text-white' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h4 className="text-lg font-bold text-slate-900">{word.word}</h4>
                      <span className="text-xs text-slate-400 font-mono">[{word.phonetic}]</span>
                    </div>

                    <div className="text-xs text-slate-500 mb-2">{word.partOfSpeech}</div>
                    <div className="text-sm font-semibold text-rose-600">{word.translation}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500 italic line-clamp-1 pr-2">
                      "{word.exampleSentence}"
                    </p>
                    <button
                      onClick={() => speakText(word.word, word.language)}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors shrink-0"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">No matching words found</div>
              <div className="text-xs text-slate-400">Try adjusting your category or search query</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 3D FLASHCARDS MODE */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Card <span className="font-bold text-slate-900">{(flashcardIndex % flashcardDeck.length) + 1}</span> of{' '}
              {flashcardDeck.length}
            </span>
            <span className="font-semibold text-amber-600">Spaced Repetition Active</span>
          </div>

          {/* 3D Flip Card Container */}
          <div className="perspective-1000 min-h-[300px] cursor-pointer" onClick={handleFlipCard}>
            <div
              className={`relative w-full h-[320px] rounded-3xl p-8 border shadow-lg transition-transform duration-500 transform-style-preserve-3d flex flex-col justify-between ${
                isFlipped ? 'rotate-y-180 bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200' : 'bg-white border-slate-200'
              }`}
            >
              {!isFlipped ? (
                /* Card Front */
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {currentCard.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentCard.word, currentCard.language);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-3xl font-black text-slate-900">{currentCard.word}</div>
                    <div className="text-sm text-slate-400 font-mono">[{currentCard.phonetic}]</div>
                    <div className="text-xs text-slate-400 font-medium">{currentCard.partOfSpeech}</div>
                  </div>

                  <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click card to reveal translation</span>
                  </div>
                </div>
              ) : (
                /* Card Back */
                <div className="h-full flex flex-col justify-between rotate-y-180">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                      Meaning & Context
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentCard.exampleSentence, currentCard.language);
                      }}
                      className="p-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                      title="Listen to full sentence"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-rose-700">{currentCard.translation}</div>
                    <div className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                      "{currentCard.exampleSentence}"
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      ({currentCard.exampleTranslation})
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-500">
                    Next interval: {getNextSpacedRepetitionInterval(1, true)} days
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevCard}
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playSound('incorrect');
                  handleNextCard();
                }}
                className="px-5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors"
              >
                Needs Review
              </button>
              <button
                onClick={() => {
                  playSound('correct');
                  onMasterWord(currentCard.id);
                  handleNextCard();
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                Mastered ✓
              </button>
            </div>

            <button
              onClick={handleNextCard}
              className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
