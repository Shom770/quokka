"use client"

import { useEffect, useState } from "react";

export default function Page() {
  return (
    <div className="relative flex flex-col gap-8 w-1/3 overflow-y-scroll">
      <h1 className="font-extrabold text-[46px] leading-[1] text-center text-orange-500">
        Gratitude Journaling
      </h1>
      <span className="font-bold text-lg text-orange-600 text-center">
        Take a moment to reflect on and write down three things you're grateful for today. Once you've completed each, check the box to mark it as done.
      </span>

      <div className="space-y-8 flex justify-start flex-col">
        <label htmlFor="gratitude1" className="flex flex-row space-x-3 mr-auto cursor-pointer">
          <input
            className="accent-orange-500 size-6"
            id="gratitude1"
            type="checkbox"
          />
          <span className="text-orange-500">Write your first gratitude.</span>
        </label>

        <label htmlFor="gratitude2" className="flex flex-row space-x-3 mr-auto cursor-pointer">
          <input
            className="accent-orange-500 size-6"
            id="gratitude2"
            type="checkbox"
          />
          <span className="text-orange-500">Write your second gratitude.</span>
        </label>

        <label htmlFor="gratitude3" className="flex flex-row space-x-3 mr-auto cursor-pointer">
          <input
            className="accent-orange-500 size-6"
            id="gratitude3"
            type="checkbox"
          />
          <span className="text-orange-500">Write your third gratitude.</span>
        </label>
      </div>
    </div>
  )
}
