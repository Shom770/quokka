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
    // Doesn't animate without setTimeout above 100
    setTimeout(() => {
      setVisible(true);
    }, 100);

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
      className={`bg-gradient-to-br from-[#F66B6B]/60 to-[#F5C114]/60 backdrop-blur-xl rounded-lg fixed bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 z-50 w-[95%] max-w-xl ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      }`}
    >
      <div className="p-4 sm:p-6 rounded-2xl shadow-lg w-full">
        <h2 className="text-2xl text-white font-bold mb-4">
          {question.question}
        </h2>
        <div className="flex justify-between sm:px-4 md:px-6 w-full">
          {question.scale.map((icon, index) => {
            const rating = index + 1;
            return (
              <button
                key={rating}
                onClick={() => handleAnswer(rating)}
                className="duration-150 text-2xl sm:text-3xl bg-white hover:brightness-90 rounded-xl px-1 sm:px-3 py-2"
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
