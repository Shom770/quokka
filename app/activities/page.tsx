"use client";

import ActivityCard from "@/components/activites/activity-card";
import { rethinkSans } from "@/components/fonts";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export const runtime = "edge";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  title: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
  },
  gridContainer: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.6 } },
  },
  resourceCard: {
    initial: { opacity: 0, x: -50, scale: 0.9 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  },
};

export default function Page() {
  const t = useTranslations("activities");

  const activities = [
    {
      title: t("sleepTracker"),
      icon: "💤",
      backgroundColor:
        "bg-[#F66B6B]/50 hover:bg-[#F66B6B]/40 border-2 border-[#F66B6B]",
      link: "/activities/sleepTracker",
      description: t("sleepTrackerDesc"),
    },
    {
      title: t("moodJournaling"),
      icon: "📒",
      backgroundColor:
        "bg-rose-300/50 hover:bg-rose-300/40 border-2 border-rose-300",
      link: "/activities/moodJournaling",
      description: t("moodJournalingDesc"),
    },
    {
      title: t("gratitudeJournaling"),
      icon: "💖",
      backgroundColor:
        "bg-orange-600/30 hover:bg-orange-600/20 border-2 border-orange-600/60",
      link: "/activities/gratitudeJournaling",
      description: t("gratitudeJournalingDesc"),
    },
    {
      title: t("meditation"),
      icon: "🙏",
      backgroundColor:
        "bg-orange-300/50 hover:bg-orange-300/40 border-2 border-orange-300",
      link: "/activities/meditation",
      description: t("meditationDesc"),
    },
    {
      title: t("yogaVideos"),
      icon: "🧘",
      backgroundColor:
        "bg-[#FD906C]/50 hover:bg-[#FD906C]/40 border-2 border-[#FD906C]",
      link: "/activities/yogaVideos",
      description: t("yogaVideosDesc"),
    },
    {
      title: t("bookReading"),
      icon: "📖",
      backgroundColor:
        "bg-[#FFB599]/50 hover:bg-[#FFB599]/40 border-2 border-[#FFB599]",
      link: "/activities/bookReading",
      description: t("bookReadingDesc"),
    },
    {
      title: t("mindfulnessVideos"),
      icon: "🎥",
      backgroundColor:
        "bg-yellow-400/25 hover:bg-yellow-400/15 border-2 border-yellow-400",
      link: "/activities/mindfulnessVideo",
      description: t("mindfulnessVideosDesc"),
    },
    {
      title: t("squareBreathing"),
      icon: "🟦",
      backgroundColor:
        "bg-yellow-200/30 hover:bg-yellow-200/20 border-2 border-yellow-400",
      link: "/activities/squareBreathing",
      description: t("squareBreathingDesc"),
    },
  ];

  return (
    <motion.div
      className="relative flex flex-col gap-6 md:gap-8 w-full md:w-4/5 lg:w-3/5 min-h-screen px-6 md:px-0 py-6 md:py-12 mx-auto md:justify-center items-center"
      {...animationVariants.pageContainer}
    >
      <motion.h1
        className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-3xl md:text-[46px] leading-tight md:leading-[1]`}
        {...animationVariants.title}
      >
        {t("title")}
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pb-4 md:pb-0 w-full h-[75vh] md:h-full overflow-scroll"
        {...animationVariants.gridContainer}
      >
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="h-24 sm:h-32 md:h-auto"
            {...animationVariants.resourceCard}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.8 + index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15,
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
