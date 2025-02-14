"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * Example Meditation page in Next.js.
 * Place any MP3 files into your public/ folder or fetch them dynamically.
 */
export default function Page() {
  // Timer states
  const [timer, setTimer] = useState<number>(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Audio states
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Called when the user selects a time (in seconds) to start meditating
  const startMeditation = (duration: number) => {
    // Stop any active timer/audio
    stopMeditation();

    setTimer(duration);
    setIsMeditating(true);
    setIsPaused(false);

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopMeditation();
          playAlarm(); // you can define a separate alarm if desired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Load & play selected audio if any
    if (selectedSong) {
      audioRef.current = new Audio(selectedSong);
      if (!isMuted) {
        audioRef.current.play().catch((err) =>
          console.error("Audio play error:", err)
        );
      }
    }
  };

  // Stop timer and any playing audio
  const stopMeditation = () => {
    setIsMeditating(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  // Simple alarm sound (place alarm.mp3 in /public or update url)
  const playAlarm = () => {
    const alarmAudio = new Audio("/sounds/soft_alarm.mp3");
    alarmAudio.play().catch((err) =>
      console.error("Alarm audio error:", err)
    );
  };

  const pauseMeditation = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    audioRef.current?.pause();
  };

  const resumeMeditation = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopMeditation();
          playAlarm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    if (!isMuted)
      audioRef.current?.play().catch((err) =>
        console.error("Resume error:", err)
      );
  };

  // Toggle audio mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current
        .play()
        .catch((err) => console.error("Unmute error:", err));
    } else {
      audioRef.current.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopMeditation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center text-orange-600 justify-center min-h-screen gap-6 p-6">
      <h1 className="text-3xl font-bold">Mindful Meditation</h1>
      <p className="font-medium">Select a duration to begin your session.</p>
      {/* Select audio track */}
      <div className="flex items-center justify-between w-full max-w-xs">
        <label className="font-semibold">Select a Song</label>
        <select
          className="border border-gray-300 text-black rounded px-2 py-1"
          value={selectedSong || ""}
          onChange={(e) => setSelectedSong(e.target.value || null)}
        >
          <option value="">No music</option>
          <option value="/songs/song1.mp3">Song 1</option>
        </select>
      </div>
      {/* Duration buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => startMeditation(120)}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          2 minutes
        </button>
        <button
          onClick={() => startMeditation(300)}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          5 minutes
        </button>
        <button
          onClick={() => startMeditation(600)}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          10 minutes
        </button>
      </div>
      {/* Meditation Timer Display */}
      <div className="flex items-center justify-center w-40 h-40 border-4 border-orange-400 rounded-full">
        <span className="text-3xl">{formatTime(timer)}</span>
      </div>
      {/* Control Buttons */}
      {isMeditating && (
        <div className="flex gap-4">
          <button
            onClick={isPaused ? resumeMeditation : pauseMeditation}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={toggleMute}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={stopMeditation}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
}