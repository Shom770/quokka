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

export default function Page() {
  const { data: session } = useSession();
  const [showYogaVideo2, setShowYogaVideo2] = useState(false);
  const [showYogaVideo5, setShowYogaVideo5] = useState(false);
  const [showYogaVideo10, setShowYogaVideo10] = useState(false);
  
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState<boolean | null>(null);
  const [videoWatched, setVideoWatched] = useState<string | null>(null);

  // References to player instances
  const player2Ref = useRef<any>(null);
  const player5Ref = useRef<any>(null);
  const player10Ref = useRef<any>(null);
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
  }, [showYogaVideo2, showYogaVideo5, showYogaVideo10]);
  
  // Create YouTube players
  const initializePlayers = () => {
    if (showYogaVideo2 && !player2Ref.current && document.getElementById('yoga-video-2')) {
      player2Ref.current = new window.YT.Player('yoga-video-2', {
        videoId: 'EVKi3oXAYvk',
        events: {
          onStateChange: (event: any) => handleVideoStateChange(event, 'yoga-2', '2-Minute Yoga Session')
        }
      });
    }
    
    if (showYogaVideo5 && !player5Ref.current && document.getElementById('yoga-video-5')) {
      player5Ref.current = new window.YT.Player('yoga-video-5', {
        videoId: 'nvFm30ZAZRY',
        events: {
          onStateChange: (event: any) => handleVideoStateChange(event, 'yoga-5', '5-Minute Yoga Session')
        }
      });
    }
    
    if (showYogaVideo10 && !player10Ref.current && document.getElementById('yoga-video-10')) {
      player10Ref.current = new window.YT.Player('yoga-video-10', {
        videoId: '4pKly2JojMw',
        events: {
          onStateChange: (event: any) => handleVideoStateChange(event, 'yoga-10', '10-Minute Yoga Session')
        }
      });
    }
  };
  
  // Handle video state changes, log when a video ends
  const handleVideoStateChange = (event: any, videoId: string, videoTitle: string) => {
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      setVideoWatched(videoTitle);
      logYogaActivity(videoId, videoTitle);
    }
  };
  
  // Log video completion to server
  const logYogaActivity = async (videoId: string, videoTitle: string) => {
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
              notes: `Completed ${videoTitle}`
            }),
          }
        );

        if (response.ok) {
          console.log("Yoga activity logged successfully");
          setLogSuccess(true);
        } else {
          console.error("Failed to log yoga activity:", await response.text());
          setLogSuccess(false);
        }
      } catch (error) {
        console.error("Error logging yoga activity:", error);
        setLogSuccess(false);
      }
    } else {
      console.warn("Yoga video watched but not logged - no auth token available");
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
  const toggleVideo2 = () => {
    if (showYogaVideo2 && player2Ref.current) {
      player2Ref.current.destroy();
      player2Ref.current = null;
    }
    setShowYogaVideo2(!showYogaVideo2);
  };

  const toggleVideo5 = () => {
    if (showYogaVideo5 && player5Ref.current) {
      player5Ref.current.destroy();
      player5Ref.current = null;
    }
    setShowYogaVideo5(!showYogaVideo5);
  };

  const toggleVideo10 = () => {
    if (showYogaVideo10 && player10Ref.current) {
      player10Ref.current.destroy();
      player10Ref.current = null;
    }
    setShowYogaVideo10(!showYogaVideo10);
  };

  return (
    <div className="flex flex-col w-1/3 space-y-6 p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Yoga Videos</h1>

      {/* 2-Minute */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">2-Minute Yoga Session</p>
          <button
            className="text-orange-500 underline"
            onClick={toggleVideo2}
          >
            {showYogaVideo2 ? "Hide" : "Show"}
          </button>
        </div>
        {showYogaVideo2 && (
          <div className="flex flex-col mt-4 space-y-4">
            <div id="yoga-video-2" className="w-full" style={{height: videoHeight}}></div>
          </div>
        )}
      </div>

      {/* 5-Minute */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">5-Minute Yoga Session</p>
          <button
            className="text-orange-500 underline"
            onClick={toggleVideo5}
          >
            {showYogaVideo5 ? "Hide" : "Show"}
          </button>
        </div>
        {showYogaVideo5 && (
          <div className="flex flex-col mt-4 space-y-4">
            <div id="yoga-video-5" className="w-full" style={{height: videoHeight}}></div>
          </div>
        )}
      </div>

      {/* 10-Minute */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">10-Minute Yoga Session</p>
          <button
            className="text-orange-500 underline"
            onClick={toggleVideo10}
          >
            {showYogaVideo10 ? "Hide" : "Show"}
          </button>
        </div>
        {showYogaVideo10 && (
          <div className="flex flex-col mt-4 space-y-4">
            <div id="yoga-video-10" className="w-full" style={{height: videoHeight}}></div>
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