// src/components/common/SuccessCheck.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "../../hooks/useSound";

const SuccessCheck = ({ primaryColor = "#10b981", onDone }) => {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    // confetti burst shortly after circle appears
    const t1 = setTimeout(() => setBurst(true), 350);
    // play success chime right as the checkmark finishes drawing
    const t2 = setTimeout(() => sounds.success(), 650);
    // hold the success screen visibly before closing
    const t3 = setTimeout(() => onDone?.(), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  // radial confetti particles
  const particles = Array.from({ length: 36 }).map((_, i) => {
    const angle = (i / 36) * Math.PI * 2 + Math.random() * 0.2;
    const dist = 90 + Math.random() * 110;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 4 + Math.random() * 6,
      rot: Math.random() * 720 - 360,
      delay: Math.random() * 0.15,
      color: [
        "#10b981",
        "#34d399",
        "#6ee7b7",
        "#a7f3d0",
        "#fbbf24",
        "#f472b6",
        "#60a5fa",
      ][Math.floor(Math.random() * 7)],
    };
  });

  return (
    <div className="relative flex flex-col items-center justify-center py-10 min-h-[320px] overflow-hidden">
      {/* Radial popper burst */}
      <AnimatePresence>
        {burst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-sm"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: [0, 1, 0.8],
                  rotate: p.rot,
                }}
                transition={{
                  duration: 1.2,
                  delay: p.delay,
                  ease: [0.2, 0.7, 0.3, 1],
                }}
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Check circle */}
      <div className="relative flex items-center justify-center w-[200px] h-[200px]">
        <motion.div
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="w-24 h-24 rounded-full flex items-center justify-center relative"
          style={{
            backgroundColor: `${primaryColor}1a`,
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 0 0 0 ${primaryColor}66, 0 20px 40px -20px ${primaryColor}88`,
          }}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${primaryColor}` }}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center mt-2"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Verified successfully
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your password has been reset.
        </p>
      </motion.div>
    </div>
  );
};

export default SuccessCheck;