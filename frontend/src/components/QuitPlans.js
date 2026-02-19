import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendarAlt, FaHeartbeat, FaBrain, FaUsers, FaHandHoldingHeart, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaLightbulb, FaRunning, FaBook, FaHandshake, FaTrophy } from 'react-icons/fa';
import './QuitPlan.css';

const QuitPlan = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    quitDate: true,
    healthBenefits: true,
    copingStrategies: true,
    supportSystem: true,
    rewards: true
  });
  const [completedItems, setCompletedItems] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState({
    firstDay: false,
    firstWeek: false,
    firstMonth: false,
    allHealthBenefits: false,
    allCopingStrategies: false,
    allSupportSystem: false,
    allRewards: false
  });

  // ... existing code ...

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleItemCompletion = (section, index) => {
    const itemKey = `${section}-${index}`;
    setCompletedItems(prev => {
      const newState = {
        ...prev,
        [itemKey]: !prev[itemKey]
      };
      
      // Check if all items in this section are completed
      const sectionItems = plan[section].length;
      const completedCount = Object.keys(newState).filter(key => 
        key.startsWith(`${section}-`) && newState[key]
      ).length;
      
      if (completedCount === sectionItems) {
        // Show confetti when all items in a section are completed
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      return newState;
    });
  };

  const getSectionIcon = (section) => {
    switch(section) {
      case 'quitDate':
        return <FaCalendarAlt className="section-icon" />;
      case 'healthBenefits':
        return <FaHeartbeat className="section-icon" />;
      case 'copingStrategies':
        return <FaBrain className="section-icon" />;
      case 'supportSystem':
        return <FaUsers className="section-icon" />;
      case 'rewards':
        return <FaHandHoldingHeart className="section-icon" />;
      default:
        return null;
    }
  };

  const getItemIcon = (section, index) => {
    const itemKey = `${section}-${index}`;
    return completedItems[itemKey] ? 
      <FaCheckCircle className="item-icon completed" /> : 
      <FaTimesCircle className="item-icon" />;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!plan) return 0;
    
    const totalItems = 
      plan.healthBenefits.length + 
      plan.copingStrategies.length + 
      plan.supportSystem.length + 
      plan.rewards.length;
    
    const completedItems = Object.keys(completedItems).filter(key => completedItems[key]).length;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  // Check for achievements
  useEffect(() => {
    if (!plan) return;
    
    // Check if all items in a section are completed
    const allHealthBenefitsCompleted = plan.healthBenefits.every((_, index) => 
      completedItems[`healthBenefits-${index}`]
    );
    
    const allCopingStrategiesCompleted = plan.copingStrategies.every((_, index) => 
      completedItems[`copingStrategies-${index}`]
    );
    
    const allSupportSystemCompleted = plan.supportSystem.every((_, index) => 
      completedItems[`supportSystem-${index}`]
    );
    
    const allRewardsCompleted = plan.rewards.every((_, index) => 
      completedItems[`rewards-${index}`]
    );
    
    // Update achievements
    setAchievements(prev => ({
      ...prev,
      allHealthBenefits: allHealthBenefitsCompleted,
      allCopingStrategies: allCopingStrategiesCompleted,
      allSupportSystem: allSupportSystemCompleted,
      allRewards: allRewardsCompleted
    }));
  }, [completedItems, plan]);

  // Add ripple effect to plan sections
  const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'ripple';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  // ... existing code ...

  return (
    <div className="quit-plan-container">
      <h1>Your Quit Smoking Plan</h1>
      
      {loading ? (
        <div className="loading">Loading your quit plan...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : plan ? (
        <div className="plan-content">
          {/* Progress Indicator */}
          <div className="progress-container">
            <div className="progress-title">
              <h3>Your Progress</h3>
              <span>{calculateProgress()}% Complete</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            
            {/* Achievement Badges */}
            <div className="achievement-badges">
              <div className={`badge ${achievements.allHealthBenefits ? '' : 'locked'}`}>
                <FaHeartbeat className="badge-icon" />
                <span>Health Master</span>
              </div>
              <div className={`badge ${achievements.allCopingStrategies ? '' : 'locked'}`}>
                <FaBrain className="badge-icon" />
                <span>Coping Expert</span>
              </div>
              <div className={`badge ${achievements.allSupportSystem ? '' : 'locked'}`}>
                <FaUsers className="badge-icon" />
                <span>Support Champion</span>
              </div>
              <div className={`badge ${achievements.allRewards ? '' : 'locked'}`}>
                <FaTrophy className="badge-icon" />
                <span>Reward Collector</span>
              </div>
            </div>
          </div>
          
          <div 
            className="plan-section" 
            onClick={(e) => {
              createRipple(e);
              toggleSection('quitDate');
            }}
          >
            <h2>
              {expandedSections.quitDate ? <FaChevronDown className="section-toggle" /> : <FaChevronUp className="section-toggle" />}
              Quit Date
            </h2>
            {getSectionIcon('quitDate')}
            {expandedSections.quitDate && (
              <p className="quit-date">{plan.quitDate}</p>
            )}
          </div>
          
          <div 
            className="plan-section" 
            onClick={(e) => {
              createRipple(e);
              toggleSection('healthBenefits');
            }}
          >
            <h2>
              {expandedSections.healthBenefits ? <FaChevronDown className="section-toggle" /> : <FaChevronUp className="section-toggle" />}
              Health Benefits
            </h2>
            {getSectionIcon('healthBenefits')}
            {expandedSections.healthBenefits && (
              <ul className="plan-list">
                {plan.healthBenefits.map((benefit, index) => (
                  <li 
                    key={index} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemCompletion('healthBenefits', index);
                    }}
                    className={completedItems[`healthBenefits-${index}`] ? 'completed-item' : ''}
                  >
                    {getItemIcon('healthBenefits', index)}
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div 
            className="plan-section" 
            onClick={(e) => {
              createRipple(e);
              toggleSection('copingStrategies');
            }}
          >
            <h2>
              {expandedSections.copingStrategies ? <FaChevronDown className="section-toggle" /> : <FaChevronUp className="section-toggle" />}
              Coping Strategies
            </h2>
            {getSectionIcon('copingStrategies')}
            {expandedSections.copingStrategies && (
              <ul className="plan-list">
                {plan.copingStrategies.map((strategy, index) => (
                  <li 
                    key={index} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemCompletion('copingStrategies', index);
                    }}
                    className={completedItems[`copingStrategies-${index}`] ? 'completed-item' : ''}
                  >
                    {getItemIcon('copingStrategies', index)}
                    {strategy}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div 
            className="plan-section" 
            onClick={(e) => {
              createRipple(e);
              toggleSection('supportSystem');
            }}
          >
            <h2>
              {expandedSections.supportSystem ? <FaChevronDown className="section-toggle" /> : <FaChevronUp className="section-toggle" />}
              Support System
            </h2>
            {getSectionIcon('supportSystem')}
            {expandedSections.supportSystem && (
              <ul className="plan-list">
                {plan.supportSystem.map((support, index) => (
                  <li 
                    key={index} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemCompletion('supportSystem', index);
                    }}
                    className={completedItems[`supportSystem-${index}`] ? 'completed-item' : ''}
                  >
                    {getItemIcon('supportSystem', index)}
                    {support}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div 
            className="plan-section" 
            onClick={(e) => {
              createRipple(e);
              toggleSection('rewards');
            }}
          >
            <h2>
              {expandedSections.rewards ? <FaChevronDown className="section-toggle" /> : <FaChevronUp className="section-toggle" />}
              Rewards
            </h2>
            {getSectionIcon('rewards')}
            {expandedSections.rewards && (
              <ul className="plan-list">
                {plan.rewards.map((reward, index) => (
                  <li 
                    key={index} 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemCompletion('rewards', index);
                    }}
                    className={completedItems[`rewards-${index}`] ? 'completed-item' : ''}
                  >
                    {getItemIcon('rewards', index)}
                    {reward}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {showConfetti && (
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="confetti" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
                }}></div>
              ))}
            </div>
          )}
          
          <div className="plan-actions">
            <button className="btn btn-primary" onClick={handleEditPlan}>
              Edit Plan
            </button>
            <button className="btn btn-secondary" onClick={handleGenerateNewPlan}>
              Generate New Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="no-plan">
          <p>You don't have a quit plan yet.</p>
          <button className="btn btn-primary" onClick={handleGenerateNewPlan}>
            Generate Quit Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default QuitPlan; 