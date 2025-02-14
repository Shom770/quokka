"use client"

import { inter, rethinkSans } from "@/app/ui/fonts";
import { useEffect, useState } from "react";

export default function Page() {
    const [time, setTime] = useState<number | null>(null);

    useEffect(() => {
      setTimeout(() => {
        if (time) { setTime(time - 1); }
      }, 1000);
    }, [time]);

    return (
        <div className="relative flex flex-col items-center gap-6 w-1/3 overflow-y-scroll">
          <h1 className={`${rethinkSans.className} font-extrabold text-[46px] leading-[1] text-orange-500`}>
            Mood Journaling
          </h1>
          <span className="font-bold text-lg leading-tight text-orange-600 text-center">
            Choose a time duration and use it to journal about your emotions. Below are some suggestions to help you identify what you're feeling.
          </span>

          <div className="grid grid-cols-2 w-[80%]">
            <div className="flex flex-col items-center">
              <ul className="text-orange-600 list-disc">
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
              <ul className="text-orange-600 list-disc">
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

          <span className="mt-2 text-lg font-bold text-orange-600 text-center">Choose a duration to begin: </span>

          {/* Add spacing between buttons */}
          <div className="w-full flex flex-row justify-between space-x-4">
            <button
              className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
              onClick={() => setTime(5 * 60)}
            >
              <p className="antialiased text-lg text-orange-600 font-medium">5 minutes</p>
            </button>

            <button
              className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
              onClick={() => setTime(10 * 60)}
            >
              <p className="antialiased text-lg text-orange-600 font-medium">10 minutes</p>
            </button>

            <button
              className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
              onClick={() => setTime(15 * 60)}
            >
              <p className="antialiased text-lg text-orange-600 font-medium">15 minutes</p>
            </button>

            <button
              className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
              onClick={() => setTime(25 * 60)}
            >
              <p className="antialiased text-lg text-orange-600 font-medium">25 minutes</p>
            </button>
          </div>

          {time ? (
            <span className="text-lg text-orange-700 text-center">
              Time remaining: {Math.floor(time / 60).toString().padStart(2, "0")}:
              {(time % 60).toString().padStart(2, "0")}
            </span>
          ) : null}
        </div>
    )
}
