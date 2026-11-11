import React, { useState } from 'react';
import { QuizQuestion, LanguageCode, UserProfile } from '../../types';
import { QUIZ_QUESTIONS } from '../../data/curriculum';
import { playSound, speakText } from '../../utils/audio';
import { calculateLessonXp } from '../../utils/gamification';
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  user: UserProfile;
  onCompleteQuiz: (scorePercent: number, xpEarned: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onCompleteQuiz,
}) => {
  // Filter questions for current language or mixed
  const questions = QUIZ_QUESTIONS.filter((q) => q.language === language || q.language === 'en');
  const activeQuestions = questions.length >= 3 ? questions.slice(0, 5) : QUIZ_QUESTIONS.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambledOrder, setScrambledOrder] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = activeQuestions[currentIndex];

  // Check matching pair
  const handleSelectMatchingLeft = (left: string) => {
    playSound('click');
    setSelectedLeft(left);
  };

  const handleSelectMatchingRight = (right: string) => {
    if (!selectedLeft) return;
    playSound('click');
    setMatchedPairs({ ...matchedPairs, [selectedLeft]: right });
    setSelectedLeft(null);
  };

  // Add word to scramble sequence
  const handleAddScrambleWord = (word: string) => {
    playSound('click');
    setScrambledOrder([...scrambledOrder, word]);
  };

  const handleRemoveScrambleWord = (index: number) => {
    playSound('click');
    const updated = [...scrambledOrder];
    updated.splice(index, 1);
    setScrambledOrder(updated);
  };

  // Check answer for current question
  const handleCheckAnswer = () => {
    let correct = false;

    if (currentQ.type === 'multiple_choice' || currentQ.type === 'fill_blank' || currentQ.type === 'visual' || currentQ.type === 'true_false') {
      correct = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === 'sentence_scramble') {
      const expected = (currentQ.correctAnswer as string[]).join(' ');
      const userBuilt = scrambledOrder.join(' ');
      correct = expected.toLowerCase().trim() === userBuilt.toLowerCase().trim();
    } else if (currentQ.type === 'matching' && currentQ.matchingPairs) {
      // Check if all matched
      const allMatched = currentQ.matchingPairs.every((pair) => matchedPairs[pair.left] === pair.right);
      correct = allMatched;
    }

    setIsCurrentCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      playSound('correct');
      setCorrectCount((prev) => prev + 1);
    } else {
      playSound('incorrect');
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    playSound('click');
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setScrambledOrder([]);
      setMatchedPairs({});
      setSelectedLeft(null);
      setIsAnswerChecked(false);
      setIsCurrentCorrect(false);
    } else {
      // Quiz finished!
      const total = activeQuestions.length;
      const finalCorrect = isCurrentCorrect ? correctCount : correctCount;
      const accuracy = total > 0 ? finalCorrect / total : 1;
      const xp = calculateLessonXp(30, accuracy, user.streak > 0);
      setQuizFinished(true);
      onCompleteQuiz(Math.round(accuracy * 100), xp);
    }
  };

  // Reset / Retry
  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScrambledOrder([]);
    setMatchedPairs({});
    setSelectedLeft(null);
    setIsAnswerChecked(false);
    setIsCurrentCorrect(false);
    setCorrectCount(0);
    setQuizFinished(false);
  };

  const progressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100 flex flex-col justify-between min-h-[500px]">
        {/* Top Header & Progress */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={onClose}
              aria-label="Exit Quiz"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress Bar */}
            <div className="flex-1 mx-2 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-400 tabular-nums">
              {currentIndex + 1} / {activeQuestions.length}
            </div>
          </div>

          {!quizFinished ? (
            /* Question Body */
            <div className="space-y-6">
              {/* Prompt Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                    {currentQ.type.replace('_', ' ')}
                  </span>
                  {currentQ.promptAudio && (
                    <button
                      onClick={() => speakText(currentQ.promptAudio!, currentQ.language)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {currentQ.visualEmoji && (
                  <div className="text-5xl my-3 text-center animate-bounce">
                    {currentQ.visualEmoji}
                  </div>
                )}

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.prompt}
                </h3>
              </div>

              {/* Question UI Type: Multiple Choice / Visual / True-False / Fill in blank */}
              {(currentQ.type === 'multiple_choice' ||
                currentQ.type === 'fill_blank' ||
                currentQ.type === 'visual' ||
                currentQ.type === 'true_false') &&
                currentQ.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300';

                      if (isAnswerChecked) {
                        if (option === currentQ.correctAnswer) {
                          btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                        } else if (isSelected && option !== currentQ.correctAnswer) {
                          btnClass = 'bg-rose-50 border-rose-300 text-rose-700';
                        }
                      } else if (isSelected) {
                        btnClass = 'bg-rose-50 border-rose-400 text-rose-800 font-bold ring-2 ring-rose-200';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswerChecked}
                          onClick={() => {
                            playSound('click');
                            setSelectedOption(option);
                          }}
                          className={`p-4 rounded-2xl border text-sm text-left transition-all font-medium ${btnClass}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* Question UI Type: Sentence Scramble */}
              {currentQ.type === 'sentence_scramble' && currentQ.wordsToScramble && (
                <div className="space-y-4">
                  {/* Built sentence area */}
                  <div className="min-h-[60px] p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-wrap gap-2 items-center">
                    {scrambledOrder.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Tap words below in the correct order</span>
                    ) : (
                      scrambledOrder.map((word, wIdx) => (
                        <button
                          key={wIdx}
                          onClick={() => handleRemoveScrambleWord(wIdx)}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs shadow-xs hover:bg-rose-50 transition-colors"
                        >
                          {word} ×
                        </button>
                      ))
                    )}
                  </div>

                  {/* Word bank */}
                  <div className="flex flex-wrap gap-2">
                    {currentQ.wordsToScramble.map((word, wIdx) => {
                      const isUsed = scrambledOrder.includes(word);
                      return (
                        <button
                          key={wIdx}
                          disabled={isUsed || isAnswerChecked}
                          onClick={() => handleAddScrambleWord(word)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isUsed
                              ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50 shadow-xs'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question UI Type: Matching Pairs */}
              {currentQ.type === 'matching' && currentQ.matchingPairs && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Target Term</div>
                    {currentQ.matchingPairs.map((p) => {
                      const isMatched = !!matchedPairs[p.left];
                      const isSelected = selectedLeft === p.left;
                      return (
                        <button
                          key={p.left}
                          disabled={isMatched || isAnswerChecked}
                          onClick={() => handleSelectMatchingLeft(p.left)}
                          className={`w-full p-3 rounded-xl border text-xs text-left font-bold transition-all ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : isSelected
                              ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-200'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {p.left} {isMatched && '✓'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Translation</div>
                    {currentQ.matchingPairs.map((p) => {
                      const isMatched = Object.values(matchedPairs).includes(p.right);
                      return (
                        <button
                          key={p.right}
                          disabled={isMatched || isAnswerChecked}
                          onClick={() => handleSelectMatchingRight(p.right)}
                          className={`w-full p-3 rounded-xl border text-xs text-left font-medium transition-all ${
                            isMatched
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {p.right} {isMatched && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Quiz Completed!</h3>
                <p className="text-xs text-slate-500">
                  You answered {correctCount} out of {activeQuestions.length} questions correctly.
                </p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl max-w-xs mx-auto">
                <div className="text-xs text-rose-600 font-bold uppercase">Reward</div>
                <div className="text-xl font-extrabold text-slate-900">
                  +{calculateLessonXp(30, correctCount / activeQuestions.length, user.streak > 0)} XP
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-md hover:from-rose-600 hover:to-amber-600 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Deck */}
        {!quizFinished && (
          <div className="pt-4 border-t border-slate-100">
            {isAnswerChecked ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-2xl flex items-start gap-2 text-xs ${
                    isCurrentCorrect
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {isCurrentCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{isCurrentCorrect ? 'Superb! Correct!' : 'Not quite right'}</div>
                    <div className="text-[11px] mt-0.5 text-slate-600">{currentQ.explanation}</div>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>{currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Finish Quiz'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckAnswer}
                disabled={
                  (currentQ.type === 'multiple_choice' || currentQ.type === 'fill_blank' || currentQ.type === 'visual' || currentQ.type === 'true_false') &&
                  !selectedOption
                }
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99]"
              >
                Check Answer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
