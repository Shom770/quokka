"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

// Define TypeScript types for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function MindfulnessVideos() {
  const { data: session } = useSession();
  const [showMindfulnessVideo1, setShowMindfulnessVideo1] = useState(false);
  const [showMindfulnessVideo2, setShowMindfulnessVideo2] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [videoWatched, setVideoWatched] = useState<string | null>(null);

  // References to player instances
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const apiReadyRef = useRef(false);

  const videoHeight = 300;
  
  // Load YouTube API
  useEffect(() => {
    // Only load the API once
    if (window.YT || document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      apiReadyRef.current = true;
      return;
    }
    
    // This function will be called once the API is ready
    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
      initializePlayers();
    };
    
    // Load the YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);
  
  // Initialize players when API is ready and videos are shown
  useEffect(() => {
    if (apiReadyRef.current) {
      initializePlayers();
    }
  }, [showMindfulnessVideo1, showMindfulnessVideo2]);
  
  // Create YouTube players
  const initializePlayers = () => {
    if (showMindfulnessVideo1 && !player1Ref.current && document.getElementById('video1')) {
      player1Ref.current = new window.YT.Player('video1', {
        videoId: 'ssss7V1_eyA',
        events: {
          onStateChange: (event: any) => handleVideoStateChange(event, 'video1')
        }
      });
    }
    
    if (showMindfulnessVideo2 && !player2Ref.current && document.getElementById('video2')) {
      player2Ref.current = new window.YT.Player('video2', {
        videoId: 'p5EVLX8XxzM',
        events: {
          onStateChange: (event: any) => handleVideoStateChange(event, 'video2')
        }
      });
    }
  };
  
  // Handle video state changes, log when a video ends
  const handleVideoStateChange = (event: any, videoId: string) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      const videoTitle = videoId === 'video1' ? 
        "Mindfulness Video With Commentary" : 
        "Mindfulness Video Without Commentary";
      
      setVideoWatched(videoTitle);
      logVideoActivity(videoId, videoTitle);
    }
  };
  
  // Log video completion to server
  const logVideoActivity = async (videoId: string, videoTitle: string) => {
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
              activity_id: "mindfulness-video",
              notes: `Watched ${videoTitle}`
            }),
          }
        );

        if (response.ok) {
          console.log("Video activity logged successfully");
          setLogSuccess(true);
        } else {
          console.error("Failed to log video activity:", await response.text());
          setLogSuccess(false);
        }
      } catch (error) {
        console.error("Error logging video activity:", error);
        setLogSuccess(false);
      }
    } else {
      console.warn("Video watched but not logged - no auth token available");
      setLogSuccess(false);
    }
    
    setIsLogging(false);
    
    // Clear success message after a few seconds
    setTimeout(() => {
      setLogSuccess(null);
      setVideoWatched(null);
    }, 5000);
  };

  // Handle video show/hide and clean up player instances
  const toggleVideo1 = () => {
    if (showMindfulnessVideo1 && player1Ref.current) {
      player1Ref.current.destroy();
      player1Ref.current = null;
    }
    setShowMindfulnessVideo1(!showMindfulnessVideo1);
  };

  const toggleVideo2 = () => {
    if (showMindfulnessVideo2 && player2Ref.current) {
      player2Ref.current.destroy();
      player2Ref.current = null;
    }
    setShowMindfulnessVideo2(!showMindfulnessVideo2);
  };

  return (
    <div className="flex flex-col w-1/3 space-y-6 p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Mindfulness Videos
      </h1>

      {/* Video With Commentary */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">
            Video With Commentary
          </p>
          <button
            className="text-orange-500 underline"
            onClick={toggleVideo1}
          >
            {showMindfulnessVideo1 ? "Hide" : "Show"}
          </button>
        </div>
        {showMindfulnessVideo1 && (
          <div className="flex flex-col mt-4 space-y-4">
            <div id="video1" className="w-full" style={{height: videoHeight}}></div>
          </div>
        )}
      </div>

      {/* Video Without Commentary */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">
            Video Without Commentary
          </p>
          <button
            className="text-orange-500 underline"
            onClick={toggleVideo2}
          >
            {showMindfulnessVideo2 ? "Hide" : "Show"}
          </button>
        </div>
        {showMindfulnessVideo2 && (
          <div className="flex flex-col mt-4 space-y-4">
            <div id="video2" className="w-full" style={{height: videoHeight}}></div>
          </div>
        )}
      </div>

      {/* Activity Logging Feedback */}
      {isLogging && (
        <div className="mt-4 py-2 px-4 bg-yellow-100 text-yellow-800 rounded-md">
          Logging your activity...
        </div>
      )}
      
      {logSuccess === true && videoWatched && (
        <div className="mt-4 py-2 px-4 bg-green-100 text-green-800 rounded-md">
          ✓ "{videoWatched}" completed and logged successfully!
        </div>
      )}
      
      {logSuccess === false && (
        <div className="mt-4 py-2 px-4 bg-red-100 text-red-800 rounded-md">
          Failed to log video completion. Please check your connection.
        </div>
      )}
    </div>
  );
}