import { useState, useEffect } from "react";
import { logCraving, getCravingAnalytics } from "../api";
import "./CravingLog.css";

export default function CravingLog() {
  const [cravingData, setCravingData] = useState({
    intensity: 5,
    trigger: "",
    location: "",
    time: new Date().toISOString().slice(0, 16),
    notes: ""
  });
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId] = useState(() => Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getCravingAnalytics(userId);
      setAnalytics(response);
    } catch (err) {
      console.error("Error fetching craving analytics:", err);
      setError("Failed to load craving analytics. Please try again.");
      
      // Mock data for development
      setAnalytics({
        totalCravings: 12,
        averageIntensity: 6.2,
        topTriggers: ["Stress", "After meals", "Social situations"],
        cravingsByDay: [
          { day: "Mon", count: 3 },
          { day: "Tue", count: 2 },
          { day: "Wed", count: 1 },
          { day: "Thu", count: 2 },
          { day: "Fri", count: 3 },
          { day: "Sat", count: 1 },
          { day: "Sun", count: 0 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCravingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      await logCraving(userId, cravingData);
      setSuccess(true);
      setCravingData({
        intensity: 5,
        trigger: "",
        location: "",
        time: new Date().toISOString().slice(0, 16),
        notes: ""
      });
      fetchAnalytics();
    } catch (err) {
      console.error("Error logging craving:", err);
      setError("Failed to log craving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="craving-log-container">
      <h1>Craving Log</h1>
      <p className="craving-log-intro">
        Log your cravings to track patterns and identify triggers. This information helps you develop better coping strategies.
      </p>
      
      <div className="craving-log-grid">
        <div className="log-form-container">
          <h2>Log a Craving</h2>
          <form className="craving-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="intensity">Intensity (1-10)</label>
              <input
                type="range"
                id="intensity"
                name="intensity"
                min="1"
                max="10"
                value={cravingData.intensity}
                onChange={handleInputChange}
                className="intensity-slider"
              />
              <div className="intensity-value">{cravingData.intensity}</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="trigger">Trigger</label>
              <input
                type="text"
                id="trigger"
                name="trigger"
                value={cravingData.trigger}
                onChange={handleInputChange}
                placeholder="What triggered this craving?"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={cravingData.location}
                onChange={handleInputChange}
                placeholder="Where were you?"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="datetime-local"
                id="time"
                name="time"
                value={cravingData.time}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={cravingData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about this craving..."
                className="form-textarea"
                rows="4"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging..." : "Log Craving"}
            </button>
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <p>Craving logged successfully!</p>
              </div>
            )}
          </form>
        </div>
        
        <div className="analytics-container">
          <h2>Your Craving Analytics</h2>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading analytics...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchAnalytics} className="retry-button">
                Try Again
              </button>
            </div>
          ) : analytics ? (
            <div className="analytics-content">
              <div className="analytics-summary">
                <div className="summary-card">
                  <h3>Total Cravings</h3>
                  <div className="summary-value">{analytics.totalCravings}</div>
                </div>
                <div className="summary-card">
                  <h3>Average Intensity</h3>
                  <div className="summary-value">{analytics.averageIntensity.toFixed(1)}</div>
                </div>
              </div>
              
              <div className="analytics-section">
                <h3>Top Triggers</h3>
                <ul className="triggers-list">
                  {analytics.topTriggers.map((trigger, index) => (
                    <li key={index} className="trigger-item">
                      <span className="trigger-rank">{index + 1}</span>
                      <span className="trigger-name">{trigger}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="analytics-section">
                <h3>Cravings by Day</h3>
                <div className="cravings-chart">
                  {analytics.cravingsByDay.map((day) => (
                    <div key={day.day} className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${(day.count / Math.max(...analytics.cravingsByDay.map(d => d.count))) * 100}%` }}
                      ></div>
                      <div className="chart-label">{day.day}</div>
                      <div className="chart-value">{day.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No craving data available yet. Start logging your cravings to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 