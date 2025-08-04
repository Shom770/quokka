"use client";

import { rethinkSans } from "@/components/fonts";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export const runtime = "edge";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const viewVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export default function Page() {
  useSession({ required: true });
  const [time, setTime] = useState<number | null>(null);
  const [originalDuration, setOriginalDuration] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [journalCompleted, setJournalCompleted] = useState(false);

  const t = useTranslations("moodJournaling");

  const logJournalingActivity = useCallback(async () => {
    if (!originalDuration) return;
    setIsLogging(true);
    try {
      const minutes = Math.floor(originalDuration / 60);
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: "mood-journaling",
          notes: `Completed ${minutes} minute mood journaling session`,
        }),
      });
      setLogSuccess(response.ok);
      if (response.ok) {
        window.dispatchEvent(new Event("statsUpdate"));
      }
    } catch (error) {
      console.error("Error logging journaling activity:", error);
      setLogSuccess(false);
    }
    setIsLogging(false);
  }, [originalDuration]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (time !== null && time > 0) {
      timer = setTimeout(() => {
        setTime(time - 1);
      }, 1000);
    } else if (time === 0 && !journalCompleted) {
      setJournalCompleted(true);
      logJournalingActivity();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [time, journalCompleted, logJournalingActivity]);

  const startTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTime(seconds);
    setOriginalDuration(seconds);
    setJournalCompleted(false);
    setLogSuccess(null);
  };

  const resetSession = () => {
    setTime(null);
    setOriginalDuration(null);
    setJournalCompleted(false);
    setLogSuccess(null);
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Correctly handle cases where time or originalDuration might be null
  const progress =
    originalDuration && time !== null ? time / originalDuration : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-6 w-full md:w-1/2 lg:w-1/3 h-full p-4"
    >
      <motion.h1
        variants={itemVariants}
        className={`${rethinkSans.className} font-extrabold text-[46px] leading-[1] text-orange-500 text-center`}
      >
        {t("moodJournalingTitle")}
      </motion.h1>
      <motion.span
        variants={itemVariants}
        className="font-bold text-lg leading-tight text-orange-600 text-center"
      >
        {t("moodJournalingSubtitle")}
      </motion.span>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 w-full max-w-sm"
      >
        <div className="flex justify-center">
          <ul className="text-orange-600 list-disc list-inside">
            <li>{t("feelingAnxious")}</li>
            <li>{t("feelingOverwhelmed")}</li>
            <li>{t("feelingExcited")}</li>
            <li>{t("feelingFrustrated")}</li>
            <li>{t("feelingContent")}</li>
            <li>{t("feelingLonely")}</li>
            <li>{t("feelingGrateful")}</li>
          </ul>
        </div>
        <div className="flex justify-center">
          <ul className="text-orange-600 list-disc list-inside">
            <li>{t("feelingConfused")}</li>
            <li>{t("feelingHopeful")}</li>
            <li>{t("feelingNervous")}</li>
            <li>{t("feelingAngry")}</li>
            <li>{t("feelingSad")}</li>
            <li>{t("feelingJoyful")}</li>
            <li>{t("feelingEmbarrassed")}</li>
          </ul>
        </div>
      </motion.div>

      {/* Timer Section */}
      <div className="w-full mt-4">
        <AnimatePresence mode="wait">
          {!time && !journalCompleted && (
            <motion.div
              key="selection"
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <span className="block mt-2 text-lg font-bold text-orange-600 mb-4">
                {t("chooseDuration")}
              </span>
              <div className="w-full grid grid-cols-2 gap-4">
                {[5, 10, 15, 25].map((min) => (
                  <motion.button
                    key={min}
                    className="bg-orange-500/15 px-4 py-3 rounded-lg border-2 border-orange-500 text-orange-600 font-medium text-lg"
                    onClick={() => startTimer(min)}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(249, 115, 22, 0.25)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("minutes", { count: min })}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {time !== null && time > 0 && (
            <motion.div
              key="timer"
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center flex flex-col items-center"
            >
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg
                  className="absolute w-full h-full transform -rotate-90"
                  viewBox="0 0 140 140"
                >
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#FDBA74"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#F97316"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <span className="text-4xl font-bold text-orange-700 z-10">
                  {Math.floor(time / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(time % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-orange-600 mt-4">{t("timeRemaining")}</p>
              <motion.button
                className="mt-4 bg-orange-500 px-7 py-2 rounded-lg text-white font-semibold"
                onClick={resetSession}
                whileHover={{ scale: 1.05, backgroundColor: "#EA580C" }}
                whileTap={{ scale: 0.95 }}
              >
                {t("cancel")}
              </motion.button>
            </motion.div>
          )}

          {journalCompleted && time === 0 && (
            <motion.div
              key="complete"
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center mt-4"
            >
              <h2 className="text-2xl font-bold text-orange-600">
                {t("sessionComplete")}
              </h2>

              <AnimatePresence>
                {isLogging ? (
                  <motion.div
                    variants={itemVariants}
                    className="mt-4 py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md"
                  >
                    {t("loggingSession")}
                  </motion.div>
                ) : logSuccess === true ? (
                  <motion.div
                    variants={itemVariants}
                    className="mt-4 py-2 px-4 bg-green-100 text-green-800 rounded-md"
                  >
                    {t("logSuccess")}
                  </motion.div>
                ) : logSuccess === false ? (
                  <motion.div
                    variants={itemVariants}
                    className="mt-4 py-2 px-4 bg-red-100 text-red-800 rounded-md"
                  >
                    {t("logError")}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <motion.button
                className="mt-6 bg-orange-500 px-7 py-2 rounded-lg text-white font-semibold"
                onClick={resetSession}
                whileHover={{ scale: 1.05, backgroundColor: "#EA580C" }}
                whileTap={{ scale: 0.95 }}
              >
                {t("startNewSession")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
