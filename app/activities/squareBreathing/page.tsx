"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function SquareBreathing() {
  const { data: session } = useSession();
  
  // States for exercise control
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState("");
  const [counter, setCounter] = useState(4);
  const [circleScale, setCircleScale] = useState(1);
  
  // States for activity logging
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [exerciseDuration, setExerciseDuration] = useState(0);
  
  // Duration in seconds for each phase
  const phaseDuration = 4;
  
  // Reference for tracking total exercise duration
  const startTimeRef = useRef<number | null>(null);

  // Update counter and phase based on interval
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev === 1) {
          // Cycle phases: Breathe In, Hold, Breathe Out, Wait
          if (phase === "Breathe In") {
            setPhase("Hold");
          } else if (phase === "Hold") {
            setPhase("Breathe Out");
          } else if (phase === "Breathe Out") {
            setPhase("Wait");
          } else if (phase === "Wait") {
            setPhase("Breathe In");
          }
          return phaseDuration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, started]);

  // Animate circle scale based on phase changes
  useEffect(() => {
    if (!started) return;
    if (phase === "Breathe In") {
      setCircleScale(1.5);
    } else if (phase === "Breathe Out") {
      setCircleScale(1);
    }
    // No scale update during Hold or Wait
  }, [phase, started]);

  // Start the exercise
  const startExercise = () => {
    setStarted(true);
    setPhase("Breathe In");
    setCounter(phaseDuration);
    startTimeRef.current = Date.now();
    setLogSuccess(null);
  };

  // Log breathing activity to the server
  const logBreathingActivity = async (durationSeconds: number) => {
    setIsLogging(true);
    
    if (session?.serverToken) {
      try {
        const minutes = Math.round(durationSeconds / 60);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sync/activities`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.serverToken}`,
            },
            body: JSON.stringify({
              activity_id: "square-breathing",
              notes: `Completed ${minutes} minute${minutes !== 1 ? 's' : ''} of square breathing`
            }),
          }
        );

        if (response.ok) {
          console.log("Breathing activity logged successfully");
          setLogSuccess(true);
        } else {
          console.error("Failed to log breathing activity:", await response.text());
          setLogSuccess(false);
        }
      } catch (error) {
        console.error("Error logging breathing activity:", error);
        setLogSuccess(false);
      }
    } else {
      console.warn("Breathing exercise completed but not logged - no auth token available");
      setLogSuccess(false);
    }
    
    setIsLogging(false);
  };

  // Finish the exercise and reset states
  const finishExercise = () => {
    if (startTimeRef.current) {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      setExerciseDuration(durationSeconds);
      logBreathingActivity(durationSeconds);
    }
    
    setStarted(false);
    setPhase("");
    setCounter(phaseDuration);
    setCircleScale(1);
    startTimeRef.current = null;
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (logSuccess !== null) {
      timeoutId = setTimeout(() => {
        setLogSuccess(null);
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [logSuccess]);

  return (
    <div
      className={`flex flex-col items-center text-orange-600 min-h-[90%] p-8 mb-6 ${
        started ? "justify-between" : "justify-center"
      }`}
    >
      <div className="mt-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Square Breathing</h1>
        <p className="text-lg mb-6">
          Follow the guided square breathing exercise to relax and focus.
        </p>
      </div>

      {!started ? (
        <div className="flex flex-col items-center">
          <button
            onClick={startExercise}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md"
          >
            Begin Exercise
          </button>
          
          {/* Activity logging feedback */}
          {isLogging && (
            <div className="mt-4 py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md">
              Logging your breathing exercise...
            </div>
          )}
          
          {logSuccess === true && (
            <div className="mt-4 py-2 px-4 bg-green-100 text-green-800 rounded-md">
              ✓ Breathing exercise logged successfully!
              <div className="text-sm mt-1">
                {Math.floor(exerciseDuration / 60)} minutes, {exerciseDuration % 60} seconds completed
              </div>
            </div>
          )}
          
          {logSuccess === false && (
            <div className="mt-4 py-2 px-4 bg-red-100 text-red-800 rounded-md">
              Failed to log your breathing exercise. Please try again later.
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="relative">
            <div
              className="rounded-full bg-orange-500 transition-transform duration-[4000ms]"
              style={{
                width: 300,
                height: 300,
                transform: `scale(${circleScale})`,
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Phase text is centered in the circle */}
              <p className="text-2xl text-white font-medium">{phase}</p>
              <p className="text-4xl text-white font-bold">{counter}s</p>
            </div>
          </div>
        </div>
      )}

      {started && (
        <button
          onClick={finishExercise}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md mt-8 mb-8"
        >
          Finish Exercise
        </button>
      )}
    </div>
  );
}