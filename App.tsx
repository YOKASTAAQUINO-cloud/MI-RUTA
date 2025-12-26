
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Coaching from './components/Coaching';
import ContentSupport from './components/ContentSupport';
import FollowUps from './components/FollowUps';
import IncomeTracker from './components/IncomeTracker';
import StrategyCalendar from './components/StrategyCalendar';

const Navigation = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'INICIO', icon: '🏛️' },
    { path: '/planner', label: 'AGENDA', icon: '📜' },
    { path: '/strategy', label: 'ESTRATEGIA', icon: '📅' },
    { path: '/coaching', label: 'MENTOR', icon: '✨' },
    { path: '/content', label: 'ESTUDIO', icon: '🖋️' },
    { path: '/followups', label: 'SEGUIMIENTO', icon: '💎' },
    { path: '/income', label: 'FORTUNA', icon: '💰' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-luxury-gold/20 flex justify-around items-center p-4 md:top-0 md:bottom-auto md:flex-col md:w-24 md:h-screen md:border-r md:p-6 z-50 transition-all duration-500">
      <div className="hidden md:block mb-10 text-center">
        <h1 className="serif text-2xl font-bold text-luxury-burgundy tracking-tighter">R</h1>
        <div className="w-8 h-[1px] bg-luxury-gold mx-auto mt-1"></div>
      </div>
      <div className="flex w-full justify-around md:flex-col md:gap-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center group transition-all duration-300 ${
              location.pathname === item.path 
                ? 'text-luxury-burgundy' 
                : 'text-luxury-gold/40 hover:text-luxury-gold'
            }`}
          >
            <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.path ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[8px] font-bold mt-2 letter-spacing-widest uppercase md:hidden lg:block">{item.label}</span>
            {location.pathname === item.path && (
              <div className="w-1 h-1 bg-luxury-burgundy rounded-full mt-1 hidden md:block"></div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen pb-24 md:pb-0 md:pl-24 flex flex-col selection:bg-luxury-gold selection:text-white">
        <Navigation />
        <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/strategy" element={<StrategyCalendar />} />
            <Route path="/coaching" element={<Coaching />} />
            <Route path="/content" element={<ContentSupport />} />
            <Route path="/followups" element={<FollowUps />} />
            <Route path="/income" element={<IncomeTracker />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
