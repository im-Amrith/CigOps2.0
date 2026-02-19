import axios from "axios";

// Base URL for API requests
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock data for game features (replace with actual API calls)
const mockDailyChallenges = [
    { id: 'challenge-1', name: 'Log a Craving', description: 'Use the chat to log a craving today.', xp_reward: 25, completed: false },
    { id: 'challenge-2', name: 'Meditate for 5 Minutes', description: 'Complete a short meditation session.', xp_reward: 30, completed: false },
    { id: 'challenge-3', name: 'Identify a Trigger', description: 'Recognize and note down a smoking trigger.', xp_reward: 20, completed: false },
];

let mockProgress = {
    user_id: 'synthetic_user_game',
    days_nicotine_free: 5,
    total_cravings_logged: 10,
    level: 1,
    experience_points: 80,
    streak_days: 5,
};

let mockProgressHistory = [
    { date: '2025-01-01', days_nicotine_free: 0, experience_points: 0 },
    { date: '2025-01-02', days_nicotine_free: 1, experience_points: 50 },
    { date: '2025-01-03', days_nicotine_free: 2, experience_points: 120 },
    { date: '2025-01-04', days_nicotine_free: 3, experience_points: 180 },
    { date: '2025-01-05', days_nicotine_free: 4, experience_points: 250 },
    { date: '2025-01-06', days_nicotine_free: 5, experience_points: 320 },
];

const mockAchievements = [
  {
    id: 'achievement-1',
    title: 'First Day',
    description: 'Completed your first day nicotine-free',
    awarded: true,
    experience_reward: 100,
  },
  {
    id: 'achievement-2',
    title: 'One Week Streak',
    description: 'Stayed nicotine-free for a week',
    awarded: false,
    experience_reward: 500,
  },
  {
    id: 'achievement-3',
    title: 'Craving Conqueror',
    description: 'Logged 10 cravings',
    awarded: true,
    experience_reward: 200,
  },
];

const mockLeaderboard = [
  {
    user_id: 'synthetic_user_game',
    name: 'You',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=You',
    level: 2,
    experience_points: 250,
    days_nicotine_free: 5,
    isCurrentUser: true,
  },
  {
    user_id: 'friend_1',
    name: 'Alex',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex',
    level: 3,
    experience_points: 380,
    days_nicotine_free: 8,
  },
  {
    user_id: 'friend_2',
    name: 'Sam',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sam',
    level: 2,
    experience_points: 210,
    days_nicotine_free: 6,
  },
  {
    user_id: 'friend_3',
    name: 'Jordan',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Jordan',
    level: 1,
    experience_points: 90,
    days_nicotine_free: 2,
  },
];

