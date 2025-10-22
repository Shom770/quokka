"use client";

import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import Card from "./card";
import { RefObject } from "react";
import { useTranslations } from "next-intl";

interface CardsProps {
  meditationCardRef: RefObject<HTMLDivElement | null>;
  journalingCardRef: RefObject<HTMLDivElement | null>;
  resourcesCardRef: RefObject<HTMLDivElement | null>;
}

export default function Cards({ meditationCardRef, journalingCardRef, resourcesCardRef }: CardsProps) {
  const t = useTranslations("cards");

  return (
    <>
      <Link href="/reflection" className="journaling-card">
        <Card
          ref={journalingCardRef}
          title={t("journalingTitle")}
          text={
            <p>
              {t.rich("journalingText", {
                bold1: (chunks) => <span className="font-extrabold">{chunks}</span>,
                bold2: (chunks) => <span className="font-extrabold">{chunks}</span>,
              })}
            </p>
          }
          icon={PencilIcon}
          iconColor="#FFE5E5"
          color="#F66B6B"
          rotate="-6deg"
          zIndex={3}
          position="right-[28%] top-[13%]"
          delay={0.6}
        />
      </Link>
      <Link href="/calendar" className="calendar-card">
        <Card
          title={t("calendarTitle")}
          text={
            <p>
              {t.rich("calendarText", {
                bold: (chunks) => <span className="font-extrabold">{chunks}</span>,
              })}
            </p>
          }
          icon={CalendarDaysIcon}
          iconColor="#FFEFD6"
          color="#F7A24C"
          rotate="-12deg"
          zIndex={1}
          position="right-[34%] top-[0%]"
          delay={0.7}
        />
      </Link>
      <Link href="/resources" className="resources-card">
        <Card
          ref={resourcesCardRef}
          title={t("resourcesTitle")}
          text={
            <p>
              {t.rich("resourcesText", {
                bold: (chunks) => <span className="font-extrabold">{chunks}</span>,
              })}
            </p>
          }
          icon={BookmarkIcon}
          iconColor="#FFE8DC"
          color="#FD906C"
          rotate="0deg"
          zIndex={4}
          position="right-[22%] top-[26%]"
          delay={0.9}
        />
      </Link>
      <Link href="/activities" className="meditation-card">
        <Card
          ref={meditationCardRef}
          title={t("activitiesTitle")}
          text={
            <p>
              {t.rich("activitiesText", {
                bold1: (chunks) => <span className="font-extrabold">{chunks}</span>,
                bold2: (chunks) => <span className="font-extrabold">{chunks}</span>,
              })}
            </p>
          }
          icon={BookOpenIcon}
          iconColor="#FFE5E5"
          color="#B35D40"
          rotate="6deg"
          zIndex={10}
          position="top-[39%] right-[16%]"
          delay={1.0}
        />
      </Link>
    </>
  );
}