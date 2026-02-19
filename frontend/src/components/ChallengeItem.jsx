import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { CustomTooltip } from './CustomTooltip';

const ChallengeItem = ({ challenge, onComplete, loading, xpGain, showConfetti }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  const [error, setError] = useState(null);

  // Handle XP gain animation
  useEffect(() => {
    if (xpGain > 0 && showConfetti) {
      setShowXpGain(true);
      const timer = setTimeout(() => setShowXpGain(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [xpGain, showConfetti]);

  // Handle error state
  useEffect(() => {
    if (challenge.error) {
      setError(challenge.error);
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [challenge.error]);

  const handleClick = () => {
    if (challenge.completed || loading) return;
    
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    
    try {
      onComplete(challenge);
    } catch (err) {
      setError(err.message || 'Failed to complete challenge');
    }
  };

  return (
    <div
      className={`challenge-item ${challenge.completed ? 'completed' : ''} ${loading ? 'loading' : ''} ${error ? 'error' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isClicked ? 'scale(0.98)' : isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="text-light" style={{ fontWeight: 600 }}>{challenge.name}</span>
          {challenge.completed && <CheckCircle2 size={16} color="#10b981" />}
          {loading && <Loader2 size={16} className="animate-spin" color="#8b5cf6" />}
          {error && <XCircle size={16} color="#ef4444" />}
        </div>
        <span className="text-muted" style={{ fontSize: 14 }}>{challenge.description}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={16} color="#f59e0b" />
          <span className="text-light" style={{ fontWeight: 600 }}>{challenge.xp_reward}</span>
        </div>
        
        {!challenge.completed && !loading && !error && (
          <CustomTooltip content="Complete this challenge to earn XP">
            <div className="complete-button">
              <span>Complete</span>
            </div>
          </CustomTooltip>
        )}
      </div>
      
      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXpGain && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: -30,
              right: 0,
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Sparkles size={14} />
            <span>+{xpGain} XP</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              bottom: -30,
              left: 0,
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChallengeItem; 