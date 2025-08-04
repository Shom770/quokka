"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { YTPlayer, YTPlayerEvent } from "@/types/youtube";
import { motion, AnimatePresence } from "framer-motion";

export const runtime = "edge";

// Animation Variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const videoContainerVariants = {
  open: { opacity: 1, height: "auto", marginTop: "1rem" },
  collapsed: { opacity: 0, height: 0, marginTop: 0 },
};

const feedbackVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function MindfulnessVideos() {
  useSession({ required: true });
  const [showMindfulnessVideo1, setShowMindfulnessVideo1] = useState(false);
  const [showMindfulnessVideo2, setShowMindfulnessVideo2] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [videoWatched, setVideoWatched] = useState<string | null>(null);

  const player1Ref = useRef<YTPlayer | null>(null);
  const player2Ref = useRef<YTPlayer | null>(null);
  const apiReadyRef = useRef(false);

  const videoHeight = 300;

  const logVideoActivity = useCallback(async (videoTitle: string) => {
    setIsLogging(true);
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_id: "mindfulness-video",
          notes: `Watched ${videoTitle}`,
        }),
      });
      setLogSuccess(response.ok);
      if (response.ok) {
        window.dispatchEvent(new Event("statsUpdate"));
      }
    } catch (error) {
      console.error("Error logging video activity:", error);
      setLogSuccess(false);
    }
    setIsLogging(false);
    setTimeout(() => {
      setLogSuccess(null);
      setVideoWatched(null);
    }, 5000);
  }, []);

  const handleVideoStateChange = useCallback(
    (event: YTPlayerEvent, videoTitle: string) => {
      if (event.data === 0) {
        // YT.PlayerState.ENDED
        setVideoWatched(videoTitle);
        logVideoActivity(videoTitle);
      }
    },
    [logVideoActivity]
  );

  const initializePlayers = useCallback(() => {
    if (
      showMindfulnessVideo1 &&
      !player1Ref.current &&
      document.getElementById("video1")
    ) {
      player1Ref.current = new window.YT.Player("video1", {
        videoId: "ssss7V1_eyA",
        events: {
          onStateChange: (e) =>
            handleVideoStateChange(e, "Mindfulness With Commentary"),
        },
      });
    }
    if (
      showMindfulnessVideo2 &&
      !player2Ref.current &&
      document.getElementById("video2")
    ) {
      player2Ref.current = new window.YT.Player("video2", {
        videoId: "p5EVLX8XxzM",
        events: {
          onStateChange: (e) =>
            handleVideoStateChange(e, "Mindfulness Without Commentary"),
        },
      });
    }
  }, [showMindfulnessVideo1, showMindfulnessVideo2, handleVideoStateChange]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      apiReadyRef.current = true;
      initializePlayers();
      return;
    }
    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
      initializePlayers();
    };
    if (
      !document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )
    ) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [initializePlayers]);

  useEffect(() => {
    if (apiReadyRef.current) initializePlayers();
  }, [showMindfulnessVideo1, showMindfulnessVideo2, initializePlayers]);

  const createToggle =
    (
      isShowing: boolean,
      setter: React.Dispatch<React.SetStateAction<boolean>>,
      playerRef: React.MutableRefObject<YTPlayer | null>
    ) =>
    () => {
      if (isShowing && playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setter(!isShowing);
    };

  const toggleVideo1 = createToggle(
    showMindfulnessVideo1,
    setShowMindfulnessVideo1,
    player1Ref
  );
  const toggleVideo2 = createToggle(
    showMindfulnessVideo2,
    setShowMindfulnessVideo2,
    player2Ref
  );

  const renderVideoSection = (
    title: string,
    videoId: string,
    isShowing: boolean,
    toggleFn: () => void
  ) => (
    <motion.div
      variants={itemVariants}
      className="p-4 border border-orange-300 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-orange-600">{title}</p>
        <motion.button
          className="text-orange-500 font-semibold underline"
          onClick={toggleFn}
          whileHover={{ color: "#c2410c" }}
          whileTap={{ scale: 0.95 }}
        >
          {isShowing ? "Hide" : "Show"}
        </motion.button>
      </div>
      <AnimatePresence>
        {isShowing && (
          <motion.div
            key={videoId}
            variants={videoContainerVariants}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div
              id={videoId}
              className="w-full rounded-md"
              style={{ height: videoHeight }}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col w-full md:w-1/2 space-y-6 p-4 md:p-8"
    >
      <motion.h1
        variants={itemVariants}
        className="text-4xl font-bold text-orange-600"
      >
        Mindfulness Videos
      </motion.h1>

      {renderVideoSection(
        "Video With Commentary",
        "video1",
        showMindfulnessVideo1,
        toggleVideo1
      )}
      {renderVideoSection(
        "Video Without Commentary",
        "video2",
        showMindfulnessVideo2,
        toggleVideo2
      )}

      <div className="h-14">
        <AnimatePresence mode="wait">
          {isLogging && (
            <motion.div
              key="logging"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md"
            >
              Logging your activity...
            </motion.div>
          )}
          {logSuccess === true && videoWatched && (
            <motion.div
              key="success"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-2 px-4 bg-green-100 text-green-800 rounded-md"
            >
              ✓ “{videoWatched}” logged successfully!
            </motion.div>
          )}
          {logSuccess === false && (
            <motion.div
              key="error"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-2 px-4 bg-red-100 text-red-800 rounded-md"
            >
              Failed to log video completion.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
