"use client";

import { rethinkSans } from "@/app/ui/fonts";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CalendarIcon, FireIcon, TrophyIcon } from "@heroicons/react/24/solid";

// Updated types to match actual API responses
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
};

type CalendarResponse = {
  date: string;
  activities: CalendarActivity[];
};

export default function StatsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState<ActivityCount | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (session?.serverToken) {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    if (session?.serverToken) {
      fetchCalendarItems();
    }
  }, [selectedDate, session]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Fetch counts
      const countsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/counts`,
        {
          headers: {
            Authorization: `Bearer ${session?.serverToken}`,
          },
        }
      );

      if (!countsResponse.ok) {
        throw new Error("Failed to fetch activity counts");
      }

      const countsData = await countsResponse.json();

      // Fetch streak
      const streakResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/streak`,
        {
          headers: {
            Authorization: `Bearer ${session?.serverToken}`,
          },
        }
      );

      if (!streakResponse.ok) {
        throw new Error("Failed to fetch streak information");
      }

      const streakData = await streakResponse.json();

      setCounts(countsData);
      setStreak(streakData);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarItems = async () => {
    if (!selectedDate) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/calendar?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${session?.serverToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch calendar items");
      }

      const data = await response.json();
      setCalendarData(data);
    } catch (err) {
      console.error("Error fetching calendar items:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimeFromISO = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityName = (activity: CalendarActivity) => {
    // For challenges, the activity_id contains the full name with category prefix
    if (activity.type === 'challenge') {
      // Extract the part after the dash
      const parts = activity.activity_id.split('-');
      return parts.length > 1 ? parts.slice(1).join('-') : activity.activity_id;
    }
    
    // For regular activities, use a nicer label based on activity_id
    const activityLabels: Record<string, string> = {
      'meditation': 'Meditation',
      'gratitude-journaling': 'Gratitude Journal',
      'mood-journaling': 'Mood Journal',
      'sleep-tracking': 'Sleep Tracking',
      'square-breathing': 'Square Breathing',
      'book-reading': 'Reading',
      'yoga-video': 'Yoga Session',
      'mindfulness-video': 'Mindfulness Exercise'
    };
    
    return activityLabels[activity.activity_id] || activity.activity_id;
  };

  const getCategoryEmoji = (activity: CalendarActivity) => {
    if (activity.type !== 'challenge') return '📝';
    
    if (activity.activity_id.includes('Personal Growth')) return '🌟';
    if (activity.activity_id.includes('Creativity')) return '🧩';
    if (activity.activity_id.includes('Social Connection')) return '🧑‍🤝‍🧑';
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
        <div className="text-red-500 text-center">
          <p className="text-2xl font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full py-16 px-4 min-h-screen">
    <h1
      className={`${rethinkSans.className} antialiased font-extrabold text-[46px] leading-[1] text-orange-600 mb-8`}
    >
      Your Statistics
    </h1>

      <div className="w-full max-w-4xl space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity Count */}
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <TrophyIcon className="h-8 w-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-orange-800">Activities</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Total: <span className="font-bold text-lg">{counts?.total_count || 0}</span>
              </p>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">
                  Activities: <span className="font-bold text-lg">{counts?.activity_count || 0}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Challenges: <span className="font-bold text-lg">{counts?.challenge_count || 0}</span>
                </p>
              </div>
              <div className="w-full bg-yellow-400 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-orange-400 h-2.5 rounded-full" 
                  style={{ 
                    width: `${counts?.total_count ? (counts.activity_count / counts.total_count) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <FireIcon className="h-8 w-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-orange-800">Current Streak</h2>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-600">
                {streak?.streak_count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">days</p>
              {streak?.streak_dates && streak.streak_dates.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  Last activity: {new Date(streak.streak_dates[0]).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Streak Dates */}
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-8 w-8 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-orange-800">Streak Days</h2>
            </div>
            <div className="space-y-2">
              {streak?.streak_dates && streak.streak_dates.length > 0 ? (
                <ul className="text-sm text-gray-600">
                  {streak.streak_dates.slice(0, 5).map((date) => (
                    <li key={date} className="flex justify-between items-center mb-1">
                      <span>{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </li>
                  ))}
                  {streak.streak_dates.length > 5 && (
                    <li className="text-xs text-center text-gray-500 mt-2">
                      + {streak.streak_dates.length - 5} more days
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No active streak days</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Calendar View */}
        <div className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-orange-800 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-orange-600" />
              Daily Activities
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-orange-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <p className="text-gray-600 mb-4">
            {formatDate(selectedDate)}
          </p>

          {calendarData?.activities && calendarData.activities.length > 0 ? (
            <ul className="space-y-3">
              {calendarData.activities.map((activity) => (
                <li 
                  key={activity.id}
                  className="p-3 rounded-md bg-orange-50 border border-orange-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <span className="mr-2">{getCategoryEmoji(activity)}</span>
                        {getActivityName(activity)}
                      </span>
                      {activity.notes && (
                        <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeFromISO(activity.completed_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No activities or challenges completed on this day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}