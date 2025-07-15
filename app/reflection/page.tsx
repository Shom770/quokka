"use client";

import React from "react";
import { questions } from "./questions";
import { rethinkSans } from "../ui/fonts";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, SparklesIcon, HeartIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  },
  titleContainer: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
  },
  questionCard: {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 15 } },
    hover: { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", transition: { duration: 0.2 } }
  },
  submitButton: {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 120, damping: 10 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  },
  resultSection: {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 120, damping: 10 } }
  },
  radioButton: {
    initial: { scale: 1 },
    checked: { scale: 1.2, transition: { duration: 0.2, type: "spring", stiffness: 200, damping: 10 } },
    hover: { scale: 1.1, transition: { duration: 0.1 } }
  },
  backgroundElements: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, delay: 0.3 } }
  },
  floatingIcon: {
    animate: {
      y: [-8, 8, -8],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

export default function Page() {
  const [selected, setSelected] = React.useState<string[]>(() =>
    questions.map(() => "")
  );
  const [goal, setGoal] = React.useState<string | null>(null);
  const resultRef = React.useRef<HTMLDivElement | null>(null);

  const handleOptionChange = (questionIndex: number, optionText: string) => {
    setSelected((prev) => {
      const newSelected = [...prev];
      newSelected[questionIndex] = optionText;
      return newSelected;
    });
  };

  const gradeQuiz = () => {
    const categories = new Map<string, number>();

    questions.forEach((question, idx) => {
      let score = 0;
      question.options.forEach((opt) => {
        if (opt.text === selected[idx]) {
          score = opt.score;
        }
      });
      question.categories.forEach((category) => {
        categories.set(category, (categories.get(category) ?? 0) + score);
      });
    });

    let maxCategory = "";
    let maxScore = 0;
    categories.forEach((value, key) => {
      if (value > maxScore) {
        maxScore = value;
        maxCategory = key;
      }
    });

    setGoal(maxCategory);

    // Scroll to result
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  };

  const allAnswered = selected.every((answer) => answer !== "");

  const renderedQuestions = questions.map((question, idx) => {
    return (
      <motion.fieldset
        key={idx}
        className="block w-full p-6 mb-4 bg-white border border-orange-300 rounded-xl shadow-sm"
        {...animationVariants.questionCard}
        initial="initial"
        animate="animate"
        whileHover="hover"
        transition={{ delay: idx * 0.1 }}
      >
        <legend className="sr-only">{question.question}</legend>
        <motion.h5 
          className={`${rethinkSans.className} mb-4 text-2xl font-bold tracking-tight text-black`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (idx * 0.1) + 0.2 }}
        >
          {question.question}
        </motion.h5>
        {question.options.map((opt, o_idx) => {
          const id = `question_${idx}_option_${o_idx}`;
          const isSelected = selected[idx] === opt.text;
          return (
            <motion.label
              key={o_idx}
              htmlFor={id}
              className="flex items-center mb-3 cursor-pointer text-gray-900 hover:text-orange-600 transition-colors duration-200 group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (idx * 0.1) + 0.3 + (o_idx * 0.05) }}
              whileHover={{ x: 5 }}
            >
              <div className="relative">
                <input
                  id={id}
                  type="radio"
                  name={`Question_${idx}`}
                  value={opt.text}
                  checked={isSelected}
                  onChange={() => handleOptionChange(idx, opt.text)}
                  className="w-4 h-4 border-gray-300 accent-orange-500 sr-only"
                />
                <motion.div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'
                  } transition-all duration-200`}
                  {...animationVariants.radioButton}
                  animate={isSelected ? "checked" : "initial"}
                  whileHover="hover"
                >
                  {isSelected && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, type: "spring" }}
                    />
                  )}
                </motion.div>
              </div>
              <span className="ml-3 text-sm font-medium group-hover:text-orange-600 transition-colors duration-200">
                {opt.text}
              </span>
            </motion.label>
          );
        })}
      </motion.fieldset>
    );
  });

  return (
    <motion.div 
      className="relative flex flex-col items-center gap-6 w-full max-w-2xl mx-auto overflow-y-scroll px-4"
      {...animationVariants.pageContainer}
    >
      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        {...animationVariants.backgroundElements}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-rose-50 opacity-30" />
        
        {/* Decorative Elements */}
        <div className="absolute top-32 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 opacity-20 blur-xl" />
        <div className="absolute bottom-64 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-rose-200 to-orange-200 opacity-15 blur-2xl" />
        
        {/* Floating Icons */}
        <motion.div 
          className="absolute top-20 right-20 text-orange-300 opacity-25"
          {...animationVariants.floatingIcon}
        >
          <SparklesIcon className="w-6 h-6" />
        </motion.div>
        <motion.div 
          className="absolute bottom-40 left-20 text-rose-300 opacity-20"
          {...animationVariants.floatingIcon}
          style={{ animationDelay: "2s" }}
        >
          <HeartIcon className="w-8 h-8" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        <motion.div 
          className="text-center mb-8"
          {...animationVariants.titleContainer}
        >
          <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[46px] leading-[1] text-orange-600 drop-shadow-sm`}>
            Reflect on your mental health.
          </h1>
          <p className="text-gray-600 text-lg font-medium mt-2">
            Answer these questions to get personalized wellness recommendations
          </p>
        </motion.div>

        {renderedQuestions}

        <AnimatePresence>
          {allAnswered && (
            <motion.div 
              className="flex justify-center my-8"
              {...animationVariants.submitButton}
            >
              <motion.button
                onClick={gradeQuiz}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={animationVariants.submitButton.hover}
                whileTap={animationVariants.submitButton.tap}
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span className={`${rethinkSans.className} antialiased`}>
                    Get Your Activity Recommendation
                  </span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {goal && (
            <motion.div 
              ref={resultRef} 
              className="mb-8 p-6 bg-white rounded-xl border border-orange-200 shadow-lg"
              {...animationVariants.resultSection}
            >
              <div className="text-center space-y-3">
                <motion.div 
                  className="flex items-center justify-center gap-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 10 }}
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  <h3 className={`${rethinkSans.className} text-2xl font-bold text-gray-900`}>
                    Your Recommendation
                  </h3>
                </motion.div>
                <motion.p 
                  className="text-lg text-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Based on your responses, you should try{" "}
                  <span className="font-bold text-orange-600">{goal}</span>.
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link 
                    href="/activities" 
                    className="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-300 hover:decoration-orange-500 transition-colors duration-200"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      Check out our activities page
                    </motion.span>
                  </Link>{" "}
                  to get started!
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
