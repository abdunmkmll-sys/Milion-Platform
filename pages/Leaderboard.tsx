
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Trophy, Medal } from 'lucide-react';
import { Language, LeaderboardEntry } from '../types';

interface Props {
  t: (key: string) => string;
  lang: Language;
}

const Leaderboard: React.FC<Props> = ({ t, lang }) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await StorageService.getLeaderboard(50);
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" />
          {t('leaderboard')}
        </h2>
        <p className="opacity-60">{lang === 'ar' ? 'أفضل المتسابقين حول العالم' : 'Top challengers around the world'}</p>
      </div>

      {loading ? (
        <div className="glass p-12 rounded-3xl text-center opacity-50">
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : data.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center opacity-50">
          {lang === 'ar' ? 'لا يوجد متصدرون حتى الآن. كن الأول!' : 'No leaders yet. Be the first!'}
        </div>
      ) : (
        <div className="glass rounded-[2rem] overflow-hidden">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-widest opacity-50">#</th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-widest opacity-50">{lang === 'ar' ? 'اللاعب' : 'Player'}</th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-widest opacity-50">{t('score')}</th>
                <th className="px-6 py-4 text-start text-xs font-bold uppercase tracking-widest opacity-50">{t('accuracy')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((entry, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    {idx === 0 ? <Medal className="text-yellow-400" size={20} /> : 
                     idx === 1 ? <Medal className="text-gray-300" size={20} /> :
                     idx === 2 ? <Medal className="text-amber-600" size={20} /> : 
                     <span className="font-mono opacity-50">{idx + 1}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{entry.userName}</div>
                    <div className="text-[10px] opacity-40">{new Date(entry.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-indigo-400">{entry.score}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 rounded-md bg-white/5 text-emerald-400 text-xs font-bold">{entry.accuracy}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
