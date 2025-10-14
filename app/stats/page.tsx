"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { TrophyIcon, CalendarIcon, StarIcon } from "@heroicons/react/24/solid";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";
import { rethinkSans } from "@/components/fonts";
import { getMilestones, getMilestoneThreshold } from "@/utils/levels";
import { useTranslations } from "next-intl";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

export const runtime = "edge";

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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
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

// --- Reusable Animated Counter Component ---
function AnimatedCounter({ to }: { to: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const controls = animate(count, to, { duration: 1, ease: "easeOut" });
    controlsRef.current = controls;
    return () => controls.stop();
  }, [to, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StatsPage() {
  useSession({ required: true });
  const t = useTranslations("stats");
  const tMonth = useTranslations("month"); // <-- add this

  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState<ActivityCount | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [points, setPoints] = useState<number>(0); // <-- add points state
  // Calendar cache: { [date: string]: CalendarResponse }
  const [calendarCache, setCalendarCache] = useState<{
    [date: string]: CalendarResponse;
  }>({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  // Get local date string (YYYY-MM-DD) in user's timezone
  function getLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(today));
  // Track previous date for animation direction
  const [prevDate, setPrevDate] = useState(selectedDate);
  const [dateDirection, setDateDirection] = useState<"left" | "right">("left");

  // Update direction when selectedDate changes
  useEffect(() => {
    if (selectedDate !== prevDate) {
      if (selectedDate > prevDate) {
        setDateDirection("left"); // date increased, slide left
      } else {
        setDateDirection("right"); // date decreased, slide right
      }
      setPrevDate(selectedDate);
    }
  }, [selectedDate, prevDate]);
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [countsResponse, streakResponse] = await Promise.all([
        fetch("/api/counts"),
        fetch("/api/streak"),
      ]);
      if (!countsResponse.ok)
        throw new Error("Failed to fetch activity counts");
      if (!streakResponse.ok) throw new Error("Failed to fetch streak data");
      const countsData = (await countsResponse.json()) as ActivityCount;
      const streakData = (await streakResponse.json()) as Streak;
      setCounts(countsData);
      setStreak(streakData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCalendarItems = useCallback(async () => {
    if (!selectedDate || !streak) return; // Wait for streak to load
    // If already cached, use cache
    if (calendarCache[selectedDate]) {
      return;
    }
    // Only fetch if the selectedDate is in the streak
    const streakSet = new Set(streak.streak_dates || []);
    if (!streakSet.has(selectedDate)) {
      setCalendarCache((prev) => ({
        ...prev,
        [selectedDate]: { date: selectedDate, activities: [] },
      }));
      return;
    }
    setCalendarLoading(true);
    try {
      const res = await fetch(`/api/calendar?date=${selectedDate}`);
      if (!res.ok) throw new Error("Failed to fetch calendar items");
      const data = (await res.json()) as CalendarResponse;
      setCalendarCache((prev) => ({ ...prev, [selectedDate]: data }));
    } catch (err) {
      console.error("Error fetching calendar items:", err);
    } finally {
      setCalendarLoading(false);
    }
  }, [selectedDate, calendarCache, streak]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  // Fetch calendar items when selectedDate or streak changes
  useEffect(() => {
    fetchCalendarItems();
  }, [fetchCalendarItems, selectedDate, streak]);

  // Parse date string as local date (not UTC) to avoid off-by-one error
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  // Localized date formatting
  const tDate = useTranslations("date");
  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    // Use next-intl translation for date format (now under date.format and date.weekdays)
    return tDate("format", {
      weekday: tDate(`weekdays.${date.getDay()}`),
      day: date.getDate(),
      month: tMonth(MONTHS[date.getMonth()]),
      year: date.getFullYear(),
    });
  };
  const formatTimeFromISO = (isoString: string) =>
    new Date(isoString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getActivityName = (
    activity: CalendarActivity & { challenge_theme?: string }
  ) => {
    if (activity.type === "challenge") {
      // Show the challenge theme if available
      return activity.challenge_theme || "Challenge";
    }
    const activityLabels: Record<string, string> = {
      meditation: "Meditation",
      "gratitude-journaling": "Gratitude",
      "mood-journaling": "Mood Journal",
      "sleep-tracking": "Sleep Tracking",
      "square-breathing": "Breathing",
      "book-reading": "Reading",
      "yoga-video": "Yoga",
      "mindfulness-video": "Mindfulness",
    };
    return activityLabels[activity.activity_id] || activity.activity_id;
  };

  const getCategoryEmoji = (activity: CalendarActivity) => {
    if (activity.type !== "challenge") return "📝";
    if (activity.activity_id.includes("Personal")) return "🌟";
    if (activity.activity_id.includes("Creativity")) return "🧩";
    if (activity.activity_id.includes("Social")) return "🧑‍🤝‍🧑";
    if (activity.activity_id.includes("Mindfulness")) return "🧘";
    if (activity.activity_id.includes("Physical")) return "🏃‍♂️";
    return "🏆";
  };

  // Fetch points
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await fetch("/api/points");
        if (res.ok) {
          const data: { points: number } = await res.json();
          setPoints(data.points);
        }
      } catch {
        setPoints(0);
      }
    };
    fetchPoints();
  }, []);

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

  const { level, nextThreshold, progress } = getMilestones(points);
  // Prepare the five levels to display
  const displayedLevels = Array.from({ length: 5 }).map((_, i) =>
    Math.max(1, level - 2) + i
  );
  // Find the index of the last *completed* level to correctly render the progress bar
  const lastCompletedIdx = displayedLevels.findIndex((l) => l === level - 1);
  const totalSegments = displayedLevels.length - 1;
  const completedProgress =
    (lastCompletedIdx + (progress > 0 ? progress : 0)) / totalSegments;
  const totalProgressPercentage = Math.max(0, completedProgress * 100);

  // Get localized month and year
  const localizedMonth = tMonth(MONTHS[calendarMonth]);
  const localizedYear = calendarYear;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center w-full py-16 px-4 min-h-screen"
    >
      <motion.h1
        variants={itemVariants}
        className={`${rethinkSans.className} antialiased font-extrabold text-[46px] leading-[1] text-orange-600 mb-12`} // mb-12 for more space below main title
      >
        {t("title")}
      </motion.h1>

      <motion.div variants={itemVariants} className="w-full max-w-4xl space-y-14"> {/* space-y-14 for more vertical spacing between sections */}
        {/* Milestones Section */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-4xl flex flex-col items-center mb-14" // mb-14 for more space below milestones
        >
          <h2 className="text-2xl font-bold text-orange-700 mb-7"> {/* mb-7 for more space below section title */}
            {t("milestonesTitle", { defaultValue: "Milestones" })}
          </h2>

          <div className="relative w-full max-w-2xl mx-auto flex items-center" style={{ minHeight: 88 }}>
            {/* Single continuous connecting bar */}
            <div className="absolute left-8 right-8 h-2 z-0" style={{ top: "50%", transform: "translateY(-50%)" }}>
              {/* Grey background bar */}
              <div className="w-full h-full bg-gray-200 rounded-full absolute inset-0" />
              {/* Orange progress bar */}
              <motion.div
                className="h-full bg-orange-400 rounded-full absolute inset-0"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ zIndex: 1 }}
              />
            </div>

            {/* Milestone circles */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {displayedLevels.map((milestoneLevel) => {
                const threshold = getMilestoneThreshold(milestoneLevel);
                // A level is highlighted if the user has enough points for it.
                const shouldHighlight = points >= threshold;

                const border = shouldHighlight
                  ? "border-orange-400"
                  : "border-gray-300";
                const bg = shouldHighlight
                  ? "bg-orange-100"
                  : "bg-white";
                const text = shouldHighlight
                  ? "text-orange-600"
                  : "text-gray-400";

                return (
                  <div
                    key={milestoneLevel}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`flex items-center justify-center w-16 h-16 rounded-full border-4 ${border} ${bg}`}
                    >
                      <span className={`text-3xl font-bold ${text}`}>
                        {milestoneLevel}
                      </span>
                    </div>
                    <span className="mt-2 text-xs text-gray-500 font-semibold">
                      {threshold} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-orange-700 font-semibold text-lg">
            {t("currentLevel", { defaultValue: "Level" })} {level} —{" "}
            <AnimatedCounter to={points} /> / {nextThreshold} pts
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10"> {/* gap-10 for more space between cards */}
          {/* Activities Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-orange-50 border border-orange-200 p-8 rounded-lg shadow-sm" // p-8 for more padding
          >
            <div className="flex items-center mb-6"> {/* mb-6 for more space below card header */}
              <TrophyIcon className="h-8 w-8 text-orange-500 mr-4" /> {/* mr-4 for more space between icon and text */}
              <h2 className="text-xl font-bold text-orange-800">
                {t("activities")}
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {t("total")}{" "}
              <span className="font-bold text-lg">
                <AnimatedCounter to={counts?.total_count || 0} />
              </span>
            </p>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-600">
                {t("activitiesCount")}{" "}
                <span className="font-bold text-lg">
                  <AnimatedCounter to={counts?.activity_count || 0} />
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {t("challengesCount")}{" "}
                <span className="font-bold text-lg">
                  <AnimatedCounter to={counts?.challenge_count || 0} />
                </span>
              </p>
            </div>
            <div className="w-full bg-yellow-400 rounded-full h-2.5 mt-2 overflow-hidden">
              <motion.div
                className="bg-orange-400 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    counts?.total_count
                      ? (counts.activity_count / counts.total_count) * 100
                      : 0
                  }%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            {/* Points display below progress bar */}
            <div className="flex items-center mt-4 text-orange-700 font-bold text-lg gap-2">
              <StarIcon className="w-6 h-6 text-yellow-400" />
              <span>
                <AnimatedCounter to={points} /> {t("points")}
              </span>
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-orange-200 rounded-lg p-8 shadow-sm" // p-8 for more padding
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-6"> {/* mb-6 for more space below calendar nav */}
                <button
                  onClick={() => {
                    setCalendarMonth((m) => (m === 0 ? 11 : m - 1));
                    if (calendarMonth === 0) setCalendarYear((y) => y - 1);
                  }}
                  className="text-orange-500 px-2 py-1 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  &lt;
                </button>
                <span className="font-bold text-orange-700 text-lg">
                  {localizedMonth} {localizedYear}
                </span>
                {/* Prevent going past the current month */}
                <button
                  onClick={() => {
                    // Only allow if not at current month/year
                    const now = new Date();
                    if (
                      calendarYear < now.getFullYear() ||
                      (calendarYear === now.getFullYear() &&
                        calendarMonth < now.getMonth())
                    ) {
                      setCalendarMonth((m) => (m === 11 ? 0 : m + 1));
                      if (calendarMonth === 11) setCalendarYear((y) => y + 1);
                    }
                  }}
                  disabled={
                    calendarYear > new Date().getFullYear() ||
                    (calendarYear === new Date().getFullYear() &&
                      calendarMonth >= new Date().getMonth())
                  }
                  className={`text-orange-500 px-2 py-1 rounded-xl transition-colors ${
                    calendarYear > new Date().getFullYear() ||
                    (calendarYear === new Date().getFullYear() &&
                      calendarMonth >= new Date().getMonth())
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-orange-100"
                  }`}
                >
                  &gt;
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 w-full mb-2">
                <div className="text-xs text-center font-semibold text-orange-600">{t("sunday")}</div>
                <div className="text-xs text-center font-semibold text-orange-600">{t("monday")}</div>
                <div className="text-xs text-center font-semibold text-orange-600">{t("tuesday")}</div>
                <div className="text-xs text-center font-semibold text-orange-600">{t("wednesday")}</div>
                <div className="text-xs text-center font-semibold text-orange-600">{t("thursday")}</div>
                <div className="text-xs text-center font-semibold text-orange-600">{t("friday")}</div>
                <div className="text-xs text-center font-semibold text-orange-600">{t("saturday")}</div>
              </div>
              <div className="grid grid-cols-7 gap-1 w-full relative">
                {(() => {
                  const days = getMonthDays(calendarYear, calendarMonth);
                  const firstDay = days[0].getDay();
                  const blanks = Array(firstDay).fill(null);
                  const streakDates = (streak?.streak_dates || []).map((d) =>
                    parseLocalDate(d)
                  );
                  const streakSet = new Set(
                    streakDates.map((d) => d.toDateString())
                  );

                  // Find streak groups (consecutive days)
                  const streakGroups: number[][] = [];
                  let group: number[] = [];
                  for (let i = 0; i < days.length; i++) {
                    if (streakSet.has(days[i].toDateString())) {
                      if (
                        group.length === 0 ||
                        days[i].getDate() === days[i - 1]?.getDate() + 1
                      ) {
                        group.push(i);
                      } else {
                        streakGroups.push([...group]);
                        group = [i];
                      }
                    } else if (group.length) {
                      streakGroups.push([...group]);
                      group = [];
                    }
                  }
                  if (group.length) streakGroups.push([...group]);

                  // Render blanks
                  const blankEls = blanks.map((_, i) => (
                    <div key={"blank-" + i} />
                  ));

                  // Render streak backgrounds (pills)
                  const pillEls = streakGroups.map((group, idx) => {
                    if (group.length < 2) return null; // Only show pill for 2+ streaks
                    return (
                      <div
                        key={"pill-" + idx}
                        style={{
                          gridColumnStart: group[0] + 1 + firstDay,
                          gridColumnEnd: group[group.length - 1] + 2 + firstDay,
                          zIndex: 0,
                        }}
                        className="absolute h-8 bg-orange-100"
                      />
                    );
                  });

                  // Render day buttons (streak group: first/last rounded+border, middle no border/radius)
                  const dayEls = days.map((day, i) => {
                    const isStreak = streakSet.has(day.toDateString());
                    const isSelected = isSameDay(
                      day,
                      parseLocalDate(selectedDate)
                    );
                    let pillClass = "rounded-full border border-orange-200";
                    let isMiddleStreak = false;
                    for (const group of streakGroups) {
                      if (group.length > 1 && group.includes(i)) {
                        if (i === group[0]) {
                          pillClass = "rounded-l-full border border-orange-200";
                        } else if (i === group[group.length - 1]) {
                          pillClass = "rounded-r-full border border-orange-200";
                        } else {
                          pillClass = "border-none rounded-none";
                          isMiddleStreak = true;
                        }
                        break;
                      }
                    }
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() =>
                          setSelectedDate(day.toISOString().split("T")[0])
                        }
                        className={`aspect-square w-8 flex items-center justify-center mx-auto text-sm font-bold transition relative z-10 ${
                          isSelected
                            ? `bg-orange-200 border-orange-500 text-orange-900 border ${pillClass}`
                            : isStreak
                            ? `bg-orange-100 text-orange-800 hover:bg-orange-100 ${pillClass}`
                            : "bg-orange-50/50 border border-orange-100 text-orange-700 hover:bg-orange-100 rounded-full"
                        }`}
                        style={isMiddleStreak ? { boxShadow: "none" } : {}}
                      >
                        {isStreak ? <span>🔥</span> : day.getDate()}
                      </button>
                    );
                  });

                  return [...blankEls, ...pillEls, ...dayEls];
                })()}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white border border-orange-200 rounded-lg p-8 shadow-sm mt-12" // p-8 for more padding, mt-12 for more space above
          layout
          transition={{ type: "ease", duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6"> {/* mb-8 and gap-6 for more space */}
            <h2 className="text-xl font-bold text-orange-800 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-3 text-orange-600" /> {/* mr-3 for more space */}
              {t("dailyActivities")}
            </h2>
          </div>
          <div className="text-gray-600 mb-4 min-h-[28px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={selectedDate}
                initial={{ opacity: 0, x: dateDirection === "left" ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dateDirection === "left" ? -30 : 30 }}
                transition={{ duration: 0.35 }}
                className="block"
              >
                {formatDate(selectedDate)}
              </motion.span>
            </AnimatePresence>
          </div>
          <ul className="space-y-3 min-h-[60px]">
            {calendarLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-400"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                {calendarCache[selectedDate]?.activities &&
                calendarCache[selectedDate].activities.length > 0 ? (
                  <motion.div
                    key={selectedDate}
                    initial={{
                      opacity: 0,
                      y: dateDirection === "left" ? 30 : -30,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        opacity: { duration: 0.25 },
                        y: { type: "spring", stiffness: 120, damping: 18 },
                        scale: { duration: 0.2 },
                        when: "beforeChildren",
                        staggerChildren: 0.04,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: dateDirection === "left" ? -30 : 30,
                      scale: 0.98,
                      transition: { duration: 0.18 },
                    }}
                  >
                    {calendarCache[selectedDate].activities.map(
                      (activity) => (
                        <motion.li
                          key={activity.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { type: "spring", stiffness: 120, damping: 18 },
                            },
                            exit: { opacity: 0, y: 20, transition: { duration: 0.12 } },
                          }}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="p-3 rounded-md bg-orange-50 border border-orange-100"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm font-medium text-gray-600 flex items-center">
                                <span className="mr-2">
                                  {getCategoryEmoji(activity)}
                                </span>
                                {getActivityName(activity)}
                              </span>
                              {/* Show challenge description if type is challenge */}
                              {activity.type === "challenge" &&
                                activity.challenge_description && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {activity.challenge_description}
                                  </p>
                                )}
                              {activity.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                {t("completed")}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimeFromISO(activity.completed_at)}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      )
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-activity"
                    initial={{
                      opacity: 0,
                      y: dateDirection === "left" ? 30 : -30,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.25 },
                    }}
                    exit={{
                      opacity: 0,
                      y: dateDirection === "left" ? -30 : 30,
                      scale: 0.98,
                      transition: { duration: 0.18 },
                    }}
                    className="text-center py-6 text-gray-500"
                  >
                    {t("noActivity")}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
