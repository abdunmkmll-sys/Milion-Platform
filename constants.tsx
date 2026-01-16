
import { Question, Translations } from './types';

export const DICTIONARY: Translations = {
  appName: { ar: 'منصة المليون', en: 'Milion Platform' },
  startGame: { ar: 'ابدأ اللعب', en: 'Start Game' },
  dailyChallenge: { ar: 'تحدي اليوم', en: 'Daily Challenge' },
  leaderboard: { ar: 'لوحة المتصدرين', en: 'Leaderboard' },
  community: { ar: 'المجتمع', en: 'Community' },
  admin: { ar: 'لوحة الإدارة', en: 'Admin' },
  selectLang: { ar: 'اختر اللغة', en: 'Select Language' },
  selectCategory: { ar: 'التصنيف', en: 'Category' },
  selectDifficulty: { ar: 'المستوى', en: 'Level' },
  easy: { ar: 'مبتدئ', en: 'Easy' },
  medium: { ar: 'متوسط', en: 'Medium' },
  hard: { ar: 'محترف', en: 'Expert' },
  science: { ar: 'علوم', en: 'Science' },
  history: { ar: 'تاريخ', en: 'History' },
  geography: { ar: 'جغرافيا', en: 'Geography' },
  math: { ar: 'رياضيات', en: 'Math' },
  general: { ar: 'عام', en: 'General' },
  religion: { ar: 'دين', en: 'Religion' },
  next: { ar: 'التالي', en: 'Next' },
  finish: { ar: 'إنهاء', en: 'Finish' },
  correct: { ar: 'إجابة صحيحة!', en: 'Correct Answer!' },
  wrong: { ar: 'إجابة خاطئة', en: 'Wrong Answer' },
  results: { ar: 'النتائج', en: 'Results' },
  score: { ar: 'النتيجة', en: 'Score' },
  accuracy: { ar: 'الدقة', en: 'Accuracy' },
  time: { ar: 'الوقت', en: 'Time' },
  playAgain: { ar: 'لعب مرة أخرى', en: 'Play Again' },
  noQuestions: { ar: 'لا توجد أسئلة لهذه المعايير حالياً.', en: 'No questions available for these filters yet.' },
};

export const BUILT_IN_QUESTIONS: Question[] = [
  {
    id: 'b1',
    category: 'science',
    difficulty: 'easy',
    language: 'ar',
    questionText: 'ما هو الكوكب الأحمر في مجموعتنا الشمسية؟',
    options: ['الأرض', 'المريخ', 'المشتري', 'الزهرة'],
    correctIndex: 1,
    explanation: 'المريخ يُعرف بالكوكب الأحمر بسبب وجود أكسيد الحديد على سطحه.'
  },
  {
    id: 'b2',
    category: 'science',
    difficulty: 'easy',
    language: 'en',
    questionText: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correctIndex: 2
  },
  {
    id: 'b3',
    category: 'history',
    difficulty: 'medium',
    language: 'ar',
    questionText: 'في أي عام انتهت الحرب العالمية الثانية؟',
    options: ['1939', '1942', '1945', '1950'],
    correctIndex: 2
  },
  {
    id: 'b4',
    category: 'geography',
    difficulty: 'easy',
    language: 'ar',
    questionText: 'ما هي عاصمة مصر؟',
    options: ['القاهرة', 'الإسكندرية', 'الأقصر', 'أسوان'],
    correctIndex: 0
  },
  {
    id: 'b5',
    category: 'math',
    difficulty: 'medium',
    language: 'en',
    questionText: 'What is the square root of 144?',
    options: ['10', '11', '12', '13'],
    correctIndex: 2
  },
  {
    id: 'b6',
    category: 'science',
    difficulty: 'hard',
    language: 'en',
    questionText: 'Which element has the atomic number 79?',
    options: ['Silver', 'Gold', 'Platinum', 'Copper'],
    correctIndex: 1
  },
  {
    id: 'b7',
    category: 'history',
    difficulty: 'hard',
    language: 'ar',
    questionText: 'من هو مؤسس الدولة العباسية؟',
    options: ['أبو العباس السفاح', 'هارون الرشيد', 'المأمون', 'المعتصم'],
    correctIndex: 0
  },
  {
    id: 'b8',
    category: 'religion',
    difficulty: 'easy',
    language: 'ar',
    questionText: 'كم عدد أركان الإسلام؟',
    options: ['3', '4', '5', '6'],
    correctIndex: 2
  }
];
