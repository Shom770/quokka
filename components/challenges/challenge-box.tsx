import React from "react";
import { inter, rethinkSans } from "@/components/fonts";
import { motion } from "framer-motion";
import {
  HeartIcon,
  BoltIcon,
  SunIcon,
  SparklesIcon,
  CheckCircleIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";

const getCategoryIcon = (category: string): React.ReactElement => {
  if (!category) return <PlayCircleIcon className="w-6 h-6" />;
  const lowerCategory = category.toLowerCase();

  if (
    lowerCategory.includes("mindfulness") ||
    lowerCategory.includes("meditation")
  ) {
    return <SunIcon className="w-6 h-6" />;
  } else if (
    lowerCategory.includes("fitness") ||
    lowerCategory.includes("exercise")
  ) {
    return <BoltIcon className="w-6 h-6" />;
  } else if (
    lowerCategory.includes("social") ||
    lowerCategory.includes("connection")
  ) {
    return <HeartIcon className="w-6 h-6" />;
  } else if (
    lowerCategory.includes("creativity") ||
    lowerCategory.includes("art")
  ) {
    return <SparklesIcon className="w-6 h-6" />;
  } else {
    return <PlayCircleIcon className="w-6 h-6" />;
  }
};

const getCategoryColor = (category: string): string => {
  if (!category) return "from-gray-500 to-gray-600";
  const lowerCategory = category.toLowerCase();

  if (
    lowerCategory.includes("mindfulness") ||
    lowerCategory.includes("meditation")
  ) {
    return "from-purple-500 to-indigo-500";
  } else if (
    lowerCategory.includes("fitness") ||
    lowerCategory.includes("exercise")
  ) {
    return "from-red-500 to-orange-500";
  } else if (
    lowerCategory.includes("social") ||
    lowerCategory.includes("connection")
  ) {
    return "from-pink-500 to-rose-500";
  } else if (
    lowerCategory.includes("creativity") ||
    lowerCategory.includes("art")
  ) {
    return "from-yellow-500 to-amber-500";
  } else {
    return "from-orange-500 to-yellow-500";
  }
};

export default function ChallengeBox({
  category,
  description,
  isCompleted,
  allChallengesAccomplished,
  onToggle,
  loading,
  points,
}: {
  category: string;
  description: string;
  isCompleted: boolean;
  allChallengesAccomplished: boolean;
  onToggle: (event?: React.MouseEvent) => void;
  loading?: boolean;
  points?: number;
}) {
  const gradientColor = getCategoryColor(category);
  const categoryIcon = getCategoryIcon(category);

  // Choose badge color based on points value
  let badgeColor = "bg-yellow-400 text-yellow-900";
  if (points && points >= 100) badgeColor = "bg-orange-500 text-white";
  else if (points && points >= 50) badgeColor = "bg-amber-500 text-white";

  return (
    <motion.button
      className={`relative group w-full h-full p-4 rounded-2xl transition-all duration-300 transform z-10 hover:scale-105 ${
        !isCompleted
          ? "bg-white/50 border-2 border-orange-200 text-gray-700 shadow-lg hover:shadow-xl"
          : "bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-xl hover:shadow-2xl"
      }`}
      onClick={(event) => onToggle(event)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      disabled={loading}
    >
      {/* Points Badge */}
      {!isCompleted && points && (
        <div className={`absolute top-3 left-3 z-20`}>
          <span
            className={`flex items-center justify-center w-12 h-9 rounded-2xl font-bold text-sm shadow-md border-2 border-white ${badgeColor}`}
          >
            +{points}
          </span>
        </div>
      )}

      {/* Completion Glow Effect */}
      {allChallengesAccomplished && (
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} blur-lg rounded-2xl -z-10 opacity-75`}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.75, 0.9, 0.75],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-current opacity-10" />
        <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-current opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 h-full">
        {/* Category Icon or Spinner */}
        <motion.div
          className={`flex items-center justify-center w-12 h-12 rounded-full ${
            !isCompleted
              ? `bg-gradient-to-br ${gradientColor} text-white`
              : "bg-white/20 text-white"
          } shadow-lg`}
          animate={loading ? { rotate: 360 } : {}}
          transition={
            loading
              ? { repeat: Infinity, duration: 0.8, ease: "linear" }
              : { duration: 0.6 }
          }
        >
          {loading ? (
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            categoryIcon
          )}
        </motion.div>

        {/* Category Title */}
        <h1
            className={`${rethinkSans.className} text-lg md:text-base lg:text-xl font-extrabold text-center leading-tight`}
        >
          {category}
        </h1>

        {/* Description */}
        <div className="px-3 text-center flex-1 flex items-center">
          <p
            className={`${inter.className} antialiased text-sm font-medium leading-relaxed opacity-90 line-clamp-4`}
          >
            {description}
          </p>
        </div>

        {/* Status Indicator */}
        <motion.div
          className="flex items-center justify-center gap-1 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isCompleted ? (
            <>
              <CheckCircleIcon className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold">Done!</span>
            </>
          ) : loading ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-current opacity-60 animate-spin" />
              <span className="text-xs font-medium opacity-70">
                Completing…
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-xl border-2 border-current opacity-60" />
              <span className="text-xs font-medium opacity-70">
                {/* No points here, badge shows it */}
                Complete this challenge for {points} points!
              </span>
            </>
          )}
        </motion.div>
      </div>

      {/* Hover Effect Overlay */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          !isCompleted
            ? "bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100"
            : "bg-white/5 opacity-0 group-hover:opacity-100"
        }`}
      />
    </motion.button>
  );
}
