"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
// --- Calendar Helper ---
function getMonthDays(year: number, month: number) {
  // month is 0-indexed
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
import { useSession } from "next-auth/react";
import { CalendarIcon, TrophyIcon } from "@heroicons/react/24/solid";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls, // Import the correct type
} from "framer-motion";
import { rethinkSans } from "@/app/ui/fonts";

// --- Types ---
type ActivityCount = {
  total_count: number;
  activity_count: number;
  challenge_count: number;
};
type Streak = {
  streak_count: number;
  streak_dates: string[];
};
type CalendarActivity = {
  id: number;
  activity_id: string;
  type: string;
  completed_at: string;
  notes: string;
  challenge_theme?: string;
  challenge_description?: string;
};
type CalendarResponse = {
  date: string;
  activities: CalendarActivity[];
};

// --- Animation Variants ---
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};
const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// --- Reusable Animated Counter Component ---
function AnimatedCounter({ to }: { to: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  // Use the specific type instead of 'any'
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const controls = animate(count, to, { duration: 1, ease: "easeOut" });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [to, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StatsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState<ActivityCount | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  // Calendar cache: { [date: string]: CalendarResponse }
  const [calendarCache, setCalendarCache] = useState<{ [date: string]: CalendarResponse }>({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    if (!session?.serverToken) return;
    setIsLoading(true);
    setError("");
    try {
      const [countsResponse, streakResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/counts`, {
          headers: { Authorization: `Bearer ${session.serverToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/streak`, {
          headers: { Authorization: `Bearer ${session.serverToken}` },
        }),
      ]);
      if (!countsResponse.ok) throw new Error("Failed to fetch activity counts");
      if (!streakResponse.ok) throw new Error("Failed to fetch streak data");
      const countsData = await countsResponse.json();
      const streakData = await streakResponse.json();
      setCounts(countsData);
      setStreak(streakData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, [session?.serverToken]);

  const fetchCalendarItems = useCallback(async () => {
    if (!selectedDate || !session?.serverToken || !streak) return; // Wait for streak to load
    // If already cached, use cache
    if (calendarCache[selectedDate]) {
      return;
    }
    // Only fetch if the selectedDate is in the streak
    const streakSet = new Set(streak.streak_dates || []);
    if (!streakSet.has(selectedDate)) {
      setCalendarCache(prev => ({ ...prev, [selectedDate]: { date: selectedDate, activities: [] } }));
      return;
    }
    setCalendarLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/calendar?date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${session.serverToken}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch calendar items");
      const data = await res.json();
      setCalendarCache(prev => ({ ...prev, [selectedDate]: data }));
    } catch (err) {
      console.error("Error fetching calendar items:", err);
    } finally {
      setCalendarLoading(false);
    }
  }, [selectedDate, session?.serverToken, calendarCache, streak]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  // Fetch calendar items when selectedDate or streak changes
  useEffect(() => { fetchCalendarItems(); }, [fetchCalendarItems, selectedDate, streak]);

  // Parse date string as local date (not UTC) to avoid off-by-one error
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const formatDate = (dateString: string) => parseLocalDate(dateString).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const formatTimeFromISO = (isoString: string) => new Date(isoString).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const getActivityName = (activity: CalendarActivity & { challenge_theme?: string }) => {
    if (activity.type === 'challenge') {
      // Show the challenge theme if available
      return activity.challenge_theme || 'Challenge';
    }
    const activityLabels: Record<string, string> = { 'meditation': 'Meditation', 'gratitude-journaling': 'Gratitude', 'mood-journaling': 'Mood Journal', 'sleep-tracking': 'Sleep Tracking', 'square-breathing': 'Breathing', 'book-reading': 'Reading', 'yoga-video': 'Yoga', 'mindfulness-video': 'Mindfulness' };
    return activityLabels[activity.activity_id] || activity.activity_id;
  };

  const getCategoryEmoji = (activity: CalendarActivity) => {
    if (activity.type !== 'challenge') return '📝';
    if (activity.activity_id.includes('Personal')) return '🌟';
    if (activity.activity_id.includes('Creativity')) return '🧩';
    if (activity.activity_id.includes('Social')) return '🧑‍🤝‍🧑';
    if (activity.activity_id.includes('Mindfulness')) return '🧘';
    if (activity.activity_id.includes('Physical')) return '🏃‍♂️';
    return '🏆';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-2xl font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }


  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center w-full py-16 px-4 min-h-screen"
    >
      <motion.h1
        variants={itemVariants}
        className={`${rethinkSans.className} antialiased font-extrabold text-[46px] leading-[1] text-orange-600 mb-8`}
      >
        Your Statistics
      </motion.h1>

      <motion.div
        variants={itemVariants}
        className="w-full max-w-4xl space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activities Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-orange-50 border border-orange-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <TrophyIcon className="h-8 w-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-orange-800">Activities</h2>
            </div>
            <p className="text-sm text-gray-600">Total: <span className="font-bold text-lg"><AnimatedCounter to={counts?.total_count || 0} /></span></p>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-600">Activities: <span className="font-bold text-lg"><AnimatedCounter to={counts?.activity_count || 0} /></span></p>
              <p className="text-sm text-gray-600">Challenges: <span className="font-bold text-lg"><AnimatedCounter to={counts?.challenge_count || 0} /></span></p>
            </div>
            <div className="w-full bg-yellow-400 rounded-full h-2.5 mt-2 overflow-hidden">
              <motion.div className="bg-orange-400 h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${counts?.total_count ? (counts.activity_count / counts.total_count) * 100 : 0}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div variants={itemVariants} className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-4">
                <button
                  onClick={() => {
                    setCalendarMonth(m => m === 0 ? 11 : m - 1);
                    if (calendarMonth === 0) setCalendarYear(y => y - 1);
                  }}
                  className="text-orange-500 px-2 py-1 rounded-xl hover:bg-orange-100 transition-colors"
                >&lt;</button>
                <span className="font-bold text-orange-700 text-lg">{new Date(calendarYear, calendarMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
                {/* Prevent going past the current month */}
                <button
                  onClick={() => {
                    // Only allow if not at current month/year
                    const now = new Date();
                    if (calendarYear < now.getFullYear() || (calendarYear === now.getFullYear() && calendarMonth < now.getMonth())) {
                      setCalendarMonth(m => m === 11 ? 0 : m + 1);
                      if (calendarMonth === 11) setCalendarYear(y => y + 1);
                    }
                  }}
                  disabled={calendarYear > new Date().getFullYear() || (calendarYear === new Date().getFullYear() && calendarMonth >= new Date().getMonth())}
                  className={`text-orange-500 px-2 py-1 rounded-xl transition-colors ${calendarYear > new Date().getFullYear() || (calendarYear === new Date().getFullYear() && calendarMonth >= new Date().getMonth()) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-orange-100'}`}
                >&gt;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 w-full mb-2">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                  <div key={d} className="text-xs text-center font-semibold text-orange-600">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 w-full">
                {(() => {
                  const days = getMonthDays(calendarYear, calendarMonth);
                  const firstDay = days[0].getDay();
                  const blanks = Array(firstDay).fill(null);
                  const streakSet = new Set((streak?.streak_dates || []).map(d => parseLocalDate(d).toDateString()));
                  return [
                    ...blanks.map((_, i) => <div key={"blank-"+i} />),
                    ...days.map(day => {
                      const isStreak = streakSet.has(day.toDateString());
                      const isSelected = isSameDay(day, parseLocalDate(selectedDate));
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day.toISOString().split("T")[0])}
                          className={`aspect-square w-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold transition border ${isSelected ? "bg-orange-200 border-orange-500 text-orange-900" : "bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100"}`}
                        >
                          {isStreak ? <span>🔥</span> : day.getDate()}
                        </button>
                      );
                    })
                  ];
                })()}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-orange-800 flex items-center"><CalendarIcon className="h-6 w-6 mr-2 text-orange-600" />Daily Activities</h2>
          </div>
          <p className="text-gray-600 mb-4">{formatDate(selectedDate)}</p>
          <ul className="space-y-3">
            {calendarLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-400"></div>
              </div>
            ) : (
              <AnimatePresence>
                {calendarCache[selectedDate]?.activities && calendarCache[selectedDate].activities.length > 0 ? (
                  calendarCache[selectedDate].activities.map((activity, index) => (
                    <motion.li key={activity.id} variants={listItemVariants} initial="hidden" animate="visible" exit="exit" transition={{ delay: index * 0.05 }} className="p-3 rounded-md bg-orange-50 border border-orange-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-600 flex items-center">
                            <span className="mr-2">{getCategoryEmoji(activity)}</span>
                            {getActivityName(activity)}
                          </span>
                          {/* Show challenge description if type is challenge */}
                          {activity.type === 'challenge' && activity.challenge_description && (
                            <p className="text-xs text-gray-500 mt-1">{activity.challenge_description}</p>
                          )}
                          {activity.notes && (
                            <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeFromISO(activity.completed_at)}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))
                ) : (
                  <motion.div key="no-activity" variants={listItemVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-6 text-gray-500">No activities completed on this day.</motion.div>
                )}
              </AnimatePresence>
            )}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}