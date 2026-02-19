import React, { useState, useEffect, useRef } from 'react';
import { getProgress, getAchievements, getDailyChallenges, completeDailyChallenge, getProgressHistory, getLeaderboard } from '../api'; // Import new API functions
import './GamifiedRecovery.css'; // Import component-specific styles
// Lucide React icons for a modern look
import { Trophy, X, ArrowUpFromDot, Star, CheckCircle, Circle, Loader2, Sparkles, Zap, Flame, Heart, Target, Award, Gift, Crown, BadgeCheck, Wallet, Users, PartyPopper, Clock, User } from 'lucide-react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
// Import chart components
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Refactored Card3D with Framer Motion only
const Card3D = ({ children, className = '', ...props }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 15; // max 15deg
    const rotateX = -((y - centerY) / centerY) * 15;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={`glassmorphic card ${className}`}
      style={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      <div style={{ transform: 'translateZ(75px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  );
};

// Animated Achievement Badge with Particles
const AchievementBadge = ({ achievement, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  
  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.5 }
      });
    }
  }, [isHovered, controls]);
  
  return (
    <motion.div
      className="achievement-badge"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={controls}
      whileHover={{ scale: 1.05, boxShadow: '0 12px 32px 0 rgba(236,72,153,0.18)' }}
      transition={{ duration: 0.4 }}
      onClick={() => onClick(achievement)}
      tabIndex={0}
      role="button"
      aria-pressed="false"
      style={{ cursor: 'pointer', outline: 'none', position: 'relative' }}
    >
      {achievement.awarded && (
        <motion.div 
          className="achievement-particles"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #facc15, transparent)',
                top: '50%',
                left: '50%',
                zIndex: 1
              }}
            />
          ))}
        </motion.div>
      )}
      
      {achievement.awarded ? (
        <Trophy className="achievement-icon" color="#facc15" size={36} />
      ) : (
        <Circle className="achievement-icon" color="#ced4da" size={36} />
      )}
      <span className="text-light" style={{ fontWeight: 600, marginTop: 8 }}>{achievement.title}</span>
      <span className="text-light-600" style={{ fontSize: 13 }}>{achievement.description}</span>
    </motion.div>
  );
};

// Interactive Tooltip Component
const CustomTooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(30, 30, 46, 0.9)',
              color: '#f8f9fa',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              marginBottom: '8px'
            }}
          >
            {text}
            <div 
              style={{
                position: 'absolute',
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '10px',
                height: '10px',
                backgroundColor: 'rgba(30, 30, 46, 0.9)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Animated Progress Bar with Glow Effect
const AnimatedProgressBar = ({ percent, label }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    // Ensure percent is a number and not NaN
    const validPercent = typeof percent === 'number' && !isNaN(percent) ? percent : 0;
    
    controls.start({
      width: `${validPercent}%`,
      transition: { duration: 1.2, ease: "easeInOut" }
    });
  }, [percent, controls]);
  
  return (
    <div className="progress-bar-container">
      <motion.div
        className="progress-bar"
        animate={controls}
        style={{ 
          background: '#fe7902',
          boxShadow: '0 0 15px rgba(254, 121, 2, 0.5)'
        }}
      />
      <span className="progress-text">{Math.round(percent)}%</span>
      {label && <span className="progress-label">{label}</span>}
    </div>
  );
};

