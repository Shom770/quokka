import { questions } from "./questions"

export default function Page() {
  const renderedQuestions = questions.map((question, idx) => {
    const opts = question.options.map((opt, o_idx) => (
      <div key={o_idx} className="flex items-center mb-4 text-gray-900 hover:text-gray-500 focus:ring-2 focus:ring-blue-300">
        <input
          id={`question_${idx}_option_${o_idx}`}
          type="radio"
          name={`Question_${idx}`}
          value={opt.text}
          className="w-4 h-4 border-gray-300 accent-blue-500"
        />
        <label
          htmlFor={`question_${idx}_option_${o_idx}`}
          className="block ml-2 text-sm font-medium"
        >
          {opt.text}
        </label>
      </div>
    ));

    return (
      <fieldset
        key={idx}
        className="block w-full p-6 bg-white border border-blue-300 rounded-xl shadow-sm"
      >
        <legend className="sr-only">{question.question}</legend>
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-black">
          {question.question}
        </h5>
        {opts}
      </fieldset>
    );
  });

  return (
    <div className="relative flex flex-col items-center gap-8 w-1/2 overflow-y-scroll">
      <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1] mb-6">
        Reflect on your mental health.
      </h1>

      {renderedQuestions}
      <div className="mb-6">
        <button className="bg-blue-500/25 hover:bg-blue-600/25 px-7 py-3 my-4 rounded-lg border border-blue-600 active:bg-blue-500/35 duration-50 mb-6">
          <p className="antialiased text-lg text-blue-600">
            Get Your Activity Recommendation
          </p>
        </button>
      </div>
    </div>
  )
}
