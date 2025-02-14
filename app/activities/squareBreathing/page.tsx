"use client";

import React, { useState, useEffect } from "react";

export default function SquareBreathing() {
  // States for exercise control
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState("");
  const [counter, setCounter] = useState(4);
  const [circleScale, setCircleScale] = useState(1);

  // Duration in seconds for each phase
  const phaseDuration = 4;

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
  };

  // Finish the exercise and reset states
  const finishExercise = () => {
    setStarted(false);
    setPhase("");
    setCounter(phaseDuration);
    setCircleScale(1);
    // alert("Great job!");
  };

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
        <button
          onClick={startExercise}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-md"
        >
          Begin Exercise
        </button>
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