import React, { useState } from 'react';
import { UserProfile, LanguageCode, ListeningItem, ReadingStory, GrammarLesson } from '../../types';
import { LANGUAGES } from '../../data/languages';
import { LISTENING_LESSONS, READING_STORIES, GRAMMAR_LESSONS } from '../../data/curriculum';
import { playSound, speakText, stopSpeaking } from '../../utils/audio';
import {
  BookOpen,
  Headphones,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  Bookmark,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface LearnHubProps {
  user: UserProfile;
  initialSubTab?: 'path' | 'listening' | 'reading' | 'grammar';
  initialItemId?: string;
  onCompleteLesson: (lessonId: string, xpEarned: number) => void;
  onSaveWord: (wordId: string) => void;
  onStartQuiz: () => void;
}

export const LearnHub: React.FC<LearnHubProps> = ({
  user,
  initialSubTab = 'path',
  initialItemId,
  onCompleteLesson,
  onSaveWord,
  onStartQuiz,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'path' | 'listening' | 'reading' | 'grammar'>(initialSubTab);
  const currentLang = LANGUAGES[user.currentLanguage];

  // Filtering content by current language
  const languageListening = LISTENING_LESSONS.filter((item) => item.language === user.currentLanguage);
  const languageStories = READING_STORIES.filter((item) => item.language === user.currentLanguage);
  const languageGrammar = GRAMMAR_LESSONS.filter((item) => item.language === user.currentLanguage);

  // Fallback to all if language-specific has fewer items
  const activeListeningList = languageListening.length > 0 ? languageListening : LISTENING_LESSONS;
  const activeStoriesList = languageStories.length > 0 ? languageStories : READING_STORIES;
  const activeGrammarList = languageGrammar.length > 0 ? languageGrammar : GRAMMAR_LESSONS;

  // Selected item states
  const [selectedListening, setSelectedListening] = useState<ListeningItem>(
    activeListeningList.find((l) => l.id === initialItemId) || activeListeningList[0]
  );
  const [selectedStory, setSelectedStory] = useState<ReadingStory>(
    activeStoriesList.find((s) => s.id === initialItemId) || activeStoriesList[0]
  );
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarLesson>(
    activeGrammarList.find((g) => g.id === initialItemId) || activeGrammarList[0]
  );

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, number>>({});
  const [listeningSubmitted, setListeningSubmitted] = useState(false);

  // Reading interactive word popover state
  const [activeWordPopover, setActiveWordPopover] = useState<{
    word: string;
    translation: string;
    phonetic?: string;
  } | null>(null);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  // Grammar practice question answer
  const [grammarAnswer, setGrammarAnswer] = useState<number | null>(null);
  const [grammarChecked, setGrammarChecked] = useState(false);

  // Audio playback handler
  const handlePlayListeningAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(selectedListening.audioText, selectedListening.language, audioSpeed, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Submit listening comprehension
  const handleSubmitListening = () => {
    let correctCount = 0;
    selectedListening.questions.forEach((q) => {
      if (listeningAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const isAllCorrect = correctCount === selectedListening.questions.length;
    playSound(isAllCorrect ? 'correct' : 'incorrect');
    setListeningSubmitted(true);
    if (correctCount > 0) {
      onCompleteLesson(selectedListening.id, correctCount * 15);
    }
  };

  // Submit reading comprehension
  const handleSubmitReading = () => {
    let correctCount = 0;
    selectedStory.comprehensionQuestions.forEach((q) => {
      if (readingAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    playSound(correctCount > 0 ? 'correct' : 'incorrect');
    setReadingSubmitted(true);
    if (correctCount > 0) {
      onCompleteLesson(selectedStory.id, correctCount * 20);
    }
  };

  // Check grammar practice answer
  const handleCheckGrammar = () => {
    if (grammarAnswer === null) return;
    const isCorrect = grammarAnswer === selectedGrammar.practiceQuestion.correctIndex;
    playSound(isCorrect ? 'correct' : 'incorrect');
    setGrammarChecked(true);
    if (isCorrect) {
      onCompleteLesson(selectedGrammar.id, 25);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Learn Hub Header & Sub-Navigation */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
            <span>{currentLang.flag}</span>
            <span>{currentLang.name} Curriculum</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Learning Studio
          </h1>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
          {[
            { id: 'path', label: 'Curriculum Path', icon: Sparkles },
            { id: 'listening', label: 'Listening', icon: Headphones },
            { id: 'reading', label: 'Reading', icon: BookOpen },
            { id: 'grammar', label: 'Grammar', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('click');
                  setActiveSubTab(tab.id as typeof activeSubTab);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: CURRICULUM PATH */}
      {activeSubTab === 'path' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-rose-50/50 rounded-3xl p-6 sm:p-8 border border-indigo-100/60 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Structured Path · A1 Foundations</h2>
            <p className="text-xs text-slate-600 max-w-xl mb-6">
              Step through interactive checkpoints to build fluency in {currentLang.name}. Earn stars and unlock advanced chapters.
            </p>

            {/* Path Nodes */}
            <div className="relative max-w-md mx-auto space-y-6 py-4">
              {[
                {
                  id: 'unit-1',
                  title: 'Unit 1: Greetings & Warm Introductions',
                  subtitle: 'Say hello, introduce yourself, and master basic pleasantries',
                  status: 'completed',
                  xp: 80,
                  stars: 3,
                },
                {
                  id: 'unit-2',
                  title: 'Unit 2: At the Café & Ordering Food',
                  subtitle: 'Order croissants, coffee, and ask for the bill with confidence',
                  status: 'active',
                  xp: 120,
                  stars: 2,
                },
                {
                  id: 'unit-3',
                  title: 'Unit 3: Navigating the City & Directions',
                  subtitle: 'Find train stations, ask for directions, and read metro signs',
                  status: 'locked',
                  xp: 150,
                  stars: 0,
                },
                {
                  id: 'unit-4',
                  title: 'Unit 4: Daily Life & Expressing Feelings',
                  subtitle: 'Talk about hobbies, express excitement, and connect with locals',
                  status: 'locked',
                  xp: 180,
                  stars: 0,
                },
              ].map((unit, idx) => {
                const isCompleted = unit.status === 'completed';
                const isActive = unit.status === 'active';
                const isLocked = unit.status === 'locked';

                return (
                  <div
                    key={unit.id}
                    className={`relative rounded-3xl p-5 border transition-all ${
                      isActive
                        ? 'bg-white border-rose-300 shadow-md ring-2 ring-rose-200/50'
                        : isCompleted
                        ? 'bg-white/80 border-emerald-200'
                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isActive
                              ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCompleted ? '✓' : `0${idx + 1}`}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{unit.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{unit.subtitle}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold">
                            <span className="text-amber-600">{'★'.repeat(unit.stars)}{'☆'.repeat(3 - unit.stars)}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-600">+{unit.xp} XP</span>
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <button
                          onClick={() => {
                            playSound('click');
                            setActiveSubTab('listening');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                        >
                          Start
                        </button>
                      ) : isCompleted ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          Mastered
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LISTENING STUDIO */}
      {activeSubTab === 'listening' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Lesson Selector */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
              Listening Dialogues
            </h2>
            <div className="space-y-2">
              {activeListeningList.map((item) => {
                const isSelected = selectedListening.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedListening(item);
                      setListeningAnswers({});
                      setListeningSubmitted(false);
                      stopSpeaking();
                      setIsPlayingAudio(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-300 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-sky-600 mb-1">
                      <span className="uppercase tracking-wider">{item.level}</span>
                      <span>{item.durationSeconds}s</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.context}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Interactive Audio Player & Comprehension */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                    Speaker: {selectedListening.speaker}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedListening.title}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedListening.context}</p>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
                  {[0.75, 1.0, 1.25].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setAudioSpeed(speed)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        audioSpeed === speed
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Playback Deck */}
              <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayListeningAudio}
                    aria-label={isPlayingAudio ? 'Pause dialogue audio' : 'Play dialogue audio'}
                    className="w-14 h-14 rounded-2xl bg-white text-sky-600 hover:bg-sky-50 flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0"
                  >
                    {isPlayingAudio ? <Pause className="w-6 h-6 fill-sky-600" /> : <Play className="w-6 h-6 fill-sky-600 ml-1" />}
                  </button>
                  <div>
                    <div className="text-xs text-sky-200 font-medium">Native Voice Audio</div>
                    <div className="text-base font-bold">
                      {isPlayingAudio ? 'Playing conversation...' : 'Tap play to listen'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      stopSpeaking();
                      setIsPlayingAudio(false);
                      handlePlayListeningAudio();
                    }}
                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-colors"
                  >
                    {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                  </button>
                </div>
              </div>

              {/* Transcript & Translation Box */}
              {showTranscript && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Audio Transcript</div>
                  <p className="text-sm text-slate-900 leading-relaxed font-medium">
                    "{selectedListening.audioText}"
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 italic">
                    Meaning: "{selectedListening.translation}"
                  </div>
                </div>
              )}

              {/* Comprehension Questions */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Comprehension Check</h3>
                {selectedListening.questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
                    <div className="text-xs font-semibold text-slate-800">
                      {qIndex + 1}. {q.prompt}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((option, optIdx) => {
                        const isSelected = listeningAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        let optionStyle = 'bg-white border-slate-200 hover:border-sky-300 text-slate-700';

                        if (listeningSubmitted) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-rose-50 border-rose-300 text-rose-700';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-sky-50 border-sky-400 text-sky-800 font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={listeningSubmitted}
                            onClick={() => {
                              playSound('click');
                              setListeningAnswers({ ...listeningAnswers, [q.id]: optIdx });
                            }}
                            className={`p-3 rounded-xl border text-xs text-left transition-all ${optionStyle}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {listeningSubmitted && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}

                {!listeningSubmitted ? (
                  <button
                    onClick={handleSubmitListening}
                    disabled={Object.keys(listeningAnswers).length < selectedListening.questions.length}
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99]"
                  >
                    Check Answers
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setListeningAnswers({});
                      setListeningSubmitted(false);
                    }}
                    className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                  >
                    Retry Exercise
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: READING LIBRARY */}
      {activeSubTab === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stories List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
              Short Stories & Articles
            </h2>
            <div className="space-y-2">
              {activeStoriesList.map((story) => {
                const isSelected = selectedStory.id === story.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedStory(story);
                      setActiveWordPopover(null);
                      setReadingAnswers({});
                      setReadingSubmitted(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-600 mb-1">
                      <span>{story.category}</span>
                      <span>{story.estimatedMinutes} min read</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{story.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reader Passage & Interactive Glossaries */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                    {selectedStory.level} · {selectedStory.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedStory.title}</h2>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  Tap any underlined word for instant translation
                </div>
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-4">
                {selectedStory.paragraphs.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/70 space-y-2">
                    <p className="text-base text-slate-900 leading-relaxed">
                      {p.words.map((w, wIdx) => (
                        <button
                          key={wIdx}
                          onClick={() => {
                            playSound('click');
                            setActiveWordPopover({
                              word: w.word,
                              translation: w.translation,
                              phonetic: w.phonetic,
                            });
                            speakText(w.word, selectedStory.language);
                          }}
                          className="inline-block mx-0.5 text-rose-700 font-semibold border-b-2 border-rose-300 hover:bg-rose-100 rounded px-1 transition-colors"
                        >
                          {w.word}
                        </button>
                      ))}
                    </p>
                    <p className="text-xs text-slate-500 italic pt-1 border-t border-amber-100/50">
                      {p.sentenceTranslation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Floating or pinned active word popover */}
              {activeWordPopover && (
                <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-lg flex items-center justify-between gap-4 animate-scaleUp">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{activeWordPopover.word}</span>
                      {activeWordPopover.phonetic && (
                        <span className="text-xs text-slate-400 font-mono">[{activeWordPopover.phonetic}]</span>
                      )}
                      <button
                        onClick={() => speakText(activeWordPopover.word, selectedStory.language)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-rose-700 font-semibold">{activeWordPopover.translation}</div>
                  </div>

                  <button
                    onClick={() => {
                      onSaveWord(activeWordPopover.word);
                      playSound('correct');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to Vocab</span>
                  </button>
                </div>
              )}

              {/* Story Comprehension Questions */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Story Comprehension</h3>
                {selectedStory.comprehensionQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="text-xs font-semibold text-slate-800">
                      {qIndex + 1}. {q.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = readingAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        let btnStyle = 'bg-white border-slate-200 text-slate-700';

                        if (readingSubmitted) {
                          if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                          else if (isSelected) btnStyle = 'bg-rose-50 border-rose-300 text-rose-700';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={readingSubmitted}
                            onClick={() => {
                              playSound('click');
                              setReadingAnswers({ ...readingAnswers, [q.id]: optIdx });
                            }}
                            className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!readingSubmitted ? (
                  <button
                    onClick={handleSubmitReading}
                    disabled={Object.keys(readingAnswers).length < selectedStory.comprehensionQuestions.length}
                    className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99]"
                  >
                    Check Comprehension
                  </button>
                ) : (
                  <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-3 rounded-xl">
                    Comprehension validated! +20 XP awarded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: GRAMMAR SCHOOL */}
      {activeSubTab === 'grammar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grammar Lessons List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
              Grammar Masterclasses
            </h2>
            <div className="space-y-2">
              {activeGrammarList.map((lesson) => {
                const isSelected = selectedGrammar.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedGrammar(lesson);
                      setGrammarAnswer(null);
                      setGrammarChecked(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-300 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                      {lesson.tag}
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{lesson.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grammar Rule Details & Interactive Exercises */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                  {selectedGrammar.level} · {selectedGrammar.tag}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedGrammar.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{selectedGrammar.ruleSummary}</p>
              </div>

              {/* Syntax Formula */}
              {selectedGrammar.formula && (
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/60 font-mono text-xs text-purple-900">
                  <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1 font-sans">
                    Grammar Rule Formula
                  </div>
                  {selectedGrammar.formula}
                </div>
              )}

              {/* Explanation */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedGrammar.fullExplanation}
              </div>

              {/* Examples Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">Practical Examples</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedGrammar.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{ex.target}</span>
                        <button
                          onClick={() => speakText(ex.target, selectedGrammar.language)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500">{ex.native}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfalls / Mistakes */}
              {selectedGrammar.commonMistakes.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2">
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Common Mistakes to Avoid</span>
                  </div>
                  {selectedGrammar.commonMistakes.map((m, mIdx) => (
                    <div key={mIdx} className="text-xs space-y-1">
                      <div className="line-through text-rose-600">❌ {m.wrong}</div>
                      <div className="font-semibold text-emerald-700">✓ {m.correct}</div>
                      <div className="text-slate-500 text-[11px]">{m.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Practice Check */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-900">Interactive Practice Check</div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="text-xs font-medium text-slate-800">
                    {selectedGrammar.practiceQuestion.question}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedGrammar.practiceQuestion.options.map((opt, oIdx) => {
                      const isSelected = grammarAnswer === oIdx;
                      const isCorrect = oIdx === selectedGrammar.practiceQuestion.correctIndex;
                      let style = 'bg-white border-slate-200 text-slate-700';

                      if (grammarChecked) {
                        if (isCorrect) style = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                        else if (isSelected) style = 'bg-rose-50 border-rose-300 text-rose-700';
                      } else if (isSelected) {
                        style = 'bg-purple-50 border-purple-400 text-purple-800 font-semibold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={grammarChecked}
                          onClick={() => {
                            playSound('click');
                            setGrammarAnswer(oIdx);
                          }}
                          className={`p-3 rounded-xl border text-xs text-left transition-all ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!grammarChecked ? (
                    <button
                      onClick={handleCheckGrammar}
                      disabled={grammarAnswer === null}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      Verify Rule Understanding
                    </button>
                  ) : (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{selectedGrammar.practiceQuestion.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
