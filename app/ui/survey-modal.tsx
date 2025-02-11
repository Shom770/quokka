import React, { useEffect, useRef, useState } from "react";

interface SurveyQuestion {
  _id: number;
  question: string;
  type: string;
  scale: string[];
}

interface SurveyModalProps {
  question: SurveyQuestion;
  onSubmit: (rating: number) => void;
  onClose: () => void;
}

export default function SurveyModal({
  question,
  onSubmit,
  onClose,
}: SurveyModalProps) {
  const [visible, setVisible] = useState(false);
  const autoDismissTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animate in immediately.
    setVisible(true);
    autoDismissTimer.current = setTimeout(() => {
      // Trigger exit animation.
      setVisible(false);
      // Wait for the exit animation to finish (500ms) before unmounting.
      setTimeout(() => {
        onClose();
      }, 500);
    }, 10000);

    return () => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }
    };
  }, [onClose]);

  const handleAnswer = (rating: number) => {
    // Clear the auto-dismiss timer if still running
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
    }
    // Trigger exit animation.
    setVisible(false);
    // After exit animation, submit the answer.
    setTimeout(() => {
      onSubmit(rating);
    }, 500);
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 z-50 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl text-black font-bold mb-4">{question.question}</h2>
        <div className="flex justify-center space-x-4">
          {question.scale.map((icon, index) => {
            const rating = index + 1;
            return (
              <button
                key={rating}
                onClick={() => handleAnswer(rating)}
                className="text-3xl"
              >
                {icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}