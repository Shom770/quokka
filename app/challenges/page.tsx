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


export default function Page() {
  const { data: session } = useSession({ required: true });
  const [challenge, setChallenge] = useState<{
    id: number;
    category: string;
    theme: string;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch("https://data.quokka.school/api/challenges/daily");
        const data = await res.json();
        if (data.success && data.data && data.data.challenge) {
          setChallenge(data.data.challenge);
        }
      } catch (error) {
        console.error("Failed to fetch daily challenge", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenge();
  }, []);

  const handleToggle = async () => {
    if (!challenge || completed || posting || !session?.serverToken) return;
    setPosting(true);
    setPostError("");
    try {
      // challenge.id is already a number, send as is
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.serverToken}`,
        },
        body: JSON.stringify({ challenge_id: challenge.id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record challenge completion");
      }
      setCompleted(true);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to record challenge completion");
    } finally {
      setPosting(false);
    }
  };

  if (isLoading || posting) {
    return (
      <motion.div 
        className="flex items-center justify-center w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

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
      <div className="relative z-10 flex flex-col justify-center items-center gap-8 w-full max-w-2xl px-6">
        <motion.div 
          className="text-center space-y-2"
          {...animationVariants.titleContainer}
        >
          <h1 className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-[52px] leading-[1] drop-shadow-sm`}>
            Daily Challenge
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Push yourself to be better today
          </p>
        </motion.div>

        {challenge && (
          <motion.div 
            className="w-full max-w-md space-y-6"
            {...animationVariants.challengeCard}
          >
            <ChallengeBox
              category={`${challenge.theme}`}
              description={challenge.description}
              isCompleted={completed}
              onToggle={handleToggle}
              allChallengesAccomplished={completed}
            />
            {postError && (
              <div className="text-center text-red-500 text-sm mt-2">{postError}</div>
            )}
            {completed && (
              <motion.div 
                className="text-center space-y-2"
                {...animationVariants.completionMessage}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-500" />
                  <h2 className={`${rethinkSans.className} antialiased text-2xl text-orange-600 font-extrabold`}>
                    Challenge Complete!
                  </h2>
                  <SparklesIcon className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-gray-600 font-medium">
                  You&apos;re making great progress on your wellness journey!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
