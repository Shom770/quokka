"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { YTPlayer, YTPlayerEvent } from "@/types/youtube";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Page() {
  const { data: session } = useSession();
  const [showYogaVideo2, setShowYogaVideo2] = useState(false);
  const [showYogaVideo5, setShowYogaVideo5] = useState(false);
  const [showYogaVideo10, setShowYogaVideo10] = useState(false);

  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [videoWatched, setVideoWatched] = useState<string | null>(null);

  const player2Ref = useRef<YTPlayer | null>(null);
  const player5Ref = useRef<YTPlayer | null>(null);
  const player10Ref = useRef<YTPlayer | null>(null);
  const apiReadyRef = useRef(false);

  const videoHeight = 300;

  const logYogaActivity = useCallback(
    async (videoTitle: string) => {
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
                activity_id: "yoga-video",
                notes: `Completed ${videoTitle}`,
              }),
            }
          );
          setLogSuccess(response.ok);
        } catch (error) {
          console.error("Error logging yoga activity:", error);
          setLogSuccess(false);
        }
      } else {
        setLogSuccess(false);
      }
      setIsLogging(false);
      setTimeout(() => {
        setLogSuccess(null);
        setVideoWatched(null);
      }, 5000);
    },
    [session?.serverToken]
  );

  const handleVideoStateChange = useCallback(
    (event: YTPlayerEvent, videoTitle: string) => {
      if (event.data === 0) {
        // YT.PlayerState.ENDED
        setVideoWatched(videoTitle);
        logYogaActivity(videoTitle);
      }
    },
    [logYogaActivity]
  );

  const initializePlayers = useCallback(() => {
    if (
      showYogaVideo2 &&
      !player2Ref.current &&
      document.getElementById("yoga-video-2")
    ) {
      player2Ref.current = new window.YT.Player("yoga-video-2", {
        videoId: "EVKi3oXAYvk",
        events: {
          onStateChange: (e) => handleVideoStateChange(e, "2-Minute Yoga"),
        },
      });
    }
    if (
      showYogaVideo5 &&
      !player5Ref.current &&
      document.getElementById("yoga-video-5")
    ) {
      player5Ref.current = new window.YT.Player("yoga-video-5", {
        videoId: "nvFm30ZAZRY",
        events: {
          onStateChange: (e) => handleVideoStateChange(e, "5-Minute Yoga"),
        },
      });
    }
    if (
      showYogaVideo10 &&
      !player10Ref.current &&
      document.getElementById("yoga-video-10")
    ) {
      player10Ref.current = new window.YT.Player("yoga-video-10", {
        videoId: "4pKly2JojMw",
        events: {
          onStateChange: (e) => handleVideoStateChange(e, "10-Minute Yoga"),
        },
      });
    }
  }, [showYogaVideo2, showYogaVideo5, showYogaVideo10, handleVideoStateChange]);

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
    // Correctly clear the global callback on cleanup by assigning an empty function
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [initializePlayers]);

  useEffect(() => {
    if (apiReadyRef.current) initializePlayers();
  }, [showYogaVideo2, showYogaVideo5, showYogaVideo10, initializePlayers]);

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

  const toggleVideo2 = createToggle(
    showYogaVideo2,
    setShowYogaVideo2,
    player2Ref
  );
  const toggleVideo5 = createToggle(
    showYogaVideo5,
    setShowYogaVideo5,
    player5Ref
  );
  const toggleVideo10 = createToggle(
    showYogaVideo10,
    setShowYogaVideo10,
    player10Ref
  );

  const renderYogaSection = (
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
        Yoga Sessions
      </motion.h1>

      {renderYogaSection(
        "2-Minute Yoga",
        "yoga-video-2",
        showYogaVideo2,
        toggleVideo2
      )}
      {renderYogaSection(
        "5-Minute Yoga",
        "yoga-video-5",
        showYogaVideo5,
        toggleVideo5
      )}
      {renderYogaSection(
        "10-Minute Yoga",
        "yoga-video-10",
        showYogaVideo10,
        toggleVideo10
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