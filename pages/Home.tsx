
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category, Difficulty, Language, LeaderboardEntry } from '../types';
import { StorageService } from '../services/storage';
import { Play, Flame, Trophy, Award, Medal, ArrowRight, User } from 'lucide-react';

interface Props {
  t: (key: string) => string;
  lang: Language;
}

const Home: React.FC<Props> = ({ t, lang }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => localStorage.getItem('milion_user_name') || '');
  const [category, setCategory] = useState<Category>('religion');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ questions: 0, scores: 0 });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [leaderboardData, liveStats] = await Promise.all([
        StorageService.getLeaderboard(5),
        StorageService.getStats()
      ]);
      setTopPlayers(leaderboardData);
      setStats({
        questions: liveStats.questions,
        scores: liveStats.scores
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('milion_user_name', userName);
  }, [userName]);

  const handleStart = () => {
    if (!userName.trim()) {
      setShowError(true);
      return;
    }
    navigate(`/quiz?name=${encodeURIComponent(userName)}&cat=${category}&diff=${difficulty}`);
  };

  const handleDaily = () => {
    if (!userName.trim()) {
      setShowError(true);
      return;
    }
    navigate(`/quiz?name=${encodeURIComponent(userName)}&daily=true`);
  };

  const formatStat = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto pb-12">
      <section className="text-center py-16 px-4 space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] -z-10 rounded-full"></div>
        
        <h2 className="text-5xl md:text-7xl font-[900] tracking-tight text-white drop-shadow-2xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-indigo-300">
            {t('appName')}
          </span>
        </h2>
        
        <p className="text-white/80 text-lg md:text-2xl max-w-lg mx-auto leading-relaxed font-medium">
          {lang === 'ar' ? 'اختبر معلوماتك ونافس الملايين في منصة تعليمية فريدة' : 'Test your knowledge and compete with millions in a unique educational platform.'}
        </p>
      </section>

      <div 
        onClick={handleDaily}
        className="cursor-pointer glass border-indigo-500/40 p-6 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
          <Flame size={120} color="#6366f1" />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Flame size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">{t('dailyChallenge')}</h3>
            <p className="text-indigo-100/70 text-sm">{lang === 'ar' ? 'أسئلة جديدة كل يوم للجميع' : 'Fresh questions every day for everyone'}</p>
          </div>
          <div className={`p-3 bg-white/10 rounded-full transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180' : ''}`}>
             <ArrowRight size={24} className="text-indigo-300" />
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[2.5rem] space-y-8 shadow-2xl border-white/10">
        <div className="space-y-4">
          <label className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em] block px-1">
            {lang === 'ar' ? 'اسم المتسابق' : 'YOUR COMPETITOR NAME'}
          </label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-white transition-colors" size={22} />
            <input 
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setShowError(false);
              }}
              placeholder={lang === 'ar' ? 'أدخل اسمك هنا...' : 'Enter your name...'}
              className={`w-full bg-white/5 border-2 ${showError ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-indigo-500/50'} p-5 pl-14 rounded-2xl outline-none text-xl font-bold transition-all placeholder:text-white/20 placeholder:font-normal`}
            />
            {showError && (
              <p className="text-red-400 text-sm mt-3 font-bold flex items-center gap-2 px-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                {lang === 'ar' ? 'يرجى إدخال الاسم قبل البدء' : 'Please enter your name before starting'}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">{t('selectCategory')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['science', 'history', 'geography', 'math', 'religion', 'general'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as Category)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${category === cat ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'}`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">{t('selectDifficulty')}</label>
            <div className="flex flex-col gap-2">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff as Difficulty)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${difficulty === diff ? 'bg-purple-600 text-white border-purple-400 shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/5'}`}
                >
                  {t(diff)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[1.5rem] text-2xl font-black text-white hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          <Play fill="currentColor" size={28} />
          {t('startGame')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-6 rounded-3xl flex items-center gap-5 border-white/5 group transition-all">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
            <Trophy className="text-yellow-400" size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white tabular-nums animate-fade-in" key={stats.scores}>
              +{formatStat(stats.scores || 1200000)}
            </div>
            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">{lang === 'ar' ? 'لاعب نشط' : 'Active Players'}</div>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl flex items-center gap-5 border-white/5 group transition-all">
          <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-400/20 transition-colors">
            <Award className="text-emerald-400" size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white tabular-nums animate-fade-in" key={stats.questions}>
              +{formatStat(stats.questions || 150)}
            </div>
            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">{lang === 'ar' ? 'تحدي جديد' : 'New Challenges'}</div>
          </div>
        </div>
      </div>

      <section className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Medal className="text-yellow-400" size={24} />
            {lang === 'ar' ? 'قائمة المتصدرين' : 'Leaderboard'}
          </h3>
          <Link to="/leaderboard" className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:text-indigo-300 transition-colors bg-white/5 px-4 py-2 rounded-full">
            {lang === 'ar' ? 'عرض الكل' : 'View All'}
            <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </Link>
        </div>

        <div className="glass rounded-[2rem] overflow-hidden border-white/5 divide-y divide-white/5">
          {topPlayers.length === 0 ? (
            <div className="p-12 text-center text-white/20 italic font-medium">
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading ranks...'}
            </div>
          ) : (
            topPlayers.map((player, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${
                    idx === 0 ? 'bg-yellow-400 text-indigo-950 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : 
                    idx === 1 ? 'bg-slate-300 text-indigo-950' : 
                    idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{player.userName}</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{player.accuracy}% {t('accuracy')}</div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-2xl font-black text-indigo-400 leading-none">{player.score}</div>
                  <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{t('score')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
