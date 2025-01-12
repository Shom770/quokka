import LandingCard from "@/app/ui/landing/landing-card";
import { BookOpenIcon, BookmarkIcon, PencilIcon, TrophyIcon } from "@heroicons/react/24/solid";

export default function Page() {
  return (
    <div className="relative flex flex-col justify-center gap-8 w-3/5 h-full">
      <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
        Your mental<br />health matters.
      </h1>
      <div className="grid w-full h-[55%] grid-rows-2 grid-cols-2 gap-8">
        <LandingCard 
          color="bg-[#1E90FF]/25 border-2 border-[#1E90FF]/75"
          svgColor="text-[#1E90FF]"
          icon={PencilIcon}
          title="Mental Health Reflection"
          description="Take a quick questionnaire to identify what activities could help you."
          link="/mental-health-reflection"
          />
        <LandingCard 
          color="bg-purple-600/25 border-2 border-purple-600/75"
          svgColor="text-purple-600"
          icon={BookOpenIcon}
          title="Activities"
          description="Exercises built in the website to help you get into the right mindspace."
          link="/activities"
          />
        <LandingCard 
          color="bg-[#4C67FF]/25 border-2 border-[#4C67FF]/75"
          svgColor="text-[#4C67FF]"
          icon={BookmarkIcon}
          title="Mental Health Resources"
          description="A list of resources that can help you when you’re in need or need someone to talk to."
          link="/mental-health-resources"
          />
        <LandingCard 
          color="bg-[#DC22E9]/25 border-2 border-[#DC22E9]/50"
          svgColor="text-[#DC22E9]"
          icon={TrophyIcon}
          title="Daily Challenges"
          description="New challenges every day that push you to become a better person mentally."
          link="/daily-challenges"
          />
          
      </div>
    </div>
  )
}