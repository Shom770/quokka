"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { rethinkSans } from "@/components/fonts";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-gradient-to-br from-red-300 via-orange-400 to-orange-300 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Dynamic background particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            left: `${10 + (i % 5) * 16}%`,
            top: `${15 + Math.floor(i / 5) * 15}%`,
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + (i % 2),
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/15 rounded-lg rotate-45"
        animate={{
          rotate: [45, 405],
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-white/10 rounded-full"
        animate={{
          scale: [1, 2, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-8 h-8 bg-white/20 transform rotate-45"
        animate={{
          rotate: [45, -315],
          scale: [1, 1.8, 1],
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Pulsing rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-white/20 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-white/25 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.25, 0, 0.25],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Energy waves */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/15 rounded-full"
        animate={{
          scale: [0.5, 1.5, 0.5],
          opacity: [0.15, 0, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sparkle effects */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-white/60 rounded-full"
          style={{
            left: `${20 + (i % 4) * 15}%`,
            top: `${25 + Math.floor(i / 4) * 15}%`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main content with dynamic entrance */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        {/* Logo with glow effect */}
        <motion.div
          className="relative"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            ease: "easeOut"
          }}
        >
          <motion.h1 
            className={`${rethinkSans.className} text-8xl font-extrabold text-white drop-shadow-2xl`}
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            quokka
          </motion.h1>
        </motion.div>

        {/* Tagline with slide effect */}
        <motion.p
          className="text-xl text-white/90 mt-4 font-medium drop-shadow-lg"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.6,
            ease: "easeOut"
          }}
        >
          Be the best version of yourself
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          className="mt-8 w-32 h-1 bg-white/30 rounded-full overflow-hidden mx-auto"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ 
            duration: 2, 
            delay: 0.8,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ 
              duration: 2, 
              delay: 0.8,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 