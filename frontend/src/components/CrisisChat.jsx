import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  Paperclip, 
  Plus, 
  Clock, 
  MessageSquare,
  Image as ImageIcon,
  Globe,
  ChevronDown,
  RefreshCw,
  Search,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { sendMessage, getChatHistory } from "../api";

const WaveformBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] z-0">
      <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full preserve-3d">
        <path
          fill="#fe7902"
          d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          className="animate-[wave_20s_ease-in-out_infinite_alternate]"
        />
      </svg>
      <style>{`
        @keyframes wave {
          0% { transform: translateY(0) scaleY(1); }
          100% { transform: translateY(20px) scaleY(1.2); }
        }
      `}</style>
    </div>
  );
};

const CrisisChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId] = useState(() => "user_" + Math.random().toString(36).substring(2, 9));
  const scrollRef = useRef(null);

  const history = [
    { id: 'h1', title: 'Morning Craving Strategy', date: 'Today' },
    { id: 'h2', title: 'Neuroplasticity Basics', date: 'Yesterday' },
    { id: 'h3', title: 'Dopamine Recovery Timeline', date: '3 days ago' },
    { id: 'h4', title: 'Relapse Prevention Plan', date: '1 week ago' },
  ];

  const suggestions = [
    { title: 'Write a craving response plan', sub: 'For high-stress situations', icon: MessageSquare },
    { title: 'Analyze recovery data', sub: 'Extract insights from current week', icon: Clock },
    { title: 'Explain dopamine receptors', sub: 'Summarize neural changes in 1 paragraph', icon: Sparkles },
    { title: 'Support group nodes', sub: 'Find clinical facilities nearby', icon: Search },
  ];

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory(userId);
        if (history && history.length > 0) {
          const formattedHistory = history.map(msg => ({
            id: msg.id,
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedHistory);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };
    loadHistory();
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customMsg) => {
    const text = customMsg || input;
    if (!text.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const context = {
        user_id: userId,
        days_smoke_free: 14,
        cravings: 0,
        triggers: [],
        goals: [],
        medications: [],
        quit_date: null,
        last_smoke: null,
        quit_attempts: 0,
        support_network: [],
        preferred_coping_strategies: [],
        time_of_day: null,
        location: null,
        mood: "",
        stress_level: 5,
        sleep_hours: null,
        exercise_minutes: null,
        water_intake: null,
        caffeine_intake: null,
        alcohol_intake: null,
        other_context: {},
      };

      const response = await sendMessage(userId, text, context, true, "default");
      
      const aiMsg = { 
        id: response.id || (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.text || "Synchronizing recovery protocols...", 
        timestamp: new Date(response.timestamp) 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8 overflow-hidden bg-[#fffff5] border-t border-orange-500/5">
      {/* Collapsible Sidebar */}
      <aside 
        className={`bg-white/40 border-r border-orange-500/10 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${
          isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div className="p-6 min-w-[288px]">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#292929] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 mb-8">
            <Plus className="h-4 w-4 text-[#fe7902]" />
            New Session
          </button>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 block">Archive</span>
              <div className="space-y-1">
                {history.map(item => (
                  <button key={item.id} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-500/5 group text-left transition-all">
                    <MessageSquare className="h-4 w-4 text-gray-300 group-hover:text-[#fe7902]" />
                    <span className="text-sm font-bold text-[#292929] truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-orange-500/5 min-w-[288px]">
          <div className="flex items-center gap-3 text-gray-400 hover:text-[#292929] cursor-pointer transition-colors">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Logs</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <WaveformBackground />
        
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-6 left-6 z-50 p-2 text-gray-400 hover:text-[#fe7902] hover:bg-orange-50 rounded-xl transition-all"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col items-center pt-16" ref={scrollRef}>
          <div className="max-w-4xl w-full px-8">
            {messages.length === 0 ? (
              /* New Chat State */
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mb-8">
                  <h1 className="text-4xl font-black tracking-tighter text-[#292929] italic uppercase leading-none">
                    Hi there, <span className="text-[#fe7902] underline decoration-[#fe7902]/20">Alex</span>
                  </h1>
                  <h2 className="text-4xl font-black tracking-tighter text-[#292929]/30 italic uppercase leading-none mt-2">
                    What would you like to know?
                  </h2>
                  <p className="text-sm font-medium text-gray-400 mt-4 tracking-tight">
                    Deploy one of the recovery protocols below or initiate a manual query to begin.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {suggestions.map((s, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(s.title)}
                      className="flex flex-col text-left p-5 bg-white border border-orange-500/5 rounded-2xl hover:border-[#fe7902]/40 hover:shadow-xl transition-all group min-h-[120px]"
                    >
                      <p className="text-sm font-black text-[#292929] uppercase leading-tight mb-2 group-hover:text-[#fe7902] transition-colors">
                        {s.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-relaxed">
                        {s.sub}
                      </p>
                      <div className="mt-auto opacity-10 group-hover:opacity-100 group-hover:text-[#fe7902] transition-all">
                        <s.icon className="h-5 w-5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Chat messages */
              <div className="space-y-12">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[90%] gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 mt-1 h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-[#fe7902] text-white' : 'bg-[#292929] text-white'}`}>
                        {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>
                      <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`p-6 rounded-3xl font-medium text-lg leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-transparent text-[#292929] font-black' 
                            : 'bg-white shadow-xl shadow-orange-500/5 text-[#292929] border border-orange-500/5'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-6 items-center animate-pulse">
                      <div className="bg-[#292929] text-white h-10 w-10 rounded-2xl flex items-center justify-center">
                        <Sparkles className="h-5 w-5 animate-spin" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Focused Footer Input */}
        <div className="border-t border-orange-500/10 bg-[#fffff5] p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-orange-500/10 p-4 transition-all focus-within:border-[#fe7902]/30">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask whatever you want..."
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 resize-none font-bold text-[#292929] placeholder:text-gray-300 text-lg"
                rows={1}
              />
              
              <div className="flex items-center justify-between px-4 mt-4">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#fe7902] transition-colors">
                    <Paperclip className="h-4 w-4" />
                    Add Attachment
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#fe7902] transition-colors">
                    <ImageIcon className="h-4 w-4" />
                    Use Image
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    <Globe className="h-3 w-3 text-gray-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">All Nodes</span>
                    <ChevronDown className="h-3 w-3 text-gray-300" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase tabular-nums">
                      {input.length}/1000
                    </span>
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className={`p-3 rounded-xl transition-all shadow-lg active:scale-95 ${
                        !input.trim() || isLoading 
                          ? 'bg-gray-200 text-gray-400' 
                          : 'bg-[#fe7902] text-white hover:shadow-orange-500/30'
                      }`}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 mt-3">
              AI-Augmented Recovery • Clinical Protocol Verification Enabled
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrisisChat;