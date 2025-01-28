"use client";

import { inter } from "@/app/ui/fonts";
import FocusPill from "@/app/ui/challenges/focus-pill";
import { useState, useMemo } from "react";
import generatedChallenges from "./generated_challenges.json"
import ChallengeBox from "../ui/challenges/challenge-box";

type focusName = 'sleep' | 'meditation' | 'journaling' | 'exercise'

function generateChallenges(focuses: string[]) {
    const focusNameToFormattedName: Record<focusName, string> = {
        "sleep": "😴 Sleep",
        "meditation": "🧘 Meditation",
        "journaling": "📖 Journaling",
        "exercise": "🏃 Exercise"
    }
    const challenges: string[][] = []
    
    focuses.forEach((focus) => 
        challenges.push([focusNameToFormattedName[focus.toLowerCase() as focusName], generatedChallenges[focus.toLowerCase() as focusName][Math.floor(Math.random() * generatedChallenges[focus.toLowerCase() as focusName].length)]])
    )
  
    // Fill up the challenges array with random challenges until it's full.
    const challengesLeft = 4 - challenges.length
  
    for (var i = 0; i < challengesLeft; i++) {
      challenges.push(generatedChallenges["general_challenges"][Math.floor(Math.random() * generatedChallenges["general_challenges"].length)])
    }
  
    return challenges
  }

export default function Page() {
    const [focuses, setFocuses] = useState<string[]>([]);

    const addToFocuses = (focus: string) => setFocuses([...focuses, focus])
    const removeFromFocuses = (focus: string) => setFocuses(focuses.filter(f => f != focus))

    const challenges = generateChallenges(focuses);

    return (
        <div className="relative flex flex-col justify-center gap-5 w-3/5 h-full">
            <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
                Daily challenges made to push you.
            </h1>
            <div className="space-y-2">
                <h1 className={`${inter.className} antialiased text-lg text-black font-medium`}>What do you want to focus on today?</h1>
                <div className="flex flex-row items-center justify-center gap-4 w-full h-16">
                    <FocusPill emoji="🧘" name="Meditation" addToFocuses={addToFocuses} removeFromFocuses={removeFromFocuses} />
                    <FocusPill emoji="📖" name="Journaling" addToFocuses={addToFocuses} removeFromFocuses={removeFromFocuses} />
                    <FocusPill emoji="😴" name="Sleep" addToFocuses={addToFocuses} removeFromFocuses={removeFromFocuses} />
                    <FocusPill emoji="🏃" name="Exercise" addToFocuses={addToFocuses} removeFromFocuses={removeFromFocuses} />
                </div>
            </div>
            <div className="space-y-2">
                <h1 className={`${inter.className} antialiased text-lg text-black font-medium`}>Here's your challenges.</h1>
                <div className="flex flex-row items-center justify-center gap-4 w-full">
                    { challenges.map(([category, description], index) => <ChallengeBox category={category} description={description} key={index} /> )}
                </div>
            </div>
        </div>
    )
}