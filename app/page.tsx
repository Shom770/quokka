"use client";

import Cards from "@/components/landing/cards";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ChallengeBox from "@/components/challenges/challenge-box";
import { useSession } from "next-auth/react";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  },
  leftSection: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 0.2 } }
  },
  rightSection: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 0.4 } }
  },
  gradientBackground: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 1.0, delay: 0.6, type: "spring", stiffness: 100, damping: 15 } },
    hover: { scale: 1.1, opacity: 1, transition: { duration: 0.4 } }
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

export default function Page() {
  const { data: session } = useSession();
  const [challenge, setChallenge] = useState<{
    id: number;
    category: string;
    theme: string;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  // For checking if today's challenge is already completed
  const [checkedCompletion, setCheckedCompletion] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");


  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch("https://data.quokka.school/api/challenges/daily");
        const data = await res.json() as {
          success?: boolean;
          data?: { challenge?: { id: number; category: string; theme: string; description: string } };
        };
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

  // Check if today's challenge is already completed
  useEffect(() => {
    const checkCompleted = async () => {
      if (!challenge || checkedCompletion) return;
      try {
        // Get today's date in yyyy-mm-dd
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/calendar?date=${todayStr}`, {
          headers: session?.serverToken ? { Authorization: `Bearer ${session.serverToken}` } : undefined
        });
        if (!res.ok) return;
        const data = await res.json() as { activities?: CalendarActivity[] };
        if (data && data.activities) {
          const found = (data.activities as CalendarActivity[]).some(
            (a) => a.type === 'challenge' && String(a.activity_id) === String(challenge.id)
          );
          if (found) setCompleted(true);
        }
      } catch {
        // ignore
      } finally {
        setCheckedCompletion(true);
      }
    };
    checkCompleted();
  }, [challenge, session, checkedCompletion]);

  const handleToggle = async () => {
    if (!challenge || completed || posting || !session?.serverToken) return;
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/challenges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.serverToken}`,
        },
        body: JSON.stringify({ challenge_id: challenge.id }),
        credentials: "include",
      });
      const data = await res.json() as { success?: boolean; message?: string };
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



  return (
    <motion.div 
      className="flex flex-row items-center justify-between w-4/5 h-full"
      {...animationVariants.pageContainer}
    >
      <motion.div 
        className="flex items-center justify-center relative w-[50%] h-[80%]"
        {...animationVariants.leftSection}
      >
        <Cards />
      </motion.div>
      <motion.div 
        className="relative flex flex-col justify-center w-2/5 h-2/5 gap-2"
        {...animationVariants.rightSection}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#F66B6B]/90 to-[#F5C114]/90 blur-[150px] rounded-xl z-0" 
          {...animationVariants.gradientBackground}
        />
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
            {challenge && (
              <ChallengeBox
                category={challenge.theme}
                description={challenge.description}
                isCompleted={completed}
                onToggle={handleToggle}
                allChallengesAccomplished={completed}
              />
            )}
            {postError && (
              <div className="text-center text-red-500 text-sm mt-2 z-10">{postError}</div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}