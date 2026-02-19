import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './DynamicSphere.css'; // Create this CSS file

export default function DynamicSphere({ volume, isListening, isSpeaking, isProcessing }) {
  const sphereRef = useRef(null);

  // Define animation variants based on different states
  const variants = {
    idle: { scale: 0.8, opacity: 0.6, backgroundColor: "#00bfff" },
    listening: { 
      scale: [1.0, 0.9, 1.0], // Subtle pulse while listening
      opacity: 0.8, 
      backgroundColor: "#ff4136", // Red when listening
      transition: { duration: 1.5, ease: "easeInOut", yoyo: Infinity }
    },
    processing: {
      scale: [0.9, 1.1, 0.9], // Pulsing while processing
      opacity: 0.7,
      backgroundColor: "#ffcc00", // Yellow/Orange when processing
      transition: { duration: 1.0, ease: "easeInOut", yoyo: Infinity }
    },
    speaking: { 
      scale: 0.8 + volume * 0.005, // Scale based on volume
      opacity: 0.7 + volume * 0.002, // Opacity based on volume
      backgroundColor: "#00bfff", // Blue when speaking
      transition: { 
        type: "spring", 
        stiffness: 150, // Increased stiffness for quicker reaction
        damping: 10, 
        mass: 0.5 // Reduced mass for more responsiveness
      }
    },
  };

  // Determine the current animation state
  let animationState = 'idle';
  if (isListening) {
    animationState = 'listening';
  } else if (isProcessing) {
    animationState = 'processing';
  } else if (isSpeaking) {
    animationState = 'speaking';
  }

  return (
    <motion.div 
      ref={sphereRef}
      className={`dynamic-sphere ${isSpeaking ? 'speaking' : ''}`}
      variants={variants}
      animate={animationState}
      // Remove default transition if defining in variants
      // transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Optional: Add internal elements or a gradient for the sphere effect */}
    </motion.div>
  );
} 