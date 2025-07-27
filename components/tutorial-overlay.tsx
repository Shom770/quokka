"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { rethinkSans } from "@/components/fonts";

interface TutorialStep {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
  title: string;
  description: string;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  refs: {
    activityCards: React.RefObject<HTMLElement | null>;
    meditationCard: React.RefObject<HTMLElement | null>;
    journalingCard: React.RefObject<HTMLElement | null>;
    resourcesCard: React.RefObject<HTMLElement | null>;
    challengeBox: React.RefObject<HTMLElement | null>;
  };
}

export default function TutorialOverlay({ isVisible, onComplete, onSkip, refs }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: "challenge",
      ref: refs.challengeBox,
      title: "Daily Challenge",
      description: "Complete daily challenges to build healthy habits and track your progress."
    },
    {
      id: "reflection",
      ref: refs.journalingCard,
      title: "Mental Health Reflection",
      description: "Reflect on your mental health and understand yourself better."
    },
    {
      id: "resources",
      ref: refs.resourcesCard,
      title: "Resources",
      description: "Find mental health resources and support when you need help."
    },
    {
      id: "activities",
      ref: refs.meditationCard,
      title: "Activities",
      description: "Access meditation, breathing exercises, yoga, and other wellness activities."
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    if (isVisible) {
      // Initially dim all tutorial elements
      tutorialSteps.forEach(step => {
        if (step.ref?.current) {
          step.ref.current.style.filter = 'blur(2px) brightness(0.7)';
        }
      });
      
      // Then highlight the current element
      if (currentStepData?.ref?.current) {
        const element = currentStepData.ref.current;
        element.style.boxShadow = '0 0 0 4px rgba(251, 146, 60, 0.8), 0 0 20px rgba(251, 146, 60, 0.6)';
        element.style.borderRadius = '16px';
        element.style.zIndex = '1000';
        element.style.filter = 'none'; // Remove any blur from highlighted element
      }
    }
  }, [isVisible, currentStep, currentStepData]);

  useEffect(() => {
    if (isVisible && currentStepData?.ref?.current) {
      // Add highlight style to current element
      const element = currentStepData.ref.current;
      element.style.boxShadow = '0 0 0 4px rgba(251, 146, 60, 0.8), 0 0 20px rgba(251, 146, 60, 0.6)';
      element.style.borderRadius = '16px';
      element.style.zIndex = '1000';
      element.style.filter = 'none'; // Remove any blur from highlighted element
      
      // Remove highlight from other elements and add blur
      tutorialSteps.forEach((step, index) => {
        if (index !== currentStep && step.ref?.current) {
          step.ref.current.style.boxShadow = '';
          step.ref.current.style.borderRadius = '';
          step.ref.current.style.zIndex = '';
          step.ref.current.style.filter = 'blur(2px) brightness(0.7)'; // Dim and blur other elements
        }
      });
    }
  }, [currentStep, currentStepData]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Remove all highlights and blur effects
      tutorialSteps.forEach(step => {
        if (step.ref?.current) {
          step.ref.current.style.boxShadow = '';
          step.ref.current.style.borderRadius = '';
          step.ref.current.style.zIndex = '';
          step.ref.current.style.filter = '';
        }
      });
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Remove all highlights and blur effects
    tutorialSteps.forEach(step => {
      if (step.ref?.current) {
        step.ref.current.style.boxShadow = '';
        step.ref.current.style.borderRadius = '';
        step.ref.current.style.zIndex = '';
        step.ref.current.style.filter = '';
      }
    });
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-red-500/5" />

        {/* Tooltip */}
        <motion.div
          className="absolute bg-white/95 rounded-2xl shadow-2xl border border-orange-100 p-6 max-w-sm"
          style={{
            top: 100,
            left: 50,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-orange-500" />
              <h3 className={`${rethinkSans.className} font-bold text-xl text-orange-600`}>
                {currentStepData?.title}
              </h3>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {currentStepData?.description}
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                    style={{ width: index === currentStep ? '24px' : '8px' }}
                    animate={{ width: index === currentStep ? '24px' : '8px' }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <motion.button
                    onClick={prevStep}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                  </motion.button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Skip
                </motion.button>
                <motion.button
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Close button */}
        <motion.button
          onClick={handleSkip}
          className="absolute top-6 right-6 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
} 