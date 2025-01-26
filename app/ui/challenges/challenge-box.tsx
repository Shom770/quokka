"use client";

import { useState } from "react";
import { inter } from "@/app/ui/fonts";

export default function ChallengeBox({ category, description } : { category: string, description: string }) {
    const [pressed, setPressed] = useState(false);

    return (
        <button 
          className={`flex flex-col items-center justify-center gap-2 basis-1/4 aspect-square rounded-xl ${!pressed? 'bg-blue-500/10 border border-blue-500 text-blue-500' : 'bg-blue-500 text-white'}`}
          onClick={() => setPressed(!pressed)}>
            <h1 className="text-xl font-extrabold">{category}</h1>
            <div className="px-8">
                <p className={`${inter.className} antialiased text-xs font-medium`}>{description}</p>
            </div>
        </button>
    )
}