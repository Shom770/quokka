"use client";

import ActivityCard from "../ui/activites/activity-card";
import { rethinkSans } from "../ui/fonts";
import { motion } from "framer-motion";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  },
  title: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
  },
  gridContainer: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.6 } }
  },
  resourceCard: {
    initial: { opacity: 0, x: -50, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 15 } }
  }
};

const activities = [
  {
    title: "Sleep Tracker",
    icon: "💤",
    backgroundColor: "bg-[#F66B6B]/50 hover:bg-[#F66B6B]/40 border-2 border-[#F66B6B]",
    link: "/activities/sleepTracker",
    description: "A tool to track your sleep!"
  },
  {
    title: "Mood Journaling",
    icon: "📒",
    backgroundColor: "bg-rose-300/50 hover:bg-rose-300/40 border-2 border-rose-300",
    link: "/activities/moodJournaling",
    description: "Journal about your mood!"
  },
  {
    title: "Gratitude Journaling",
    icon: "💖",
    backgroundColor: "bg-orange-600/30 hover:bg-orange-600/20 border-2 border-orange-600/60",
    link: "/activities/gratitudeJournaling",
    description: "Journal what you feel gratitude towards"
  },
  {
    title: "Meditation",
    icon: "🙏",
    backgroundColor: "bg-orange-300/50 hover:bg-orange-300/40 border-2 border-orange-300",
    link: "/activities/meditation",
    description: "Take it slow and meditate."
  },
  {
    title: "Yoga Videos",
    icon: "🧘",
    backgroundColor: "bg-[#FD906C]/50 hover:bg-[#FD906C]/40 border-2 border-[#FD906C]",
    link: "/activities/yogaVideos",
    description: "Do some yoga with video instruction."
  },
  {
    title: "Book Reading",
    icon: "📖",
    backgroundColor: "bg-[#FFB599]/50 hover:bg-[#FFB599]/40 border-2 border-[#FFB599]",
    link: "/activities/bookReading",
    description: "Read a book"
  },
  {
    title: "Mindfulness Videos",
    icon: "🎥",
    backgroundColor: "bg-yellow-400/25 hover:bg-yellow-400/15 border-2 border-yellow-400",
    link: "/activities/mindfulnessVideo",
    description: "Learn mindfulness through a video"
  },
  {
    title: "Square Breathing",
    icon: "🟦",
    backgroundColor: "bg-yellow-200/30 hover:bg-yellow-200/20 border-2 border-yellow-400",
    link: "/activities/squareBreathing",
    description: "Practice calm breathing techniques"
  }
];

export default function Page() {
  return (
    <motion.div
      className="relative flex flex-col justify-center gap-8 w-3/5 h-full"
      {...animationVariants.pageContainer}
    >
      <motion.h1
        className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-[46px] leading-[1]`}
        {...animationVariants.title}
      >
        Activities made for you.
      </motion.h1>

      <motion.div
        className="grid grid-cols-2 grid-rows-4 gap-3"
        {...animationVariants.gridContainer}
      >
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            {...animationVariants.resourceCard}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.8 + index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <ActivityCard
              title={activity.title}
              icon={activity.icon}
              backgroundColor={activity.backgroundColor}
              link={activity.link}
              description={activity.description}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
