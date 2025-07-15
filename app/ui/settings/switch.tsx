"use client";

import { motion } from "framer-motion";

export default function Switch({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30,
  };

  return (
    <motion.div
      className={`flex h-8 w-16 rounded-full items-center p-1 cursor-pointer ${
        enabled ? "justify-end" : "justify-start"
      }`}
      animate={{
        backgroundColor: enabled ? "rgb(251 146 60)" : "rgb(156 163 175)",
      }} // orange-400 and gray-400
      onClick={() => {
        setEnabled(!enabled);
      }}
    >
      <motion.div
        className="size-6 bg-white rounded-full shadow-lg"
        layout
        transition={spring}
      />
    </motion.div>
  );
}