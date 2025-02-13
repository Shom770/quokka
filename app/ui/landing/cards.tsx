"use client";


import { motion } from "framer-motion";
import { rethinkSans } from "../fonts";
import { TrophyIcon } from "@heroicons/react/24/solid";
import Link from "next/link";


export default function Cards() {
   const cardData = [
       { text: "mental health reflection", color: "#F66B6B", rotate: "-16deg", zIndex: 0, position: "left-0 top-0" },
       { text: "mental health resources", color: "#FD906C", rotate: "-8deg", zIndex: 5, position: "left-[17.5%] top-[15%]" },
       { text: "activities", color: "#B35D40", rotate: "0deg", zIndex: 10, position: "bottom-[15%] right-[17.5%]" },
       { text: "daily challenges", color: "#80432E", rotate: "8deg", zIndex: 15, position: "bottom-0 right-[5%]" },
   ];


   return (
       <>
           {cardData.map((card, index) => (
               <Link href="/daily-challenges" key={index}>
                   <motion.div
                       key={index}
                       className={`absolute ${card.position} flex flex-col px-8 items-center justify-around py-4 gap-2 w-[360px] h-[400px] rounded-2xl transition-all duration-150 ease-in-out`}
                       style={{
                           backgroundColor: card.color,
                       }}
                       whileHover={{
                           zIndex: 20, // Elevate on hover
                           transform: `rotate(${card.rotate}) scale(1.07)`,
                           transition: {
                               type: "spring",
                               stiffness: 100, // Adjust for bounciness
                               damping: 10, // Controls the smoothness
                           },
                       }}
                       whileTap={{
                           transform: `rotate(${card.rotate}) scale(0.98)`
                       }}
                       initial={{ opacity: 0, y: 20, transform: `rotate(${card.rotate}) scale(1.0)`, zIndex: card.zIndex }}
                       animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                   >
                       <h1 className={`text-white text-[28px] font-extrabold ${rethinkSans.className} antialiased`}>
                           {card.text}
                       </h1>
                       <TrophyIcon className="w-40 h-40" />
                       <h1 className={`text-white text-lg text-center leading-[1.2] mb-4`}>
                           New challenges every day to <strong>push you</strong> to be the <strong>best version</strong> of yourself.
                       </h1>
                   </motion.div>
               </Link>
           ))}
       </>
   );
}
