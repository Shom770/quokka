"use client"

import { useEffect, useState } from "react";

export default function Page() {
    return (
        <div className="relative flex flex-col items-center gap-8 w-1/3 overflow-y-scroll">
          <h1 className="font-extrabold text-[46px] leading-[1] text-blue-500">
            Gratitude journaling
          </h1>
          <span className="font-bold text-lg leading-10 text-blue-600 text-center">Take a moment to reflect on and write down three things you're grateful for today. Once you've completed each, check the box to mark it as done.</span>



          <div className="w-1/3 space-y-8 flex justify-start flex-col">
            <div className="flex flex-row justify-center space-x-3 mr-auto">
              <input className="accent-blue-700 size-6" type="checkbox" />
              <span className="text-blue-700">Write your first gratitude.</span>
            </div>

            <div className="flex flex-row justify-center space-x-3 mr-auto">
              <input className="accent-blue-700 size-6" type="checkbox" />
              <span className="text-blue-700">Write your second gratitude.</span>
            </div>
        
             <div className="flex flex-row justify-center space-x-3 mr-auto">
              <input className="accent-blue-700 size-6" type="checkbox" />
              <span className="text-blue-700">Write your third gratitude.</span>
            </div>
          </div>
        </div>
    )
}