// Enhanced Level Up Animation with Confetti
const LevelUpAnimation = () => {
  const { width, height } = useWindowSize();
  
  return (
    <motion.div
      className="level-up-animation-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />
      <motion.div
        className="level-up-animation"
        initial={{ scale: 0.7, rotate: -10 }}
        animate={{ 
          scale: 1.1, 
          rotate: 0,
          boxShadow: '0 0 20px rgba(254, 121, 2, 0.6)'
        }}
        transition={{ 
          duration: 1.5,
          type: 'spring',
          stiffness: 120,
          damping: 8
        }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <Crown className="level-up-icon" size={64} color="#fe7902" />
        </motion.div>
        <motion.h2 
          style={{ 
            marginTop: 16,
            fontSize: 32,
            fontWeight: 700,
            color: '#292929',
            textShadow: '0 0 10px rgba(254, 121, 2, 0.8)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Level Up!
        </motion.h2>
      </motion.div>
    </motion.div>
  );
};

// Refactored ParallaxCard with Framer Motion only
const ParallaxCard = ({ children, className = '', style = {}, ...props }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 12; // max 12deg
    const rotateX = -((y - centerY) / centerY) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        rotateX: tilt.x,
        rotateY: tilt.y,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Daily Challenge Item
const ChallengeItem = ({ challenge, onComplete, loading, xpGain, showConfetti }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (xpGain && xpGain > 0) {
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1800);
    }
  }, [xpGain]);
  
  const handleCardClick = () => {
    if (!challenge.completed && !loading) {
      setError(null); // Clear any previous errors
      onComplete(challenge);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };
  
  return (
    <div 
      className={`challenge-item${challenge.completed ? ' completed' : ''}${loading ? ' loading' : ''}${error ? ' error' : ''}`}
      style={{ 
        position: 'relative', 
        overflow: 'visible',
        cursor: challenge.completed || loading ? 'default' : 'pointer',
        opacity: challenge.completed ? 0.8 : 1,
        transition: 'all 0.3s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        marginBottom: '12px',
        borderRadius: '12px',
        background: 'white',
        border: challenge.completed ? '2px solid #10b981' : '1px solid #e5e7eb',
        transform: isHovered && !challenge.completed && !loading && !error ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered && !challenge.completed && !loading && !error 
          ? '0 8px 24px rgba(254, 121, 2, 0.2)' 
          : '0 2px 8px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-disabled={challenge.completed || loading}
      aria-label={`${challenge.title}: ${challenge.description}`}
    >
      {showConfetti && <Confetti width={180} height={60} numberOfPieces={30} recycle={false} style={{ position: 'absolute', left: 0, top: -30, pointerEvents: 'none' }} />}
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={22} color={challenge.completed ? '#10b981' : '#fe7902'} />
          <span style={{ fontWeight: 700, fontSize: 17, color: '#292929' }}>{challenge.title}</span>
        </div>
        <div style={{ fontSize: 14, color: '#6c757d' }}>{challenge.description}</div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: '#fe7902', fontWeight: 600 }}>
            <Zap size={14} color="#fe7902" />+{challenge.xp_reward} XP
          </span>
          {challenge.completed && <CheckCircle size={18} color="#10b981" style={{ marginLeft: 4 }} />}
        </div>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -24 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.7 }}
            style={{
              marginLeft: 18,
              color: '#fe7902',
              fontWeight: 700,
              fontSize: 20,
              background: 'rgba(254,121,2,0.12)',
              borderRadius: 12,
              padding: '4px 14px',
              boxShadow: '0 2px 8px rgba(254,121,2,0.3)',
              zIndex: 10
            }}
          >
            +{challenge.xp_reward} XP!
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 8,
              color: '#ef4444',
              fontSize: 13,
              background: 'rgba(239,68,68,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              border: '1px solid rgba(239,68,68,0.3)'
            }}
          >
            {error}
          </motion.div>
        )}
      </div>
      
      {/* Status indicator instead of button */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 100,
          padding: '8px 16px',
          borderRadius: 8,
          background: challenge.completed 
            ? 'linear-gradient(90deg, #10b981, #059669)' 
            : error
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: 14,
          transition: 'all 0.3s ease',
          boxShadow: isHovered && !challenge.completed && !loading && !error
            ? '0 0 15px rgba(139, 92, 246, 0.5)' 
            : 'none'
        }}
      >
        {challenge.completed ? (
          <>
            <CheckCircle size={20} color="#ffffff" />
            <span style={{ marginLeft: 6 }}>Completed</span>
          </>
        ) : loading ? (
          <Loader2 className="animate-spin" size={20} color="#ffffff" />
        ) : error ? (
          <>
            <X size={20} color="#ffffff" />
            <span style={{ marginLeft: 6 }}>Error</span>
          </>
        ) : (
          'Complete'
        )}
      </div>
    </div>
  );
};

