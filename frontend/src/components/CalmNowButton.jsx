import { useState } from "react";
import { triggerCalm } from "../api";
import "./CalmNowButton.css";

export default function CalmNowButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState("user_" + Math.random().toString(36).substring(2, 9));

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Create user context with default values
      const userContext = {
        user_id: userId,
        mood: "stressed",
        cravings: 8,
        days_smoke_free: 0,
        previous_attempts: 0
      };
      
      // Trigger calm voice
      const response = await triggerCalm(userId, userContext);
      
      // Store the audio URL for later use if needed
      if (response.audioUrl) {
        console.log("Audio available at:", response.audioUrl);
      }
    } catch (error) {
      console.error("Error triggering calm voice:", error);
      alert("Unable to connect to voice service. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`calm-now-button ${isLoading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner"></span>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <span className="icon">🔊</span>
          <span>Calm Now (Voice Support)</span>
        </>
      )}
    </button>
  );
}