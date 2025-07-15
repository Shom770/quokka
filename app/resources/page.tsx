"use client";

import Resource from "@/app/ui/resource";
import lifeline988Image from "@/public/resources/988lifeline.png";
import dbsaImage from "@/public/resources/dbsa.png";
import trevorImage from "@/public/resources/trevor.png";
import ommImage from "@/public/resources/omm.png";
import namiImage from "@/public/resources/nami.jpg";
import hotlineImage from "@/public/resources/hotline.png";
import safeImage from "@/public/resources/safe.png";
import lhicImage from "@/public/resources/HCLHIC.png";
import { rethinkSans } from "../ui/fonts";
import { motion } from "framer-motion";
import { HeartIcon, ShieldCheckIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";

const resources = [
  {
    title: "988 Suicide & Crisis Lifeline",
    description: "The 988 Lifeline is a nationwide network of local crisis centers offering free and confidential emotional support to individuals experiencing suicidal crises or emotional distress, available 24/7 across the U.S.",
    image: lifeline988Image,
    link: "https://988lifeline.org"
  },
  {
    title: "Depression and Bipolar Support Alliance (DBSA)",
    description: "DBSA offers support, education, and advocacy for individuals with mood disorders. They aim to create inclusive spaces and equitable access to mental health resources for everyone.",
    image: dbsaImage,
    link: "https://www.dbsalliance.org"
  },
  {
    title: "The Trevor Project (1-866-488-7386)",
    description: "The Trevor Project is a nonprofit focused on preventing suicide among LGBTQ+ youth and providing education and research on LGBTQ studies. Calling their number will connect with a counselor!",
    image: trevorImage,
    link: "https://www.thetrevorproject.org"
  },
  {
    title: "Our Minds Matter",
    description: "Our Minds Matter aims to prevent teen suicide by providing mental health education, resources, and support. They are dedicated to empowering teens to take charge of their mental well-being and creating a supportive community.",
    image: ommImage,
    link: "https://ourmindsmatter.org"
  },
  {
    title: "National Alliance on Mental Illness, NAMI Maryland (800-950-6264)",
    description: "NAMI is the largest grassroots mental health organization in the United States. It offers education, support and advocacy for individuals and families affected by mental illness.",
    image: namiImage,
    link: "https://www.nami.org"
  },
  {
    title: "National Human Trafficking Hotline (1-888-373-7888)",
    description: "The National Human Trafficking Hotline is a confidential, 24/7 service that provides critical support to victims and survivors of human trafficking. It can also be used to report trafficking situations.",
    image: hotlineImage,
    link: "https://humantraffickinghotline.org"
  },
  {
    title: "SAFE Center for Human Trafficking Survivors",
    description: "University of Maryland SAFE Center provides trauma-informed services to empower survivors of human trafficking, while also conducting research and advocating for policy changes.",
    image: safeImage,
    link: "https://umdsafecenter.org"
  },
  {
    title: "Howard County LHIC",
    description: "The Local Health Improvement Coalition (LHIC) works to achieve health equity in Howard County. Participation is sought from individuals and organizations working to achieve optimal health and wellness for all Howard County residents.",
    image: lhicImage,
    link: "https://www.hclhic.org/healthy/mental-health"
  }
];

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  },
  titleLine1: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
  },
  titleLine2: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4 } }
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
  return (
    <motion.div 
      className="relative flex flex-col justify-center gap-8 w-full max-w-4xl mx-auto h-[75vh] overflow-hidden"
      {...animationVariants.pageContainer}
    >
      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0"
        {...animationVariants.backgroundElements}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 opacity-30" />
        
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
            {...animationVariants.titleLine1}
          >
            Mental health resources,
          </motion.div>
          <motion.div 
            className={`text-orange-600 font-extrabold text-[46px] leading-[1] ${rethinkSans.className}`}
            {...animationVariants.titleLine2}
          >
            curated for you.
          </motion.div>
          <motion.p 
            className="text-gray-600 text-lg font-medium mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Professional support and resources for your mental health journey
          </motion.p>
        </div>

        {/* Resources Container */}
        <motion.div 
          className="flex-1 overflow-y-auto space-y-4 px-3"
          {...animationVariants.scrollContainer}
        >
          {resources.map((resource, index) => (
            <motion.div
              key={index}
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
                title={resource.title} 
                description={resource.description} 
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