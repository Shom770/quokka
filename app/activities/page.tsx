import { BookOpenIcon, BookmarkIcon, PencilIcon, TrophyIcon } from "@heroicons/react/24/solid";
import ActivityCard from "../ui/activites/activity-card";

export default function Page() {
  return (
    <div className="relative flex flex-col justify-center gap-8 w-3/5 h-full">
      <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
        Activities made for you.
      </h1>

      <div className="grid grid-cols-2 grid-rows-4 gap-3">
        <ActivityCard
          title="Sleep Tracker"
          icon="💤"
          backgroundColor="bg-[#B3CDF6]/50 border-2 border-[#B3CDF6]"
          link="/activities/sleepTracker"
          description="A tool to track your sleep!"
        />
        <ActivityCard
          title="Mood Journaling"
          icon="📒"
          backgroundColor="bg-[#A5C8F6]/50 border-2 border-[#A5C8F6] "
          link="/activities/moodJournaling"
          description="Journal about your mood!"
        />
        <ActivityCard
          title="Gratitude Journaling"
          icon="💖"

          backgroundColor="bg-[#B3BDF6]/50 border-2 border-[#B3BDF6] "

          link="/activities/gratitudeJournaling"
          description="Journal what you feel gratitude towards"
        />
        <ActivityCard
          title="Meditation"
          icon="🙏"

          backgroundColor="bg-[#A5B8F6]/50 border-2 border-[#A5B8F6] "

          link="/activities/meditation"
          description="Take it slow and meditate."
        />
        <ActivityCard
          title="Yoga Videos"
          icon="🧘"

          backgroundColor="bg-[#CDB3F6]/50 border-2 border-[#CDB3F6] "

          link="/activities/yogaVideos"
          description="Do some yoga with video instruction."
        />
        {/* <ActivityCard
          title="No Phone Zone"
          icon="📵"

          backgroundColor="bg-[#C1A5F6]/50 border-2 border-[#C1A5F6] "

          link="/activities/noPhoneZone"
          description="Take a break from your phone."
        /> */}
        <ActivityCard
          title="Book Reading"
          icon="📖"

          backgroundColor="bg-[#F2B3F6]/50 border-2 border-[#F2B3F6] "

          link="/activities/bookReading"
          description="Read a book"
        />
        <ActivityCard
          title="Mindfulness Videos"
          icon="🎥"

          backgroundColor="bg-[#F6A5F6]/50 border-2 border-[#F6A5F6] "

          link="/activities/mindfulnessVideo"
          description="Learn mindfulness through a video"
        />
        <ActivityCard
          title="Square Breathing"
          icon="🟦"

          backgroundColor="bg-[#F6A5F6]/50 border-2 border-[#F6A5F6] "

          link="/activities/squareBreathing"
          description="Practice calm breathing techniques"
        />
      </div>

    </div>
  )
}
