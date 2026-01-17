
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Question, Language, Category, Difficulty } from '../types';
import { StorageService } from '../services/storage';
import { QuizSkeleton } from '../components/Skeleton';
import { CheckCircle2, XCircle, Timer, Award, RotateCcw, Trophy, AlertCircle } from 'lucide-react';

interface Props {
  t: (key: string) => string;
  lang: Language;
}

const TIMER_SECONDS = 15;
const QUESTIONS_PER_SESSION = 10;

const QuizSessionPage: React.FC<Props> = ({ t, lang }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch questions on mount based on URL parameters
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const cat = searchParams.get('cat') as Category || 'general';
        const diff = searchParams.get('diff') as Difficulty || 'medium';
        const isDaily = searchParams.get('daily') === 'true';

        // Fetch questions from StorageService (Firestore or Built-in fallback)
        const allQuestions = await StorageService.getQuestions({
          language: lang,
          category: isDaily ? 'general' : cat, // Daily defaults to general for now
          difficulty: isDaily ? 'hard' : diff
        });

        // Filter and Shuffle logic
        const shuffled = [...allQuestions]
          .sort(() => Math.random() - 0.5)
          .slice(0, QUESTIONS_PER_SESSION);

        setQuestions(shuffled);
      } catch (error) {
        console.error("Failed to load quiz questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchParams, lang]);

  // Timer Logic
  useEffect(() => {
    if (loading || isFinished || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSelect(-1); // Auto-fail on timeout
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isFinished, currentIndex, questions.length]);

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null || isFinished) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedIdx(idx);
    const correct = questions[currentIndex].correctIndex;
    const isCorrect = idx === correct;

    let newScore = score;
    let newCorrectCount = correctAnswersCount;

    if (isCorrect) {
      // Bonus points for speed
      newScore = score + (100 + timeLeft * 10);
      newCorrectCount = correctAnswersCount + 1;
      setScore(newScore);
      setCorrectAnswersCount(newCorrectCount);
    }

    // Delay transition to show feedback
    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedIdx(null);
        setTimeLeft(TIMER_SECONDS);
      } else {
        setIsFinished(true);
        const userName = searchParams.get('name') || 'Anonymous Player';
        await StorageService.saveScore({
            userId: 'u_' + Math.random().toString(36).substr(2, 5),
            userName: userName,
            score: newScore,
            accuracy: Math.round((newCorrectCount / questions.length) * 100),
            time: Math.round(Date.now()),
            date: new Date().toISOString()
        });
      }
    }, 1200);
  };

  if (loading) return (
    <div className="mt-20">
      <QuizSkeleton />
    </div>
  );

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass rounded-[2.5rem] p-12 space-y-6 text-center animate-fade-in mt-10">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-400">
           <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black">{t('noQuestions')}</h3>
          <p className="opacity-50 text-sm max-w-xs mx-auto">
            {lang === 'ar' 
              ? 'لم نجد أسئلة تطابق اختياراتك حالياً. جرب تصنيفاً آخر أو مستوى صعوبة مختلف.' 
              : 'We couldn\'t find any questions matching your filters. Try a different category or difficulty level.'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-4 bg-indigo-500 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20"
        >
          {t('playAgain')}
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="animate-fade-in space-y-8 max-w-2xl mx-auto mt-10">
        <div className="glass p-10 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden border-white/20">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-yellow-400/20 rounded-full scale-150"></div>
            <Award size={100} className="mx-auto text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tight">{t('results')}</h2>
            <p className="opacity-50 font-bold uppercase tracking-widest text-xs">Mission Accomplished</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="glass bg-white/5 p-8 rounded-3xl border-white/10 group hover:border-indigo-500/50 transition-colors">
              <div className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-black mb-1">{t('score')}</div>
              <div className="text-4xl font-black text-indigo-300">{score}</div>
            </div>
            <div className="glass bg-white/5 p-8 rounded-3xl border-white/10 group hover:border-emerald-500/50 transition-colors">
              <div className="text-[10px] opacity-40 uppercase tracking-[0.2em] font-black mb-1">{t('accuracy')}</div>
              <div className="text-4xl font-black text-emerald-400">
                {Math.round((correctAnswersCount / questions.length) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-5 bg-white text-indigo-950 rounded-2xl font-black text-lg hover:scale-[1.03] transition-transform flex items-center justify-center gap-3 shadow-xl"
            >
              <RotateCcw size={22} />
              {t('playAgain')}
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex-1 py-5 glass rounded-2xl font-black text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-3 border-white/20"
            >
              <Trophy size={22} className="text-yellow-400" />
              {t('leaderboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in px-2 py-10">
      {/* Header Stats */}
      <div className="flex items-center justify-between px-4">
        <div className="glass px-4 py-2 rounded-2xl">
          <span className="text-[10px] font-black opacity-40 uppercase block leading-none">{t('score')}</span>
          <span className="text-lg font-black text-indigo-300 tabular-nums">{score}</span>
        </div>
        
        <div className={`flex flex-col items-center justify-center glass w-20 h-20 rounded-full border-2 transition-colors ${timeLeft < 5 ? 'border-red-500 bg-red-500/10' : 'border-white/10'}`}>
           <Timer size={20} className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-indigo-400'} />
           <span className={`text-xl font-black tabular-nums ${timeLeft < 5 ? 'text-red-500' : ''}`}>{timeLeft}</span>
        </div>

        <div className="glass px-4 py-2 rounded-2xl text-end">
          <span className="text-[10px] font-black opacity-40 uppercase block leading-none">Question</span>
          <span className="text-lg font-black opacity-80 tabular-nums">{currentIndex + 1} / {questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
        />
      </div>

      {/* Question Card */}
      <div className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border-white/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
              {t(currentQ.category)}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] border border-purple-500/20">
              {t(currentQ.difficulty)}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black leading-tight text-white/95">
            {currentQ.questionText}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = currentQ.correctIndex === idx;
              const isWrongSelection = isSelected && !isCorrect;

              let borderClass = 'border-white/10';
              let bgClass = 'bg-white/5';
              let textClass = 'text-white/70';
              
              if (selectedIdx !== null) {
                if (isCorrect) {
                  borderClass = 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.02]';
                  bgClass = 'bg-emerald-500/20';
                  textClass = 'text-emerald-300 font-bold';
                } else if (isWrongSelection) {
                  borderClass = 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]';
                  bgClass = 'bg-red-500/20';
                  textClass = 'text-red-300 font-bold';
                } else {
                  bgClass = 'bg-black/20 opacity-30';
                }
              } else {
                bgClass = 'hover:bg-white/10 glass-hover hover:border-indigo-500/30';
              }

              return (
                <button
                  key={idx}
                  disabled={selectedIdx !== null}
                  onClick={() => handleSelect(idx)}
                  className={`w-full p-6 rounded-[1.5rem] border-2 text-start transition-all duration-300 transform flex items-center justify-between group/opt ${borderClass} ${bgClass} ${selectedIdx === null ? 'active:scale-[0.98]' : ''}`}
                >
                  <span className={`text-lg transition-colors ${textClass}`}>{opt}</span>
                  <div className="transition-transform group-hover/opt:scale-110">
                    {selectedIdx !== null && isCorrect && <CheckCircle2 className="text-emerald-500" size={28} />}
                    {selectedIdx !== null && isWrongSelection && <XCircle className="text-red-500" size={28} />}
                    {selectedIdx === null && <div className="w-6 h-6 rounded-full border-2 border-white/10 group-hover/opt:border-indigo-500/50"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Feedback */}
      <div className="h-16 flex items-center justify-center">
        {selectedIdx !== null && (
          <div className={`animate-bounce flex items-center gap-3 px-8 py-3 rounded-full font-black text-lg ${selectedIdx === currentQ.correctIndex ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {selectedIdx === currentQ.correctIndex ? (
              <><CheckCircle2 size={24}/> {t('correct')}</>
            ) : (
              <><XCircle size={24}/> {t('wrong')}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSessionPage;
