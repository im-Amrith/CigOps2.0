import { useState, useEffect } from "react";
import './ChatSidebar.css';

const MOODS = ["Happy", "Stressed", "Anxious", "Calm", "Irritable"];
const COPING_STRATEGIES = [
  "Deep breathing",
  "Go for a walk",
  "Listen to music",
  "Call a friend",
  "Meditate",
  "Exercise",
  "Journal",
  "Take a break"
];

const BADGES = [
  { emoji: "🏆", title: "7 Day Streak" },
  { emoji: "💪", title: "Strong Will" },
  { emoji: "🧘", title: "Mindful" },
  { emoji: "🌟", title: "Rising Star" }
];

const ChatSidebar = ({ onMoodChange, onCravingChange, onStrategySelect }) => {
  const [mood, setMood] = useState("Calm");
  const [cravingLevel, setCravingLevel] = useState(3);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [streak, setStreak] = useState(7);
  const [isVisible, setIsVisible] = useState(false);
  const [activeBadge, setActiveBadge] = useState(null);

  useEffect(() => {
    // Animate sidebar in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMoodChange = (e) => {
    const newMood = e.target.value;
    setMood(newMood);
    onMoodChange(newMood);
  };

  const handleCravingChange = (e) => {
    const newLevel = parseInt(e.target.value);
    setCravingLevel(newLevel);
    onCravingChange(newLevel);
  };

  const handleStrategyClick = (strategy) => {
    setSelectedStrategy(strategy);
    onStrategySelect(strategy);
  };

  const handleBadgeHover = (index) => {
    setActiveBadge(index);
  };

  const handleBadgeLeave = () => {
    setActiveBadge(null);
  };

  return (
    <div className={`chat-sidebar ${isVisible ? 'visible' : ''}`}>
      <div className="sidebar-section">
        <h3>How are you feeling?</h3>
        <label>
          Current Mood
          <select value={mood} onChange={handleMoodChange}>
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sidebar-section">
        <h3>Cravings</h3>
        <label>
          Craving Level: <span className="craving-value">{cravingLevel}</span>
          <input
            type="range"
            min="1"
            max="10"
            value={cravingLevel}
            onChange={handleCravingChange}
          />
        </label>
      </div>

      <div className="sidebar-section">
        <h3>Coping Strategies</h3>
        <div className="toolbox-list">
          {COPING_STRATEGIES.map((strategy) => (
            <button
              key={strategy}
              className={`toolbox-btn ${selectedStrategy === strategy ? 'active' : ''}`}
              onClick={() => handleStrategyClick(strategy)}
              disabled={selectedStrategy === strategy}
            >
              {strategy}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Your Progress</h3>
        <div className="streak">
          {streak} Day Streak
        </div>
        <div className="badges">
          {BADGES.map((badge, index) => (
            <div
              key={index}
              className={`badge ${activeBadge === index ? 'active' : ''}`}
              title={badge.title}
              onMouseEnter={() => handleBadgeHover(index)}
              onMouseLeave={handleBadgeLeave}
            >
              {badge.emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 