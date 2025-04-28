"use client";

import { rethinkSans } from "@/app/ui/fonts";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const SleepHistory = ({ session }: { session: any }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    if (session?.serverToken) {
      fetchSleepStats();
    }
  }, [session, dateRange]);

  const fetchSleepStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/sync/sleep/stats`);
      url.searchParams.append('start_date', dateRange.startDate);
      url.searchParams.append('end_date', dateRange.endDate);
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.serverToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sleep stats: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error fetching sleep statistics');
      console.error('Error fetching sleep statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find the date of the minimum and maximum sleep hours
  const findMinMaxDates = (data: any[]) => {
    if (!data || data.length === 0) return { minDate: null, maxDate: null };
    
    let minHours = Infinity;
    let maxHours = -Infinity;
    let minDate = '';
    let maxDate = '';
    
    data.forEach(day => {
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

  return (
    <div className="w-full md:w-3/4 p-6 mt-8 border border-orange-200 rounded-lg">
      <h2 className="text-xl font-bold text-orange-600 mb-4">Your Sleep History</h2>
      
      {/* Date range selection */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-orange-600 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            max={dateRange.endDate}
            className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md"
          />
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-orange-600 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            max={new Date().toISOString().split('T')[0]}
            min={dateRange.startDate}
            className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}

      {error && (
        <div className="py-4 px-3 bg-red-100 text-red-800 rounded-md text-center">
          Error: {error}
        </div>
      )}

      {stats && !loading && (
        <div className="space-y-6">
          {/* Summary statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Average Sleep</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.average_hours.toFixed(1)} hrs</p>
              <p className="text-sm text-orange-700">Quality: {stats.average_quality.toFixed(1)}/5</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Best Sleep</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.max_hours.toFixed(1)} hrs</p>
              {stats.daily_data && stats.daily_data.length > 0 && (
                (() => {
                  const { maxDate } = findMinMaxDates(stats.daily_data);
                  return maxDate ? (
                    <p className="text-sm text-orange-700">
                      on {new Date(maxDate).toLocaleDateString()}
                    </p>
                  ) : null;
                })()
              )}
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Least Sleep</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.min_hours.toFixed(1)} hrs</p>
              {stats.daily_data && stats.daily_data.length > 0 && (
                (() => {
                  const { minDate } = findMinMaxDates(stats.daily_data);
                  return minDate ? (
                    <p className="text-sm text-orange-700">
                      on {new Date(minDate).toLocaleDateString()}
                    </p>
                  ) : null;
                })()
              )}
            </div>
          </div>

          {/* Sleep trend graph */}
          {stats.daily_data && stats.daily_data.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Sleep Trend</h3>
              <div className="h-64 relative">
                {stats.daily_data.map((day: any, index: number) => (
                  <div 
                    key={day.sleep_date} 
                    className="absolute bottom-0 bg-orange-400 rounded-t-sm hover:bg-orange-600 transition-colors"
                    style={{
                      left: `${(index / stats.daily_data.length) * 100}%`,
                      width: `${90 / stats.daily_data.length}%`,
                      height: `${(day.hours / 12) * 100}%`,
                    }}
                    title={`${new Date(day.sleep_date).toLocaleDateString()}: ${day.hours} hours, Quality: ${day.quality}/5`}
                  >
                  </div>
                ))}
                
                {/* Horizontal guide lines */}
                {[0, 4, 8, 12].map((hours) => (
                  <div 
                    key={hours}
                    className="absolute w-full border-t border-dashed border-gray-300"
                    style={{ bottom: `${(hours / 12) * 100}%` }}
                  >
                    <span className="absolute -left-8 -translate-y-1/2 text-xs text-gray-500">{hours}h</span>
                  </div>
                ))}
              </div>
              
              {/* Date labels (only show a few for readability) */}
              <div className="flex justify-between mt-2">
                {stats.daily_data.filter((_: any, i: number) => 
                  i % Math.max(1, Math.ceil(stats.daily_data.length / 5)) === 0
                ).map((day: any) => (
                  <div key={day.sleep_date} className="text-xs text-gray-500">
                    {new Date(day.sleep_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sleep quality trend */}
          {stats.daily_data && stats.daily_data.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Sleep Quality</h3>
              <div className="flex items-end space-x-1">
                {stats.daily_data.map((day: any) => (
                  <div 
                    key={`quality-${day.sleep_date}`}
                    className="flex-1"
                  >
                    <div 
                      className="bg-orange-300 rounded-t-sm"
                      style={{ height: `${(day.quality / 5) * 100}px` }}
                      title={`${new Date(day.sleep_date).toLocaleDateString()}: Quality ${day.quality}/5`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!stats && !loading && !error && (
        <div className="py-8 text-center text-gray-500">
          No sleep data available for the selected period.
        </div>
      )}
    </div>
  );
};

export default function Page() {
  const { data: session } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [sleepHours, setSleepHours] = useState(0);
  const [additionalSleepHours, setAdditionalSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [sleepNotes, setSleepNotes] = useState("");
  const [sleepData, setSleepData] = useState<number[]>(Array(7).fill(0));
  
  // Set default date to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [selectedDate, setSelectedDate] = useState(yesterday.toISOString().split("T")[0]);
  
  // Logging states
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [logMessage, setLogMessage] = useState("");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      const savedHours = localStorage.getItem("sleepHours");
      const savedData = localStorage.getItem("sleepData");

      setSleepHours(savedHours ? parseFloat(savedHours) : 0);
      setSleepData(savedData ? JSON.parse(savedData) : Array(7).fill(0));
    }
  }, [isHydrated]);

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

  // Log sleep data to the server
  const logSleepData = async (hours: number) => {
    if (!session?.serverToken) {
      setLogSuccess(false);
      setLogMessage("Unable to save to server - not logged in");
      return false;
    }

    setIsLogging(true);

    try {
      // Use the selected date instead of today
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/sleep`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.serverToken}`,
          },
          body: JSON.stringify({
            hours: hours,
            quality: sleepQuality,
            notes: sleepNotes || null,
            date: selectedDate,
          }),
        }
      );

      if (response.ok) {
        console.log("Sleep data logged successfully");
        await logSleepActivity(); // Log the activity after sleep data is saved
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to log sleep data:", errorText);
        setLogSuccess(false);
        setLogMessage(`Server error: ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error("Error sending sleep data:", error);
      setLogSuccess(false);
      setLogMessage("Connection error - please try again");
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  // Log sleep tracking as an activity
  const logSleepActivity = async () => {
    if (!session?.serverToken) return;

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
            activity_id: "sleep-tracking",
            notes: `Logged ${sleepHours} hours of sleep for ${formatDateForDisplay(selectedDate)} with quality rating: ${sleepQuality}/5`
          }),
        }
      );

      if (response.ok) {
        console.log("Sleep tracking activity logged");
        setLogSuccess(true);
        setLogMessage("Sleep data saved successfully!");
      } else {
        console.log("Failed to log sleep tracking activity");
      }
    } catch (error) {
      console.error("Error logging sleep activity:", error);
    }
  };

  // Format date for display (e.g., "Apr 27, 2025")
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const setSleepHoursForToday = async () => {
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
    
    // Only update the weekly visualization if the selected date is today
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
      const day = new Date().getDay();
      const newData = [...sleepData];
      newData[day] = h;
      setSleepData(newData);
      saveSleepData(newData);
    }
    
    // Log data to server
    await logSleepData(h);
    
    setAdditionalSleepHours("");
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setLogSuccess(null);
      setLogMessage("");
    }, 5000);
  };

  if (!isHydrated) {
    // Avoid rendering while SSR
    return null;
  }

  return (
    <div className="flex flex-col items-center w-1/2 gap-8 overflow-y-scroll p-8">
      <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[46px] leading-[1] text-orange-600`}>
        Sleep Tracker
      </h1>
      <p className="text-lg font-bold text-center text-orange-600">
        Track your sleep duration and quality each day.
      </p>

      {/* Sleep Hours Recording */}
      <div className="flex flex-col w-full md:w-3/4 p-6 space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-orange-600">Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]} // Can't select future dates
            className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <h2 className="text-xl font-bold text-orange-600">Hours Slept</h2>
        <div className="flex items-center justify-between gap-4 w-full">
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Enter sleep hours"
            value={additionalSleepHours}
            onChange={(e) => setAdditionalSleepHours(e.target.value)}
            className="w-1/2 border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-center"
          />
          <p className="text-sm text-gray-700 text-right w-1/2">
            <span className="font-semibold">{sleepHours}</span> hour(s) recorded for {formatDateForDisplay(selectedDate)}.
          </p>
        </div>
        
        {/* Sleep Quality */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-orange-600">Sleep Quality (1-5)</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Poor</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setSleepQuality(rating)}
                className={`w-10 h-10 rounded-full ${
                  rating === sleepQuality 
                    ? "bg-orange-500 text-white" 
                    : "bg-orange-100 text-orange-900"
                }`}
              >
                {rating}
              </button>
            ))}
            <span className="text-sm text-gray-600">Excellent</span>
          </div>
        </div>
        
        {/* Notes */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-orange-600">Notes (Optional)</h3>
          <textarea
            placeholder="How did you sleep? Any dreams or interruptions?"
            value={sleepNotes}
            onChange={(e) => setSleepNotes(e.target.value)}
            className="w-full border text-gray-700 border-orange-400 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={2}
          />
        </div>
        
        <button
          onClick={setSleepHoursForToday}
          disabled={isLogging}
          className={`${
            isLogging 
              ? "bg-gray-300 text-gray-500" 
              : "bg-orange-500/25 hover:bg-orange-600/25 active:bg-orange-500/35 text-orange-600"
          } px-4 py-2 my-2 rounded-lg border border-orange-600 duration-50`}
        >
          {isLogging ? "Saving..." : "Save Sleep Data"}
        </button>
        
        {/* Logging feedback */}
        {logSuccess === true && (
          <div className="py-2 px-4 bg-green-100 text-green-800 rounded-md text-center">
            ✓ {logMessage}
          </div>
        )}
        
        {logSuccess === false && (
          <div className="py-2 px-4 bg-red-100 text-red-800 rounded-md text-center">
            ✗ {logMessage}
          </div>
        )}
      </div>

      {/* Add the sleep history component */}
      <SleepHistory session={session} />
    </div>
  );
}