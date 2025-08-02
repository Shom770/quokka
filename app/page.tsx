"use client";

import Cards from "@/components/landing/cards";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ChallengeBox from "@/components/challenges/challenge-box";
import { useSession } from "next-auth/react";
import { rethinkSans } from "@/components/fonts";
import { SparklesIcon, TrophyIcon } from "@heroicons/react/24/solid";
import TutorialOverlay from "@/components/tutorial-overlay";
import WelcomeAnimation from "@/components/welcome-animation";
import { useTutorial } from "@/hooks/use-tutorial";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, ease: "easeOut", delay: 3.3 } }
  },
  leftSection: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 3.5, ease: "easeOut" } }
  },
  rightSection: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 3.7, ease: "easeOut" } }
  },
  gradientBackground: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 1.0, delay: 3.9, type: "spring", stiffness: 100, damping: 15 } },
    hover: { scale: 1.1, opacity: 1, transition: { duration: 0.4 } }
  },
  completionMessage: {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 120, damping: 10 } }
  },
};

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
  points?: number;
};

export default function Page() {
  useSession({ required: true });
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();
  const [showWelcome, setShowWelcome] = useState(true);

  // Create refs for tutorial
  const activityCardsRef = useRef<HTMLDivElement>(null);
  const meditationCardRef = useRef<HTMLDivElement>(null);
  const journalingCardRef = useRef<HTMLDivElement>(null);
  const resourcesCardRef = useRef<HTMLDivElement>(null);
  const challengeBoxRef = useRef<HTMLDivElement>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState<{ [id: number]: boolean }>({});
  const [checkedCompletion, setCheckedCompletion] = useState(false);
  const [posting, setPosting] = useState<{ [id: number]: boolean }>({});
  const [postError, setPostError] = useState<{ [id: number]: string }>({});

  // Track which challenge is hovered for z-index pop
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Fetch all daily challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch("https://data.quokka.school/api/challenges/daily");
        const data = await res.json() as {
          success: boolean;
          data: { challenges: Challenge[] };
        };
        if (data.success && Array.isArray(data.data?.challenges)) {
          setChallenges(data.data.challenges);
        }
      } catch (error) {
        console.error("Failed to fetch daily challenges", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  // Check completion for all challenges
  useEffect(() => {
    const checkCompleted = async () => {
      if (!challenges.length || checkedCompletion) return;
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const res = await fetch(`/api/calendar?date=${todayStr}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { activities?: CalendarActivity[] };
        const completedMap: { [id: number]: boolean } = {};
        if (data.activities) {
          for (const challenge of challenges) {
            completedMap[challenge.id] = data.activities.some(
              (a) =>
                a.type === "challenge" &&
                String(a.activity_id) === String(challenge.id)
            );
          }
        }
        setCompleted(completedMap);
      } catch {
        // ignore
      } finally {
        setCheckedCompletion(true);
      }
    };
    checkCompleted();
  }, [challenges, checkedCompletion]);

  // Handle marking a challenge as complete
  const handleToggle = async (challengeId: number) => {
    if (completed[challengeId] || posting[challengeId]) return;
    setPosting((prev) => ({ ...prev, [challengeId]: true }));
    setPostError((prev) => ({ ...prev, [challengeId]: "" }));
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ challenge_id: challengeId }),
      });
      const data = await res.json() as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record challenge completion");
      }
      setCompleted((prev) => ({ ...prev, [challengeId]: true }));
    } catch (err) {
      setPostError((prev) => ({
        ...prev,
        [challengeId]: err instanceof Error ? err.message : "Failed to record challenge completion"
      }));
    } finally {
      setPosting((prev) => ({ ...prev, [challengeId]: false }));
    }
  };

  const allCompleted = challenges.length > 0 && challenges.every((c) => completed[c.id]);

  return (
    <>
      {/* Welcome Animation */}
      {showWelcome && (
        <WelcomeAnimation onComplete={handleWelcomeComplete} />
      )}

      <motion.div
        className="flex flex-row-reverse items-center justify-between w-4/5 h-full"
        {...animationVariants.pageContainer}
      >
        <motion.div
          ref={activityCardsRef}
          className="flex items-center justify-center relative w-[50%] h-[80%] activity-cards"
          {...animationVariants.leftSection}
        >
          <Cards 
            meditationCardRef={meditationCardRef}
            journalingCardRef={journalingCardRef}
            resourcesCardRef={resourcesCardRef}
          />
        </motion.div>
        <motion.div
          className="relative flex flex-col justify-center w-2/5 h-2/5 gap-8"
          {...animationVariants.rightSection}
        >
          <motion.div
            className="absolute inset-2 bg-gradient-to-r from-[#F66B6B]/90 to-[#F5C114]/90 blur-[150px] rounded-xl z-0"
            {...animationVariants.gradientBackground}
          />
          {(isLoading || Object.values(posting).some(Boolean)) ? (
            <div className="flex items-center justify-center w-full h-full z-10">
              <motion.div
                className="rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <>
              <div>
                <h1 className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-4xl leading-[1] drop-shadow-sm`}>
                  Your Daily Challenges
                </h1>
                <p className="text-gray-600 text-lg font-medium 4">
                  Push yourself to be better today
                </p>
              </div>
              {/* Vertically stacked Challenge Cards */}
              <div
                ref={challengeBoxRef}
                className="relative w-full"
                style={{ height: `${challenges.length * 90 + 40}px` }} // adjust height as needed
              >
                {challenges.map((challenge, idx) => (
                  <div
                    key={challenge.id}
                    className={`
                      absolute left-0 right-0 transition-all duration-300
                      group cursor-pointer
                    `}
                    style={{
                      top: `${idx * 60}px`, // vertical offset
                      zIndex: hoveredIdx === idx ? 50 : 10 + idx,
                      transform: hoveredIdx === idx
                        ? "scale(1.06) translateY(-12px)"
                        : "scale(1) translateY(0)",
                      boxShadow: hoveredIdx === idx
                        ? "0 8px 32px 0 rgba(0,0,0,0.18)"
                        : "0 2px 8px 0 rgba(0,0,0,0.08)",
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <ChallengeBox
                      category={challenge.theme}
                      description={challenge.description}
                      isCompleted={!!completed[challenge.id]}
                      onToggle={() => handleToggle(challenge.id)}
                      allChallengesAccomplished={!!completed[challenge.id]}
                    />
                  </div>
                ))}
              </div>
              {Object.values(postError).some(Boolean) && (
                <div className="text-center text-red-500 text-sm mt-2 z-10">
                  {Object.values(postError).filter(Boolean).join(", ")}
                </div>
              )}
              {allCompleted && (
                <motion.div 
                  className="text-center space-y-0 mt-4"
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
      </motion.div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
        refs={{
          activityCards: activityCardsRef,
          meditationCard: meditationCardRef,
          journalingCard: journalingCardRef,
          resourcesCard: resourcesCardRef,
          challengeBox: challengeBoxRef,
        }}
      />
    </>
  );
}