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
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Reflection = {
  id: number;
  responses: { question: string; answer: string }[];
  created_at: string;
};

type ReflectionsResponse = {
  reflections: Reflection[];
};

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
  const [stage, setStage] = React.useState<"intro" | "quiz" | "result" | "save">(
    "intro"
  );
  const [current, setCurrent] = React.useState<number>(0);
  const [selected, setSelected] = React.useState<string[]>(() =>
    questions.map(() => "")
  );
  const [goal, setGoal] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean | null>(null);
  const [showPast, setShowPast] = React.useState(false);
  const [pastReflections, setPastReflections] = React.useState<
    { id: number; responses: { question: string; answer: string }[]; created_at: string }[]
  >([]);
  const [loadingPast, setLoadingPast] = React.useState(false);
  const router = useRouter();

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

  const handleSaveReflection = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: questions.map((q, i) => ({
            question: q.question,
            answer: selected[i],
          })),
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
      } else {
        setSaveSuccess(false);
      }
    } catch {
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (stage === "save") {
      handleSaveReflection();
    }
  }, [stage]);

  // Fetch past reflections when showPast is true
  useEffect(() => {
    if (showPast) {
      setLoadingPast(true);
      fetch("/api/reflection")
        .then((res) => res.json())
        .then((data) => {
          const typed = data as ReflectionsResponse;
          setPastReflections(typed.reflections || []);
        })
        .finally(() => setLoadingPast(false));
    }
  }, [showPast]);

  return (
    <motion.div
      className="relative w-full max-w-xl mx-auto p-4"
      initial="initial"
      animate="animate"
      variants={animationVariants.pageContainer}
    >
      <AnimatePresence mode="wait">
        {stage === "intro" && !showPast && (
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
            <div className="flex flex-col gap-4 mt-6">
              <motion.button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center mx-auto"
                onClick={() => setStage("quiz")}
                initial="initial"
                animate="animate"
                variants={animationVariants.navButton}
                whileHover="hover"
              >
                Start Reflection
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-white border border-orange-400 text-orange-600 rounded-lg flex items-center mx-auto hover:bg-orange-50 transition"
                onClick={() => setShowPast(true)}
                initial="initial"
                animate="animate"
                variants={animationVariants.navButton}
                whileHover="hover"
              >
                View Past Reflections
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === "intro" && showPast && (
          <motion.div
            key="past"
            className="p-6 bg-orange-50 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants.card}
          >
            <h2 className="text-3xl font-extrabold text-orange-700 mb-8 text-center">
              Your Past Reflections
            </h2>
            {loadingPast ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
              </div>
            ) : pastReflections.length === 0 ? (
              <p className="text-gray-500 text-center">No past reflections found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 max-h-[32rem] overflow-y-auto">
                {pastReflections.map((reflection) => (
                  <motion.div
                    key={reflection.id}
                    className="relative rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-100/80 to-white shadow-lg p-6 flex flex-col gap-3 hover:shadow-xl transition-all group"
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.025 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl drop-shadow-sm">📝</span>
                      <span className="text-xs font-semibold text-orange-500 tracking-wide">
                        {new Date(reflection.created_at).toLocaleString()}
                      </span>
                    </div>
                    <ul className="list-none pl-0 flex flex-col gap-2">
                      {reflection.responses.map((r, idx) => (
                        <li key={idx} className="flex flex-col bg-orange-50/80 rounded-lg px-3 py-2 border border-orange-100 group-hover:border-orange-300 transition">
                          <span className="font-semibold text-gray-700 text-sm">{r.question}</span>
                          <span className="text-orange-700 font-medium text-base mt-1">{r.answer}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-10">
              <button
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 shadow transition"
                onClick={() => setShowPast(false)}
              >
                Back
              </button>
            </div>
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
              Try{" "}
              <span className="text-orange-600 font-bold">{goal}</span>.
            </p>
            <Link
              href="/activities"
              className="mt-4 inline-block text-orange-600 hover:underline"
            >
              Explore activities
            </Link>
            <div className="mt-8">
              <p className="mb-2 text-gray-700 font-medium">
                Would you like to save your reflection?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                  onClick={() => setStage("save")}
                  disabled={isSaving}
                >
                  Yes, save it
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  onClick={() => router.push("/")}
                  disabled={isSaving}
                >
                  No, skip
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "save" && (
          <motion.div
            key="save"
            className="p-6 bg-orange-50 rounded-xl shadow text-center"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animationVariants.card}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Saving your reflection...
            </h3>
            {isSaving ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : saveSuccess === true ? (
              <div>
                <p className="text-green-600 font-semibold mb-2">
                  Reflection saved!
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                  onClick={() => router.push("/")}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-semibold mb-2">
                  Failed to save reflection.
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                  onClick={handleSaveReflection}
                >
                  Try Again
                </button>
                <button
                  className="mt-4 ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  onClick={() => router.push("/")}
                >
                  Skip
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
