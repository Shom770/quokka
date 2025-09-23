"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  position?: { x: number; y: number };
}

export default function Confetti({ trigger, onComplete, position }: ConfettiProps) {
  useEffect(() => {
    if (trigger) {
      // Create a canvas confetti burst from the specified position or center
      const origin = position 
        ? { x: position.x / window.innerWidth, y: position.y / window.innerHeight }
        : { y: 0.6 };

      confetti({
        particleCount: 100,
        spread: 70,
        origin,
        colors: ["#F66B6B", "#F5C114", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
      });

      // Call onComplete after a short delay
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete, position]);

  return null; // This component doesn't render anything
}
