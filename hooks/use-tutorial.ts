import { useState, useEffect } from "react";

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen the tutorial before
    const tutorialSeen = localStorage.getItem("tutorial-completed");
    if (!tutorialSeen) {
      setShowTutorial(true);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem("tutorial-completed", "true");
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  const skipTutorial = () => {
    localStorage.setItem("tutorial-completed", "true");
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem("tutorial-completed");
    setShowTutorial(true);
    setHasSeenTutorial(false);
  };

  return {
    showTutorial,
    hasSeenTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
} 