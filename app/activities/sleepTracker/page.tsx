// activities/sleepTracker
"use client";

import { rethinkSans } from "@/components/fonts";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// --- Types ---
type DailySleepData = {
  sleep_date: string;
  hours: number;
  quality: number;
};

type SleepStats = {
  total_records: number;
  average_hours: number | null;
  average_quality: number | null;
  max_hours: number | null;
  min_hours: number | null;
  daily_data: DailySleepData[];
};

// --- Utility ---
const findMinMaxDates = (data: DailySleepData[]) => {
  if (!data || data.length === 0) return { minDate: null, maxDate: null };
  let minHours = Infinity,
    maxHours = -Infinity,
    minDate = null,
    maxDate = null;
  data.forEach((day) => {
    if (day.hours < minHours) {
      minHours = day.hours;
      minDate = day.sleep_date;
    }
    if (day.hours > maxHours) {
      maxHours = day.hours;
      maxDate = day.sleep_date;
    }
  });
  return { minDate, maxDate };
};

// --- Animation variants ---
const variants = {
  page: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.6 } } },
  header: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { duration: 0.8 } } },
  formSection: { initial: { x: -30, opacity: 0 }, animate: { x: 0, opacity: 1, transition: { duration: 0.6 } } },
  button: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } }, hover: { scale: 1.05 } },
  statsContainer: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { duration: 0.7 } } },
  card: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 80 } } },
};

const SleepHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const t = useTranslations("sleepTracker");

  const fetchSleepStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/sleep/stats", window.location.origin);
      url.searchParams.append("start_date", dateRange.startDate);
      url.searchParams.append("end_date", dateRange.endDate);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Fetch error ${res.status}`);
      const data = await res.json() as SleepStats;
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSleepStats();
  }, [fetchSleepStats]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants.statsContainer}
      className="w-full md:w-3/4 p-6 mt-8 border border-orange-200 rounded-lg"
    >
      <motion.h2 variants={variants.header} className="text-xl font-bold text-orange-600 mb-4">
        Your Sleep History
      </motion.h2>

      <motion.div variants={variants.card} className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-orange-600 mb-1">Start Date</label>
          <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} max={dateRange.endDate} className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md"/>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-orange-600 mb-1">End Date</label>
          <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} min={dateRange.startDate} max={new Date().toISOString().split("T")[0]} className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md"/>
        </div>
      </motion.div>

      {loading && (<motion.div variants={variants.card} className="flex justify-center my-8"><div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-orange-500 rounded-full"></div></motion.div>)}
      {error && (<motion.div variants={variants.card} className="py-4 px-3 bg-red-100 text-red-800 rounded-md text-center">Error: {error}</motion.div>)}

      {stats && !loading && stats.total_records > 0 ? (
        <>
          <motion.div variants={variants.statsContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div variants={variants.card} className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Average Sleep</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.average_hours != null ? stats.average_hours.toFixed(1) + " hrs" : "N/A"}</p>
              <p className="text-sm text-orange-700">Quality: {stats.average_quality != null ? stats.average_quality.toFixed(1) : "N/A"}/5</p>
            </motion.div>
            <motion.div variants={variants.card} className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Best Sleep</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.max_hours != null ? stats.max_hours.toFixed(1) + " hrs" : "N/A"}</p>
              {stats.daily_data?.length > 0 && (() => { const { maxDate } = findMinMaxDates(stats.daily_data); return maxDate ? <p className="text-sm text-orange-700">on {new Date(maxDate).toLocaleDateString()}</p> : null; })()}
            </motion.div>
            <motion.div variants={variants.card} className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Least Sleep</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.min_hours != null ? stats.min_hours.toFixed(1) + " hrs" : "N/A"}</p>
              {stats.daily_data?.length > 0 && (() => { const { minDate } = findMinMaxDates(stats.daily_data); return minDate ? <p className="text-sm text-orange-700">on {new Date(minDate).toLocaleDateString()}</p> : null; })()}
            </motion.div>
          </motion.div>

          {stats.daily_data?.length > 0 && (
            <motion.div variants={variants.statsContainer} className="mt-8">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Sleep Trend</h3>
              <div className="h-64 relative">
                {stats.daily_data.map((day: DailySleepData, idx: number) => (
                  <motion.div key={day.sleep_date} variants={variants.card} className="absolute bottom-0 bg-orange-400 rounded-t-sm hover:bg-orange-600 transition-colors" style={{ left: `${(idx / stats.daily_data.length) * 100}%`, width: `${90 / stats.daily_data.length}%`, height: `${(day.hours / 12) * 100}%` }} title={`${new Date(day.sleep_date).toLocaleDateString()}: ${day.hours} hrs, Quality: ${day.quality}/5`}/>
                ))}
                {[0, 4, 8, 12].map((hr) => (<motion.div key={hr} variants={variants.card} className="absolute w-full border-t border-dashed border-gray-300" style={{ bottom: `${(hr / 12) * 100}%` }}><span className="absolute -left-8 -translate-y-1/2 text-xs text-gray-500">{hr}h</span></motion.div>))}
              </div>
            </motion.div>
          )}

          {stats.daily_data?.length > 0 && (
            <motion.div variants={variants.statsContainer} className="mt-8">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Sleep Quality</h3>
              <div className="flex items-end space-x-1">
                {stats.daily_data.map((day: DailySleepData, idx: number) => (
                  <motion.div key={idx} variants={variants.card} className="flex-1">
                    <div className="bg-orange-300 rounded-t-sm" style={{ height: `${(day.quality / 5) * 100}px` }} title={`${new Date(day.sleep_date).toLocaleDateString()}: Quality ${day.quality}/5`}/>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        !loading && !error && (
          <motion.div variants={variants.card} className="py-8 text-center text-gray-500">
            {t("noData")}
          </motion.div>
        )
      )}
    </motion.div>
  );
};

export default function Page() {
  useSession({ required: true });
  const t = useTranslations("sleepTracker");

  const [additionalSleepHours, setAdditionalSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [sleepNotes, setSleepNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [selectedDate, setSelectedDate] = useState(
    yesterday.toISOString().split("T")[0]
  );

  const logSleepData = async (hours: number) => {
    setIsLogging(true);
    try {
      const res = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours, quality: sleepQuality, notes: sleepNotes || null, date: selectedDate }),
      });
      if (!res.ok) throw new Error(await res.text());
      setLogSuccess(true);
    } catch (e) {
      setLogSuccess(false);
    } finally {
      setIsLogging(false);
      setTimeout(() => setLogSuccess(null), 5000);
    }
  };

  const handleSave = async () => {
    const hrs = parseFloat(additionalSleepHours);
    if (isNaN(hrs) || hrs < 0 || hrs > 24) {
      alert("Please enter a valid number of hours (0-24).");
      return;
    }
    if (sleepQuality === null) {
      alert("Please select a sleep quality rating (1-5).");
      return;
    }
    await logSleepData(hrs);
    setAdditionalSleepHours("");
  };

  return (
    <motion.div initial="initial" animate="animate" variants={variants.page} className="flex flex-col items-center w-full md:w-3/4 lg:w-1/2 gap-8 overflow-y-auto p-8">
      <motion.h1 variants={variants.header} className={`${rethinkSans.className} text-[46px] font-extrabold text-orange-600`}>
        {t("title")}
      </motion.h1>
      <motion.p variants={variants.header} className="text-lg font-bold text-orange-600 text-center">
        {t("subtitle")}
      </motion.p>
      <motion.div variants={variants.formSection} className="flex flex-col w-full md:w-3/4 p-6 space-y-4">
        <motion.div variants={variants.card} className="space-y-2">
          <h3 className="text-md font-medium text-orange-600">{t("selectDate")}</h3>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:ring-2 focus:ring-orange-400"/>
        </motion.div>

        <motion.div variants={variants.card}>
          <h2 className="text-xl font-bold text-orange-600">{t("hoursSlept")}</h2>
          <input type="number" min="0" step="0.1" value={additionalSleepHours} onChange={(e) => setAdditionalSleepHours(e.target.value)} placeholder={t("hoursPlaceholder")} className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md text-center focus:ring-2 focus:ring-orange-400"/>
        </motion.div>

        <motion.div variants={variants.card} className="space-y-2">
          <h3 className="text-md font-medium text-orange-600">{t("quality")}</h3>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setSleepQuality(r)} className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150 focus:outline-none ${sleepQuality === r ? "" : "bg-orange-100"}`}>
                {sleepQuality === r && (<motion.div layoutId="selected-quality-bg" className="absolute inset-0 bg-orange-500 rounded-full" transition={{ type: "spring", stiffness: 350, damping: 30 }}/>)}
                <span className={`relative transition-colors ${sleepQuality === r ? "text-white" : "text-orange-900"}`}>{r}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={variants.card} className="space-y-2">
          <h3 className="text-md font-medium text-orange-600">{t("notes")}</h3>
          <textarea rows={2} value={sleepNotes} onChange={(e) => setSleepNotes(e.target.value)} placeholder={t("notesPlaceholder")} className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:ring-2 focus:ring-orange-400"/>
        </motion.div>

        <motion.button variants={variants.button} whileHover="hover" onClick={handleSave} disabled={isLogging} className={`${isLogging ? "bg-gray-300 text-gray-500" : "bg-orange-500/25 hover:bg-orange-600/25 text-orange-600"} px-4 py-2 rounded-lg border border-orange-600 duration-50`}>
          {isLogging ? t("saving") : t("save")}
        </motion.button>

        {logSuccess === true && (<motion.div variants={variants.card} className="py-2 px-4 bg-green-100 text-green-800 rounded-md text-center">✓ {t("saveSuccess")}</motion.div>)}
        {logSuccess === false && (<motion.div variants={variants.card} className="py-2 px-4 bg-red-100 text-red-800 rounded-md text-center">✗ {t("saveFail")}</motion.div>)}
      </motion.div>

      <SleepHistory />
    </motion.div>
  );
}