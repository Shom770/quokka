"use client";

import { rethinkSans } from "@/components/fonts";
import { useState, useEffect } from "react";
import ChallengeBox from "@/components/challenges/challenge-box";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { SparklesIcon, TrophyIcon, FireIcon } from "@heroicons/react/24/solid";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  },
  titleContainer: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2 } }
  },
  challengeCard: {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 0.4, type: "spring", stiffness: 100, damping: 15 } }
  },
  completionMessage: {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 120, damping: 10 } }
  },
  backgroundElements: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.2, delay: 0.1 } }
  },
  floatingIcon: {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Add this type above your component if not already defined:
type CalendarActivity = {
  id: number;
  activity_id: string;
  type: string;
  completed_at: string;
  notes?: string | null;
  challenge_theme?: string;
  challenge_description?: string;
};

type Challenge = {
  id: number;
  category: string;
  theme: string;
  description: string;
};

export default function Page() {
  useSession({ required: true });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [checkedCompletion, setCheckedCompletion] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Fetch 3 challenges
        const challengePromises = Array.from({ length: 3 }, () =>
          fetch("https://data.quokka.school/api/challenges/daily")
        );
        
        const responses = await Promise.all(challengePromises);
        const challengeData = await Promise.all(
          responses.map(res => res.json())
        );
        
        const validChallenges = challengeData
          .filter((data: any) => data.success && data.data && data.data.challenge)
          .map((data: any) => data.data.challenge)
          .slice(0, 3); // Ensure we only get 3 challenges
        
        setChallenges(validChallenges);
      } catch (error) {
        console.error("Failed to fetch daily challenges", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  // Check if today's challenges are already completed
  useEffect(() => {
    const checkCompleted = async () => {
      if (challenges.length === 0 || checkedCompletion) return;
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const res = await fetch(`/api/calendar?date=${todayStr}`);
        if (!res.ok) return;
        const data = await res.json() as { activities?: CalendarActivity[] };
        if (data && data.activities) {
          const completedIds = new Set<number>();
          (data.activities as CalendarActivity[]).forEach((a) => {
            if (a.type === 'challenge') {
              completedIds.add(Number(a.activity_id));
            }
          });
          setCompletedChallenges(completedIds);
        }
      } catch {
        // ignore
      } finally {
        setCheckedCompletion(true);
      }
    };
    checkCompleted();
  }, [challenges, checkedCompletion]);

  const handleToggle = async (challengeId: number) => {
    if (completedChallenges.has(challengeId) || posting) return;
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch(`/api/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challenge_id: challengeId }),
        credentials: "include",
      });
      const data = await res.json() as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record challenge completion");
      }
      setCompletedChallenges(prev => new Set([...prev, challengeId]));
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to record challenge completion");
    } finally {
      setPosting(false);
    }
  };

  const allCompleted = challenges.length > 0 && completedChallenges.size === challenges.length;

  return (
    <motion.div 
      className="relative flex flex-col justify-center items-center gap-8 w-full h-full overflow-hidden"
      {...animationVariants.pageContainer}
    >
      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        {...animationVariants.backgroundElements}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 opacity-40" />
        
        {/* Decorative Circles */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 opacity-20 blur-xl" />
        <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 opacity-15 blur-2xl" />
        <div className="absolute top-1/2 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-yellow-300 opacity-25 blur-lg" />
        
        {/* Floating Icons */}
        <motion.div 
          className="absolute top-32 right-32 text-orange-300 opacity-30"
          {...animationVariants.floatingIcon}
        >
          <SparklesIcon className="w-8 h-8" />
        </motion.div>
        <motion.div 
          className="absolute bottom-40 left-32 text-yellow-400 opacity-25"
          {...animationVariants.floatingIcon}
          style={{ animationDelay: "2s" }}
        >
          <TrophyIcon className="w-10 h-10" />
        </motion.div>
        <motion.div 
          className="absolute top-1/3 right-16 text-orange-400 opacity-20"
          {...animationVariants.floatingIcon}
          style={{ animationDelay: "4s" }}
        >
          <FireIcon className="w-6 h-6" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center gap-8 w-full max-w-6xl px-6">
        <motion.div 
          className="text-center space-y-2"
          {...animationVariants.titleContainer}
        >
          <h1 className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-[52px] leading-[1] drop-shadow-sm`}>
            Daily Challenges
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Push yourself to be better today
          </p>
        </motion.div>

        {challenges.length > 0 && (
          <motion.div 
            className="w-full"
            {...animationVariants.challengeCard}
          >
            {(isLoading || posting) ? (
              <div className="flex items-center justify-center w-full h-full z-10">
                <motion.div 
                  className="rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.4 + (index * 0.1), 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 15 
                      }}
                    >
                      <ChallengeBox
                        category={`${challenge.theme}`}
                        description={challenge.description}
                        isCompleted={completedChallenges.has(challenge.id)}
                        onToggle={() => handleToggle(challenge.id)}
                        allChallengesAccomplished={allCompleted}
                      />
                    </motion.div>
                  ))}
                </div>
                {postError && (
                  <div className="text-center text-red-500 text-sm mt-4">{postError}</div>
                )}
                {allCompleted && (
                  <motion.div 
                    className="text-center space-y-2 mt-8"
                    {...animationVariants.completionMessage}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <TrophyIcon className="w-6 h-6 text-yellow-500" />
                      <h2 className={`${rethinkSans.className} antialiased text-2xl text-orange-600 font-extrabold`}>
                        All Challenges Complete!
                      </h2>
                      <SparklesIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      You&apos;re making great progress on your wellness journey!
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
