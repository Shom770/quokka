// page.tsx
"use client";

import React, { useEffect, useCallback, useMemo, useState } from "react";
import { rethinkSans } from "@/components/fonts";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Activity,
  Question,
  questionBank,
  pickQuestions,
  gradeResponses,
} from "./questions";

export const runtime = "edge";

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
  card: {
    initial: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      scale: 0.95,
    }),
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
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -50 : 50,
      scale: 0.95,
      transition: { duration: 0.4 },
    }),
  },
  navButton: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05 },
  },
};

export default function Page() {
  const t = useTranslations("reflection");

  const [stage, setStage] = useState<"intro" | "quiz" | "result" | "save">(
    "intro"
  );
  const [direction, setDirection] = useState<1 | -1>(1);

  // Randomized per session
  const sessionQuestions: Question[] = useMemo(
    () => pickQuestions(7, 10, questionBank),
    []
  );

  const [current, setCurrent] = useState<number>(0);
  const [selected, setSelected] = useState<string[]>(() =>
    sessionQuestions.map(() => "")
  );

  const [goal, setGoal] = useState<Activity | null>(null);
  const [alternates, setAlternates] = useState<Activity[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [pastReflections, setPastReflections] = useState<
    {
      id: number;
      responses: { question: string; answer: string }[];
      created_at: string;
    }[]
  >([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);

  // Detect guest mode via cookie
  useEffect(() => {
    try {
      const cookie = typeof document !== "undefined" ? document.cookie : "";
      setIsGuest(cookie.split("; ").some((c) => c.startsWith("guest=1")));
    } catch {
      setIsGuest(false);
    }
  }, []);

  const handleOptionChange = (option: string) => {
    const copy = [...selected];
    copy[current] = option;
    setSelected(copy);

    setTimeout(() => {
      nextQuestion();
    }, 100);
  };

  const nextQuestion = () => {
    setDirection(1);
    if (current < sessionQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      gradeQuiz();
    }
  };

  const prevQuestion = () => {
    setDirection(-1);
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const gradeQuiz = () => {
    setDirection(1);

    // Pull last goal from localStorage for diversity/cool-down
    let lastGoal: Activity | undefined;
    try {
      const g = localStorage.getItem("mh_last_goal") as Activity | null;
      if (g) lastGoal = g;
    } catch {
      // ignore
    }

    const result = gradeResponses(sessionQuestions, selected, lastGoal);
    setGoal(result.top);
    setAlternates(result.top3.slice(1));

    // remember for rotation next time
    try {
      localStorage.setItem("mh_last_goal", result.top);
    } catch {
      // ignore
    }

    setStage("result");
  };

  // Save reflection
  const handleSaveReflection = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: sessionQuestions.map((q, i) => ({
            question: q.question,
            answer: selected[i],
          })),
        }),
      });
      setSaveSuccess(res.ok);
    } catch {
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }, [selected, sessionQuestions]);

  useEffect(() => {
    if (stage === "save" && !isGuest) {
      handleSaveReflection();
    }
  }, [stage, handleSaveReflection, isGuest]);

  // Fetch past reflections when showPast is true
  useEffect(() => {
    if (showPast && !isGuest) {
      setLoadingPast(true);
      fetch("/api/reflection")
        .then((res) => res.json())
        .then((data) => {
          const typed = data as ReflectionsResponse;
          setPastReflections(typed.reflections || []);
        })
        .finally(() => setLoadingPast(false));
    }
  }, [showPast, isGuest]);

  return (
    <motion.div
      className="relative flex w-full items-center justify-center px-4 py-8 min-h-[calc(100dvh-10vh)]"
      initial="initial"
      animate="animate"
      variants={animationVariants.pageContainer}
    >
      <div className="relative w-full max-w-xl z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            className="absolute -inset-16 bg-gradient-to-r from-[#F66B6B]/40 to-[#F5C114]/40 blur-[64px] rounded-xl -z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut" 
            }}
            key="gradient-bg"
          />
          {stage === "intro" && !showPast && (
            <motion.div
              key="intro"
              className="text-center p-6 bg-orange-100 rounded-xl shadow"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={animationVariants.card}
              custom={direction}
            >
              <h1
                className={`${rethinkSans.className} text-3xl font-bold text-orange-600`}
              >
                {t("title")}
              </h1>
              <p className="mt-2 text-gray-700">{t("subtitle")}</p>
              <div className="flex flex-col gap-4 mt-6">
                <motion.button
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center mx-auto"
                  onClick={() => {
                    setDirection(1);
                    setStage("quiz");
                  }}
                  initial="initial"
                  animate="animate"
                  variants={animationVariants.navButton}
                  whileHover="hover"
                >
                  {t("start")}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </motion.button>
                {!isGuest && (
                  <motion.button
                    className="px-4 py-2 bg-white border border-orange-400 text-orange-600 rounded-lg flex items-center mx-auto hover:bg-orange-50 transition"
                    onClick={() => {
                      setDirection(1);
                      setShowPast(true);
                    }}
                    initial="initial"
                    animate="animate"
                    variants={animationVariants.navButton}
                    whileHover="hover"
                  >
                    {t("viewPast")}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {stage === "intro" && showPast && !isGuest && (
            <motion.div
              key="past"
              className="p-6 bg-orange-50 rounded-xl shadow"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={animationVariants.card}
              custom={direction}
            >
              <h2 className="text-3xl font-extrabold text-orange-700 mb-8 text-center">
                {t("pastTitle")}
              </h2>
              {loadingPast ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
                </div>
              ) : pastReflections.length === 0 ? (
                <p className="text-gray-500 text-center">{t("noPast")}</p>
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
                          <li
                            key={idx}
                            className="flex flex-col bg-orange-50/80 rounded-lg px-3 py-2 border border-orange-100 group-hover:border-orange-300 transition"
                          >
                            <span className="font-semibold text-gray-700 text-sm">
                              {r.question}
                            </span>
                            <span className="text-orange-700 font-medium text-base mt-1">
                              {r.answer}
                            </span>
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
                  onClick={() => {
                    setDirection(-1);
                    setShowPast(false);
                  }}
                >
                  {t("back")}
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
              custom={direction}
            >
              <fieldset className="mb-4">
                <legend className="sr-only">
                  {sessionQuestions[current].question}
                </legend>
                <h5 className="text-xl font-bold text-gray-700 mb-3">
                  {sessionQuestions[current].question}
                </h5>
                {sessionQuestions[current].options.map((o, i) => (
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
                  <ArrowLeftIcon className="w-5 h-5 mr-1" /> {t("back")}
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
                  {current < sessionQuestions.length - 1
                    ? t("next")
                    : t("finish")}
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
              custom={direction}
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
                {t("recommendation")}
              </h3>
              <p className="mt-2 text-gray-800">
                {t("try")}{" "}
                <span className="text-orange-600 font-bold">{goal}</span>.
              </p>

              {alternates.length > 0 && (
                <p className="mt-2 text-gray-700 text-sm">
                  Other good options: {alternates.join(", ")}
                </p>
              )}

              <Link
                href="/activities"
                className="mt-4 inline-block text-orange-600 hover:underline"
              >
                {t("explore")}
              </Link>
              <div className="mt-8">
                <p className="mb-2 text-gray-700 font-medium">
                  {t("savePrompt")}
                </p>
                <div className="flex justify-center gap-4">
                  {!isGuest && (
                    <button
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                      onClick={() => {
                        if (!isGuest) {
                          setDirection(1);
                          setStage("save");
                        }
                      }}
                      disabled={isSaving}
                    >
                      {t("saveYes")}
                    </button>
                  )}
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    onClick={() => router.push("/")}
                    disabled={isSaving}
                  >
                    {t("saveNo")}
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
              custom={direction}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t("saving")}
              </h3>
              {isSaving ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : saveSuccess === true ? (
                <div>
                  <p className="text-green-600 font-semibold mb-2">
                    {t("saveSuccess")}
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                    onClick={() => router.push("/")}
                  >
                    {t("done")}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-semibold mb-2">
                    {t("saveFail")}
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                    onClick={handleSaveReflection}
                  >
                    {t("tryAgain")}
                  </button>
                  <button
                    className="mt-4 ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    onClick={() => router.push("/")}
                  >
                    {t("skip")}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
