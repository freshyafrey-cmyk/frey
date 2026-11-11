export type LanguageCode = 'en' | 'de' | 'fr' | 'id';

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
  tagline: string;
  color: string;
  accentColor: string;
  speechVoiceLang: string;
  samplePhrases: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  nativeLanguage: string;
  currentLanguage: LanguageCode;
  learningLanguages: LanguageCode[];
  level: LearningLevel;
  targetMinutes: 5 | 10 | 15 | 30;
  xp: number;
  streak: number;
  longestStreak: number;
  streakFreezeCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  historyDates: string[]; // list of active dates
  minutesSpentToday: number;
  wordsLearnedCount: number;
  lessonsCompletedCount: number;
  quizzesTakenCount: number;
  quizzesCorrectCount: number;
  soundEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // e.g. "19:00"
  onboardingComplete: boolean;
  savedVocabIds: string[];
  masteredVocabIds: string[];
  completedLessonIds: string[];
  claimedAchievementIds: string[];
}

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  language: LanguageCode;
  category: 'daily' | 'food' | 'travel' | 'education' | 'work' | 'relationships' | 'shopping' | 'lifestyle' | 'emotions' | 'culture';
  phonetic: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface ListeningQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ListeningItem {
  id: string;
  title: string;
  language: LanguageCode;
  level: LearningLevel;
  speaker: string;
  context: string;
  audioText: string;
  translation: string;
  durationSeconds: number;
  questions: ListeningQuestion[];
}

export interface StoryWord {
  word: string;
  translation: string;
  phonetic?: string;
  pos?: string;
}

export interface StoryParagraph {
  sentenceOriginal: string;
  sentenceTranslation: string;
  words: StoryWord[];
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingStory {
  id: string;
  title: string;
  language: LanguageCode;
  level: LearningLevel;
  category: string;
  estimatedMinutes: number;
  paragraphs: StoryParagraph[];
  comprehensionQuestions: ComprehensionQuestion[];
}

export type QuizType =
  | 'multiple_choice'
  | 'matching'
  | 'sentence_scramble'
  | 'fill_blank'
  | 'translate'
  | 'true_false'
  | 'visual';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  promptAudio?: string;
  language: LanguageCode;
  level: LearningLevel;
  options?: string[];
  correctAnswer: string | string[]; // For scramble, string array; for multiple choice, index or text
  matchingPairs?: { id: string; left: string; right: string }[];
  wordsToScramble?: string[];
  explanation: string;
  hint?: string;
  visualEmoji?: string;
}

export interface GrammarExample {
  target: string;
  native: string;
  note?: string;
}

export interface GrammarCommonMistake {
  wrong: string;
  correct: string;
  reason: string;
}

export interface GrammarLesson {
  id: string;
  language: LanguageCode;
  level: LearningLevel;
  title: string;
  tag: string;
  ruleSummary: string;
  fullExplanation: string;
  formula?: string;
  examples: GrammarExample[];
  commonMistakes: GrammarCommonMistake[];
  practiceQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetValue: number;
  currentValue: (user: UserProfile) => number;
  rewardXp: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  rank: number;
  flag: string;
  learningLanguage: LanguageCode;
  isCurrentUser?: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  completed: boolean;
}
