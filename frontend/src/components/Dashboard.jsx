import { useState, useEffect, useRef, useMemo } from 'react';
import { getDashboard } from "../api";
import { 
  Heart, 
  Coins, 
  Calendar, 
  Flame, 
  Clock, 
  Activity, 
  Zap,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import BentoCard from './BentoCard';
import * as THREE from 'three';

const AbstractBlobProgress = ({ value, label, color }) => {
  const complexity = useMemo(() => 0.2 + (value / 100) * 0.8, [value]);
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
          <path
            fill={color}
            fillOpacity="0.15"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="5 5"
            d={`M150,100c0,27.6-22.4,50-50,50s-50-22.4-50-50s22.4-50,50-50S150,72.4,150,100z`}
            className="transition-all duration-1000"
            style={{ 
              transform: `scale(${0.8 + complexity * 0.2})`,
              transformOrigin: 'center'
            }}
          />
          <circle cx="100" cy="100" r={40 + value * 0.4} fill={color} fillOpacity="0.1" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-[#292929]">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">{label}</span>
    </div>
  );
};

const CircularGauge = ({ value, label, color }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="56" cy="56" r={radius} fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="4" />
          <circle 
            cx="56" 
            cy="56" 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="4" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            className="transition-all duration-1000 ease-out"
          />
          {[0, 25, 50, 75].map(tick => {
            const angle = (tick / 100) * 360 * (Math.PI / 180);
            const tx = 56 + radius * Math.cos(angle);
            const ty = 56 + radius * Math.sin(angle);
            return <circle key={tick} cx={tx} cy={ty} r="1.5" fill="rgba(0,0,0,0.1)" />;
          })}
        </svg>
        <span className="absolute text-2xl font-black text-[#292929]">{value}%</span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">{label}</span>
    </div>
  );
};

