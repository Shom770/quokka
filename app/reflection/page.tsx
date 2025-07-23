"use client";

import React from "react";
import { questions } from "./questions";
import { rethinkSans } from "@/components/fonts";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  },
  titleContainer: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
  },
  card: {
    initial: { opacity: 0, x: 50, scale: 0.95 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: { opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.4 } },
  },
  navButton: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05 },
  },
};

export default function Page() {
  const [stage, setStage] = React.useState<"intro" | "quiz" | "result">(
    "intro"
  );
  const [current, setCurrent] = React.useState<number>(0);
  const [selected, setSelected] = React.useState<string[]>(() =>
    questions.map(() => "")
  );
  const [goal, setGoal] = React.useState<string | null>(null);

  const handleOptionChange = (option: string) => {
    const copy = [...selected];
    copy[current] = option;
    setSelected(copy);

    setTimeout(() => {
      nextQuestion();
    }, 100);
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      gradeQuiz();
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const gradeQuiz = () => {
    const categories = new Map<string, number>();
    questions.forEach((q, idx) => {
      const opt = q.options.find((o) => o.text === selected[idx]);
      if (opt) {
        q.categories.forEach((cat) => {
          categories.set(cat, (categories.get(cat) || 0) + opt.score);
        });
      }
    });
    let maxCategory = "";
    let maxScore = -Infinity;
    categories.forEach((score, cat) => {
      if (score > maxScore) {
        maxScore = score;
        maxCategory = cat;
      }
    });
    setGoal(maxCategory);
    setStage("result");
  };

  return (
    <motion.div
      className="relative w-full max-w-xl mx-auto p-4"
      initial="initial"
      animate="animate"
      variants={animationVariants.pageContainer}
    >
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            className="text-center p-6 bg-orange-100 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants.card}
          >
            <motion.h1
              className={`${rethinkSans.className} text-3xl font-bold text-orange-600`}
              initial="initial"
              animate="animate"
              variants={animationVariants.titleContainer}
            >
              Reflect on your mental health
            </motion.h1>
            <motion.p
              className="mt-2 text-gray-700"
              initial="initial"
              animate="animate"
              variants={animationVariants.titleContainer}
            >
              Answer these questions to get personalized wellness
              recommendations.
            </motion.p>
            <motion.button
              className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center mx-auto"
              onClick={() => setStage("quiz")}
              initial="initial"
              animate="animate"
              variants={animationVariants.navButton}
              whileHover="hover"
            >
              Start
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.button>
          </motion.div>
        )}

        {stage === "quiz" && (
          <motion.div
            key={`quiz-${current}`}
            className="relative z-10 bg-orange-100 p-4 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants.card}
          >
            <fieldset className="mb-4">
              <legend className="sr-only">{questions[current].question}</legend>
              <motion.h5
                className="text-xl font-bold text-gray-700 mb-3"
                initial="initial"
                animate="animate"
                variants={animationVariants.titleContainer}
              >
                {questions[current].question}
              </motion.h5>
              {questions[current].options.map((o, i) => (
                <label
                  key={i}
                  className="block mb-2 cursor-pointer text-gray-600"
                >
                  <input
                    type="radio"
                    name={`question-${current}`}
                    value={o.text}
                    checked={selected[current] === o.text}
                    onChange={() => handleOptionChange(o.text)}
                    className="mr-2 accent-orange-500"
                  />
                  {o.text}
                </label>
              ))}
            </fieldset>
            <div className="flex justify-between">
              <motion.button
                className={`flex items-center ${
                  current === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "text-gray-900 font-medium"
                }`}
                onClick={prevQuestion}
                disabled={current === 0}
                initial="initial"
                animate="animate"
                variants={animationVariants.navButton}
                whileHover="hover"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
              </motion.button>
              <motion.button
                className={`flex items-center ${
                  !selected[current]
                    ? "opacity-50 cursor-not-allowed"
                    : "text-gray-900 font-medium"
                }`}
                onClick={nextQuestion}
                disabled={!selected[current]}
                initial="initial"
                animate="animate"
                variants={animationVariants.navButton}
                whileHover="hover"
              >
                {current < questions.length - 1 ? "Next" : "Finish"}
                <ArrowRightIcon className="w-5 h-5 ml-1" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === "result" && (
          <motion.div
            key="result"
            className="p-6 bg-orange-50 rounded-xl shadow text-center"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants.card}
          >
            <motion.div
              className="mb-4 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 10 }}
            >
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900">
              Your Recommendation
            </h3>
            <p className="mt-2 text-gray-800">
              Try <span className="text-orange-600 font-bold">{goal}</span>.
            </p>
            <Link
              href="/activities"
              className="mt-4 inline-block text-orange-600 hover:underline"
            >
              Explore activities
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
