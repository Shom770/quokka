"use client";

import React from "react";
import { questions } from "./questions";

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
        className="block w-full p-6 mb-4 bg-white border border-blue-300 rounded-xl shadow-sm"
      >
        <legend className="sr-only">{question.question}</legend>
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-black">
          {question.question}
        </h5>
        {question.options.map((opt, o_idx) => {
          const id = `question_${idx}_option_${o_idx}`;
          return (
            <label
              key={o_idx}
              htmlFor={id}
              className="flex items-center mb-4 cursor-pointer text-gray-900 hover:text-gray-500"
            >
              <input
                id={id}
                type="radio"
                name={`Question_${idx}`}
                value={opt.text}
                checked={selected[idx] === opt.text}
                onChange={() => handleOptionChange(idx, opt.text)}
                className="w-4 h-4 border-gray-300 accent-blue-500"
              />
              <span className="ml-2 text-sm font-medium">{opt.text}</span>
            </label>
          );
        })}
      </fieldset>
    );
  });

  return (
    <div className="relative flex flex-col items-center gap-8 w-1/2 overflow-y-scroll">
      <h1 className="font-extrabold text-[46px] leading-[1] text-blue-500">
        Reflect on your mental health.
      </h1>
      {renderedQuestions}

      <div className="mb-6">
        <button
          onClick={gradeQuiz}
          hidden={!allAnswered}
          className="bg-blue-500/25 hover:bg-blue-600/25 active:bg-blue-500/35 px-7 py-3 my-4 rounded-lg border border-blue-600 duration-50 mb-6 text-blue-500"
        >
          <p className="antialiased text-lg text-blue-600">
            Get Your Activity Recommendation
          </p>
        </button>
      </div>

      {goal && (
        <div ref={resultRef} className="mb-6 text-lg text-gray-900">
          You should try: <span className="font-bold">{goal}</span>
        </div>
      )}
    </div>
  );
}
