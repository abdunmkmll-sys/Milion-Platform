
import React, { useState, useEffect } from 'react';
import { Question, Language, Category, Difficulty, LeaderboardEntry, CommunityComment } from '../types';
import { StorageService } from '../services/storage';
import { BUILT_IN_QUESTIONS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Plus, Trash2, Check, Eye, X, Upload, Lock, Unlock, 
  LayoutDashboard, BookOpen, Trophy, MessageSquare, 
  ChevronRight, Search, BarChart3, Edit2, Download, ShieldCheck, RotateCcw,
  Sparkles, Zap, Database
} from 'lucide-react';

interface Props {
  t: (key: string) => string;
  lang: Language;
}

type AdminTab = 'overview' | 'questions' | 'leaderboard' | 'community' | 'lab';

const AdminDashboard: React.FC<Props> = ({ t, lang }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Data States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scores, setScores] = useState<(LeaderboardEntry & { id: string })[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [stats, setStats] = useState({ questions: 0, scores: 0, comments: 0 });
  const [loading, setLoading] = useState(false);

  // AI Lab States
  const [aiLoading, setAiLoading] = useState(false);
  const [labCategory, setLabCategory] = useState<Category>('science');
  const [labDiff, setLabDiff] = useState<Difficulty>('medium');
  const [labLang, setLabLang] = useState<Language>('ar');

  // UI States
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<Question>>({
    language: 'ar',
    category: 'general',
    difficulty: 'medium',
    options: ['', '', '', ''],
    correctIndex: 0,
    questionText: ''
  });

  const loadAllData = async () => {
    setLoading(true);
    const [qs, ldr, cmm, st] = await Promise.all([
      StorageService.getQuestions(),
      StorageService.getLeaderboard(100) as Promise<(LeaderboardEntry & { id: string })[]>,
      StorageService.getComments(),
      StorageService.getStats()
    ]);
    setQuestions(qs);
    setScores(ldr);
    setComments(cmm);
    setStats(st);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert(lang === 'ar' ? 'كلمة المرور خاطئة' : 'Incorrect password');
    }
  };

  const handleSave = async () => {
    if (!formData.questionText || !formData.options?.every(o => o.trim() !== '')) {
      alert(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    const qToSave = editingQuestion 
      ? { ...formData, id: editingQuestion.id } as Question 
      : { ...formData, id: 'q_' + Math.random().toString(36).substr(2, 9) } as Question;
    
    await StorageService.saveQuestion(qToSave);
    await loadAllData();
    setIsAdding(false);
    setEditingQuestion(null);
    setFormData({ language: 'ar', category: 'general', difficulty: 'medium', options: ['', '', '', ''], correctIndex: 0, questionText: '' });
  };

  const generateAIQuestions = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate 10 high-quality educational quiz questions for a platform called Milion. 
      Category: ${labCategory}
      Difficulty: ${labDiff}
      Language: ${labLang === 'ar' ? 'Arabic' : 'English'}
      Format: Strict JSON. Each question must have questionText, options (array of 4), correctIndex (0-3), and a brief explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["questionText", "options", "correctIndex"]
            }
          }
        }
      });

      const generatedData = JSON.parse(response.text || '[]');
      const formattedQuestions: Question[] = generatedData.map((q: any) => ({
        ...q,
        id: 'ai_' + Math.random().toString(36).substr(2, 9),
        category: labCategory,
        difficulty: labDiff,
        language: labLang
      }));

      await StorageService.batchSaveQuestions(formattedQuestions);
      alert(lang === 'ar' ? `تم توليد وحفظ ${formattedQuestions.length} سؤال بنجاح!` : `Successfully generated and saved ${formattedQuestions.length} questions!`);
      await loadAllData();
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Generation failed. Check console for details.");
    } finally {
      setAiLoading(false);
    }
  };

  const pushSeedsToFirestore = async () => {
    if (confirm(lang === 'ar' ? 'هل تريد رفع جميع الأسئلة الافتراضية إلى السحابة؟' : 'Push all built-in questions to cloud?')) {
      await StorageService.batchSaveQuestions(BUILT_IN_QUESTIONS);
      await loadAllData();
      alert(lang === 'ar' ? 'تم الرفع بنجاح' : 'Push successful');
    }
  };

  const handleDeleteQ = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) {
      await StorageService.deleteQuestion(id);
      await loadAllData();
    }
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormData(q);
    setIsAdding(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass rounded-3xl text-center space-y-6 animate-fade-in shadow-2xl">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
          <Lock size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black">{t('admin')}</h2>
          <p className="opacity-50 text-sm mt-1">{lang === 'ar' ? 'يرجى إدخال رمز الوصول' : 'Please enter access code'}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-indigo-500 focus:outline-none text-center text-xl tracking-widest"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
            <Unlock size={20} />
            {lang === 'ar' ? 'دخول المشرف' : 'Admin Login'}
          </button>
        </form>
        <p className="text-[10px] opacity-20 uppercase tracking-tighter">Secure Command Center v1.0</p>
      </div>
    );
  }

  const filteredQuestions = questions.filter(q => 
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-3">
            <ShieldCheck size={36} className="text-indigo-400" />
            {lang === 'ar' ? 'مركز التحكم' : 'Command Center'}
          </h2>
          <p className="opacity-50 mt-1">{lang === 'ar' ? 'أهلاً بك، المشرف. المنصة تعمل بشكل ممتاز.' : 'Welcome, Admin. Platform is running smoothly.'}</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => window.location.reload()} className="p-3 glass rounded-2xl hover:bg-white/10 transition-colors">
              <RotateCcw size={20} />
           </button>
           <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-indigo-500 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform flex items-center gap-2">
              <Plus size={20} />
              {lang === 'ar' ? 'إضافة سؤال' : 'New Question'}
           </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label={lang === 'ar' ? 'نظرة عامة' : 'Overview'} />
        <TabButton active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} icon={<BookOpen size={18}/>} label={t('selectCategory')} />
        <TabButton active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<Zap size={18}/>} label={lang === 'ar' ? 'مختبر الأسئلة' : 'AI Lab'} />
        <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy size={18}/>} label={t('leaderboard')} />
        <TabButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={<MessageSquare size={18}/>} label={t('community')} />
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatCard label={lang === 'ar' ? 'إجمالي الأسئلة' : 'Total Questions'} value={stats.questions} color="bg-blue-500" icon={<BookOpen />} />
            <StatCard label={lang === 'ar' ? 'النتائج المسجلة' : 'Game Sessions'} value={stats.scores} color="bg-emerald-500" icon={<Trophy />} />
            <StatCard label={lang === 'ar' ? 'تفاعلات المجتمع' : 'Comments'} value={stats.comments} color="bg-purple-500" icon={<MessageSquare />} />
            
            <div className="md:col-span-2 glass p-8 rounded-[2.5rem] space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-400" />
                {lang === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
              </h3>
              <div className="space-y-3">
                 {[...comments].slice(0, 5).map(c => (
                   <div key={c.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold">{c.userName[0]}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">{c.userName} <span className="text-[10px] opacity-30 font-normal">علّق في المجتمع</span></div>
                        <div className="text-xs opacity-50 truncate">{c.text}</div>
                      </div>
                      <div className="text-[10px] opacity-30 whitespace-nowrap">{new Date(c.timestamp).toLocaleTimeString()}</div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
               <Database size={48} className="text-indigo-400 opacity-20" />
               <h3 className="font-bold">{lang === 'ar' ? 'مزامنة البيانات' : 'Sync Data'}</h3>
               <p className="text-xs opacity-50 px-4">{lang === 'ar' ? 'رفع الأسئلة المدمجة إلى قاعدة البيانات السحابية' : 'Push internal seed questions to your cloud Firestore database.'}</p>
               <button 
                onClick={pushSeedsToFirestore}
                className="w-full py-3 bg-white/10 rounded-2xl text-sm font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
               >
                 <Upload size={16} />
                 Push Seeds to Cloud
               </button>
            </div>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="glass p-8 rounded-[2.5rem] space-y-8 animate-fade-in border-indigo-500/20 shadow-xl shadow-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black">{lang === 'ar' ? 'توليد الأسئلة بالذكاء الاصطناعي' : 'AI Question Lab'}</h3>
                <p className="text-sm opacity-50">{lang === 'ar' ? 'استخدم Gemini 3 Flash لإنشاء دفعات كبيرة من الأسئلة' : 'Use Gemini 3 Flash to create large batches of high-quality questions instantly.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <SelectField label={t('selectCategory')} value={labCategory} onChange={(v: string) => setLabCategory(v as Category)} options={['science', 'history', 'math', 'geography', 'religion', 'general']} t={t} />
               <SelectField label={t('selectDifficulty')} value={labDiff} onChange={(v: string) => setLabDiff(v as Difficulty)} options={['easy', 'medium', 'hard']} t={t} />
               <SelectField label={t('selectLang')} value={labLang} onChange={(v: string) => setLabLang(v as Language)} options={['ar', 'en']} t={t} />
            </div>

            <button
              onClick={generateAIQuestions}
              disabled={aiLoading}
              className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all ${aiLoading ? 'bg-white/5 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95'}`}
            >
              {aiLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {lang === 'ar' ? 'جاري التوليد...' : 'Generating Batch...'}
                </div>
              ) : (
                <>
                  <Sparkles size={24} />
                  {lang === 'ar' ? 'توليد 10 أسئلة جديدة وحفظها' : 'Generate & Save 10 Questions'}
                </>
              )}
            </button>

            <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-sm">
              <p className="font-bold mb-2 flex items-center gap-2">
                <Zap size={16} className="text-indigo-400" />
                {lang === 'ar' ? 'كيف يعمل هذا؟' : 'How does this work?'}
              </p>
              <p className="opacity-70 leading-relaxed">
                {lang === 'ar' 
                  ? 'سيقوم النظام بالاتصال بـ Gemini API لإنشاء 10 أسئلة فريدة بناءً على اختياراتك. سيتم فحص الأسئلة وحفظها مباشرة في قاعدة البيانات، وستظهر فوراً للاعبين.' 
                  : 'The system will connect to the Gemini API to generate 10 unique questions based on your selections. Questions are automatically formatted and saved directly to Firestore, becoming instantly available to players.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                 <input 
                  type="text" 
                  placeholder={lang === 'ar' ? 'البحث في الأسئلة...' : 'Search questions...'}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl focus:border-indigo-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredQuestions.length === 0 ? (
                <div className="p-20 text-center glass rounded-3xl opacity-30 italic">
                  {lang === 'ar' ? 'لا توجد أسئلة. استخدم المختبر لتوليد بعضها!' : 'No questions found. Use the Lab to generate some!'}
                </div>
              ) : (
                filteredQuestions.map(q => (
                  <div key={q.id} className="glass p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                         <Badge label={t(q.category)} color="indigo" />
                         <Badge label={t(q.difficulty)} color="purple" />
                         <Badge label={q.language.toUpperCase()} color="gray" />
                      </div>
                      <h4 className="text-lg font-bold">{q.questionText}</h4>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEdit(q)} className="p-4 glass rounded-2xl text-indigo-400 hover:bg-indigo-500/20 transition-colors"><Edit2 size={20} /></button>
                       <button onClick={() => handleDeleteQ(q.id)} className="p-4 glass rounded-2xl text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="glass rounded-[2.5rem] overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-bold">{lang === 'ar' ? 'إدارة الترتيب' : 'Leaderboard Moderation'}</h3>
            </div>
            <table className="w-full text-start">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest opacity-40">
                <tr>
                  <th className="px-8 py-4 text-start">Rank</th>
                  <th className="px-8 py-4 text-start">Player</th>
                  <th className="px-8 py-4 text-start">Score</th>
                  <th className="px-8 py-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scores.map((s, idx) => (
                  <tr key={s.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-4 font-mono opacity-50">#{idx + 1}</td>
                    <td className="px-8 py-4">
                      <div className="font-bold">{s.userName}</div>
                      <div className="text-[10px] opacity-30">{new Date(s.date).toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-4 text-indigo-400 font-black">{s.score}</td>
                    <td className="px-8 py-4 text-end">
                      <button onClick={() => StorageService.deleteScore(s.id).then(loadAllData)} className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="px-2 text-xl font-bold">{lang === 'ar' ? 'رقابة التعليقات' : 'Comment Moderation'}</h3>
            <div className="grid grid-cols-1 gap-4">
               {comments.map(c => (
                 <div key={c.id} className="glass p-6 rounded-[2rem] flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold">{c.userName[0]}</div>
                       <div>
                          <div className="font-bold">{c.userName} <span className="text-[10px] font-normal opacity-30 ml-2">{new Date(c.timestamp).toLocaleString()}</span></div>
                          <p className="text-sm text-white/70 mt-1">{c.text}</p>
                       </div>
                    </div>
                    <button onClick={() => StorageService.deleteComment(c.id).then(loadAllData)} className="p-4 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-2xl transition-all"><Trash2 size={20}/></button>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-8 space-y-6 relative animate-fade-in shadow-2xl border-white/20">
             <button onClick={() => {setIsAdding(false); setEditingQuestion(null);}} className="absolute top-6 right-6 p-2 glass rounded-full hover:bg-white/10">
                <X size={24} />
             </button>
             
             <h3 className="text-2xl font-black">{editingQuestion ? (lang === 'ar' ? 'تعديل سؤال' : 'Edit Question') : (lang === 'ar' ? 'سؤال جديد' : 'New Question')}</h3>
             
             <div className="space-y-4">
                <textarea 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl min-h-[120px] focus:border-indigo-500 outline-none text-lg leading-relaxed"
                  placeholder={lang === 'ar' ? 'اكتب نص السؤال هنا...' : 'Type your question here...'}
                  value={formData.questionText}
                  onChange={e => setFormData({...formData, questionText: e.target.value})}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField label={t('selectCategory')} value={formData.category} onChange={(v: string) => setFormData({...formData, category: v as Category})} options={['science', 'history', 'math', 'geography', 'religion', 'general']} t={t} />
                  <SelectField label={t('selectDifficulty')} value={formData.difficulty} onChange={(v: string) => setFormData({...formData, difficulty: v as Difficulty})} options={['easy', 'medium', 'hard']} t={t} />
                  <SelectField label={t('selectLang')} value={formData.language} onChange={(v: string) => setFormData({...formData, language: v as Language})} options={['ar', 'en']} t={t} />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase opacity-40 px-2 tracking-widest">{lang === 'ar' ? 'الخيارات (اختر الإجابة الصحيحة)' : 'Options (Mark correct one)'}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.options?.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-2 p-1 rounded-2xl border-2 transition-all ${formData.correctIndex === i ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
                        <input 
                          className="flex-1 bg-transparent p-3 outline-none text-sm"
                          placeholder={`Option ${i+1}`}
                          value={opt}
                          onChange={e => {
                            const next = [...formData.options!];
                            next[i] = e.target.value;
                            setFormData({...formData, options: next});
                          }}
                        />
                        <button 
                          onClick={() => setFormData({...formData, correctIndex: i})}
                          className={`p-3 rounded-xl transition-all ${formData.correctIndex === i ? 'bg-emerald-500 text-white' : 'opacity-20 hover:opacity-100'}`}
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSave} className="w-full py-5 bg-indigo-500 rounded-3xl font-black text-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                   {editingQuestion ? <Edit2 size={24}/> : <Plus size={24}/>}
                   {editingQuestion ? (lang === 'ar' ? 'تحديث السؤال' : 'Update Question') : (lang === 'ar' ? 'حفظ ونشر' : 'Save & Publish')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all whitespace-nowrap ${active ? 'bg-white text-indigo-900 shadow-xl' : 'glass hover:bg-white/10'}`}
  >
    {icon}
    {label}
  </button>
);

const StatCard = ({ label, value, color, icon }: any) => (
  <div className="glass p-8 rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden group">
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700`}>
       {React.cloneElement(icon, { size: 120 })}
    </div>
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
      {React.cloneElement(icon, { size: 28, className: 'text-white' })}
    </div>
    <div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs opacity-50 uppercase font-bold tracking-widest">{label}</div>
    </div>
  </div>
);

const Badge = ({ label, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-500/20 text-indigo-300',
    purple: 'bg-purple-500/20 text-purple-300',
    gray: 'bg-white/10 text-white/50'
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
};

const SelectField = ({ label, value, onChange, options, t }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase opacity-40 px-2 tracking-widest">{label}</label>
    <select 
      className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl focus:border-indigo-500 outline-none text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map((o: string) => (
        <option key={o} value={o} className="bg-slate-900">{t(o) || o.toUpperCase()}</option>
      ))}
    </select>
  </div>
);

export default AdminDashboard;
