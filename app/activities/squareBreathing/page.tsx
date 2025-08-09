"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export const runtime = "edge";

// Animation Variants
const viewVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const feedbackVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Define the four phases of square breathing
const phases = ["Breathe In", "Hold", "Breathe Out", "Hold "]; // Space on 2nd hold to differentiate keys
const phaseDuration = 4;

export default function SquareBreathing() {
  useSession();
  const [isGuest, setIsGuest] = useState(false);
  useEffect(() => {
    try {
      const cookie = typeof document !== "undefined" ? document.cookie : "";
      setIsGuest(cookie.split("; ").some((c) => c.startsWith("guest=1")));
    } catch {
      setIsGuest(false);
    }
  }, []);

  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(phaseDuration);
  const [circleScale, setCircleScale] = useState(1);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

  const t = useTranslations("squareBreathing");

  const startTimeRef = useRef<number | null>(null);
  const phase = phases[phaseIndex];

  // Corrected: Effect to handle the 1-second countdown
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setCounter((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // Corrected: Effect to handle phase changes when the counter reaches zero
  useEffect(() => {
    if (started && counter === 0) {
      setPhaseIndex((prevIndex) => (prevIndex + 1) % phases.length);
      setCounter(phaseDuration);
    }
  }, [counter, started]);

  // Effect to control the circle's scale based on the current phase
  useEffect(() => {
    if (phase === "Breathe In") {
      setCircleScale(1.5);
    } else if (phase === "Breathe Out") {
      setCircleScale(1);
    }
    // During "Hold" phases, the scale remains static
  }, [phase]);

  const startExercise = () => {
    setStarted(true);
    setPhaseIndex(0);
    setCounter(phaseDuration);
    startTimeRef.current = Date.now();
    setLogSuccess(null);
  };

  const logBreathingActivity = async (durationSeconds: number) => {
    if (isGuest) return;
    setIsLogging(true);
    try {
      const minutes = Math.round(durationSeconds / 60);
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: "square-breathing",
          notes: `Completed ${minutes} minute${
            minutes !== 1 ? "s" : ""
          } of square breathing`,
        }),
      });
      setLogSuccess(response.ok);
      if (response.ok) {
        window.dispatchEvent(new Event("statsUpdate"));
      }
    } catch (error) {
      // Log the caught error to the console for debugging
      console.error("Error logging breathing activity:", error);
      setLogSuccess(false);
    }
    setIsLogging(false);
  };

  const finishExercise = () => {
    if (startTimeRef.current) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      logBreathingActivity(duration);
    }
    setStarted(false);
    setCircleScale(1);
    startTimeRef.current = null;
  };

  useEffect(() => {
    if (logSuccess !== null) {
      const timeoutId = setTimeout(() => setLogSuccess(null), 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [logSuccess]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col items-center text-orange-600 justify-center w-full min-h-[90%] p-8"
    >
      <div className="text-center w-full max-w-md">
        <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-4">
          {t("breathingTitle")}
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg mb-8">
          {t("breathingSubtitle")}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="start-view"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center"
          >
            <motion.button
              onClick={startExercise}
              className="px-8 py-3 bg-orange-500 text-white text-lg font-semibold rounded-lg shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("beginButton")}
            </motion.button>
            <div className="h-20 mt-4">
              <AnimatePresence>
                {isLogging && (
                  <motion.div
                    key="logging"
                    variants={feedbackVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md"
                  >
                    {t("loggingMessage")}
                  </motion.div>
                )}
                {logSuccess === true && (
                  <motion.div
                    key="success"
                    variants={feedbackVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="py-2 px-4 bg-green-100 text-green-800 rounded-md"
                  >
                    {t("logSuccess")}
                  </motion.div>
                )}
                {logSuccess === false && (
                  <motion.div
                    key="error"
                    variants={feedbackVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="py-2 px-4 bg-red-100 text-red-800 rounded-md"
                  >
                    {t("logError")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-view"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-between flex-1 w-full"
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="rounded-full bg-orange-400"
                  animate={{ scale: circleScale }}
                  transition={{ duration: phaseDuration, ease: "easeInOut" }}
                  style={{ width: 300, height: 300 }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phase}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-3xl font-medium"
                    >
                      {t(phase.trim())}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-5xl font-bold">
                    {t("secondsCounter", { count: counter })}
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              onClick={finishExercise}
              className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md mb-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("finishButton")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
