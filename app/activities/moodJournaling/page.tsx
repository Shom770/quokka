"use client"

import { rethinkSans } from "@/app/ui/fonts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
    const { data: session } = useSession();
    const [time, setTime] = useState<number | null>(null);
    const [originalDuration, setOriginalDuration] = useState<number | null>(null);
    const [isLogging, setIsLogging] = useState(false);
    const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
    const [journalCompleted, setJournalCompleted] = useState(false);

    useEffect(() => {
      let timer: NodeJS.Timeout;
      
      if (time && time > 0) {
        timer = setTimeout(() => {
          setTime(time - 1);
        }, 1000);
      } else if (time === 0 && !journalCompleted) {
        // Timer completed - log activity
        setJournalCompleted(true);
        logJournalingActivity();
      }
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [time, journalCompleted]);

    // Log journaling activity to the server
    const logJournalingActivity = async () => {
      if (!originalDuration) return;
      
      setIsLogging(true);
      
      if (session?.serverToken) {
        try {
          const minutes = Math.floor(originalDuration / 60);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sync/activities`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.serverToken}`,
              },
              body: JSON.stringify({
                activity_id: "mood-journaling",
                notes: `Completed ${minutes} minute mood journaling session`
              }),
            }
          );

          if (response.ok) {
            console.log("Journaling activity logged successfully");
            setLogSuccess(true);
          } else {
            console.error("Failed to log journaling activity:", await response.text());
            setLogSuccess(false);
          }
        } catch (error) {
          console.error("Error logging journaling activity:", error);
          setLogSuccess(false);
        }
      } else {
        console.warn("Journaling completed but not logged - no auth token available");
        setLogSuccess(false);
      }
      
      setIsLogging(false);
    };

    // Start a new journaling session
    const startTimer = (minutes: number) => {
      const seconds = minutes * 60;
      setTime(seconds);
      setOriginalDuration(seconds);
      setJournalCompleted(false);
      setLogSuccess(null);
    };

    // Reset the session
    const resetSession = () => {
      setTime(null);
      setOriginalDuration(null);
      setJournalCompleted(false);
      setLogSuccess(null);
    };

    return (
        <div className="flex flex-col items-center gap-6 w-1/3 h-full">
          <h1 className={`${rethinkSans.className} font-extrabold text-[46px] leading-[1] text-orange-500`}>
            Mood Journaling
          </h1>
          <span className="font-bold text-lg leading-tight text-orange-600 text-center">
            Choose a time duration and use it to journal about your emotions. Below are some suggestions to help you identify what you&apos;re feeling.
          </span>

          {/* Fixed list section - doesn't scroll */}
          <div className="grid grid-cols-2 w-[80%]">
            <div className="flex flex-col items-center">
              <ul className="text-orange-600 list-disc">
                <li>Anxious</li>
                <li>Overwhelmed</li>
                <li>Excited</li>
                <li>Frustrated</li>
                <li>Content</li>
                <li>Lonely</li> 
                <li>Grateful</li>
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <ul className="text-orange-600 list-disc">
                <li>Confused</li>
                <li>Hopeful</li>
                <li>Nervous</li>
                <li>Angry</li>
                <li>Sad</li>
                <li>Joyful</li>
                <li>Embarrassed</li>
              </ul>
            </div>
          </div>

          {/* Timer section */}
          <div className="w-full">
            {!time && !journalCompleted && (
              <>
                <span className="block mt-2 text-lg font-bold text-orange-600 text-center mb-4">
                  Choose a duration to begin:
                </span>

                <div className="w-full flex flex-row justify-between space-x-4">
                  <button
                    className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
                    onClick={() => startTimer(5)}
                  >
                    <p className="antialiased text-lg text-orange-600 font-medium">5 minutes</p>
                  </button>

                  <button
                    className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
                    onClick={() => startTimer(10)}
                  >
                    <p className="antialiased text-lg text-orange-600 font-medium">10 minutes</p>
                  </button>

                  <button
                    className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
                    onClick={() => startTimer(15)}
                  >
                    <p className="antialiased text-lg text-orange-600 font-medium">15 minutes</p>
                  </button>

                  <button
                    className="bg-orange-500/15 hover:bg-orange-600/25 active:bg-orange-500/35 px-7 py-3 my-4 rounded-lg border-2 border-orange-500 duration-50 text-orange-500"
                    onClick={() => startTimer(25)}
                  >
                    <p className="antialiased text-lg text-orange-600 font-medium">25 minutes</p>
                  </button>
                </div>
              </>
            )}

            {time !== null && time > 0 && (
              <div className="text-center">
                <span className="text-3xl font-bold text-orange-700">
                  {Math.floor(time / 60).toString().padStart(2, "0")}:
                  {(time % 60).toString().padStart(2, "0")}
                </span>
                <p className="text-orange-600 mt-2">Time remaining for your journaling</p>
                
                <button
                  className="mt-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-7 py-2 rounded-lg text-white"
                  onClick={resetSession}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Activity Logging Feedback */}
            {isLogging && (
              <div className="mt-4 py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md text-center">
                Logging your mood journaling session...
              </div>
            )}
            
            {journalCompleted && time === 0 && (
              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-orange-600">
                  Journaling Session Complete
                </h2>
                
                {logSuccess === true ? (
                  <div className="mt-4 py-2 px-4 bg-green-100 text-green-800 rounded-md">
                    ✓ Your mood journaling session has been logged!
                  </div>
                ) : logSuccess === false ? (
                  <div className="mt-4 py-2 px-4 bg-red-100 text-red-800 rounded-md">
                    Could not log your journaling session. Please try again later.
                  </div>
                ) : null}
                
                <button
                  className="mt-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-7 py-2 rounded-lg text-white"
                  onClick={resetSession}
                >
                  Start New Session
                </button>
              </div>
            )}
          </div>
        </div>
    )
}