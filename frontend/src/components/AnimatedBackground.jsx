import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  // EXTREMELY slow, smooth animation time
  const [time, setTime] = useState(0);
  useEffect(() => {
    let frame;
    const animate = (t) => {
      setTime(t / 12000); // even slower
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // 3 very slow, smooth, large particles
  const particles = [
    {
      color: "rgba(139,92,246,0.13)",
      size: 320,
      amplitude: 120,
      speed: 0.008,
      phase: 0,
      baseX: 20,
      baseY: 30,
    },
    {
      color: "rgba(33,150,243,0.10)",
      size: 220,
      amplitude: 90,
      speed: 0.012,
      phase: Math.PI / 2,
      baseX: 60,
      baseY: 60,
    },
    {
      color: "rgba(236,72,153,0.10)",
      size: 260,
      amplitude: 110,
      speed: 0.01,
      phase: Math.PI,
      baseX: 80,
      baseY: 20,
    },
  ];

  return (
    <div
      className="therapeutic-bg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Soft animated gradient background */}
      <motion.div
        className="therapeutic-bg-gradient"
        animate={{
          background: [
            "linear-gradient(120deg, rgba(139,92,246,0.10), rgba(33,150,243,0.10) 80%)",
            "linear-gradient(240deg, rgba(236,72,153,0.10), rgba(59,130,246,0.10) 80%)",
            "linear-gradient(120deg, rgba(139,92,246,0.10), rgba(33,150,243,0.10) 80%)"
          ]
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.7,
        }}
      />
      {/* Slow, smooth, floating particles */}
      {particles.map((p, i) => {
        const t = time * p.speed + p.phase;
        const x = p.amplitude * Math.sin(t);
        const y = p.amplitude * Math.cos(t);
        return (
          <motion.div
            key={i}
            className="therapeutic-particle"
            style={{
              left: `calc(${p.baseX}% + ${x}px)`,
              top: `calc(${p.baseY}% + ${y}px)`,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, ${p.color} 0%, transparent 80%)`,
            }}
            transition={{ type: "tween", duration: 0.1 }}
          />
        );
      })}
    </div>
  );
} 