"use client";

import { motion } from "framer-motion";
import { StarIcon, TrophyIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { getMilestones } from "@/utils/levels";

interface NavbarLevelProps {
  totalPoints: number;
}

export default function NavbarLevel({ totalPoints }: NavbarLevelProps) {
  const { level: currentLevel, progress } = getMilestones(totalPoints);
  const progressPercent = Math.max(0, Math.min(100, progress * 100));

  const getLevelIcon = (level: number) => {
    if (level <= 5) return <StarIcon className="w-4 h-4" />;
    if (level <= 10) return <TrophyIcon className="w-4 h-4" />;
    return <SparklesIcon className="w-4 h-4" />;
  };

  const getLevelColor = (level: number) => {
    if (level <= 5) return "from-green-400 to-emerald-500";
    if (level <= 10) return "from-blue-400 to-cyan-500";
    if (level <= 15) return "from-purple-400 to-violet-500";
    if (level <= 20) return "from-orange-400 to-red-500";
    if (level <= 25) return "from-yellow-400 to-orange-500";
    if (level <= 30) return "from-pink-400 to-purple-500";
    return "from-indigo-400 to-purple-600";
  };

  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-orange-200 min-w-[220px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0 }}
    >
      {/* Level Icon */}
      <div className={`p-2 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} text-white shadow-sm`}>
        {getLevelIcon(currentLevel)}
      </div>
      
      {/* Level Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Level {currentLevel}</span>
          <span className="text-xs text-gray-500 font-medium mr-1">{totalPoints} pts</span>
        </div>
        
        {/* Progress Bar with Percentage */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
            <motion.div
              className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <span className="text-xs text-gray-500 mr-1">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
