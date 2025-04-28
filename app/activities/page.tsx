import ActivityCard from "../ui/activites/activity-card";
import { rethinkSans } from "../ui/fonts";

export default function Page() {
  return (
    <div className="relative flex flex-col justify-center gap-8 w-3/5 h-full">
      <h1 className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-[46px] leading-[1]`}>
        Activities made for you.
      </h1>

      <div className="grid grid-cols-2 grid-rows-4 gap-3">
        <ActivityCard
          title="Sleep Tracker"
          icon="💤"
          backgroundColor="bg-[#F66B6B]/50 hover:bg-[#F66B6B]/40 border-2 border-[#F66B6B]"
          link="/activities/sleepTracker"
          description="A tool to track your sleep!"
        />
        <ActivityCard
          title="Mood Journaling"
          icon="📒"
          backgroundColor="bg-rose-300/50 hover:bg-rose-300/40 border-2 border-rose-300"
          link="/activities/moodJournaling"
          description="Journal about your mood!"
        />
        <ActivityCard
          title="Gratitude Journaling"
          icon="💖"
          backgroundColor="bg-orange-600/30 hover:bg-orange-600/20 border-2 border-orange-600/60"
          link="/activities/gratitudeJournaling"
          description="Journal what you feel gratitude towards"
        />
        <ActivityCard
          title="Meditation"
          icon="🙏"
          backgroundColor="bg-orange-300/50 hover:bg-orange-300/40 border-2 border-orange-300 "
          link="/activities/meditation"
          description="Take it slow and meditate."
        />
        <ActivityCard
          title="Yoga Videos"
          icon="🧘"

          backgroundColor="bg-[#FD906C]/50 hover:bg-[#FD906C]/40 border-2 border-[#FD906C]"

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

          backgroundColor="bg-[#FFB599]/50 hover:bg-[#FFB599]/40 border-2 border-[#FFB599] "

          link="/activities/bookReading"
          description="Read a book"
        />
        <ActivityCard
          title="Mindfulness Videos"
          icon="🎥"

          backgroundColor="bg-yellow-400/25 hover:bg-yellow-400/15 border-2 border-yellow-400 "

          link="/activities/mindfulnessVideo"
          description="Learn mindfulness through a video"
        />
        <ActivityCard
          title="Square Breathing"
          icon="🟦"

          backgroundColor="bg-yellow-200/30 hover:bg-yellow-200/20 border-2 border-yellow-400"

          link="/activities/squareBreathing"
          description="Practice calm breathing techniques"
        />
      </div>

    </div>
  )
}