// Enhanced Leaderboard Card
const LeaderboardCard = ({ user, idx, isCurrentUser }) => {
  return (
    <ParallaxCard
      className={`leaderboard-card glassmorphic${isCurrentUser ? ' current-user' : ''}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 18, padding: 18, borderRadius: 16, position: 'relative',
        border: isCurrentUser ? '2px solid #fe7902' : '1px solid #e5e7eb',
        background: isCurrentUser ? 'rgba(254,121,2,0.08)' : 'white',
        boxShadow: isCurrentUser ? '0 4px 16px rgba(254,121,2,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
        minHeight: 80,
      }}
      tabIndex={0}
    >
      {/* Rank Badge */}
      <motion.div
        className="rank-badge"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: idx === 0 ? '#fe7902' : idx === 1 ? '#10b981' : idx === 2 ? '#3b82f6' : '#6c757d',
          color: '#fff', fontWeight: 700, fontSize: 20, marginRight: 8,
          boxShadow: idx === 0 ? '0 0 16px rgba(254,121,2,0.6)' : undefined,
          border: idx === 0 ? '2px solid #fe7902' : '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {idx === 0 ? <Crown size={28} color="white" /> : idx + 1}
      </motion.div>
      {/* Avatar */}
      <img src={user.avatar} alt={user.name} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #e5e7eb', background: '#fff', objectFit: 'cover', marginRight: 8 }} />
      {/* User Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#292929' }}>{user.name}</span>
          {isCurrentUser && <Sparkles size={18} color="#fe7902" />}
        </div>
        <div style={{ fontSize: 13, color: '#6c757d' }}>Level {user.level} &bull; {user.days_nicotine_free} days nicotine-free</div>
        {/* Progress Bar */}
        <div style={{ marginTop: 6 }}>
          <motion.div
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((user.experience_points / (user.level * 100)) * 100, 100)}%` }}
            transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeInOut' }}
            style={{
              height: 10,
              borderRadius: 8,
              background: '#fe7902',
              boxShadow: '0 0 8px rgba(254,121,2,0.5)',
            }}
          />
        </div>
      </div>
      {/* XP */}
      <div style={{ minWidth: 60, textAlign: 'right' }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#292929' }}>{user.experience_points} XP</span>
      </div>
      {/* Confetti for top user */}
      {idx === 0 && (
        <Confetti
          width={120}
          height={60}
          numberOfPieces={30}
          recycle={false}
          style={{ position: 'absolute', left: 0, top: -30, pointerEvents: 'none' }}
        />
      )}
    </ParallaxCard>
  );
};

