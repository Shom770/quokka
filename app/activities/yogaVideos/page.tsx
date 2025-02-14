"use client";

import React, { useState } from "react";

export default function Page() {
  const [showYogaVideo2, setShowYogaVideo2] = useState(false);
  const [showYogaVideo5, setShowYogaVideo5] = useState(false);
  const [showYogaVideo10, setShowYogaVideo10] = useState(false);

  const videoHeight = 300;

  return (
    <div className="flex flex-col w-1/3 space-y-6 p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Yoga Videos</h1>

      {/* 2-Minute */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">2-Minute Yoga Session</p>
          <button
            className="text-orange-500 underline"
            onClick={() => setShowYogaVideo2((prev) => !prev)}
          >
            {showYogaVideo2 ? "Hide" : "Show"}
          </button>
        </div>
        {showYogaVideo2 && (
          <div className="flex flex-col mt-4 space-y-4">
            <iframe
              width="100%"
              height={videoHeight}
              src="https://www.youtube.com/embed/EVKi3oXAYvk"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="rounded-sm"
            />
          </div>
        )}
      </div>

      {/* 5-Minute */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">5-Minute Yoga Session</p>
          <button
            className="text-orange-500 underline"
            onClick={() => setShowYogaVideo5((prev) => !prev)}
          >
            {showYogaVideo5 ? "Hide" : "Show"}
          </button>
        </div>
        {showYogaVideo5 && (
          <div className="flex flex-col mt-4 space-y-4">
            <iframe
              width="100%"
              height={videoHeight}
              src="https://www.youtube.com/embed/nvFm30ZAZRY"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="rounded-sm"
            />
          </div>
        )}
      </div>

      {/* 10-Minute */}
      <div className="p-4 border border-orange-300 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-orange-500">10-Minute Yoga Session</p>
          <button
            className="text-orange-500 underline"
            onClick={() => setShowYogaVideo10((prev) => !prev)}
          >
            {showYogaVideo10 ? "Hide" : "Show"}
          </button>
        </div>
        {showYogaVideo10 && (
          <div className="flex flex-col mt-4 space-y-4">
            <iframe
              width="100%"
              height={videoHeight}
              src="https://www.youtube.com/embed/4pKly2JojMw"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="rounded-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}