const CravingDotGrid = ({ cravingData = [] }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Use actual craving data or fallback to mock
  const levels = cravingData.length > 0 ? cravingData : [0, 0, 0, 4, 2, 1, 0];
  
  return (
    <div className="flex justify-between items-end h-32 gap-1.5 px-2">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-2 group">
          <div className="flex flex-col gap-1.5">
            {[...Array(5)].map((_, j) => (
              <div 
                key={j} 
                className={`w-4 h-4 rounded-sm transition-all duration-300 ${
                  4 - j < levels[i] 
                    ? 'bg-[#fe7902] shadow-[0_0_12px_rgba(254,121,2,0.4)]' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 mt-1">{day}</span>
        </div>
      ))}
    </div>
  );
};

const InteractiveNeuroCore = () => {
  const containerRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xfe7902, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const innerGeo = new THREE.OctahedronGeometry(1.2, 2);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x292929, wireframe: true, opacity: 0.03, transparent: true });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    const animate = (time) => {
      requestAnimationFrame(animate);
      const t = time * 0.001;
      
      sphere.rotation.y += 0.002;
      sphere.rotation.y += (mouse.current.x * 0.3 - sphere.rotation.y) * 0.05;
      sphere.rotation.x += (-mouse.current.y * 0.3 - sphere.rotation.x) * 0.05;
      
      innerSphere.rotation.z += 0.01;
      innerSphere.scale.setScalar(1 + Math.sin(t * 2) * 0.05);

      renderer.render(scene, camera);
    };
    animate(0);

    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId] = useState("user_" + Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await getDashboard(userId);
        setData(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        // Fallback to mock data
        setData({
          user_id: userId,
          days_smoke_free: 14,
          money_saved: 168.00,
          cravings_resisted: 21,
          cravings_smoked: 3,
          triggers: ["Morning Coffee", "Work Breaks"],
          badges: [],
          health_improvements: ["Lung function improving", "Better sleep quality"],
          craving_history: [0, 0, 0, 4, 2, 1, 0],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe7902]"></div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate health metrics based on days smoke-free
  const lungRepair = Math.min(100, Math.round((data.days_smoke_free / 90) * 100));
  const oxygenation = Math.min(100, Math.round(70 + (data.days_smoke_free / 30) * 30));
  const hrvCoherence = Math.min(100, Math.round(40 + (data.days_smoke_free / 60) * 60));
  const neuroSync = Math.min(100, Math.round(10 + (data.days_smoke_free / 120) * 90));

  const username = "ALEX";
  const daysToFreedom = Math.max(0, 28 - data.days_smoke_free);
  const progressPercent = Math.min(100, (data.days_smoke_free / 28) * 100);

  // Calculate peak and current craving mean from history
  const cravingHistory = data.craving_history || [0, 0, 0, 4, 2, 1, 0];
  const peakLoad = Math.max(...cravingHistory);
  const currentMean = cravingHistory[cravingHistory.length - 1] || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 auto-rows-min">
      {/* 1. Header Hero - Refined Typography */}
      <BentoCard 
        className="sm:col-span-7 !bg-[#292929] text-white border-none overflow-hidden relative min-h-[320px]"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fe7902] opacity-5 blur-[140px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 py-8 flex flex-col justify-center h-full px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#fe7902] mb-6 block">Biometric Verified</span>
          <h1 className="text-6xl font-black tracking-tighter mb-6 leading-[0.85] italic">
            ALEX.<br/>
            <span className="text-[#fe7902]">14 DAYS</span><br/>
            AUTONOMOUS.
          </h1>
          <p className="text-gray-400 max-w-sm text-sm font-medium leading-relaxed opacity-80">
            Synaptic reorganization detected. Neuro-chemical baseline trending toward optimization.
          </p>
          <div className="flex gap-4 mt-10">
            <button className="px-8 py-3 bg-[#fe7902] text-white font-black text-[10px] uppercase tracking-[0.25em] rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-orange-500/10">
              Update Log
            </button>
            <button className="px-8 py-3 bg-white/5 text-white font-black text-[10px] uppercase tracking-[0.25em] rounded-lg hover:bg-white/10 active:scale-95 transition-all border border-white/10">
              Protocol
            </button>
          </div>
        </div>
      </BentoCard>

      {/* 2. Vital Progress - Larger Box for Gauges */}
      <BentoCard className="sm:col-span-5" title="Regeneration Status">
        <div className="grid grid-cols-2 gap-y-12 gap-x-6 py-6 h-full items-center justify-items-center">
          <CircularGauge value={35} label="Lung Repair" color="#fe7902" />
          <CircularGauge value={85} label="Oxygenation" color="#292929" />
          <CircularGauge value={60} label="HRV Coherence" color="#fe7902" />
          <CircularGauge value={20} label="Neuro-Sync" color="#292929" />
        </div>
      </BentoCard>

      {/* 3. Interactive Neuro Core - Centerpiece */}
      <BentoCard className="sm:col-span-5 sm:row-span-2 p-0 overflow-hidden bg-white/5 border-orange-500/5" title="Neuro-Sync Analysis" noPadding>
        <div className="relative w-full h-[520px]">
          <InteractiveNeuroCore />
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-[#fe7902] rounded-full animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#292929]">Signal Strength: High</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receptor Density: Normalizing</p>
            </div>
            <Activity className="h-10 w-10 text-[#fe7902] opacity-10" />
          </div>
        </div>
      </BentoCard>

      {/* 4. Craving Visualization - Dot Grid */}
      <BentoCard className="sm:col-span-4" title="Urge Density Heatmap">
        <div className="py-4">
          <CravingDotGrid />
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Peak Load</span>
              <span className="text-2xl font-black text-[#fe7902] tracking-tighter">LVL 04</span>
            </div>
            <div className="flex flex-col text-right gap-1">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Current Mean</span>
              <span className="text-2xl font-black text-[#292929] tracking-tighter">LVL 01</span>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* 5. Savings / Achievement */}
      <BentoCard className="sm:col-span-3" title="Capital Reclamation">
        <div className="flex flex-col h-full justify-between py-2">
          <div className="space-y-1">
            <p className="text-5xl font-black tracking-tighter text-[#292929] leading-none">$168.00</p>
            <p className="text-[10px] font-black text-[#fe7902] uppercase tracking-[0.3em] mt-2">Recovered Value</p>
          </div>
          <div className="bg-gray-50/80 p-5 rounded-xl mt-6 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Asset: Specialized Gear</span>
              <span className="text-[10px] font-black text-[#fe7902]">24%</span>
            </div>
            <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-[#fe7902] w-[24%] transition-all duration-1000" />
            </div>
          </div>
        </div>
      </BentoCard>

      {/* 6. Milestone Pulse */}
      <BentoCard className="sm:col-span-4 !bg-[#fe7902] text-white border-none overflow-hidden relative" title="Mission Clock">
        <div className="flex items-center gap-6 py-4">
          <div className="flex-1">
            <h3 className="text-3xl font-black tracking-tighter italic uppercase leading-[0.9]">Total<br/>Freedom.</h3>
            <p className="text-[10px] text-orange-100 font-bold uppercase tracking-widest mt-4 opacity-80">Arrival in T-Minus 7 Days</p>
          </div>
          <div className="h-24 w-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
            <span className="text-4xl font-black">21</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/30 w-[66%] transition-all duration-1000" />
      </BentoCard>

      {/* 7. Daily Protocol Callout */}
      <BentoCard className="sm:col-span-3" title="Active Protocol">
        <div className="space-y-5 py-3">
          {[
            { icon: Zap, text: 'Neutralize Morning Coffee Triggers', color: '#292929' },
            { icon: Activity, text: 'Execute 4-7-8 Breath Protocol', color: '#fe7902' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div className="p-2 rounded-lg bg-gray-50 text-[#292929] group-hover:bg-[#fe7902] group-hover:text-white transition-all">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-black text-[#292929] leading-snug uppercase tracking-tight opacity-70 group-hover:opacity-100">{item.text}</p>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* 8. AI Insight */}
      <BentoCard className="sm:col-span-12 lg:col-span-12 hover:border-[#fe7902]/40" noPadding>
        <div className="flex items-center gap-8 p-8">
          <div className="p-5 bg-orange-50 rounded-2xl text-[#fe7902] animate-pulse">
            <Flame className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black text-[#fe7902] uppercase tracking-[0.5em] mb-2 block">Neural Insight Vector #042</span>
            <p className="text-lg font-medium text-[#292929] italic leading-snug">
              "System analysis indicates receptor downregulation. Psychological restlessness is a functional byproduct of returning to systemic equilibrium. <span className="text-[#fe7902] font-black not-italic">Stay the course.</span>"
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 px-4">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Confidence</span>
            <span className="text-xl font-black text-[#292929]">99.4%</span>
          </div>
          <ArrowUpRight className="hidden sm:block h-8 w-8 text-gray-200" />
        </div>
      </BentoCard>
    </div>
  );
};

export default Dashboard;
