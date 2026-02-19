import { useState, useEffect } from "react";
import { getQuitPlan, updateQuitPlan } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { 
  Calendar, 
  CheckCircle, 
  Sparkles, 
  Heart, 
  Award, 
  PartyPopper,
  Flame,
  Target,
  Shield,
  Zap,
  Edit3,
  Save,
  X
} from "lucide-react";
import BentoCard from "./BentoCard";

// Timeline milestone generator
function generateMilestones(quitDate) {
  const start = new Date(quitDate);
  const addDays = (d) => {
    const date = new Date(start);
    date.setDate(date.getDate() + d);
    return date.toISOString().split("T")[0];
  };
  return [
    {
      label: "Quit Day",
      date: addDays(0),
      benefit: "You've made the decision! Nicotine starts leaving your body.",
      fact: "Cravings peak in the first 3 days, but you're stronger than them.",
      icon: Flame,
    },
    {
      label: "3 Days",
      date: addDays(3),
      benefit: "Nicotine is out of your system. Breathing gets easier.",
      fact: "Your sense of taste and smell begin to improve.",
      icon: Sparkles,
    },
    {
      label: "1 Week",
      date: addDays(7),
      benefit: "You've made it a week! Circulation improves.",
      fact: "Risk of heart attack begins to drop.",
      icon: Heart,
    },
    {
      label: "1 Month",
      date: addDays(30),
      benefit: "Coughing and shortness of breath decrease.",
      fact: "Lung function improves. You're saving money!",
      icon: Award,
    },
    {
      label: "3 Months",
      date: addDays(90),
      benefit: "Energy levels rise. Cravings are less frequent.",
      fact: "Your risk of heart disease continues to fall.",
      icon: PartyPopper,
    },
  ];
}

