"use client";

import React, { useState, useEffect } from "react";

export default function BookReadingActivity() {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsSessionComplete(true);
      setIsTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  const startTimer = (time: number) => {
    setSelectedTime(time);
    setTimer(time * 60);
    setIsTimerActive(true);
  };

  const handleCompletion = () => {
    alert(`Session complete! You read for ${selectedTime} minutes.`);
    // Reset session after completion
    setIsSessionComplete(false);
    setSelectedTime(null);
    setTimer(0);
    setIsTimerActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full p-6 text-blue-600">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <span role="img" aria-label="book">
            📖
          </span>{" "}
          Book Reading
        </h1>
        <p className="text-lg mb-6 font-medium">
          Set a goal for your reading session and track your progress.
        </p>

        {!isSessionComplete && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">Choose Time (minutes)</h2>
            <div className="flex flex-wrap justify-evenly text-white gap-2">
              {[10, 15, 20, 30, 45, 60].map((time) => (
                <button
                  key={time}
                  onClick={() => startTimer(time)}
                  className={`px-4 py-2 rounded font-white ${
                    selectedTime === time
                      ? "bg-blue-700"
                      : "bg-blue-500"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {isTimerActive && (
          <div className="text-2xl font-bold text-center mb-4">
            {`${Math.floor(timer / 60)}:${timer % 60 < 10 ? `0${timer % 60}` : timer % 60}`}
          </div>
        )}

        {isSessionComplete && (
          <button
            onClick={handleCompletion}
            className="w-full py-3 rounded bg-green-500 text-lg font-semibold"
          >
            Session Complete - Continue
          </button>
        )}
      </div>
    </div>
  );
}