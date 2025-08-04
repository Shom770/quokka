"use client";

import { useContext, useEffect, useState } from "react";
import SurveyModal from "./survey-modal";
import { Context } from "@/app/layout-client";
import { usePathname } from "next/navigation";

let PROBABILITY = 0.4;
if (process.env.NODE_ENV === "development") {
  PROBABILITY = 1;
}

interface SurveyQuestion {
  _id: number;
  question: string;
  type: string;
  scale: string[];
}

interface SurveyApiResponse {
  success: boolean;
  data: SurveyQuestion;
}

export default function SurveyManager() {
  const pathname = usePathname();
  const [surveyTypes, setSurveyTypes] = useState<string[]>([]);
  const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestion | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const { canShow } = useContext(Context);
  const [surveyAttempted, setSurveyAttempted] = useState(false);
  const [prevPath, setPrevPath] = useState<string>(pathname);

  // Pre-cache survey types on mount, but only if canShow is true
  useEffect(() => {
    if (!canShow) return;
    fetch("https://data.quokka.school/api/surveys/questions/types")
      .then((res) => res.json() as Promise<{ data: string[] }>)
      .then((data) => {
        setSurveyTypes(data.data);
      })
      .catch((err) => {
        console.error("Error fetching survey types:", err);
      });
  }, [canShow]);

  // Track previous pathname
  useEffect(() => {
    if (pathname !== "/") {
      setSurveyAttempted(false); // Reset attempt when leaving root
    }
    setPrevPath(() => pathname);
  }, [pathname]);

  // Trigger survey fetch only when navigating from a non-root page to root
  useEffect(() => {
    if (
      pathname === "/" &&
      prevPath !== "/" &&
      !surveyAttempted &&
      surveyTypes.length > 0 &&
      canShow
    ) {
      // 15% chance to show survey
      if (Math.random() < PROBABILITY) {
        // Determine candidate type from the previous path's last segment
        const segments = prevPath.split("/");
        const possibleType = segments[segments.length - 1].toLowerCase();
        const type = surveyTypes.includes(possibleType) ? possibleType : "general";
        fetch(`https://data.quokka.school/api/surveys/random/${type}`)
          .then((res) => res.json() as Promise<SurveyApiResponse>)
          .then((data) => {
            setSurveyQuestion(data.data);
            setShowSurvey(true);
            setSurveyAttempted(true);
          })
          .catch((err) => {
            console.error("Error fetching survey question", err);
            setSurveyAttempted(true);
          });
      } else {
        setSurveyAttempted(true);
      }
    }
  }, [pathname, prevPath, surveyTypes, canShow, surveyAttempted]);

  // Handle survey response submission
  const handleSurveySubmit = (rating: number) => {
    if (!surveyQuestion) return;
    fetch(`https://data.quokka.school/api/surveys/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question_id: surveyQuestion._id,
        rating: rating,
      }),
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(text);
        }
      })
      .then((data) => {
        console.log("Survey response:", data);
        setShowSurvey(false);
        setSurveyQuestion(null);
      })
      .catch((err) => {
        console.error("Error sending survey response:", err);
      });
  };

  if (!showSurvey || !surveyQuestion) return null;

  return (
    <SurveyModal
      question={surveyQuestion}
      onSubmit={handleSurveySubmit}
      onClose={() => {
        setShowSurvey(false);
        setSurveyQuestion(null);
      }}
    />
  );
}
