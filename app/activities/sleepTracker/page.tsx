"use client";

import React, { useState, useEffect } from "react";

export default function Page() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [bedtime, setBedtime] = useState<Date | null>(null);
  const [sleepHours, setSleepHours] = useState(0);
  const [additionalSleepHours, setAdditionalSleepHours] = useState("");
  const [sleepData, setSleepData] = useState<number[]>(Array(7).fill(0));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      const savedBedtime = localStorage.getItem("bedtime");
      const savedHours = localStorage.getItem("sleepHours");
      const savedData = localStorage.getItem("sleepData");

      setBedtime(savedBedtime ? new Date(savedBedtime) : new Date());
      setSleepHours(savedHours ? parseFloat(savedHours) : 0);
      setSleepData(savedData ? JSON.parse(savedData) : Array(7).fill(0));
    }
  }, [isHydrated]);

  const saveBedtime = (time: Date) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bedtime", time.toISOString());
    }
  };

  const saveSleepHours = (hours: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sleepHours", JSON.stringify(hours));
    }
  };

  const saveSleepData = (data: number[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sleepData", JSON.stringify(data));
    }
  };

  const handleBedtimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isHydrated) return;
    const [hoursStr, minutesStr] = e.target.value.split(":");
    const currentDate = new Date();
    currentDate.setHours(+hoursStr, +minutesStr, 0, 0);
    setBedtime(currentDate);
    saveBedtime(currentDate);
  };

  const setSleepHoursForToday = () => {
    if (!isHydrated) return;
    const h = parseFloat(additionalSleepHours);
    if (isNaN(h)) {
      alert("Please enter a valid number for hours slept.");
      return;
    }
    if (h > 24) {
      alert("You can't sleep more than 24 hours!");
      return;
    }
    setSleepHours(h);
    saveSleepHours(h);
    const day = new Date().getDay();
    const newData = [...sleepData];
    newData[day] = h;
    setSleepData(newData);
    saveSleepData(newData);
    setAdditionalSleepHours("");
  };

  if (!isHydrated) {
    // Avoid rendering while SSR
    return null;
  }

  return (
    <div className="flex flex-col items-center w-1/2 gap-8 overflow-y-scroll p-8">
      <h1 className="font-extrabold text-[46px] leading-[1] text-blue-500">
        Sleep Tracker
      </h1>
      <p className="text-lg font-bold text-center text-blue-600">
        Track your bedtime and how many hours of sleep you get each day.
      </p>

      {/* Bedtime Setting */}
      <div className="flex flex-col w-full md:w-3/4 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-600">Set Your Target Bedtime</h2>
        <div className="flex items-center justify-between gap-4 w-full">
          <input
            type="time"
            onChange={handleBedtimeChange}
            className="border w-[40%] border-blue-400 text-gray-700 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-sm text-gray-700 text-right w-[55%]">
            Current bedtime:{" "}
            <span className="font-semibold">
              {bedtime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        </div>
      </div>

      {/* Sleep Hours Recording */}
      <div className="flex flex-col w-full md:w-3/4 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-600">Hours Slept</h2>
        <div className="flex items-center justify-between gap-4 w-full">
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Enter sleep hours"
            value={additionalSleepHours}
            onChange={(e) => setAdditionalSleepHours(e.target.value)}
            className="w-1/2 border text-gray-700 border-blue-400 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
          />
          <p className="text-sm text-gray-700 text-right w-1/2">
            <span className="font-semibold">{sleepHours}</span> hour(s) recorded today.
          </p>
        </div>
        <button
          onClick={setSleepHoursForToday}
          className="bg-blue-500/25 hover:bg-blue-600/25 active:bg-blue-500/35 px-4 py-2 my-2 rounded-lg border border-blue-600 duration-50 text-blue-600"
        >
          Save Hours
        </button>
      </div>
    </div>
  );
}