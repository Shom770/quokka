"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export const runtime = "edge";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const feedbackVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const checkVariants = {
  checked: { scale: 1, backgroundColor: "#f97316" },
  unchecked: { scale: 1, backgroundColor: "#ffffff" },
};

const checkmarkPathVariants = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { pathLength: 0, transition: { duration: 0.1 } },
};

// Custom Animated Checkbox Component
const GratitudeItem = ({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <motion.label
      htmlFor={id}
      variants={itemVariants}
      className="flex items-center space-x-4 cursor-pointer"
      whileHover={{ x: 2 }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <motion.div
        className="w-6 h-6 border-2 border-orange-400 rounded flex items-center justify-center shrink-0"
        variants={checkVariants}
        animate={checked ? "checked" : "unchecked"}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                variants={checkmarkPathVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="relative text-orange-600">
        <span>{label}</span>
        <AnimatePresence>
          {checked && (
            <motion.div
              className="absolute top-[55%] left-0 w-full h-[2px] bg-orange-400"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{
                scaleX: 1,
                originX: 0,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              exit={{
                scaleX: 0,
                originX: 1,
                transition: { duration: 0.2, ease: "easeIn" },
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.label>
  );
};

export default function Page() {
  const { data: session } = useSession({ required: true });
  const [gratitudes, setGratitudes] = useState({
    gratitude1: false,
    gratitude2: false,
    gratitude3: false,
  });
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

  const handleCheckboxChange = (id: keyof typeof gratitudes) => {
    setGratitudes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allCompleted =
    gratitudes.gratitude1 && gratitudes.gratitude2 && gratitudes.gratitude3;

  useEffect(() => {
    const logActivity = async () => {
      if (allCompleted && !isLogging && logSuccess === null) {
        setIsLogging(true);
        try {
          const response = await fetch("/api/activities", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              activity_id: "gratitude-journaling",
              notes: "Completed 3 gratitude items",
            }),
          });
          setLogSuccess(response.ok);
        } catch (error) {
          console.error("Error logging gratitude activity:", error);
          setLogSuccess(false);
        }
        setIsLogging(false);
      }
    };
    logActivity();
  }, [allCompleted, isLogging, logSuccess, session]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (logSuccess !== null) {
      timeout = setTimeout(() => {
        setLogSuccess(null);
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [logSuccess]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 w-full md:w-1/2 lg:w-1/3 p-4"
    >
      <motion.h1
        variants={itemVariants}
        className="font-extrabold text-[46px] leading-[1] text-center text-orange-500"
      >
        Gratitude Journaling
      </motion.h1>
      <motion.span
        variants={itemVariants}
        className="font-bold text-lg text-orange-600 text-center"
      >
        Take a moment to reflect on three things you&apos;re grateful for. As
        you complete each one, check the box.
      </motion.span>

      <motion.div
        variants={containerVariants}
        className="space-y-6 flex flex-col items-start"
      >
        <GratitudeItem
          id="gratitude1"
          label="Write your first gratitude."
          checked={gratitudes.gratitude1}
          onChange={() => handleCheckboxChange("gratitude1")}
        />
        <GratitudeItem
          id="gratitude2"
          label="Write your second gratitude."
          checked={gratitudes.gratitude2}
          onChange={() => handleCheckboxChange("gratitude2")}
        />
        <GratitudeItem
          id="gratitude3"
          label="Write your third gratitude."
          checked={gratitudes.gratitude3}
          onChange={() => handleCheckboxChange("gratitude3")}
        />
      </motion.div>

      <div className="h-12 mt-4">
        <AnimatePresence mode="wait">
          {isLogging && (
            <motion.div
              key="logging"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center font-semibold"
            >
              Logging your gratitude practice...
            </motion.div>
          )}
          {logSuccess === true && (
            <motion.div
              key="success"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-3 bg-green-100 text-green-800 rounded-lg text-center font-semibold"
            >
              ✨ Practice logged successfully! Keep it up!
            </motion.div>
          )}
          {logSuccess === false && (
            <motion.div
              key="error"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-3 bg-red-100 text-red-800 rounded-lg text-center font-semibold"
            >
              Could not log your practice. Please try again.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}