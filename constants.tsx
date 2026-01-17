
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
  // SCIENCE
  { id: 's1', category: 'science', difficulty: 'easy', language: 'ar', questionText: 'ما هو العنصر الكيميائي الذي يرمز له بـ O؟', options: ['الذهب', 'الأكسجين', 'الحديد', 'الكربون'], correctIndex: 1 },
  { id: 's2', category: 'science', difficulty: 'medium', language: 'ar', questionText: 'ما هي الوحدة الأساسية لبناء الكائنات الحية؟', options: ['الذرة', 'الخلية', 'النسيج', 'العضو'], correctIndex: 1 },
  { id: 's3', category: 'science', difficulty: 'hard', language: 'ar', questionText: 'من هو العالم الذي وضع قانون الجاذبية؟', options: ['أينشتاين', 'نيوتن', 'تسلا', 'جاليليو'], correctIndex: 1 },
  { id: 's4', category: 'science', difficulty: 'easy', language: 'en', questionText: 'What planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correctIndex: 1 },
  { id: 's5', category: 'science', difficulty: 'medium', language: 'en', questionText: 'What is the speed of light approximately?', options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '500,000 km/s'], correctIndex: 0 },
  
  // HISTORY
  { id: 'h1', category: 'history', difficulty: 'easy', language: 'ar', questionText: 'من هو القائد المسلم الذي فتح الأندلس؟', options: ['خالد بن الوليد', 'طارق بن زياد', 'عمر بن الخطاب', 'صلاح الدين الأيوبي'], correctIndex: 1 },
  { id: 'h2', category: 'history', difficulty: 'medium', language: 'ar', questionText: 'في أي عام وقعت الثورة الفرنسية؟', options: ['1789', '1800', '1914', '1750'], correctIndex: 0 },
  { id: 'h3', category: 'history', difficulty: 'hard', language: 'ar', questionText: 'ما هي أطول حضارة في التاريخ القديم؟', options: ['الحضارة الرومانية', 'الحضارة الفرعونية', 'الحضارة اليونانية', 'الحضارة الفارس'], correctIndex: 1 },
  { id: 'h4', category: 'history', difficulty: 'easy', language: 'en', questionText: 'Who was the first president of the United States?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'], correctIndex: 2 },
  
  // GEOGRAPHY
  { id: 'g1', category: 'geography', difficulty: 'easy', language: 'ar', questionText: 'ما هو أطول نهر في العالم؟', options: ['نهر الأمازون', 'نهر النيل', 'نهر المسيسيبي', 'نهر الدانوب'], correctIndex: 1 },
  { id: 'g2', category: 'geography', difficulty: 'medium', language: 'ar', questionText: 'ما هي أصغر دولة في العالم من حيث المساحة؟', options: ['موناكو', 'الفاتيكان', 'سان مارينو', 'البحرين'], correctIndex: 1 },
  { id: 'g3', category: 'geography', difficulty: 'hard', language: 'ar', questionText: 'أين يقع خندق ماريانا، أعمق نقطة في المحيطات؟', options: ['المحيط الأطلسي', 'المحيط الهادئ', 'المحيط الهندي', 'المحيط المتجمد'], correctIndex: 1 },
  
  // MATH
  { id: 'm1', category: 'math', difficulty: 'easy', language: 'ar', questionText: 'ما هو ناتج ضرب 7 في 8؟', options: ['54', '56', '64', '48'], correctIndex: 1 },
  { id: 'm2', category: 'math', difficulty: 'medium', language: 'ar', questionText: 'ما هي قيمة "باي" (π) التقريبية؟', options: ['3.14', '2.14', '3.41', '4.13'], correctIndex: 0 },
  { id: 'm3', category: 'math', difficulty: 'hard', language: 'en', questionText: 'What is the derivative of x^2?', options: ['x', '2x', 'x/2', '2'], correctIndex: 1 },

  // RELIGION
  { id: 'r1', category: 'religion', difficulty: 'easy', language: 'ar', questionText: 'من هو خاتم الأنبياء والمرسلين؟', options: ['عيسى عليه السلام', 'موسى عليه السلام', 'محمد صلى الله عليه وسلم', 'إبراهيم عليه السلام'], correctIndex: 2 },
  { id: 'r2', category: 'religion', difficulty: 'medium', language: 'ar', questionText: 'كم عدد سور القرآن الكريم؟', options: ['110', '114', '120', '100'], correctIndex: 1 },
  { id: 'r3', category: 'religion', difficulty: 'hard', language: 'ar', questionText: 'من هو الصحابي الملقب بـ "ذو النورين"؟', options: ['أبو بكر الصديق', 'عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب'], correctIndex: 2 }
];
