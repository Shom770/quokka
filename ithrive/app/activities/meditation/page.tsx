"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Page() {
  const [selectedTime, setSelectedTime] = useState<number>(0); // in minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);

  const toggleTimer = (): void => {
    if (timeRemaining === 0 && selectedTime > 0) {
      setTimeRemaining(selectedTime * 60);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const resetTimer = (): void => {
    setIsRunning(false);
    setTimeRemaining(0);
  };

  const minutes: number = Math.floor(timeRemaining / 60);
  const seconds: number = timeRemaining % 60;

  return (
    <div className="relative flex flex-col justify-center gap-8 w-[40%] h-full">
      <div className="space-y-1">
        <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
          Meditate mindfully.
        </h1>
        <p className="text-black text-xl">Select a meditation duration and sit with your thoughts until the timer is up.</p>
      </div>
      <div className="flex flex-row items-center justify-between gap-8 w-full h-12">
        <button
          className={`w-1/3 h-full px-4 py-2 rounded-lg ${selectedTime === 2 ? "bg-blue-500 text-white font-bold" : "bg-blue-500/10 border border-blue-500 text-black"}`}
          onClick={() => setSelectedTime(2)}
        >
          2 Minutes
        </button>
        <button
          className={`w-1/3 h-full px-4 py-2 rounded-lg ${selectedTime === 5 ? "bg-blue-500 text-white font-bold" : "bg-blue-500/10 border border-blue-500 text-black"}`}
          onClick={() => setSelectedTime(5)}
        >
          5 Minutes
        </button>
        <button
          className={`w-1/3 h-full px-4 py-2 rounded-lg ${selectedTime === 10 ? "bg-blue-500 text-white font-bold" : "bg-blue-500/10 border border-blue-500 text-black"}`}
          onClick={() => setSelectedTime(10)}
        >
          10 Minutes
        </button>
      </div>

      <div className="flex flex-col items-center gap-12 mt-4 w-full">
        <motion.div
          className="relative flex items-center justify-center w-80 h-80 rounded-full border-4 border-blue-500"
          animate={{ scale: isRunning ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <span className="text-3xl font-bold text-blue-500">
            {`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
          </span>
        </motion.div>
        <div className="flex gap-4 mt-2">
            <button
                onClick={toggleTimer}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg"
            >
                {isRunning ? "Pause" : "Start"}
            </button>
            <button
                onClick={resetTimer}
                className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg"
            >
                Reset
            </button>
        </div>
      </div>
    </div>
  );
}
