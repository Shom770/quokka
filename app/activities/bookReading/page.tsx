"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export const runtime = "edge";

// Animation Variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const viewVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.3, ease: [0.6, 0.04, 0.98, 0.34] } },
};

export default function BookReadingActivity() {
  useSession({ required: true });
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && !isPaused && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsSessionComplete(true);
      setIsTimerActive(false);
      setIsPaused(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerActive, isPaused, timer]);

  const startTimer = (time: number) => {
    setSelectedTime(time);
    setTimer(time * 60);
    setIsTimerActive(true);
    setIsPaused(false);
    setIsSessionComplete(false);
    setLogSuccess(null);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsTimerActive(false);
    setIsPaused(false);
    setSelectedTime(null);
    setTimer(0);
  };

  const handleCompletion = async () => {
    if (!selectedTime) return;
    setIsLogging(true);
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: "book-reading", notes: `Reading session for ${selectedTime} minutes` }),
      });
      setLogSuccess(response.ok);
    } catch (error) {
      console.error("Error logging book reading activity:", error);
      setLogSuccess(false);
    }
    setIsLogging(false);
    setTimeout(() => {
      setIsSessionComplete(false);
      setSelectedTime(null);
    }, 3000);
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = (selectedTime || 0) * 60;
  const progress = totalSeconds > 0 ? timer / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const getButtonState = () => {
    if (isLogging) return { text: "Logging activity...", color: "#9CA3AF" }; // gray-400
    if (logSuccess === true) return { text: "✓ Activity Logged!", color: "#16A34A" }; // green-600
    if (logSuccess === false) return { text: "✗ Logging Failed", color: "#DC2626" }; // red-600
    return { text: "Mark Session as Complete", color: "#22C55E" }; // green-500
  };
  const buttonState = getButtonState();

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-screen p-6"
    >
      <div className="max-w-xl w-full p-6 text-orange-600">
        <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-4 flex items-center gap-3">
          <span role="img" aria-label="book" className="text-4xl">📖</span>
          Book Reading
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg mb-8 font-medium">
          Set a goal for your reading session and immerse yourself in a good book.
        </motion.p>

        <AnimatePresence mode="wait">
          {!isTimerActive && !isSessionComplete && (
            <motion.div key="selection" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Time (minutes)</h2>
              <div className="grid grid-cols-3 gap-4">
                {[10, 15, 20, 30, 45, 60].map((time) => (
                  <motion.button
                    key={time}
                    onClick={() => startTimer(time)}
                    className="px-4 py-3 rounded-lg font-semibold text-white bg-orange-500"
                    whileHover={{ scale: 1.05, backgroundColor: "#F97316" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {isTimerActive && (
            <motion.div key="timer" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center">
                <motion.div className="relative w-52 h-52 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r={radius} stroke="#FDBA74" strokeWidth="12" fill="none" />
                        <motion.circle
                            cx="100" cy="100" r={radius}
                            stroke="#F97316" strokeWidth="12" fill="none" strokeLinecap="round"
                            strokeDasharray={circumference}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <span className="text-5xl font-mono text-orange-700">
                        {`${Math.floor(timer / 60)}`.padStart(2, "0")}:{`${timer % 60}`.padStart(2, "0")}
                    </span>
                </motion.div>
                <p className="text-lg font-semibold mt-6">Focus on your reading...</p>
                <motion.div
                    className="flex gap-4 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.4 } }}
                >
                    <motion.button onClick={handlePauseResume} className="px-5 py-2 rounded-lg font-semibold text-white bg-yellow-500" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {isPaused ? "Resume" : "Pause"}
                    </motion.button>
                    <motion.button onClick={handleStop} className="px-5 py-2 rounded-lg font-semibold text-white bg-red-500" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Stop
                    </motion.button>
                </motion.div>
            </motion.div>
          )}

          {isSessionComplete && (
            <motion.div key="completion" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Session Complete!</h2>
                    <p className="text-lg mt-2 mb-6">Great job on completing your reading session.</p>
                </div>
                <motion.button
                    onClick={handleCompletion}
                    disabled={isLogging || logSuccess !== null}
                    className="w-full py-3 rounded-lg text-white text-lg font-semibold"
                    animate={{ backgroundColor: buttonState.color }}
                    whileHover={{ scale: isLogging || logSuccess !== null ? 1 : 1.03 }}
                    whileTap={{ scale: isLogging || logSuccess !== null ? 1 : 0.97 }}
                >
                    {buttonState.text}
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}