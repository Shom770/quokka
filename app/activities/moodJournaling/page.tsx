"use client"

import { inter } from "@/app/ui/fonts";
import { useEffect, useState } from "react";

export default function Page() {
    const [time, setTime] = useState<number | null>(null);

    useEffect(() => {
      setTimeout(() => {
        if (time) { setTime(time - 1); }
      }, 1000);
    }, [time]);

    return (
        <div className="relative flex flex-col items-center gap-8 w-1/3 overflow-y-scroll">
          <h1 className="font-extrabold text-[46px] leading-[1] text-blue-500">
            Mood Journaling
          </h1>
          <span className="font-bold text-lg leading-10 text-blue-600 text-center">
            Choose a time duration and use it to journal about your emotions. Below are some suggestions to help you identify what you're feeling.
          </span>

          <div className="grid grid-cols-2 w-[80%]">
            <div className="flex flex-col items-center">
              <ul className="text-blue-700 list-disc">
                <li>Anxious</li>
                <li>Overwhelmed</li>
                <li>Excited</li>
                <li>Frustrated</li>
                <li>Content</li>
                <li>Lonely</li> 
                <li>Grateful</li>
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <ul className="text-blue-700 list-disc">
                <li>Confused</li>
                <li>Hopeful</li>
                <li>Nervous</li>
                <li>Angry</li>
                <li>Sad</li>
                <li>Joyful</li>
                <li>Embarrassed</li>
              </ul>
            </div>
          </div>

          <span className="text-lg font-bold text-blue-700 text-center">Choose a duration to begin: </span>

          {/* Add spacing between buttons */}
          <div className="w-full flex flex-row justify-between space-x-4">
            <button
              className="bg-blue-500/25 hover:bg-blue-600/25 active:bg-blue-500/35 px-7 py-3 my-4 rounded-lg border border-blue-600 duration-50 text-blue-500"
              onClick={() => setTime(5 * 60)}
            >
              <p className="antialiased text-lg text-blue-600">5 minutes</p>
            </button>

            <button
              className="bg-blue-500/25 hover:bg-blue-600/25 active:bg-blue-500/35 px-7 py-3 my-4 rounded-lg border border-blue-600 duration-50 text-blue-500"
              onClick={() => setTime(10 * 60)}
            >
              <p className="antialiased text-lg text-blue-600">10 minutes</p>
            </button>

            <button
              className="bg-blue-500/25 hover:bg-blue-600/25 active:bg-blue-500/35 px-7 py-3 my-4 rounded-lg border border-blue-600 duration-50 text-blue-500"
              onClick={() => setTime(15 * 60)}
            >
              <p className="antialiased text-lg text-blue-600">15 minutes</p>
            </button>

            <button
              className="bg-blue-500/25 hover:bg-blue-600/25 active:bg-blue-500/35 px-7 py-3 my-4 rounded-lg border border-blue-600 duration-50 text-blue-500"
              onClick={() => setTime(25 * 60)}
            >
              <p className="antialiased text-lg text-blue-600">25 minutes</p>
            </button>
          </div>

          {time ? (
            <span className="text-lg text-blue-700 text-center">
              Time remaining: {Math.floor(time / 60).toString().padStart(2, "0")}:
              {(time % 60).toString().padStart(2, "0")}
            </span>
          ) : null}
        </div>
    )
}
