
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
// Removed AgeGroup as it is not exported from types.ts
import { Language, Category, Difficulty } from './types';
import { DICTIONARY } from './constants';
import { LanguageToggle } from './components/LanguageToggle';
import Home from './pages/Home';
import QuizSessionPage from './pages/QuizSessionPage';
import Leaderboard from './pages/Leaderboard';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import { Home as HomeIcon, Trophy, MessageSquare, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('milion_lang');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('milion_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.className = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Force redirect to home on initial load or refresh to satisfy the requirement
  // that the main page should show instead of staying on a sub-page like Community.
  useEffect(() => {
    if (window.location.hash !== '' && window.location.hash !== '#/') {
      window.location.hash = '#/';
    }
  }, []);

  const t = (key: string) => DICTIONARY[key]?.[lang] || key;

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col pb-20 md:pb-0 md:pt-16">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-2xl font-bold">M</span>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 hidden sm:block">
                {t('appName')}
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <HeaderNavLink to="/" label={t('appName')} />
              <HeaderNavLink to="/leaderboard" label={t('leaderboard')} />
              <HeaderNavLink to="/community" label={t('community')} />
              <HeaderNavLink to="/admin" label={t('admin')} isAdmin />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 mt-16 max-w-5xl">
          <Routes>
            <Route path="/" element={<Home t={t} lang={lang} />} />
            <Route path="/quiz" element={<QuizSessionPage t={t} lang={lang} />} />
            <Route path="/leaderboard" element={<Leaderboard t={t} lang={lang} />} />
            <Route path="/community" element={<Community t={t} lang={lang} />} />
            <Route path="/admin" element={<AdminDashboard t={t} lang={lang} />} />
          </Routes>
        </main>

        {/* Bottom Navigation (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 px-4 h-16 flex items-center justify-around">
          <MobileNavLink to="/" icon={<HomeIcon size={20} />} label={t('appName')} />
          <MobileNavLink to="/leaderboard" icon={<Trophy size={20} />} label={t('leaderboard')} />
          <MobileNavLink to="/community" icon={<MessageSquare size={20} />} label={t('community')} />
          <MobileNavLink to="/admin" icon={<ShieldCheck size={20} />} label={t('admin')} />
        </nav>
      </div>
    </HashRouter>
  );
};

const HeaderNavLink = ({ to, label, isAdmin }: { to: string; label: string; isAdmin?: boolean }) => {
  return (
    <Link 
      to={to} 
      className={`text-sm font-bold transition-all hover:opacity-100 flex items-center gap-1.5 ${
        isAdmin ? 'text-indigo-400 opacity-100 hover:text-indigo-300' : 'opacity-60 text-white'
      }`}
    >
      {isAdmin && <ShieldCheck size={14} />}
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link to={to} className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors">
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);

export default App;
