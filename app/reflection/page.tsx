"use client";

import React from "react";
import { questions } from "./questions";
import { rethinkSans } from "../ui/fonts";

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
      <fieldset
        key={idx}
        className="block w-full p-6 mb-4 bg-white border border-orange-300 rounded-xl shadow-sm"
      >
        <legend className="sr-only">{question.question}</legend>
        <h5 className={`${rethinkSans.className} mb-2 text-2xl font-bold tracking-tight text-black`}>
          {question.question}
        </h5>
        {question.options.map((opt, o_idx) => {
          const id = `question_${idx}_option_${o_idx}`;
          return (
            <label
              key={o_idx}
              htmlFor={id}
              className="flex items-center mb-2 cursor-pointer text-gray-900 hover:text-gray-500"
            >
              <input
                id={id}
                type="radio"
                name={`Question_${idx}`}
                value={opt.text}
                checked={selected[idx] === opt.text}
                onChange={() => handleOptionChange(idx, opt.text)}
                className="w-4 h-4 border-gray-300 accent-orange-500"
              />
              <span className="ml-2 text-sm font-medium">{opt.text}</span>
            </label>
          );
        })}
      </fieldset>
    );
  });

  return (
    <div className="relative flex flex-col items-center gap-6 w-1/2 overflow-y-scroll">
      <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[46px] leading-[1] text-orange-600`}>
        Reflect on your mental health.
      </h1>
      {renderedQuestions}

      <button
        onClick={gradeQuiz}
        hidden={!allAnswered}
        className="bg-orange-600/15 hover:bg-orange-600/15 active:bg-orange-600/25 px-7 py-3 my-4 rounded-lg border border-orange-600 duration-50 text-orange-600"
      >
        <p className={`${rethinkSans.className} antialiased text-lg text-orange-600 font-extrabold`}>
          Get Your Activity Recommendation
        </p>
      </button>

      {goal && (
        <div ref={resultRef} className="-mt-6 mb-6 text-lg text-gray-900">
          You should try <span className="font-bold">{goal}.</span>
        </div>
      )}
    </div>
  );
}
