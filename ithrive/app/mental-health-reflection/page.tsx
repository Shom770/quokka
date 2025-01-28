// Don't need to hardcode once we get translation support
import { questions } from "./questions"

export default function Page() {
  const renderedQuestions = questions.map((question, idx) => {
    let opts = question.options.map((opt, o_idx) => (
      <div key={o_idx} className="flex flex-row my-2">
        <input name={`Question_${idx}`} className="form-radio size-6 accent-blue-500" type="radio" id={`${idx}_${o_idx}`} />
        <label className="text-black pl-2" htmlFor={`${idx}_${o_idx}`}>{opt.text}</label>
      </div>
    ));

    return (
      <fieldset className="w-[60%] bg-white h-full p-4 rounded-xl border-gray-300 border-2" key={idx}>
        <legend className="text-black text-lg px-2">{question.question}</legend>

        {opts}
      </fieldset>
    );
  });

  return (
    <div className="relative flex flex-col items-center gap-8 w-3/5 overflow-y-scroll">
      <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
        Reflect on your mental health.
      </h1>

      {renderedQuestions}

      <button
        className="flex flex-row items-center justify-center gap-2 bg-blue-500/25 hover:bg-blue-600/25 px-7 py-3 my-4 rounded-lg border border-blue-600 active:bg-blue-500/35 duration-50">
        <p className="antialiased text-lg text-blue-600 font-bold">Get Your Activity Reccomendation</p>
      </button>
    </div>
  )
}
