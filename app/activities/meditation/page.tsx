"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export const runtime = "edge";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const feedbackVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

/**
 * Example Meditation page in Next.js.
 * Place any MP3 files into your public/ folder or fetch them dynamically.
 */
export default function Page() {
  useSession({ required: true });
  const [timer, setTimer] = useState<number>(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = useTranslations("meditation");

  const startMeditation = (duration: number) => {
    stopMeditation(false);
    setTimer(duration);
    setSessionDuration(duration);
    setIsMeditating(true);
    setIsPaused(false);
    setLogSuccess(null);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopMeditation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (selectedSong) {
      audioRef.current = new Audio(selectedSong);
      if (!isMuted) {
        audioRef.current
          .play()
          .catch((err) => console.error("Audio play error:", err));
      }
    }
  };

  const logMeditationActivity = async (duration: number) => {
    setIsLogging(true);
    try {
      const minutes = Math.floor(duration / 60);
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: "meditation",
          notes: `Completed ${minutes} minute meditation`,
        }),
      });
      setLogSuccess(response.ok);
      if (response.ok) {
        window.dispatchEvent(new Event("statsUpdate"));
      }
    } catch (error) {
      console.error("Error logging meditation activity:", error);
      setLogSuccess(false);
    }
    setIsLogging(false);
  };

  const stopMeditation = (finished: boolean) => {
    setIsMeditating(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (finished) {
      playAlarm();
      logMeditationActivity(sessionDuration);
    }
  };

  const playAlarm = () => {
    const alarmAudio = new Audio("/sounds/soft_alarm.mp3");
    alarmAudio.play().catch((err) => console.error("Alarm audio error:", err));
  };

  const pauseMeditation = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    audioRef.current?.pause();
  };

  const resumeMeditation = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopMeditation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    if (!isMuted)
      audioRef.current
        ?.play()
        .catch((err) => console.error("Resume error:", err));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (logSuccess !== null) {
      const timeout = setTimeout(() => setLogSuccess(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [logSuccess]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = sessionDuration > 0 ? timer / sessionDuration : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-orange-600 justify-center min-h-screen gap-6 p-6"
    >
      <motion.h1 variants={itemVariants} className="text-4xl font-bold">
        {t("meditationTitle")}
      </motion.h1>
      <motion.p variants={itemVariants} className="font-medium text-lg">
        {t("meditationSubtitle")}
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between w-full max-w-xs"
      >
        <label className="font-semibold">{t("selectSoundLabel")}</label>
        <select
          className="border border-orange-300 text-gray-700 rounded px-2 py-1 focus:ring-2 focus:ring-orange-400"
          value={selectedSong || ""}
          onChange={(e) => setSelectedSong(e.target.value || null)}
        >
          <option value="">{t("noSoundOption")}</option>
          <option value="/songs/song1.mp3">{t("gentleRainOption")}</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-4">
        {[2, 5, 10].map((min) => (
          <motion.button
            key={min}
            onClick={() => startMeditation(min * 60)}
            className="bg-orange-500/25 text-orange-600 font-semibold px-5 py-2 rounded-lg border border-orange-500"
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(249, 115, 22, 0.35)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            {t("minutes", { count: min })}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="relative w-52 h-52 flex items-center justify-center mt-4"
        animate={{
          scale: isMeditating ? 1 : 0.9,
          opacity: isMeditating ? 1 : 0.7,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.svg
          className="absolute w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#FDBA74"
            strokeWidth="10"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#F97316"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </motion.svg>
        <span className="text-5xl font-mono text-orange-700">
          {formatTime(timer)}
        </span>
        <AnimatePresence>
          {isMeditating && !isPaused && (
            <motion.div
              className="absolute w-full h-full border-4 border-orange-200 rounded-full"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <div className="h-12">
        <AnimatePresence>
          {isMeditating && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex gap-4"
            >
              <motion.button
                variants={itemVariants}
                onClick={isPaused ? resumeMeditation : pauseMeditation}
                className="bg-yellow-500/80 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPaused ? t("resume") : t("pause")}
              </motion.button>
              <motion.button
                variants={itemVariants}
                onClick={toggleMute}
                className="bg-yellow-500/80 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? t("unmute") : t("mute")}
              </motion.button>
              <motion.button
                variants={itemVariants}
                onClick={() => stopMeditation(false)}
                className="bg-red-500/80 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("stop")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-12 mt-4">
        <AnimatePresence mode="wait">
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
  );
}
