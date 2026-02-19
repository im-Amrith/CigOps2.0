import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Activity, Info } from 'lucide-react';
import BentoCard from './BentoCard';
import * as THREE from 'three';
import { getAudioStream } from '../api';
import api from '../api';

const ReactiveBrutalistCore = ({ isActive }) => {
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const meshRef = useRef(null);

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

    const geometry = new THREE.IcosahedronGeometry(1.8, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0xfe7902,
      emissive: 0x292929,
      flatShading: true,
      shininess: 100,
      wireframe: false,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    const wireGeo = new THREE.IcosahedronGeometry(1.85, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xfe7902, wireframe: true, transparent: true, opacity: 0.1 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xfe7902, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let t = 0;
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      t += 0.01;

      if (mesh) {
        mesh.rotation.x += isActive ? 0.02 : 0.005;
        mesh.rotation.y += isActive ? 0.03 : 0.005;
        wireMesh.rotation.x = mesh.rotation.x;
        wireMesh.rotation.y = mesh.rotation.y;

        const scale = isActive 
          ? 1 + Math.sin(t * 10) * 0.1 + Math.cos(t * 15) * 0.05 
          : 1 + Math.sin(t * 2) * 0.02;
        mesh.scale.setScalar(scale);
        wireMesh.scale.setScalar(scale);
        
        material.emissiveIntensity = isActive ? (Math.sin(t * 10) + 1) * 0.5 : 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isActive]);

  return <div ref={containerRef} className="w-full h-full" />;
};

const ConversationalAI = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const retryCountRef = useRef(0);
  const userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setStatus('LISTENING');
      retryCountRef.current = 0; // Reset retry count on successful start
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript) {
        setCurrentTranscript(finalTranscript.trim());
        handleUserSpeech(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle different error types
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
        setStatus('LISTENING');
      } else if (event.error === 'network') {
        console.error('Network error in speech recognition');
        setStatus('ERROR');
        // Will retry in onend handler
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.error('Microphone access denied');
        setStatus('ERROR');
        setIsCalling(false);
        alert('Microphone access is required for voice chat. Please allow microphone access and try again.');
      } else if (event.error === 'aborted') {
        console.log('Speech recognition aborted');
        // Don't show error for intentional aborts
      } else {
        console.error('Speech recognition error:', event.error);
        setStatus('ERROR');
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Only restart if we're still in a call and not muted
      if (isCalling && !isMuted && retryCountRef.current < 5) {
        console.log('Attempting to restart recognition...');
        
        // Add a small delay before restarting to avoid rapid restart loops
        setTimeout(() => {
          if (isCalling && !isMuted) {
            try {
              retryCountRef.current += 1;
              recognition.start();
            } catch(e) {
              console.error('Error restarting recognition:', e);
              if (retryCountRef.current < 5) {
                // Try again after a longer delay
                setTimeout(() => {
                  if (isCalling && !isMuted) {
                    try {
                      recognition.start();
                    } catch(err) {
                      console.error('Failed to restart after retry:', err);
                    }
                  }
                }, 2000);
              }
            }
          }
        }, 500);
      } else if (retryCountRef.current >= 5) {
        console.error('Max retry attempts reached');
        setStatus('ERROR');
        alert('Speech recognition encountered repeated errors. Please refresh the page and try again.');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort(); // Use abort instead of stop for cleanup
        } catch(e) {
          console.error('Error aborting recognition:', e);
        }
      }
    };
  }, [isCalling, isMuted]);

  const handleUserSpeech = async (transcript) => {
    if (isProcessing || !transcript.trim()) return;

    setIsProcessing(true);
    setStatus('ANALYZING');

    try {
      const userMessage = {
        sender: 'user',
        text: transcript,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [...conversationHistory, userMessage];
      setConversationHistory(updatedHistory);

      const response = await api.post('/api/voice_chat', {
        user_id: userId,
        text: transcript,
        context: {
          cravings: 5,
          stress_level: 5,
          days_smoke_free: 0
        },
        conversation_history: updatedHistory.map(msg => ({
          sender: msg.sender,
          text: msg.text
        }))
      });

      const aiResponseText = response.data.response_text;

      const aiMessage = {
        sender: 'assistant',
        text: aiResponseText,
        timestamp: new Date().toISOString()
      };
      
      setConversationHistory([...updatedHistory, aiMessage]);
      
      setStatus('RESPONDING');
      await playAudioResponse(aiResponseText);

    } catch (error) {
      console.error('Error processing speech:', error);
      setStatus('ERROR');
      setTimeout(() => setStatus('LISTENING'), 2000);
    } finally {
      setIsProcessing(false);
      if (isCalling && !isMuted) {
        setStatus('LISTENING');
      }
    }
  };

  const playAudioResponse = async (text) => {
    try {
      const { audioUrl } = await getAudioStream(text, 'default');
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setStatus('LISTENING');
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setStatus('LISTENING');
    }
  };

  const toggleCall = () => {
    if (!isCalling) {
      setIsCalling(true);
      setConversationHistory([]);
      setCurrentTranscript('');
      retryCountRef.current = 0; // Reset retry counter
      localStorage.setItem('userId', userId);
      
      // Start recognition after a short delay to ensure state is updated
      setTimeout(() => {
        if (recognitionRef.current && !isMuted) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error starting recognition:', e);
            // Try once more after a delay
            setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Failed to start recognition on retry:', err);
                alert('Failed to start speech recognition. Please check your microphone permissions.');
              }
            }, 1000);
          }
        }
      }, 100);
    } else {
      setIsCalling(false);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      setStatus('STANDBY');
      setDuration(0);
      setCurrentTranscript('');
      retryCountRef.current = 0; // Reset retry counter
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      // Muting
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          retryCountRef.current = 0; // Reset retry counter
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      setStatus('MUTED');
      setCurrentTranscript('');
    } else {
      // Unmuting
      retryCountRef.current = 0; // Reset retry counter
      if (recognitionRef.current && isCalling) {
        setStatus('LISTENING');
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error starting recognition:', e);
            // Try once more after a delay
            setTimeout(() => {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Failed to start recognition on retry:', err);
              }
            }, 1000);
          }
        }, 200);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isCalling) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div className={`relative min-h-[700px] h-[80vh] rounded-[2.5rem] overflow-hidden transition-all duration-1000 border border-orange-500/5 shadow-2xl ${
        isCalling ? 'bg-[#292929]' : 'bg-white'
      }`}>
        {isCalling && (
          <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              status === 'ERROR' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 
              'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
            }`} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              {status === 'ERROR' ? 'Reconnecting...' : 'Rec Session'}
            </span>
          </div>
        )}

        <div className="absolute top-10 right-10 z-20">
          <div className={`px-4 py-2 rounded-xl backdrop-blur-md border ${isCalling ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
             <span className={`text-xs font-black tabular-nums ${isCalling ? 'text-[#fe7902]' : 'text-gray-400'}`}>
                {formatTime(duration)}
             </span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <h1 className={`text-[15rem] md:text-[20rem] lg:text-[25rem] font-black tracking-tighter italic uppercase leading-none transition-all duration-500 select-none ${
            isCalling ? 'text-white/10' : 'text-[#292929]/5'
          }`}>
            {status}
          </h1>
        </div>

        <div className="absolute inset-x-0 top-20 flex flex-col items-center pointer-events-none z-5">
          <span className={`text-[10px] font-black uppercase tracking-[0.8em] transition-colors duration-500 ${isCalling ? 'text-[#fe7902]/60' : 'text-gray-300'}`}>
            System Phase
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
           <div className="w-full h-full max-w-md max-h-[350px]">
              <ReactiveBrutalistCore isActive={isCalling && (status === 'LISTENING' || status === 'RESPONDING')} />
           </div>
        </div>

        {isCalling && conversationHistory.length > 0 && (
          <div className="absolute left-10 right-10 bottom-32 max-h-[200px] overflow-y-auto z-15 backdrop-blur-md bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="space-y-3">
              {conversationHistory.slice(-3).map((msg, idx) => (
                <div key={idx} className={`text-sm ${msg.sender === 'user' ? 'text-white/80' : 'text-[#fe7902]'}`}>
                  <span className="font-black uppercase text-[10px] tracking-wider opacity-60">
                    {msg.sender === 'user' ? 'YOU' : 'AI'}:
                  </span>
                  <p className="mt-1 font-medium">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isCalling && currentTranscript && status === 'ANALYZING' && (
          <div className="absolute left-10 right-10 top-32 z-15 backdrop-blur-md bg-[#fe7902]/10 rounded-2xl p-4 border border-[#fe7902]/20">
            <p className="text-white/80 text-sm italic">"{currentTranscript}"</p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-10 flex justify-center items-center gap-4 z-20 px-6">
          <div className={`p-1.5 rounded-2xl flex items-center gap-2 backdrop-blur-2xl border transition-all duration-500 ${
            isCalling ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-orange-500/5'
          }`}>
            <button 
              onClick={toggleMute}
              disabled={!isCalling}
              className={`p-4 rounded-xl transition-all ${
                isMuted ? 'bg-red-500 text-white' : 'hover:bg-gray-100 text-gray-400 disabled:opacity-0'
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button 
              onClick={toggleCall}
              className={`px-12 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 ${
                isCalling ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#fe7902] text-white hover:bg-[#e06a02]'
              }`}
            >
              {isCalling ? "Terminate" : "Initiate Link"}
            </button>

            <button 
              disabled={!isCalling}
              className="p-4 rounded-xl hover:bg-white/10 text-gray-400 disabled:opacity-0 transition-all"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
        <BentoCard className="md:col-span-7" title="Neuro-Vocal Mechanism">
          <div className="flex gap-6 py-4">
            <div className="p-5 bg-orange-50 rounded-2xl text-[#fe7902] h-fit">
              <Activity className="h-8 w-8" />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-[#292929] leading-relaxed uppercase tracking-tight">
                Vocalizing cravings shifts neural activity from the <span className="text-[#fe7902]">emotional amygdala</span> to the <span className="text-[#fe7902]">rational prefrontal cortex</span>.
              </p>
              <div className="h-1 bg-gray-50 w-full overflow-hidden">
                <div className="h-full bg-[#fe7902] w-2/3 animate-[shimmer_2s_infinite]" />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                Instant diffusion of physiological urges through guided cognitive restructuring.
              </p>
            </div>
          </div>
        </BentoCard>

        <BentoCard className="md:col-span-5" title="Protocol Status">
          <div className="space-y-4 py-4">
             {[
               { label: 'Latency', value: '18ms', active: true },
               { label: 'Security', value: 'Encrypted', active: true },
               { label: 'Baseline', value: 'Calibrated', active: false }
             ].map((item, idx) => (
               <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                 <div className="flex items-center gap-2">
                    {item.active && <div className="w-1 h-1 bg-[#fe7902] rounded-full animate-pulse" />}
                    <span className="text-xs font-black text-[#292929] uppercase">{item.value}</span>
                 </div>
               </div>
             ))}
             <button className="w-full flex items-center justify-center gap-2 pt-4 group">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 group-hover:text-[#fe7902] transition-colors">Operational Documentation</span>
                <Info className="h-3 w-3 text-gray-200 group-hover:text-[#fe7902]" />
             </button>
          </div>
        </BentoCard>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ConversationalAI;
