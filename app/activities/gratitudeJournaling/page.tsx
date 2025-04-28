"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const [gratitudes, setGratitudes] = useState({
    gratitude1: false,
    gratitude2: false,
    gratitude3: false
  });
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);

  const handleCheckboxChange = (id: keyof typeof gratitudes) => {
    setGratitudes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Check if all gratitudes are completed
  const allCompleted = gratitudes.gratitude1 && gratitudes.gratitude2 && gratitudes.gratitude3;

  // Log activity when all gratitudes are completed
  useEffect(() => {
    const logActivity = async () => {
      if (allCompleted && !isLogging && logSuccess === null) {
        setIsLogging(true);
        
        if (session?.serverToken) {
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
                  activity_id: "gratitude-journaling",
                  notes: "Completed 3 gratitude items"
                }),
              }
            );

            if (response.ok) {
              console.log("Gratitude journaling activity logged successfully");
              setLogSuccess(true);
            } else {
              console.error("Failed to log gratitude activity:", await response.text());
              setLogSuccess(false);
            }
          } catch (error) {
            console.error("Error logging gratitude activity:", error);
            setLogSuccess(false);
          }
        } else {
          console.warn("Gratitude activity completed but not logged - no auth token available");
          setLogSuccess(false);
        }
        
        setIsLogging(false);
      }
    };
    
    logActivity();
  }, [allCompleted, isLogging, logSuccess, session]);

  // Reset logging state after showing success message
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (logSuccess !== null) {
      timeout = setTimeout(() => {
        setLogSuccess(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [logSuccess]);

  return (
    <div className="relative flex flex-col gap-8 w-1/3 overflow-y-scroll">
      <h1 className="font-extrabold text-[46px] leading-[1] text-center text-orange-500">
        Gratitude Journaling
      </h1>
      <span className="font-bold text-lg text-orange-600 text-center">
        Take a moment to reflect on and write down three things you're grateful for today. Once you've completed each, check the box to mark it as done.
      </span>

      <div className="space-y-8 flex justify-start flex-col">
        <label htmlFor="gratitude1" className="flex flex-row space-x-3 mr-auto cursor-pointer">
          <input
            className="accent-orange-500 size-6"
            id="gratitude1"
            type="checkbox"
            checked={gratitudes.gratitude1}
            onChange={() => handleCheckboxChange("gratitude1")}
          />
          <span className="text-orange-500">Write your first gratitude.</span>
        </label>

        <label htmlFor="gratitude2" className="flex flex-row space-x-3 mr-auto cursor-pointer">
          <input
            className="accent-orange-500 size-6"
            id="gratitude2"
            type="checkbox"
            checked={gratitudes.gratitude2}
            onChange={() => handleCheckboxChange("gratitude2")}
          />
          <span className="text-orange-500">Write your second gratitude.</span>
        </label>

        <label htmlFor="gratitude3" className="flex flex-row space-x-3 mr-auto cursor-pointer">
          <input
            className="accent-orange-500 size-6"
            id="gratitude3"
            type="checkbox"
            checked={gratitudes.gratitude3}
            onChange={() => handleCheckboxChange("gratitude3")}
          />
          <span className="text-orange-500">Write your third gratitude.</span>
        </label>
      </div>

      {/* Feedback message */}
      {isLogging && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded text-center">
          Logging your gratitude practice...
        </div>
      )}
      
      {logSuccess === true && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center">
          ✓ Gratitude practice logged successfully!
        </div>
      )}
      
      {logSuccess === false && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-center">
          Could not log your practice. Please try again.
        </div>
      )}
    </div>
  )
}