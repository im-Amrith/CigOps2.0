import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ListTodo, 
  Mic, 
  TrendingUp, 
  MapPin, 
  FileSearch,
  Menu,
  X,
  Flame
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import CrisisChat from './components/CrisisChat';
import QuitPlan from './components/QuitPlan';
import ConversationalAI from './components/ConversationalAI';
import GamifiedRecovery from './components/GamifiedRecovery';
import ResourceLocator from './components/ResourceLocator';
import PdfAnalyzer from './components/PdfAnalyzer';

const Header = () => (
  <header className="w-full pl-8 flex items-center py-6 bg-gray-50 z-10">
    <div className="flex items-center gap-3">
      <div className="bg-[#fe7902] p-2 rounded-xl shadow-[0_0_20px_rgba(254,121,2,0.3)] animate-pulse">
        <Flame className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col items-start">
        <span className="font-black text-xs uppercase tracking-[0.3em] text-[#292929]">Recovery Pro</span>
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#fe7902] opacity-70">AI Augmented</span>
      </div>
    </div>
  </header>
);

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { id: 'Dashboard', path: '/', icon: LayoutDashboard },
    { id: 'Chat', path: '/chat', icon: MessageSquare },
    { id: 'Quit Plan', path: '/plan', icon: ListTodo },
    { id: 'Voice AI', path: '/voice', icon: Mic },
    { id: 'Recovery Journey', path: '/game', icon: TrendingUp },
    { id: 'Find Help', path: '/resources', icon: MapPin },
    { id: 'PDF Analyzer', path: '/pdf-analyzer', icon: FileSearch },
  ];

  const activeTab = tabs.find(t => t.path === location.pathname)?.id || 'Dashboard';

  return (
    <>
      {/* Mobile Dropdown Menu - Centered using Flexbox */}
      {isOpen && (
        <div className="fixed bottom-28 inset-x-0 flex justify-center z-40 pointer-events-none">
          <div className="w-[90%] max-w-md bg-[#3a3a3a]/95 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-auto">
            <div className="px-3 py-4 space-y-1 max-h-[50vh] overflow-y-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      block px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 transition-all
                      ${isActive 
                        ? 'bg-[#fe7902] text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.id}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar - Centered using Flexbox */}
      <nav className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-[#3a3a3a]/95 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 px-6 py-3 pointer-events-auto">
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`
                    p-3 rounded-full transition-all duration-300 flex items-center justify-center
                    ${isActive 
                      ? 'bg-[#fe7902] text-white shadow-lg shadow-[#fe7902]/50 scale-110' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                  title={tab.id}
                >
                  <tab.icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation (Icon Limit: 6) */}
          <div className="md:hidden flex items-center justify-center gap-2">
            {tabs.slice(0, 6).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`
                    p-3 rounded-full transition-all duration-300 flex items-center justify-center
                    ${isActive 
                      ? 'bg-[#fe7902] text-white shadow-lg shadow-[#fe7902]/50 scale-110' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                  title={tab.id}
                >
                  <tab.icon className="h-5 w-5" />
                </Link>
              );
            })}
            
            {/* More Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                isOpen ? 'bg-[#fe7902] text-white shadow-lg shadow-[#fe7902]/50' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="More"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

const BackgroundEffects = () => (
  <>
    <div className="light-ray" style={{ top: '10%', left: '5%' }}></div>
    <div className="light-ray" style={{ bottom: '15%', right: '10%', animationDelay: '-5s' }}></div>
    <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-[#fe7902]/5 via-transparent to-[#292929]/5"></div>
  </>
);

const App = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      <BackgroundEffects />
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<CrisisChat />} />
          <Route path="/plan" element={<QuitPlan />} />
          <Route path="/voice" element={<ConversationalAI />} />
          <Route path="/game" element={<GamifiedRecovery />} />
          <Route path="/resources" element={<ResourceLocator />} />
          <Route path="/pdf-analyzer" element={<PdfAnalyzer />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
