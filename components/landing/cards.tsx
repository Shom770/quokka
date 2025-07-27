"use client";

import {
  BookmarkIcon,
  BookOpenIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import Card from "./card";
import { RefObject } from "react";

interface CardsProps {
  meditationCardRef: RefObject<HTMLDivElement | null>;
  journalingCardRef: RefObject<HTMLDivElement | null>;
  resourcesCardRef: RefObject<HTMLDivElement | null>;
}

export default function Cards({ meditationCardRef, journalingCardRef, resourcesCardRef }: CardsProps) {
  return (
    <>
      <Link href="/reflection" className="journaling-card">
        <Card
          ref={journalingCardRef}
          title="mental health reflection"
          text={
            <p>
              Reflect on your{" "}
              <span className="font-extrabold">mental health</span> to{" "}
              <span className="font-extrabold">
                understand yourself better.
              </span>
            </p>
          }
          icon={PencilIcon}
          iconColor="#FFE5E5"
          color="#F66B6B"
          rotate="-12deg"
          zIndex={0}
          position="right-[30%] top-0"
          delay={0.6}
        />
      </Link>
      <Link href="/resources" className="resources-card">
        <Card
          ref={resourcesCardRef}
          title="mental health resources"
          text={
            <p>
              When you need help, these resources are{" "}
              <span className="font-extrabold">right at your fingertips.</span>
            </p>
          }
          icon={BookmarkIcon}
          iconColor="#FFE8DC"
          color="#FD906C"
          rotate="0deg"
          zIndex={5}
          position="right-[20%] top-[15%]"
          delay={0.8}
        />
      </Link>
      <Link href="/activities" className="meditation-card">
        <Card
          ref={meditationCardRef}
          title="activities"
          text={
            <p>
              A few activities that encourage you to{" "}
              <span className="font-extrabold">destress</span> and{" "}
              <span className="font-extrabold">put yourself first.</span>
            </p>
          }
          icon={BookOpenIcon}
          iconColor="#FFE5E5"
          color="#B35D40"
          rotate="12deg"
          zIndex={10}
          position="bottom-[15%] right-[12.5%]"
          delay={1.0}
        />
      </Link>
    </>
  );
}
