"use client";

import Cards from "@/components/landing/cards";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ChallengeBox from "@/components/challenges/challenge-box";
import { rethinkSans } from "@/components/fonts";
import { SparklesIcon, TrophyIcon } from "@heroicons/react/24/solid";
import TutorialOverlay from "@/components/tutorial-overlay";
import WelcomeAnimation from "@/components/welcome-animation";
import Confetti from "@/components/confetti";
import { useTutorial } from "@/hooks/use-tutorial";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export const runtime = "edge";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut", delay: 3.3 },
    },
  },
  leftSection: {
    initial: { x: -50, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, delay: 3.5, ease: "easeOut" },
    },
  },
  rightSection: {
    initial: { x: 50, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, delay: 3.7, ease: "easeOut" },
    },
  },
  gradientBackground: {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.0,
        delay: 3.9,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: { scale: 1.1, opacity: 1, transition: { duration: 0.4 } },
  },
  completionMessage: {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 120,
        damping: 10,
      },
    },
  },
};

type CalendarActivity = {
  id: number;
  challenge_id: string;
  completed_at: string;
};

type Challenge = {
  id: number;
  category: string;
  theme: string;
  description: string;
  points?: number;
};

export default function Page() {
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Add translations
  const t = useTranslations("home");

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
  const locale = useLocale();

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState<{ x: number; y: number } | undefined>(undefined);


  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Detect guest mode from cookie
  useEffect(() => {
    try {
      const cookie = typeof document !== "undefined" ? document.cookie : "";
      setIsGuest(cookie.split("; ").some((c) => c.startsWith("guest=1")));
    } catch {
      setIsGuest(false);
    }
  }, []);

  // Fetch all daily challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch(
          `https://data.quokka.school/api/challenges/daily?locale=${locale}`
        );
        const data = (await res.json()) as {
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
  }, [locale]);

  // Check completion for all challenges (skip for guest)
  useEffect(() => {
    const checkCompleted = async () => {
      if (isGuest || !challenges.length || checkedCompletion) return;
      try {
        const res = await fetch(`/api/challenges/completed`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { completed?: CalendarActivity[] };
        const completedMap: { [id: number]: boolean } = {};
        if (data.completed) {
          for (const challenge of challenges) {
            completedMap[challenge.id] = data.completed.some(
              (a) => String(a.challenge_id) === String(challenge.id)
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
  }, [challenges, checkedCompletion, isGuest]);

  // Handle marking a challenge as complete
  const handleToggle = async (challengeId: number, event?: React.MouseEvent) => {
    if (completed[challengeId] || posting[challengeId]) return;
    
    // Get the position of the clicked challenge box for confetti
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setConfettiPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    
    setPosting((prev) => ({ ...prev, [challengeId]: true }));
    setPostError((prev) => ({ ...prev, [challengeId]: "" }));
    try {
      // Guest mode: do not call internal APIs; mark local completion only
      if (isGuest) {
        setCompleted((prev) => ({ ...prev, [challengeId]: true }));
        // Trigger confetti animation for guest mode too
        setShowConfetti(true);
        return;
      }
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ challenge_id: challengeId }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to record challenge completion"
        );
      }
      setCompleted((prev) => ({ ...prev, [challengeId]: true }));
      
      // Trigger confetti animation
      setShowConfetti(true);
      
      // Wait for state update to finish, then update stats
      setTimeout(() => {
        window.dispatchEvent(new Event("statsUpdate"));
      }, 0);
    } catch (err) {
      setPostError((prev) => ({
        ...prev,
        [challengeId]:
          err instanceof Error
            ? err.message
            : "Failed to record challenge completion",
      }));
    } finally {
      setPosting((prev) => ({ ...prev, [challengeId]: false }));
    }
  };

  const allCompleted =
    challenges.length > 0 && challenges.every((c) => completed[c.id]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    setConfettiPosition(undefined);
  };

  return (
    <>
      {/* Welcome Animation */}
      {showWelcome && <WelcomeAnimation onComplete={handleWelcomeComplete} />}

      {/* Confetti Animation */}
      <Confetti trigger={showConfetti} onComplete={handleConfettiComplete} position={confettiPosition} />

      <motion.div
        className="flex flex-row-reverse items-center justify-between w-4/5 h-full"
        {...animationVariants.pageContainer}
      >
        <motion.div
          ref={activityCardsRef}
          className="flex items-center justify-center relative w-[40%] h-[80%] activity-cards"
          {...animationVariants.leftSection}
        >
          <Cards
            meditationCardRef={meditationCardRef}
            journalingCardRef={journalingCardRef}
            resourcesCardRef={resourcesCardRef}
          />
        </motion.div>
        <motion.div
          className="relative flex flex-col justify-center w-2/5 h-3/5 gap-8"
          {...animationVariants.rightSection}
        >
          <motion.div
            className="absolute inset-2 bg-gradient-to-r from-[#F66B6B]/75 to-[#F5C114]/75 blur-[75px] rounded-xl z-0"
            {...animationVariants.gradientBackground}
          />
          {isLoading ? (
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
                <h1
                  className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-4xl leading-none drop-shadow-sm`}
                >
                  {t("dailyChallengesTitle")}
                </h1>
                <p className="text-gray-600 text-lg font-medium 4">
                  {t("dailyChallengesSubtitle")}
                </p>
              </div>
              {allCompleted && (
                <motion.div
                  className="text-center"
                  {...animationVariants.completionMessage}
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrophyIcon className="w-6 h-6 text-yellow-500" />
                    <h2
                      className={`${rethinkSans.className} antialiased text-2xl text-orange-600 font-extrabold`}
                    >
                      {t("allComplete")}
                    </h2>
                    <SparklesIcon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    {t("progressMessage")}
                  </p>
                </motion.div>
              )}
              {/* Vertically Stacked Challenge Cards */}
              <div
                ref={challengeBoxRef}
                className="flex flex-col gap-4 w-full h-full"
              >
                {challenges.map((challenge, idx) => (
                  <div
                    key={challenge.id}
                    className="flex-1 transition-all duration-300 group cursor-pointer"
                    style={{
                      zIndex: hoveredIdx === idx ? 50 : 10,
                      transform:
                        hoveredIdx === idx
                          ? "scale(1.06) translateY(-12px)"
                          : "scale(1) translateY(0)",
                      boxShadow:
                        hoveredIdx === idx
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
                      onToggle={(event) => handleToggle(challenge.id, event)}
                      allChallengesAccomplished={!!completed[challenge.id]}
                      loading={!!posting[challenge.id]}
                      points={challenge.points}
                    />
                  </div>
                ))}
              </div>
              {Object.values(postError).some(Boolean) && (
                <div className="text-center text-red-500 text-sm mt-2 z-10">
                  {t("error", {
                    message: Object.values(postError)
                      .filter(Boolean)
                      .join(", "),
                  })}
                </div>
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