// Chat API functions
export const sendMessage = async (userId, message, context = {}, voiceEnabled = false, conversationMode = "default") => {
  try {
    const response = await api.post("/api/chat", { user_id: userId, message, context, voice_enabled: voiceEnabled, conversation_mode: conversationMode });
    return {
      id: Date.now().toString(),
      sender: "assistant",
      text: response.data?.response || response.data?.message || "",
      timestamp: response.data?.timestamp || new Date().toISOString(),
      audio_url: response.data?.audio_url || null,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getChatHistory = async (userId) => {
  try {
    const response = await api.get(`/api/chat/history/${userId}`);
    // Map backend history to frontend format
    if (response.data && Array.isArray(response.data.history)) {
      return response.data.history.map((msg, idx) => ({
        id: msg.timestamp + idx,
        sender: msg.sender === "bot" ? "assistant" : "user",
        text: msg.message,
        timestamp: msg.timestamp,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

// Voice API functions
export const triggerCalm = async (userId, userContext) => {
  try {
    const response = await api.post("/api/voice/calm", { user_id: userId, context: userContext, voice_type: "default", duration: 5 });
    return response.data;
  } catch (error) {
    console.error("Error triggering calm voice:", error);
    throw error;
  }
};

// Dashboard API functions
export const getDashboard = async (userId) => {
  try {
    console.log(`Fetching dashboard data for user: ${userId}`);
    const response = await api.get(`/api/dashboard/${userId}`);
    console.log("Dashboard API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Quit Plan API functions
export const getQuitPlan = async (userId) => {
  try {
    const response = await api.get(`/api/quit-plan/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quit plan:", error);
    throw error;
  }
};

export const updateQuitPlan = async (userId, planData) => {
  try {
    const response = await api.put(`/api/quit-plan/${userId}`, planData);
    return response.data;
  } catch (error) {
    console.error("Error updating quit plan:", error);
    throw error;
  }
};

// Knowledge Base API functions
export const searchKnowledgeBase = async (query) => {
  try {
    const response = await api.get(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching knowledge base:", error);
    throw error;
  }
};

// User API functions
export const createUser = async (userData) => {
  try {
    const response = await api.post("/api/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Analytics API functions
export const logCraving = async (userId, cravingData) => {
  try {
    const response = await api.post(`/api/analytics/cravings/${userId}`, cravingData);
    return response.data;
  } catch (error) {
    console.error("Error logging craving:", error);
    throw error;
  }
};

export const getCravingAnalytics = async (userId) => {
  try {
    const response = await api.get(`/api/analytics/cravings/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching craving analytics:", error);
    throw error;
  }
};

// Game API functions
export const logProgress = async (userId, progressData) => {
  try {
    // Assuming progressData is an object matching the backend's GameProgress model
    const response = await api.post("/api/game/log_progress", { user_id: userId, ...progressData });
    return response.data;
  } catch (error) {
    console.error("Error logging game progress:", error);
    throw error;
  }
};

export const getAchievements = async (userId) => {
  return mockAchievements;
};

export const getDailyChallenges = async (userId) => {
  return mockDailyChallenges;
};

export const getProgress = async (userId) => {
    return mockProgress;
};

export const getProgressHistory = async (userId) => {
  return mockProgressHistory;
};

export const completeDailyChallenge = async (userId, challengeId) => {
  const challengeIndex = mockDailyChallenges.findIndex(c => c.id === challengeId);
  if (challengeIndex === -1 || mockDailyChallenges[challengeIndex].completed) {
    if (challengeIndex !== -1 && mockDailyChallenges[challengeIndex].completed) {
      return { success: false, message: 'Challenge already completed.' };
    } else {
      throw new Error('Challenge not found.');
    }
  }

  // Create a new challenge object with completed: true
  const updatedChallenge = { ...mockDailyChallenges[challengeIndex], completed: true };

  // Create a new dailyChallenges array with the updated challenge
  const newDailyChallenges = [
    ...mockDailyChallenges.slice(0, challengeIndex),
    updatedChallenge,
    ...mockDailyChallenges.slice(challengeIndex + 1),
  ];
  
  // Update the global mockDailyChallenges reference
  // Use Object.assign to update the array in place
  Object.assign(mockDailyChallenges, newDailyChallenges);
            
  // Simulate earning XP - create a new mockProgress object
  const xpEarned = updatedChallenge.xp_reward;
  let newExperiencePoints = mockProgress.experience_points + xpEarned;
  let newLevel = mockProgress.level;
            
  // Simulate level up logic
  const xpToNextLevel = mockProgress.level * 100;
  if (newExperiencePoints >= xpToNextLevel) {
    newLevel += 1;
    newExperiencePoints -= xpToNextLevel; // Reset XP or carry over
  }

  const newProgress = {
    ...mockProgress,
    experience_points: newExperiencePoints,
    level: newLevel,
  };
  
  // Update the global mockProgress reference
  // Use Object.assign to update the object in place
  Object.assign(mockProgress, newProgress);

  // Simulate adding to progress history (simplified) - create a new history array
            const today = new Date().toISOString().split('T')[0];
  const lastEntryIndex = mockProgressHistory.length > 0 ? mockProgressHistory.length - 1 : -1;
  const newProgressHistory = [...mockProgressHistory]; // Create a copy

  if (lastEntryIndex !== -1 && newProgressHistory[lastEntryIndex].date === today) {
    // Update the last entry immutably
    newProgressHistory[lastEntryIndex] = {
      ...newProgressHistory[lastEntryIndex],
      experience_points: newExperiencePoints,
      days_nicotine_free: mockProgress.days_nicotine_free, // Assuming this is updated elsewhere or part of progress
    };
            } else {
    // Add a new entry
    newProgressHistory.push({
                    date: today, 
                    days_nicotine_free: mockProgress.days_nicotine_free, 
      experience_points: newExperiencePoints,
                });
            }

  // Update the global mockProgressHistory reference
  // Use Object.assign to update the array in place
  Object.assign(mockProgressHistory, newProgressHistory);

  // Return updated data references
  return { success: true, new_progress: newProgress };
};

export const getLeaderboard = async () => {
  // Sort by level, then experience_points
  return [...mockLeaderboard].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.experience_points - a.experience_points;
  });
};

// Resource Locator API functions
export const searchResources = async (latitude, longitude, query = null) => {
  try {
    const response = await api.post("/api/resources/search", { latitude, longitude, query });
    return response.data;
  } catch (error) {
    console.error("Error searching resources:", error);
    throw error;
  }
};

export const sendVoiceTextMessage = async (text, conversationHistory) => {
  try {
    const userId = "voice_user_" + Math.random().toString(36).substring(2, 9); // Placeholder user ID
    
    // Create a proper UserContext object as expected by the backend
    const context = {
      user_id: userId,
      days_smoke_free: 0,
      cravings: 5,
      triggers: [],
      goals: [],
      medications: [],
      quit_attempts: 0,
      support_network: [],
      preferred_coping_strategies: [],
      stress_level: 5,
      other_context: {}
    };

    // Format conversation history properly if it exists
    const formattedHistory = conversationHistory ? conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })) : [];

    // Call the backend endpoint that returns only the text response
    const response = await api.post("/api/voice_chat", {
      user_id: userId,
      text: text,
      context: context,
      conversation_history: formattedHistory
    });

    // Assuming the backend returns a JSON object like { "response_text": "..." }
    if (response.data && response.data.response_text) {
      return { text: response.data.response_text };
    } else {
      throw new Error("Invalid response format from voice chat endpoint");
    }

  } catch (error) {
    console.error("Error sending voice text message:", error);
    // Propagate the error to the caller
    throw error;
  }
};

export const getAudioStream = async (text, voiceType = "default") => {
  try {
    // Call the new backend endpoint that synthesizes and streams audio
    const response = await api.post("/api/synthesize_audio", {
      text: text,
      voice_type: voiceType
    }, {
      responseType: 'blob' // Expecting a blob response for audio data
    });

    // Create a Blob URL from the audio blob
    const audioBlob = response.data;
    const audioBlobUrl = URL.createObjectURL(audioBlob);

    return { audioUrl: audioBlobUrl }; // Return object with audioUrl

  } catch (error) {
    console.error("Error getting audio stream:", error);
    throw error;
  }
};

export default api;