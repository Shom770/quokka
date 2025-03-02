import { inter } from "@/app/ui/fonts";

export default function ChallengeBox({ category, description, isCompleted, allChallengesAccomplished, onToggle }: { category: string, description: string, isCompleted: boolean, allChallengesAccomplished: boolean, onToggle: () => void }) {
   return (
       <button
            className={`relative duration-200 flex flex-col items-center justify-center gap-2 basis-1/4 aspect-square rounded-xl ${!isCompleted ? 'bg-orange-600/10 border border-orange-600 text-orange-600' : 'bg-orange-600 text-white'}`}
            onClick={onToggle}>
            {
                allChallengesAccomplished ? (
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-yellow-500 blur-lg rounded-lg -z-10 animate-gradient" />
                ) : <></>
            }
           <h1 className="text-xl font-extrabold">{category}</h1>
           <div className="px-8">
               <p className={`${inter.className} antialiased text-xs font-medium`}>{description}</p>
           </div>
       </button>
   )
}
