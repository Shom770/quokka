"use client";

import Resource from "@/components/resource";
import lifeline988Image from "@/public/resources/988lifeline.png";
import dbsaImage from "@/public/resources/dbsa.png";
import trevorImage from "@/public/resources/trevor.png";
import ommImage from "@/public/resources/omm.png";
import namiImage from "@/public/resources/nami.jpg";
import hotlineImage from "@/public/resources/hotline.png";
import safeImage from "@/public/resources/safe.png";
import lhicImage from "@/public/resources/HCLHIC.png";
import { rethinkSans } from "@/components/fonts";
import { motion } from "framer-motion";
import { HeartIcon, ShieldCheckIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

export const runtime = "edge";

const resources = [
  {
    key: "988",
    image: lifeline988Image,
    link: "https://988lifeline.org"
  },
  {
    key: "dbsa",
    image: dbsaImage,
    link: "https://www.dbsalliance.org"
  },
  {
    key: "trevor",
    image: trevorImage,
    link: "https://www.thetrevorproject.org"
  },
  {
    key: "omm",
    image: ommImage,
    link: "https://ourmindsmatter.org"
  },
  {
    key: "nami",
    image: namiImage,
    link: "https://www.nami.org"
  },
  {
    key: "hotline",
    image: hotlineImage,
    link: "https://humantraffickinghotline.org"
  },
  {
    key: "safe",
    image: safeImage,
    link: "https://umdsafecenter.org"
  },
  {
    key: "lhic",
    image: lhicImage,
    link: "https://www.hclhic.org/healthy/mental-health"
  }
];

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  },
  titleLine: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
  },
  scrollContainer: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.6 } }
  },
  resourceCard: {
    initial: { opacity: 0, x: -50, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 15 } }
  },
  backgroundElements: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.2, delay: 0.3 } }
  },
  floatingIcon: {
    animate: {
      y: [-8, 8, -8],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

export default function Page() {
  const t = useTranslations("resources");

  return (
    <motion.div 
      className="relative flex flex-col justify-center gap-8 w-full md:w-2/3 mx-auto min-h-screen"
      {...animationVariants.pageContainer}
    >
      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        {...animationVariants.backgroundElements}
      >
        <motion.div
          className="absolute inset-16 bg-gradient-to-r from-[#F66B6B]/30 to-[#F5C114]/30 blur-[100px] -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          key="gradient-bg"
        />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-orange-200 to-red-200 opacity-20 blur-2xl" />
        <div className="absolute bottom-32 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-red-200 to-pink-200 opacity-25 blur-lg" />
        
        {/* Floating Icons */}
        <motion.div 
          className="absolute top-32 right-32 text-orange-300 opacity-25"
          {...animationVariants.floatingIcon}
        >
          <HeartIcon className="w-8 h-8" />
        </motion.div>
        <motion.div 
          className="absolute bottom-40 left-32 text-red-300 opacity-20"
          {...animationVariants.floatingIcon}
          style={{ animationDelay: "2s" }}
        >
          <ShieldCheckIcon className="w-6 h-6" />
        </motion.div>
        <motion.div 
          className="absolute top-1/2 right-16 text-pink-300 opacity-25"
          {...animationVariants.floatingIcon}
          style={{ animationDelay: "4s" }}
        >
          <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col gap-8 h-full px-6">
        {/* Title Section */}
        <div className="text-center space-y-2">
          <motion.div 
            className={`text-orange-600 font-extrabold text-[46px] leading-[1] ${rethinkSans.className}`}
            {...animationVariants.titleLine}
          >
            {t("titleLine")}
          </motion.div>
          <motion.p 
            className="text-gray-600 text-lg font-medium mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Resources Container */}
        <motion.div 
          className="flex-1 space-y-4 px-3 pb-4"
          {...animationVariants.scrollContainer}
        >
          {resources.map((resource, index) => (
            <motion.div
              key={resource.key}
              {...animationVariants.resourceCard}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 + (index * 0.1),
                type: "spring", 
                stiffness: 100, 
                damping: 15 
              }}
            >
              <Resource 
                title={t(`${resource.key}.title`)} 
                description={t(`${resource.key}.description`)} 
                pathToImage={resource.image} 
                link={resource.link} 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}