
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Send, MessageSquare, ThumbsUp, Heart } from 'lucide-react';
import { CommunityComment, Language } from '../types';

interface Props {
  t: (key: string) => string;
  lang: Language;
}

const Community: React.FC<Props> = ({ t, lang }) => {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await StorageService.getComments();
      setComments(res);
      setLoading(false);
    };
    load();
  }, []);

  const handlePost = async () => {
    if (!newText.trim()) return;
    const commentData = {
      userId: 'guest',
      userName: 'Guest',
      text: newText,
      timestamp: Date.now(),
      reactions: []
    };
    await StorageService.addComment(commentData);
    setNewText('');
    // Refresh
    const res = await StorageService.getComments();
    setComments(res);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
       <div className="text-center space-y-2">
        <h2 className="text-3xl font-black flex items-center justify-center gap-3">
          <MessageSquare className="text-indigo-400" />
          {t('community')}
        </h2>
        <p className="opacity-60">{lang === 'ar' ? 'شارك أفكارك مع المتعلمين الآخرين' : 'Share your thoughts with other learners'}</p>
      </div>

      <div className="glass p-4 rounded-3xl flex flex-col gap-4">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={lang === 'ar' ? 'ماذا يدور في ذهنك؟' : 'What is on your mind?'}
          className="w-full bg-white/5 rounded-2xl p-4 min-h-[100px] border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handlePost}
            className="px-6 py-2 bg-indigo-500 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors"
          >
            <Send size={18} />
            {lang === 'ar' ? 'نشر' : 'Post'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center opacity-50 py-10">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : comments.map((c) => (
          <div key={c.id} className="glass p-6 rounded-3xl space-y-3 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                {c.userName[0]}
              </div>
              <div>
                <div className="text-sm font-bold">{c.userName}</div>
                <div className="text-[10px] opacity-40">{new Date(c.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">{c.text}</p>
            <div className="flex gap-4 pt-2 border-t border-white/5">
              <button className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity text-sm">
                <ThumbsUp size={14} /> 0
              </button>
              <button className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity text-sm">
                <Heart size={14} className="text-pink-400" /> 0
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
