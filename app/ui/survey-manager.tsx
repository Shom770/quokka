"use client";

import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import SurveyModal from "./survey-modal";
import { Context } from "../layout-client";

interface SurveyQuestion {
  _id: number;
  question: string;
  type: string;
  scale: string[];
}

export default function SurveyManager() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [surveyTypes, setSurveyTypes] = useState<string[]>([]);
  const [surveyQuestion, setSurveyQuestion] = useState<SurveyQuestion | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);

  const { canShow } = useContext(Context);


  // Pre-cache survey types on mount
  useEffect(() => {
    fetch("https://api.quokka.school/survey/questions/types")
      .then((res) => res.json())
      .then((data) => {
        // Assume data is an array of type strings
        setSurveyTypes(data);
      })
      .catch((err) => {
        console.error("Error fetching survey types:", err);
      });
  }, []);

  // Only trigger survey when returning to the homepage ("/") from a different page
  useEffect(() => {
    if (pathname === "/" && previousPathname.current !== "/") {
      // Roll a 10% chance
      if (Math.random() < 1 && canShow) {
        if (surveyTypes.length > 0) {
          // Determine candidate type from the previous pathname's last segment
          const segments = previousPathname.current.split("/");
          const possibleType = segments[segments.length - 1].toLowerCase();
          const type = surveyTypes.includes(possibleType) ? possibleType : "general";

          // Fetch the random survey question for the determined type
          fetch(`https://api.quokka.school/survey/random/${type}`)
            .then((res) => res.json())
            .then((data: SurveyQuestion) => {
              setSurveyQuestion(data);
              setShowSurvey(true);
            })
            .catch((err) => console.error("Error fetching survey question", err));
        }
      }
    }
    // Update previous pathname
    previousPathname.current = pathname;
  }, [pathname, surveyTypes]);

  // Handle survey response submission
  const handleSurveySubmit = (rating: number) => {
    if (!surveyQuestion) return;
    fetch("https://api.quokka.school/response", {
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
