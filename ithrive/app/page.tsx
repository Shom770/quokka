import LandingCard from "@/app/ui/landing/landing-card";
import { PencilIcon } from "@heroicons/react/24/solid";

export default function Page() {
  return (
    <div className="flex flex-col justify-center w-2/3 h-full">
      <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
        Your mental<br />health matters.
      </h1>
      <div className="grid w-5/6 h-1/2 grid-rows-2 grid-cols-2">
        <LandingCard 
          color="bg-blue-600/25 border-2 border-blue-600/75"
          svgColor="text-blue-600"
          icon={PencilIcon}
          title="Mental Health Reflection"
          description="Take a quick questionnaire to identify what activities could help you."
          />
      </div>
    </div>
  )
}