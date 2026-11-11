import { LanguageCode, LanguageInfo } from '../types';

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    greeting: 'Hello, welcome to FREY!',
    tagline: 'Connect with 1.5 billion speakers worldwide',
    color: '#38BDF8', // Sky Blue
    accentColor: '#0284C7',
    speechVoiceLang: 'en-US',
    samplePhrases: ['Good morning', 'How are you?', 'Nice to meet you', 'Have a wonderful day'],
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    greeting: 'Hallo, willkommen bei FREY!',
    tagline: 'Precision, culture, and rich compound words',
    color: '#FBBF24', // Butter Yellow / Amber
    accentColor: '#D97706',
    speechVoiceLang: 'de-DE',
    samplePhrases: ['Guten Morgen', 'Wie geht es dir?', 'Freut mich, dich kennenzulernen', 'Schönen Tag noch'],
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    greeting: 'Bonjour, bienvenue sur FREY !',
    tagline: 'Melodic cadence, literature, and art of living',
    color: '#FB7185', // Coral Pink / Rose
    accentColor: '#E11D48',
    speechVoiceLang: 'fr-FR',
    samplePhrases: ['Bonjour tout le monde', 'Comment allez-vous ?', 'Enchanté de vous rencontrer', 'Bonne journée'],
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    greeting: 'Halo, selamat datang di FREY!',
    tagline: 'Harmonious language of 17,000 tropical islands',
    color: '#34D399', // Mint Green / Emerald
    accentColor: '#059669',
    speechVoiceLang: 'id-ID',
    samplePhrases: ['Selamat pagi', 'Apa kabar?', 'Senang bertemu denganmu', 'Semoga harimu menyenangkan'],
  },
};
