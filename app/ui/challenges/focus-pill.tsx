"use client";

import { useState } from "react";

export default function FocusPill({
    emoji,
    name,
    addToFocuses,
    removeFromFocuses
}: {
    emoji: string,
    name: string,
    addToFocuses: (focus: string) => void,
    removeFromFocuses: (focus: string) => void
}) {
    const [pressed, setPressedRaw] = useState(false);

    const setPressed = (pressed: boolean) => {
        if (pressed == false) {
            removeFromFocuses(name);
        }
        else {
            addToFocuses(name);
        }

        setPressedRaw(pressed);
    }

    return (
        <button
            className={`duration-200 flex flex-row items-center justify-center gap-2 basis-1/4 h-16 rounded-xl font-extrabold px-4 py-2 ${!pressed ? 'bg-blue-500/10 border border-blue-500 text-blue-500' : 'bg-blue-500 text-white'}`}
            onClick={() => setPressed(!pressed)}>
            <h1 className="text-2xl">{emoji}</h1>
            <p>{name}</p>
        </button>
    )
}
