"use client";

import React, { useState } from "react";

export default function MindfulnessVideos() {
  const [showMindfulnessVideo1, setShowMindfulnessVideo1] = useState(false);
  const [showMindfulnessVideo2, setShowMindfulnessVideo2] = useState(false);

  const videoHeight = 300;

  return (
    <div className="flex flex-col w-1/3 space-y-6 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Mindfulness Videos
      </h1>

      {/* Video With Commentary */}
      <div className="p-4 border border-blue-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-blue-700">
            Video With Commentary
          </p>
          <button
            className="text-blue-500 underline"
            onClick={() => setShowMindfulnessVideo1((prev) => !prev)}
          >
            {showMindfulnessVideo1 ? "Hide" : "Show"}
          </button>
        </div>
        {showMindfulnessVideo1 && (
          <div className="flex flex-col mt-4 space-y-4">
            <iframe
              width="100%"
              height={videoHeight}
              src="https://www.youtube.com/embed/ssss7V1_eyA"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="rounded-sm"
            />
          </div>
        )}
      </div>

      {/* Video Without Commentary */}
      <div className="p-4 border border-blue-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-blue-700">
            Video Without Commentary
          </p>
          <button
            className="text-blue-500 underline"
            onClick={() => setShowMindfulnessVideo2((prev) => !prev)}
          >
            {showMindfulnessVideo2 ? "Hide" : "Show"}
          </button>
        </div>
        {showMindfulnessVideo2 && (
          <div className="flex flex-col mt-4 space-y-4">
            <iframe
              width="100%"
              height={videoHeight}
              src="https://www.youtube.com/embed/p5EVLX8XxzM"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="rounded-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}