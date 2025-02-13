"use client";


import { motion } from "framer-motion";
import { rethinkSans } from "../fonts";
import { BookmarkIcon, BookOpenIcon, PencilIcon, TrophyIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Card from "./card";


export default function Cards() {
   const cardData = [
       { text: "mental health reflection", color: "#F66B6B", rotate: "-16deg", zIndex: 0, position: "left-0 top-0" },
       { text: "mental health resources", color: "#FD906C", rotate: "-8deg", zIndex: 5, position: "left-[17.5%] top-[15%]" },
       { text: "activities", color: "#B35D40", rotate: "0deg", zIndex: 10, position: "bottom-[15%] right-[17.5%]" },
       { text: "daily challenges", color: "#80432E", rotate: "8deg", zIndex: 15, position: "bottom-0 right-[5%]" },
   ];


   return (
    <>
        <Link href="/reflection">
            <Card 
                title="mental health reflection"
                text={<p>Reflect on your <span className="font-extrabold">mental health</span> to <span className="font-extrabold">understand yourself better.</span></p>}
                icon={PencilIcon}
                iconColor="#FFE5E5"
                color="#F66B6B" 
                rotate="-16deg" 
                zIndex={0} 
                position="left-0 top-0" />
        </Link>
        <Link href="/resources">
            <Card 
                title="mental health resources"
                text={<p>When you need help, these resources are <span className="font-extrabold">right at your fingertips.</span></p>}
                icon={BookmarkIcon}
                iconColor="#FFE8DC"
                color="#FD906C" 
                rotate="-8deg" 
                zIndex={5} 
                position="left-[17.5%] top-[15%]" />
        </Link>
        <Link href="/activities">
            <Card 
                title="activities"
                text={<p>A few activities that encourage you to <span className="font-extrabold">destress</span> and <span className="font-extrabold">put yourself first.</span></p>}
                icon={BookOpenIcon}
                iconColor="#FFE5E5"
                color="#B35D40" 
                rotate="0deg" 
                zIndex={10} 
                position="bottom-[15%] right-[17.5%]" />
        </Link>
        <Link href="/challenges">
            <Card 
                title="daily challenges"
                text={<p>New challenges every day that <span className="font-extrabold">push you</span> to be the <span className="font-extrabold">best version of yourself.</span></p>}
                icon={TrophyIcon}
                iconColor="#FFD9C7"
                color="#80432E" 
                rotate="8deg" 
                zIndex={10} 
                position="bottom-0 right-[5%]" />
        </Link>
    </>
   );
}