export default function QuitPlan() {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId] = useState("user_" + Math.random().toString(36).substring(2, 9));
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    quitDate: "",
    triggers: "",
    copingStrategies: "",
    supportPeople: "",
    rewards: ""
  });
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneNotes, setMilestoneNotes] = useState({});

  useEffect(() => {
    const fetchQuitPlan = async () => {
      try {
        setIsLoading(true);
        const response = await getQuitPlan(userId);
        
        // Extract plan data from the response
        const planData = {
          quitDate: response.plan.find(item => item.type === "quit_date")?.value || new Date().toISOString().split("T")[0],
          triggers: response.plan.find(item => item.type === "triggers")?.value || [],
          copingStrategies: response.plan.find(item => item.type === "coping_strategies")?.value || [],
          supportPeople: response.plan.find(item => item.type === "support_people")?.value || [],
          rewards: response.plan.find(item => item.type === "rewards")?.value || []
        };
        
        setPlan(planData);
        
        // Initialize form data
        setFormData({
          quitDate: planData.quitDate,
          triggers: planData.triggers.join("\n"),
          copingStrategies: planData.copingStrategies.join("\n"),
          supportPeople: planData.supportPeople.join("\n"),
          rewards: planData.rewards.join("\n")
        });
        
        setError(null);
      } catch (err) {
        setPlan({
          quitDate: new Date().toISOString().split("T")[0],
          triggers: ["Stress at work", "After meals", "Social situations", "Driving", "Morning coffee"],
          copingStrategies: ["Deep breathing exercises", "Going for a walk", "Drinking water", "Calling a support person", "Using nicotine gum when needed"],
          supportPeople: ["John (Friend)", "Sarah (Sister)", "Dr. Smith (Doctor)", "Quit Smoking Support Group"],
          rewards: ["New pair of shoes after 1 week", "Massage after 1 month", "Weekend getaway after 3 months"]
        });
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuitPlan();
  }, [userId]);

  // Timeline milestones
  const milestones = plan ? generateMilestones(plan.quitDate) : [];

  // Mark milestone as complete
  const handleCompleteMilestone = (idx) => {
    setCompletedMilestones((prev) => [...prev, idx]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1800);
  };

  // Handle milestone note change
  const handleNoteChange = (idx, value) => {
    setMilestoneNotes((prev) => ({ ...prev, [idx]: value }));
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Re-fetch data
    fetchQuitPlan();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert textarea values to arrays
    const updatedPlan = {
      quitDate: formData.quitDate,
      triggers: formData.triggers.split("\n").filter(item => item.trim() !== ""),
      copingStrategies: formData.copingStrategies.split("\n").filter(item => item.trim() !== ""),
      supportPeople: formData.supportPeople.split("\n").filter(item => item.trim() !== ""),
      rewards: formData.rewards.split("\n").filter(item => item.trim() !== "")
    };
    
    try {
      setIsLoading(true);
      // Format the data according to the backend's expected structure
      const planRequest = {
        user_id: userId,
        context: {}, // Empty context object as required by the API
        plan_type: "daily", // Default plan type
        ...updatedPlan // Include the plan data
      };
      
      const response = await updateQuitPlan(userId, planRequest);
      
      // Extract plan data from the response
      const planData = {
        quitDate: response.plan.find(item => item.type === "quit_date")?.value || updatedPlan.quitDate,
        triggers: response.plan.find(item => item.type === "triggers")?.value || updatedPlan.triggers,
        copingStrategies: response.plan.find(item => item.type === "coping_strategies")?.value || updatedPlan.copingStrategies,
        supportPeople: response.plan.find(item => item.type === "support_people")?.value || updatedPlan.supportPeople,
        rewards: response.plan.find(item => item.type === "rewards")?.value || updatedPlan.rewards
      };
      
      setPlan(planData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating quit plan:", err);
      setError("Failed to update quit plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fe7902]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BentoCard className="max-w-md">
          <p className="text-red-500 mb-4 text-center">{error}</p>
          <button 
            onClick={handleRetry}
            className="w-full bg-[#fe7902] text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#ff8c1a] transition-all active:scale-95"
          >
            Try Again
          </button>
        </BentoCard>
      </div>
    );
  }

  // Calculate days until/since quit date
  const today = new Date();
  const quitDateObj = new Date(plan.quitDate);
  const daysDiff = Math.floor((quitDateObj - today) / (1000 * 60 * 60 * 24));
  const countdownText = daysDiff > 0 
    ? `T-${daysDiff} Days to Launch` 
    : daysDiff === 0 
    ? "Launch Day - Today!"
    : `Day ${Math.abs(daysDiff)} - Mission in Progress`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 auto-rows-min">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200} recycle={false} />
        </div>
      )}

      {/* Header Card - Mission Protocol */}
      <BentoCard className="sm:col-span-12 bg-[#292929] text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fe7902] opacity-5 blur-[140px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#fe7902] mb-2 block">Mission Protocol</span>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none mb-2">
              QUIT SMOKING<br/>
              <span className="text-[#fe7902]">OPERATION</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-3">
              {countdownText}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
              Target Date: {plan.quitDate}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] transition-all active:scale-95 ${
              isEditing 
                ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' 
                : 'bg-[#fe7902] text-white hover:brightness-110'
            }`}
          >
            {isEditing ? (
              <><X className="h-4 w-4" /> Cancel</>
            ) : (
              <><Edit3 className="h-4 w-4" /> Edit Plan</>
            )}
          </button>
        </div>
      </BentoCard>

      {/* Timeline - Left 8 columns */}
      <BentoCard className="sm:col-span-8" title="Recovery Timeline">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {milestones.map((m, idx) => {
              const isCompleted = completedMilestones.includes(idx);
              const MilestoneIcon = m.icon;
              
              return (
                <motion.div
                  key={m.label}
                  className="relative pl-14"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  {/* Node */}
                  <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-[#292929] text-white' 
                      : 'bg-white border-2 border-[#fe7902] text-[#fe7902] animate-pulse'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <MilestoneIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-xl p-5 border border-orange-500/10 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-black text-[#292929] uppercase tracking-tight">{m.label}</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.date}</span>
                      </div>
                      {isCompleted && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm font-bold text-[#fe7902] mb-2">{m.benefit}</p>
                    <p className="text-xs font-medium text-gray-400 italic">{m.fact}</p>
                    
                    <textarea
                      className="w-full mt-3 p-3 rounded-lg bg-gray-50 text-[#292929] border border-gray-200 focus:border-[#fe7902] focus:outline-none text-sm font-medium placeholder:text-gray-300"
                      placeholder="Add your thoughts, struggles, or victories..."
                      value={milestoneNotes[idx] || ''}
                      onChange={e => handleNoteChange(idx, e.target.value)}
                      rows={2}
                      disabled={isCompleted}
                    />
                    
                    {!isCompleted && (
                      <button
                        className="mt-3 bg-[#fe7902] text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
                        onClick={() => handleCompleteMilestone(idx)}
                        type="button"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </BentoCard>

      {/* Strategy Deck - Right 4 columns */}
      <div className="sm:col-span-4 space-y-6">
        {/* Triggers - Threat Vectors */}
        <BentoCard title="Threat Vectors">
          {isEditing ? (
            <textarea
              name="triggers"
              value={formData.triggers}
              onChange={handleInputChange}
              placeholder="One trigger per line..."
              className="w-full p-3 rounded-lg bg-gray-50 text-[#292929] border border-gray-200 focus:border-[#fe7902] focus:outline-none text-sm font-medium placeholder:text-gray-300"
              rows="6"
            />
          ) : (
            <div className="space-y-2">
              {plan.triggers.map((trigger, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-bold"
                >
                  <Target className="h-4 w-4 flex-shrink-0" />
                  <span>{trigger}</span>
                </div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Coping Strategies - Countermeasures */}
        <BentoCard title="Countermeasures">
          {isEditing ? (
            <textarea
              name="copingStrategies"
              value={formData.copingStrategies}
              onChange={handleInputChange}
              placeholder="One strategy per line..."
              className="w-full p-3 rounded-lg bg-gray-50 text-[#292929] border border-gray-200 focus:border-[#fe7902] focus:outline-none text-sm font-medium placeholder:text-gray-300"
              rows="6"
            />
          ) : (
            <div className="space-y-2">
              {plan.copingStrategies.map((strategy, index) => (
                <label 
                  key={index} 
                  className="flex items-start gap-3 p-3 bg-white border border-orange-500/10 rounded-lg hover:border-orange-500/30 transition-all cursor-pointer group"
                >
                  <input 
                    type="checkbox" 
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#fe7902] focus:ring-[#fe7902] cursor-pointer"
                  />
                  <span className="text-sm font-bold text-[#292929] group-hover:text-[#fe7902] transition-colors">
                    {strategy}
                  </span>
                </label>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Support Network */}
        <BentoCard title="Support Network">
          {isEditing ? (
            <textarea
              name="supportPeople"
              value={formData.supportPeople}
              onChange={handleInputChange}
              placeholder="One contact per line..."
              className="w-full p-3 rounded-lg bg-gray-50 text-[#292929] border border-gray-200 focus:border-[#fe7902] focus:outline-none text-sm font-medium placeholder:text-gray-300"
              rows="4"
            />
          ) : (
            <div className="space-y-2">
              {plan.supportPeople.map((person, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 p-2 text-sm font-bold text-[#292929]"
                >
                  <Shield className="h-4 w-4 text-[#fe7902] flex-shrink-0" />
                  <span>{person}</span>
                </div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Rewards */}
        <BentoCard title="Mission Rewards">
          {isEditing ? (
            <textarea
              name="rewards"
              value={formData.rewards}
              onChange={handleInputChange}
              placeholder="One reward per line..."
              className="w-full p-3 rounded-lg bg-gray-50 text-[#292929] border border-gray-200 focus:border-[#fe7902] focus:outline-none text-sm font-medium placeholder:text-gray-300"
              rows="4"
            />
          ) : (
            <div className="space-y-2">
              {plan.rewards.map((reward, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 p-2 text-sm font-bold text-[#292929]"
                >
                  <Zap className="h-4 w-4 text-[#fe7902] flex-shrink-0" />
                  <span>{reward}</span>
                </div>
              ))}
            </div>
          )}
        </BentoCard>

        {/* Save Button when editing */}
        {isEditing && (
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#fe7902] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        )}
      </div>

      {/* Edit Date Card */}
      {isEditing && (
        <BentoCard className="sm:col-span-12" title="Update Quit Date">
          <div className="flex items-center gap-4">
            <label className="text-sm font-black uppercase tracking-widest text-gray-400">
              Target Date:
            </label>
            <input
              type="date"
              name="quitDate"
              value={formData.quitDate}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg bg-gray-50 text-[#292929] border border-gray-200 focus:border-[#fe7902] focus:outline-none font-bold"
            />
          </div>
        </BentoCard>
      )}
    </div>
  );
}