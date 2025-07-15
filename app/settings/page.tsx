"use client";

import { useContext } from "react";
import { rethinkSans } from "../ui/fonts";
import Switch from "../ui/settings/switch";
import { Context } from "../layout-client";
import { motion } from "framer-motion";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Page() {
  const { canShow, setCanShow } = useContext(Context);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full mt-[8vw] gap-8 w-3/5"
    >
      <motion.h1
        variants={itemVariants}
        className={`text-orange-600 font-extrabold text-[46px] leading-[1] ${rethinkSans.className}`}
      >
        Settings
      </motion.h1>

      <motion.div variants={itemVariants} className="w-full">
        <div className="flex justify-between items-center mb-3 px-4">
          <div className="text-xl w-full text-orange-500">Dark mode</div>
          <div className="text-md text-nowrap text-orange-500/70">
            Coming soon...
          </div>
        </div>
        <div className="h-px w-full bg-orange-400/50" />
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <div className="flex justify-between items-center mb-3 px-4">
          <div className="text-xl w-full text-orange-500">
            Allow App Feedback Questions
          </div>
          <Switch enabled={canShow} setEnabled={setCanShow} />
        </div>
        <div className="h-px w-full bg-orange-400/50" />
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <div className="flex justify-between items-center mb-3 px-4">
          <div className="text-xl w-full text-orange-500">Language</div>
          <div className="text-md text-orange-500/70">English</div>
        </div>
        <div className="h-px w-full bg-orange-400/50" />
      </motion.div>
    </motion.div>
  );
}