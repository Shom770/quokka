"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function BookReadingActivity() {
  const { data: session } = useSession();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

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

  const handleCompletion = async () => {
    setIsLogging(true);
    
    if (session?.serverToken) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sync/activities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.serverToken}`,
            },
            body: JSON.stringify({
              activity_id: "book-reading",
              notes: `Reading session for ${selectedTime} minutes`
            }),
          }
        );

        if (response.ok) {
          console.log("Reading activity logged successfully");
          setLogSuccess(true);
        } else {
          console.error("Failed to log reading activity:", await response.text());
          setLogSuccess(false);
        }
      } catch (error) {
        console.error("Error logging reading activity:", error);
        setLogSuccess(false);
      }
    } else {
      console.warn("Reading activity completed but not logged - no auth token available");
      setLogSuccess(false);
    }

    setIsLogging(false);
    
    // Reset session after completion
    setTimeout(() => {
      setIsSessionComplete(false);
      setSelectedTime(null);
      setTimer(0);
      setIsTimerActive(false);
      setLogSuccess(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full p-6 text-orange-600">
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
                      ? "bg-orange-700"
                      : "bg-orange-500"
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
            disabled={isLogging}
            className={`w-full py-3 rounded text-white text-lg font-semibold ${
              isLogging 
                ? "bg-gray-400" 
                : logSuccess === true 
                  ? "bg-green-600"
                  : logSuccess === false 
                    ? "bg-red-600" 
                    : "bg-green-500"
            }`}
          >
            {isLogging 
              ? "Logging activity..." 
              : logSuccess === true 
                ? "✓ Activity logged!" 
                : logSuccess === false 
                  ? "Failed to log activity" 
                  : "Session Complete - Continue"}
          </button>
        )}
      </div>
    </div>
  );
}