function GamifiedRecovery() {
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  // New state for daily challenges
  const [dailyChallenges, setDailyChallenges] = useState([]);
  // New state for progress history
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // New state for achievement modal
  const [showAchievementDetails, setShowAchievementDetails] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  // New state for challenge completion feedback
  const [completionFeedback, setCompletionFeedback] = useState(null);
  const [completingChallengeId, setCompletingChallengeId] = useState(null);
  // New state for level up animation
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  // Ref to store the previous level
  const previousLevelRef = useRef(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('achievements');
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [xpAnimation, setXpAnimation] = useState({ xp: 0, show: false });
  const [levelUpPulse, setLevelUpPulse] = useState(false);

  // Replace with actual user ID mechanism later
  const userId = 'synthetic_user_game';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch progress
        const progressData = await getProgress(userId);
        // Initialize progress state with fetched data, ensuring level/xp defaults
        setProgress(progressData ? {
            ...progressData,
            level: progressData.level || 1,
            experience_points: progressData.experience_points || 0,
            xp_to_next_level: (progressData.level || 1) * 100
        } : null);

        // Fetch achievements
        const achievementsData = await getAchievements(userId);
        setAchievements(achievementsData);

        // Fetch daily challenges
        const challengesData = await getDailyChallenges(userId);
        setDailyChallenges(challengesData);

        // Fetch progress history
        // Mock data for progress history if API is not available
        const historyData = await getProgressHistory(userId).catch(() => [
            { date: '2025-01-01', days_nicotine_free: 0, experience_points: 0 },
            { date: '2025-01-02', days_nicotine_free: 1, experience_points: 50 },
            { date: '2025-01-03', days_nicotine_free: 2, experience_points: 120 },
            { date: '2025-01-04', days_nicotine_free: 3, experience_points: 180 },
            { date: '2025-01-05', days_nicotine_free: 4, experience_points: 250 }, // Level Up here
            { date: '2025-01-06', days_nicotine_free: 5, experience_points: 320 },
        ]);
        setProgressHistory(historyData);

        // Fetch leaderboard (frontend-mock)
        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); // Rerun effect if userId changes

  // Effect to check for level up and trigger animation
  useEffect(() => {
      if (progress && previousLevelRef.current !== null && progress.level > previousLevelRef.current) {
          setShowLevelUpAnimation(true);
          const timer = setTimeout(() => {
              setShowLevelUpAnimation(false);
          }, 3000); // Show animation for 3 seconds
          return () => clearTimeout(timer);
      }
      // Update the previous level ref ONLY AFTER progress is set
      if (progress) {
         previousLevelRef.current = progress.level;
      }
  }, [progress]); // Depend on progress changes


  // Calculate progress percentage using the COMPONENT'S STATE
  const progressPercentage = progress && progress.experience_points !== undefined && progress.xp_to_next_level !== undefined
    ? Math.min((progress.experience_points / progress.xp_to_next_level) * 100, 100)
    : 0;

  // Handle clicking on an achievement
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementDetails(true);
  };

  // Handle closing the achievement modal
  const handleCloseAchievementDetails = () => {
    setShowAchievementDetails(false);
    setSelectedAchievement(null);
  };

  // Handle completing a daily challenge
  const handleCompleteChallenge = async (challenge) => {
    // Prevent double clicks
    if (completingChallengeId === challenge.id) return;

    // Set loading state
      setCompletingChallengeId(challenge.id);
    setCompletionFeedback(null);

    try {
      // Call API to mark challenge as complete
      const result = await completeDailyChallenge(userId, challenge.id);

      // Update the local state to reflect the completion
      const newDailyChallenges = dailyChallenges.map(c =>
        c.id === challenge.id ? { ...c, completed: true } : c
      );
      
      // Update daily challenges
      setDailyChallenges(newDailyChallenges);
      
      // Get XP gained from the challenge
      const xpGained = challenge.xp_reward;
      
      // Show XP animation
      setXpAnimation({ xp: xpGained, show: true });
      
      // Check if level increased
      const levelIncreased = progress && result.new_progress && result.new_progress.level > progress.level;
      
      if (levelIncreased) {
        setLevelUpPulse(true);
      }
      
      // Update progress with the new data from the API
      if (result && result.new_progress) {
        // Store previous level for animation check
          previousLevelRef.current = progress ? progress.level : null;
        
        // Ensure the new progress has xp_to_next_level
        const updatedProgress = {
          ...result.new_progress,
          xp_to_next_level: result.new_progress.level * 100
        };
        
        // Update progress state
        setProgress(updatedProgress);
        
        // Show completion feedback
        setCompletionFeedback(`Challenge Completed! You earned ${xpGained} XP.`);
      } else {
        // If API didn't return new progress, fetch it
           const progressData = await getProgress(userId);
        
        // Store previous level for animation check
        previousLevelRef.current = progress ? progress.level : null;
        
        // Ensure the progress data has xp_to_next_level
        const updatedProgressData = {
          ...progressData,
          xp_to_next_level: progressData.level * 100
        };
        
        // Update progress state
        setProgress(updatedProgressData);
        
        // Show completion feedback
            setCompletionFeedback(`Challenge Completed!`);
      }

      // Fetch updated progress history
      const historyData = await getProgressHistory(userId).catch(() => [
        { date: '2025-01-01', days_nicotine_free: 0, experience_points: 0 },
        { date: '2025-01-02', days_nicotine_free: 1, experience_points: 50 },
        { date: '2025-01-03', days_nicotine_free: 2, experience_points: 120 },
        { date: '2025-01-04', days_nicotine_free: 3, experience_points: 180 },
        { date: '2025-01-05', days_nicotine_free: 4, experience_points: 250 },
        { date: '2025-01-06', days_nicotine_free: 5, experience_points: 320 },
      ]);
      
      setProgressHistory(historyData);

      // Clear completion feedback after a delay
      setTimeout(() => setCompletionFeedback(null), 5000);
      
    } catch (err) {
      // Handle errors
      const errorMessage = err.message || 'Failed to complete challenge';
      
      // Update the challenge item to show error state
      const updatedChallenges = dailyChallenges.map(c => {
        if (c.id === challenge.id) {
          return { ...c, error: errorMessage };
        }
        return c;
      });
      
      setDailyChallenges(updatedChallenges);
      
      // Show error feedback
      setCompletionFeedback(`Error: ${errorMessage}`);
      
      // Clear error feedback after a delay
        setTimeout(() => setCompletionFeedback(null), 5000);
      
    } finally {
      // Clear loading state after animations complete
      setTimeout(() => {
        setCompletingChallengeId(null);
        
        // Clear any error states
        const clearedErrorChallenges = dailyChallenges.map(c => {
          if (c.id === challenge.id && c.error) {
            const { error, ...rest } = c;
            return rest;
          }
          return c;
        });
        
        setDailyChallenges(clearedErrorChallenges);
      }, 1000);
    }
  };

  // Enhanced chart options for a more modern look
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f8f9fa',
          font: {
            size: 12,
            weight: '500'
        },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        },
        position: 'top',
      },
      title: {
        display: true,
        text: 'Recovery Progress Over Time',
        color: '#f8f9fa',
        font: {
          size: 18,
          weight: '600'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 46, 0.9)',
        titleColor: '#f8f9fa',
        bodyColor: '#ced4da',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y + ' XP';
              } else {
                label += context.parsed.y + ' days';
              }
            }
            return label;
          },
          title: function(context) {
            // Format the date to be more readable
            const date = new Date(context[0].label);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ced4da',
          font: {
            size: 11
          },
          callback: function(value, index, values) {
            // Format the date to be more readable
            const date = new Date(this.getLabelForValue(value));
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
      },
      y: {
        ticks: {
          color: '#ced4da',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        beginAtZero: true
      },
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  // Enhanced chart data with gradients
  const chartData = {
    labels: progressHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'Experience Points',
        data: progressHistory.map(entry => entry.experience_points),
        borderColor: '#fe7902',
        backgroundColor: 'rgba(254, 121, 2, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fe7902',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      },
      {
        label: 'Days Nicotine-Free',
        data: progressHistory.map(entry => entry.days_nicotine_free),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        hidden: false, // Changed to false to show by default
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      },
    ],
  };

  // Helper: Achievement icon by type
  const getAchievementIcon = (type) => {
    switch (type) {
      case 'time': return <Clock size={32} color="white" />;
      case 'money': return <Wallet size={32} color="white" />;
      case 'social': return <Users size={32} color="white" />;
      case 'trophy': return <Trophy size={32} color="white" />;
      case 'award': return <Award size={32} color="white" />;
      default: return <BadgeCheck size={32} color="white" />;
    }
  };

  // Example: Add type, progress, and status to achievements
  const enhancedAchievements = achievements.map((a, i) => {
    // Demo: Add type and progress for UI
    if (a.title.includes('24 Hours')) return { ...a, type: 'time', status: 'complete', progress: 100 };
    if (a.title.includes('One Week')) return { ...a, type: 'trophy', status: 'complete', progress: 100 };
    if (a.title.includes('Money')) return { ...a, type: 'money', status: 'complete', progress: 100 };
    if (a.title.includes('Breath')) return { ...a, type: 'award', status: 'complete', progress: 100 };
    if (a.title.includes('Two Week')) return { ...a, type: 'trophy', status: 'in-progress', progress: 71 };
    if (a.title.includes('Social')) return { ...a, type: 'social', status: 'in-progress', progress: 0 };
    return { ...a, type: 'award', status: 'in-progress', progress: 0 };
  });

  // Filtered achievements
  const filteredAchievements = achievementFilter === 'all'
    ? enhancedAchievements
    : enhancedAchievements.filter(a => a.status === achievementFilter);

  // Tab content animation variants
  const tabVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // --- Achievements Section ---
  const AchievementsSection = (
    <motion.div
      key="achievements"
      variants={tabVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      {/* Filter/Sort Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', justifyContent: 'center' }}>
        <button
          className={`tab-btn${achievementFilter === 'all' ? ' active' : ''}`}
          onClick={() => setAchievementFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: achievementFilter === 'all' ? '#fe7902' : 'white',
            color: achievementFilter === 'all' ? 'white' : '#6c757d',
            boxShadow: achievementFilter === 'all' ? '0 2px 8px rgba(254,121,2,0.3)' : 'none'
          }}
        >All</button>
        <button
          className={`tab-btn${achievementFilter === 'complete' ? ' active' : ''}`}
          onClick={() => setAchievementFilter('complete')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: achievementFilter === 'complete' ? '#fe7902' : 'white',
            color: achievementFilter === 'complete' ? 'white' : '#6c757d',
            boxShadow: achievementFilter === 'complete' ? '0 2px 8px rgba(254,121,2,0.3)' : 'none'
          }}
        >Completed</button>
        <button
          className={`tab-btn${achievementFilter === 'in-progress' ? ' active' : ''}`}
          onClick={() => setAchievementFilter('in-progress')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: achievementFilter === 'in-progress' ? '#fe7902' : 'white',
            color: achievementFilter === 'in-progress' ? 'white' : '#6c757d',
            boxShadow: achievementFilter === 'in-progress' ? '0 2px 8px rgba(254,121,2,0.3)' : 'none'
          }}
        >In Progress</button>
      </div>
      {/* Achievements Grid */}
      <div className="achievements-grid">
        {filteredAchievements.map((a, idx) => (
          <motion.div
            key={a.id}
            className={`achievement-modern-card ${a.status === 'complete' ? 'complete' : ''}`}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px 0 rgba(254,121,2,0.18)' }}
            transition={{ duration: 0.3 }}
            tabIndex={0}
            aria-label={a.title}
            onClick={() => handleAchievementClick(a)}
            style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: 24, borderRadius: 18, minWidth: 260, minHeight: 110,
              position: 'relative', cursor: 'pointer', outline: 'none',
              border: a.status === 'complete' ? '2px solid #fe7902' : '1px solid #e5e7eb',
              background: a.status === 'complete' ? 'rgba(254,121,2,0.05)' : 'white',
              boxShadow: a.status === 'complete' ? '0 4px 16px rgba(254,121,2,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            {/* Icon and status dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <div className="achievement-icon-modern">
                  {getAchievementIcon(a.type)}
                </div>
                {/* Status dot */}
                <span style={{
                  position: 'absolute', right: -6, top: -6, width: 14, height: 14, borderRadius: '50%',
                  background: a.status === 'complete' ? '#22c55e' : '#94a3b8', border: '2px solid white',
                  boxShadow: a.status === 'complete' ? '0 0 8px rgba(34,197,94,0.6)' : undefined,
                  display: 'inline-block',
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 19, color: '#292929' }}>{a.title}</div>
                <div style={{ fontSize: 15, color: '#6c757d' }}>{a.description}</div>
              </div>
            </div>
            {/* Progress bar or complete */}
            {a.status === 'in-progress' && (
              <div style={{ marginTop: 12 }}>
                <div className="modern-progress-bar-bg">
                  <motion.div
                    className="modern-progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${a.progress}%` }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  />
                </div>
                <div style={{ fontSize: 13, marginTop: 2, color: '#6c757d' }}>{a.progress}% complete</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // --- Recovery Timeline Section (placeholder) ---
  const RecoveryTimelineSection = (
    <motion.div
      key="timeline"
      variants={tabVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <div style={{ fontSize: 18, textAlign: 'center', padding: 40, color: '#6c757d' }}>
        Recovery Timeline coming soon!
      </div>
    </motion.div>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '32px', color: '#6c757d', fontSize: '16px' }}>Loading game data...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '32px', color: '#ef4444', fontSize: '16px' }}>Error loading game data: {error.message}</div>;
  }

  console.log('GamifiedRecovery render - Current progress state:', progress);
  console.log('GamifiedRecovery render - Calculated progressPercentage:', progressPercentage);

  return (
    <div className="gamified-recovery-container" style={{ background: 'transparent' }}>
      {showLevelUpAnimation && <LevelUpAnimation />}
      <motion.h1
        className="animate-fade-in"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ 
          fontSize: 32, 
          fontWeight: 900, 
          marginBottom: 24, 
          textAlign: 'center', 
          letterSpacing: 1,
          color: '#292929',
          textTransform: 'uppercase'
        }}
      >
        Recovery Game
      </motion.h1>
      {/* Tabs */}
      <div className="modern-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
        <button
          className={`modern-tab-btn${activeTab === 'achievements' ? ' active' : ''}`}
          onClick={() => setActiveTab('achievements')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: activeTab === 'achievements' ? '#fe7902' : 'white',
            color: activeTab === 'achievements' ? 'white' : '#292929',
            boxShadow: activeTab === 'achievements' ? '0 4px 12px rgba(254, 121, 2, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >Achievements</button>
        <button
          className={`modern-tab-btn${activeTab === 'timeline' ? ' active' : ''}`}
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.3s',
            background: activeTab === 'timeline' ? '#fe7902' : 'white',
            color: activeTab === 'timeline' ? 'white' : '#292929',
            boxShadow: activeTab === 'timeline' ? '0 4px 12px rgba(254, 121, 2, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >Recovery Timeline</button>
            </div>
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'achievements' ? AchievementsSection : RecoveryTimelineSection}
      </AnimatePresence>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Loader2 size={40} color="#fe7902" />
          </motion.div>
          </div>
      ) : error ? (
        <Card3D style={{ textAlign: 'center', color: '#ef4444', padding: '24px' }}>
          Error loading data. Please try again later.
        </Card3D>
      ) : (
        <>
          {/* Progress Card */}
          <Card3D className="progress-card" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                  boxShadow: levelUpPulse ? ['0 0 0 #fe7902', '0 0 30px #fe7902', '0 0 0 #fe7902'] : undefined
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  boxShadow: { duration: 1.5, repeat: 0 }
                }}
              >
                <Star size={32} color="#fe7902" style={{ filter: 'drop-shadow(0 0 8px #fe7902aa)' }} />
              </motion.div>
                 <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#292929' }}>Level {progress?.level}</div>
                <div style={{ fontSize: 15, color: '#6c757d' }}>XP: {progress?.experience_points} / {progress?.xp_to_next_level}</div>
                 </div>
              {/* Animated floating XP badge */}
              {xpAnimation.show && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -24 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.7 }}
                  style={{
                    marginLeft: 18,
                    color: '#fe7902',
                    fontWeight: 700,
                    fontSize: 20,
                    background: 'rgba(254,121,2,0.12)',
                    borderRadius: 12,
                    padding: '4px 14px',
                    boxShadow: '0 2px 8px rgba(254,121,2,0.3)',
                    zIndex: 10
                  }}
                >
                  +{xpAnimation.xp} XP
                </motion.div>
              )}
               </div>
            <AnimatedProgressBar
              percent={progressPercentage}
              label={`${progress?.experience_points} / ${progress?.xp_to_next_level} XP to Level ${progress?.level + 1}`}
            />
          </Card3D>

          {/* Daily Challenges Section */}
          <Card3D className="daily-challenges-section" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <motion.div
                animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                <ArrowUpFromDot size={26} color="#fe7902" />
              </motion.div>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#292929' }}>Daily Challenges</span>
            </div>
            <div className="challenges-list" style={{ position: 'relative', zIndex: 1 }}>
              {dailyChallenges.map((c, i) => (
                <ChallengeItem
                  key={c.id || i}
                  challenge={c}
                  onComplete={handleCompleteChallenge}
                  loading={completingChallengeId === c.id}
                  xpGain={completionFeedback && completingChallengeId === c.id ? c.xp_reward : 0}
                  showConfetti={completionFeedback && completingChallengeId === c.id}
                />
             ))}
           </div>
            {completionFeedback && (
              <motion.div
                className="completion-feedback"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
                style={{
                  marginTop: 18,
                  color: completionFeedback.startsWith('Error') ? '#ef4444' : '#10b981',
                  fontWeight: 500,
                  textAlign: 'center',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: completionFeedback.startsWith('Error') 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(16, 185, 129, 0.1)',
                  border: completionFeedback.startsWith('Error')
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                    {completionFeedback}
              </motion.div>
            )}
          </Card3D>

          {/* Progress History Chart */}
          <Card3D className="progress-history-chart" style={{ minHeight: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <Target size={26} color="#fe7902" />
              </motion.div>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#292929' }}>Progress History</span>
            </div>
            <div className="chart-container" style={{ height: 220 }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fe7902' }}></div>
                <span style={{ fontSize: 14, color: '#6c757d' }}>Experience Points</span>
        </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: 14, color: '#6c757d' }}>Days Nicotine-Free</span>
              </div>
            </div>
          </Card3D>

          {/* Leaderboard Section */}
          <Card3D className="leaderboard-section" style={{ marginBottom: 32, marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              >
                <Award size={28} color="#fe7902" />
              </motion.div>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#292929' }}>Leaderboard</span>
              </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {leaderboard.map((user, idx) => (
                <LeaderboardCard
                  key={user.user_id}
                  user={user}
                  idx={idx}
                  isCurrentUser={user.isCurrentUser}
                />
            ))}
          </div>
          </Card3D>
        </>
      )}

      {/* Achievement Modal */}
      {showAchievementDetails && selectedAchievement && (
        <div className="modal-overlay" onClick={handleCloseAchievementDetails}>
          <motion.div
            className="modal-content achievement-modal-details"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(30, 30, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <button className="modal-close-button" onClick={handleCloseAchievementDetails}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {selectedAchievement.awarded ? (
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                >
                  <Trophy className="text-primary" color="#facc15" size={48} />
                </motion.div>
              ) : (
                <Circle className="text-gray-400" size={48} />
              )}
              <div className="text-light" style={{ fontWeight: 700, fontSize: 22 }}>{selectedAchievement.title}</div>
              <div className="text-light-600" style={{ fontSize: 15 }}>{selectedAchievement.description}</div>
              {selectedAchievement.awarded && (
                <motion.div 
                  className="text-primary" 
                  style={{ 
                    fontWeight: 600, 
                    marginTop: 8,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(250, 204, 21, 0.1)',
                    border: '1px solid rgba(250, 204, 21, 0.3)'
                  }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 0 rgba(250, 204, 21, 0)',
                      '0 0 10px rgba(250, 204, 21, 0.5)',
                      '0 0 0 rgba(250, 204, 21, 0)'
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  Awarded!
                </motion.div>
              )}
                </div>
          </motion.div>
            </div>
        )}
    </div>
  );
}

export default GamifiedRecovery; 