import React from "react";
import { inter, rethinkSans } from "@/components/fonts";
import { motion } from "framer-motion";
import { 
  HeartIcon, 
  BoltIcon, 
  SunIcon, 
  SparklesIcon,
  CheckCircleIcon,
  PlayCircleIcon
} from "@heroicons/react/24/solid";

const getCategoryIcon = (category: string): React.ReactElement => {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('mindfulness') || lowerCategory.includes('meditation')) {
    return <SunIcon className="w-8 h-8" />;
  } else if (lowerCategory.includes('fitness') || lowerCategory.includes('exercise')) {
    return <BoltIcon className="w-8 h-8" />;
  } else if (lowerCategory.includes('social') || lowerCategory.includes('connection')) {
    return <HeartIcon className="w-8 h-8" />;
  } else if (lowerCategory.includes('creativity') || lowerCategory.includes('art')) {
    return <SparklesIcon className="w-8 h-8" />;
  } else {
    return <PlayCircleIcon className="w-8 h-8" />;
  }
};

const getCategoryColor = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('mindfulness') || lowerCategory.includes('meditation')) {
    return 'from-purple-500 to-indigo-500';
  } else if (lowerCategory.includes('fitness') || lowerCategory.includes('exercise')) {
    return 'from-red-500 to-orange-500';
  } else if (lowerCategory.includes('social') || lowerCategory.includes('connection')) {
    return 'from-pink-500 to-rose-500';
  } else if (lowerCategory.includes('creativity') || lowerCategory.includes('art')) {
    return 'from-yellow-500 to-amber-500';
  } else {
    return 'from-orange-500 to-yellow-500';
  }
};

export default function ChallengeBox({ category, description, isCompleted, allChallengesAccomplished, onToggle }: { category: string, description: string, isCompleted: boolean, allChallengesAccomplished: boolean, onToggle: () => void }) {
   const gradientColor = getCategoryColor(category);
   const categoryIcon = getCategoryIcon(category);

   return (
       <motion.button
            className={`relative group w-full min-h-[280px] p-6 rounded-2xl transition-all duration-300 transform z-10 hover:scale-105 ${!isCompleted ? 'bg-white border-2 border-orange-200 text-gray-700 shadow-lg hover:shadow-xl' : 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-xl hover:shadow-2xl'}`}
            onClick={onToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            {/* Completion Glow Effect */}
            {allChallengesAccomplished && (
                <motion.div 
                    className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} blur-lg rounded-2xl -z-10 opacity-75`}
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.75, 0.9, 0.75]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-current opacity-10" />
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-current opacity-10" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 h-full">
                {/* Category Icon */}
                <motion.div 
                    className={`flex items-center justify-center w-16 h-16 rounded-full ${!isCompleted ? `bg-gradient-to-br ${gradientColor} text-white` : 'bg-white/20 text-white'} shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                >
                    {categoryIcon}
                </motion.div>
                
                {/* Category Title */}
                <h1 className={`${rethinkSans.className} text-xl font-extrabold text-center leading-tight`}>
                    {category}
                </h1>
                
                {/* Description */}
                <div className="px-4 text-center">
                    <p className={`${inter.className} antialiased text-sm font-medium leading-relaxed opacity-90`}>
                        {description}
                    </p>
                </div>
                
                {/* Status Indicator */}
                <motion.div 
                    className="flex items-center justify-center gap-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {isCompleted ? (
                        <>
                            <CheckCircleIcon className="w-5 h-5 text-white" />
                            <span className="text-sm font-semibold">Completed!</span>
                        </>
                    ) : (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-current opacity-60" />
                            <span className="text-sm font-medium opacity-70">Tap to complete</span>
                        </>
                    )}
                </motion.div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${!isCompleted ? 'bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`} />
       </motion.button>
   )
}
