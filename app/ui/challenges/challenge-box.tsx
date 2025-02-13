import { useState } from "react";
import { inter } from "@/app/ui/fonts";


export default function ChallengeBox({ category, description, isCompleted, onToggle }: { category: string, description: string, isCompleted: boolean, onToggle: () => void }) {
   return (
       <button
           className={`duration-200 flex flex-col items-center justify-center gap-2 basis-1/4 aspect-square rounded-xl ${!isCompleted ? 'bg-orange-600/10 border border-orange-600 text-orange-600' : 'bg-orange-600 text-white'}`}
           onClick={onToggle}>
           <h1 className="text-xl font-extrabold">{category}</h1>
           <div className="px-8">
               <p className={`${inter.className} antialiased text-xs font-medium`}>{description}</p>
           </div>
       </button>
   )
}
