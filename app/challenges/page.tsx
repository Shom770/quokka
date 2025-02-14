"use client";

import { inter, rethinkSans } from "@/app/ui/fonts";
import FocusPill from "@/app/ui/challenges/focus-pill";
import { useState, useEffect } from "react";
import generatedChallenges from "./generated_challenges.json"
import ChallengeBox from "../ui/challenges/challenge-box";

type focusName = 'sleep' | 'meditation' | 'journaling' | 'exercise'
type Challenge = [string, string]; // [category, description]
type StoredData = {
    focuses: string[];
    challenges: Challenge[];
    lastUpdated: string;
    selectedPills: Record<string, boolean>;
    completedChallenges: Record<string, boolean>; // Using challenge description as key
}

const STORAGE_KEY = 'daily_challenges_data';

function generateChallenges(focuses: string[]) {
    const focusNameToFormattedName: Record<focusName, string> = {
        "sleep": "😴 Sleep",
        "meditation": "🧘 Meditation",
        "journaling": "📖 Journaling",
        "exercise": "🏃 Exercise"
    }
    const challenges: Challenge[] = []
    
    focuses.forEach((focus) => 
        challenges.push([focusNameToFormattedName[focus.toLowerCase() as focusName], generatedChallenges[focus.toLowerCase() as focusName][Math.floor(Math.random() * generatedChallenges[focus.toLowerCase() as focusName].length)]])
    )
  
    const challengesLeft = 4 - challenges.length
  
    for (var i = 0; i < challengesLeft; i++) {
        challenges.push(generatedChallenges["general_challenges"][Math.floor(Math.random() * generatedChallenges["general_challenges"].length)] as [string, string])
    }
  
    return challenges
}

function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

const DEFAULT_PILL_STATES = {
    "Meditation": false,
    "Journaling": false,
    "Sleep": false,
    "Exercise": false
};

export default function Page() {
    const [focuses, setFocuses] = useState<string[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [selectedPills, setSelectedPills] = useState<Record<string, boolean>>(DEFAULT_PILL_STATES);
    const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const isChallengesAccomplished = Object.values(completedChallenges).every(Boolean) && Object.keys(completedChallenges).length == challenges.length 

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedData = localStorage.getItem(STORAGE_KEY);
                if (storedData) {
                    const parsedData: StoredData = JSON.parse(storedData);
                    const lastUpdated = new Date(parsedData.lastUpdated);
                    const today = new Date();

                    // Always restore selection state
                    setSelectedPills(parsedData.selectedPills || DEFAULT_PILL_STATES);
                    setFocuses(parsedData.focuses || []);

                    if (!isSameDay(lastUpdated, today)) {
                        // New day: Generate new challenges and reset completions
                        const newChallenges = generateChallenges(parsedData.focuses || []);
                        setChallenges(newChallenges);
                        setCompletedChallenges({}); // Reset completed challenges
                        await persistData(
                            parsedData.focuses || [], 
                            newChallenges, 
                            parsedData.selectedPills || DEFAULT_PILL_STATES,
                            {} // Reset completed challenges
                        );
                    } else {
                        // Same day: Restore challenges and completion state
                        setChallenges(parsedData.challenges || []);
                        setCompletedChallenges(parsedData.completedChallenges || {});
                    }
                } else {
                    // First time user
                    const newChallenges = generateChallenges([]);
                    setChallenges(newChallenges);
                    await persistData([], newChallenges, DEFAULT_PILL_STATES, {});
                }
            } catch (error) {
                console.error('Error loading stored data:', error);
                const newChallenges = generateChallenges([]);
                setChallenges(newChallenges);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredData();
    }, []);

    const persistData = async (
        currentFocuses: string[], 
        currentChallenges: Challenge[], 
        currentSelectedPills: Record<string, boolean>,
        currentCompletedChallenges: Record<string, boolean>
    ) => {
        const dataToStore: StoredData = {
            focuses: currentFocuses,
            challenges: currentChallenges,
            lastUpdated: new Date().toISOString(),
            selectedPills: currentSelectedPills,
            completedChallenges: currentCompletedChallenges
        };
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        } catch (error) {
            console.error('Error persisting data:', error);
        }
    };

    const handlePillToggle = async (name: string, isSelected: boolean) => {
        const newSelectedPills = {
            ...selectedPills,
            [name]: isSelected
        };

        setSelectedPills(newSelectedPills);

        const newFocuses = Object.entries(newSelectedPills)
            .filter(([_, selected]) => selected)
            .map(([name]) => name);
        setFocuses(newFocuses);

        const newChallenges = generateChallenges(newFocuses);
        setChallenges(newChallenges);
        setCompletedChallenges({}); // Reset completed challenges when focuses change

        await persistData(newFocuses, newChallenges, newSelectedPills, {});
    };

    const handleChallengeToggle = async (category: string, description: string) => {
        const challengeKey = `${category}-${description}`;
        const newCompletedChallenges = {
            ...completedChallenges,
            [challengeKey]: !completedChallenges[challengeKey]
        };
        setCompletedChallenges(newCompletedChallenges);

        await persistData(focuses, challenges, selectedPills, newCompletedChallenges);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>;
    }

    return (
        <div className="relative flex flex-col justify-center gap-5 w-3/5 h-full">
            <h1 className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-[46px] leading-[1]`}>
                Daily challenges made to push you.
            </h1>
            <div className="space-y-2">
                <h1 className={`${inter.className} antialiased text-lg text-black font-medium`}>What do you want to focus on today?</h1>
                <div className="flex flex-row items-center justify-center gap-4 w-full h-16">
                    <FocusPill 
                        emoji="🧘" 
                        name="Meditation" 
                        isSelected={selectedPills["Meditation"]}
                        onToggle={(selected) => handlePillToggle("Meditation", selected)} 
                    />
                    <FocusPill 
                        emoji="📖" 
                        name="Journaling" 
                        isSelected={selectedPills["Journaling"]}
                        onToggle={(selected) => handlePillToggle("Journaling", selected)} 
                    />
                    <FocusPill 
                        emoji="😴" 
                        name="Sleep" 
                        isSelected={selectedPills["Sleep"]}
                        onToggle={(selected) => handlePillToggle("Sleep", selected)} 
                    />
                    <FocusPill 
                        emoji="🏃" 
                        name="Exercise" 
                        isSelected={selectedPills["Exercise"]}
                        onToggle={(selected) => handlePillToggle("Exercise", selected)} 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <h1 className={`${inter.className} antialiased text-lg text-black font-medium`}>Here's your challenges.</h1>
                <div className="relative flex flex-row items-center justify-center gap-4 w-full">
                    {challenges.map(([category, description]) => 
                        <ChallengeBox 
                            category={category} 
                            description={description} 
                            key={`${category}-${description}`}
                            isCompleted={completedChallenges[`${category}-${description}`] || false}
                            onToggle={() => handleChallengeToggle(category, description)}
                            allChallengesAccomplished={isChallengesAccomplished}
                        />
                    )}
                </div>
                <h1 className={`${rethinkSans.className} antialiased mt-4 text-xl ${isChallengesAccomplished ? 'text-orange-600' : 'text-[#FCF4F0]'} font-extrabold`}>You accomplished all your challenges today!</h1>
            </div>
        </div>
    );
}