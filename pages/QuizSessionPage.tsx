
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Question, Language } from '../types';
import { StorageService } from '../services/storage';
import { QuizSkeleton } from '../components/Skeleton';
import { CheckCircle2, XCircle, Timer, Award, RotateCcw, Trophy } from 'lucide-react';

interface Props {
  t: (key: string) => string;
  lang: Language;
}

const TIMER_SECONDS = 15;

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

  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to avoid namespace error in the browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading || isFinished || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSelect(-1);
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
      newScore = score + (100 + timeLeft * 10);
      newCorrectCount = correctAnswersCount + 1;
      setScore(newScore);
      setCorrectAnswersCount(newCorrectCount);
    }

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
    }, 1500);
  };

  if (loading) return <QuizSkeleton />;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 glass rounded-3xl p-8 space-y-4 text-center">
        <h3 className="text-xl font-bold">{t('noQuestions')}</h3>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20">
          {t('playAgain')}
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
        <div className="glass p-10 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          <Award size={80} className="mx-auto text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-black">{t('results')}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-6 rounded-2xl">
              <div className="text-sm opacity-50 uppercase tracking-widest">{t('score')}</div>
              <div className="text-3xl font-bold text-indigo-300">{score}</div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <div className="text-sm opacity-50 uppercase tracking-widest">{t('accuracy')}</div>
              <div className="text-3xl font-bold text-emerald-400">
                {Math.round((correctAnswersCount / questions.length) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              {t('playAgain')}
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Trophy size={20} />
              {t('leaderboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in px-2">
      <div className="flex items-center justify-between px-2">
        <div className="text-sm font-bold opacity-50">
          {t('score')}: {score}
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
           <Timer size={16} className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-indigo-400'} />
           <span className={`font-mono font-bold ${timeLeft < 5 ? 'text-red-500' : ''}`}>{timeLeft}s</span>
        </div>
        <div className="text-sm font-bold opacity-50">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
        />
      </div>

      <div className="glass p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
          {t(currentQ.category)} • {t(currentQ.difficulty)}
        </span>
        <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-8">
          {currentQ.questionText}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = currentQ.correctIndex === idx;
            const isWrongSelection = isSelected && !isCorrect;

            let borderClass = 'border-white/10';
            let bgClass = 'bg-white/5';
            
            if (selectedIdx !== null) {
              if (isCorrect) {
                borderClass = 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                bgClass = 'bg-emerald-500/20';
              } else if (isWrongSelection) {
                borderClass = 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
                bgClass = 'bg-red-500/20';
              }
            } else {
              bgClass = 'hover:bg-white/10 glass-hover';
            }

            return (
              <button
                key={idx}
                disabled={selectedIdx !== null}
                onClick={() => handleSelect(idx)}
                className={`w-full p-5 rounded-2xl border-2 text-start transition-all duration-300 transform flex items-center justify-between ${borderClass} ${bgClass} ${selectedIdx === null ? 'active:scale-95' : ''}`}
              >
                <span className="font-medium text-lg">{opt}</span>
                {selectedIdx !== null && isCorrect && <CheckCircle2 className="text-emerald-500" size={24} />}
                {selectedIdx !== null && isWrongSelection && <XCircle className="text-red-500" size={24} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-12 flex items-center justify-center">
        {selectedIdx !== null && (
          <div className={`animate-bounce flex items-center gap-2 font-bold ${selectedIdx === currentQ.correctIndex ? 'text-emerald-400' : 'text-red-400'}`}>
            {selectedIdx === currentQ.correctIndex ? t('correct') : t('wrong')}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSessionPage;
