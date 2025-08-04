"use client";

import { useContext, useState, useEffect } from "react";
import { rethinkSans } from "@/components/fonts";
import Switch from "@/components/settings/switch";
import { Context } from "@/app/layout-client";
import { motion } from "framer-motion";
import { setUserLocale, getUserLocale } from "@/utils/locale";
import { useTranslations } from "next-intl";

export const runtime = "edge";

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
  const [locale, setLocale] = useState<"en" | "es">("en");
  const t = useTranslations("settings");

  // Load the user's locale on mount
  useEffect(() => {
    async function fetchLocale() {
      const userLocale = await getUserLocale();
      if (userLocale === "en" || userLocale === "es") {
        setLocale(userLocale);
      }
    }
    fetchLocale();
  }, []);

  const handleLocaleChange = async (newLocale: "en" | "es") => {
    setLocale(newLocale);
    await setUserLocale(newLocale);
  };

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
        {t("title")}
      </motion.h1>
      <motion.div variants={itemVariants} className="w-full">
        <div className="flex justify-between items-center mb-3 px-4">
          <div className="text-xl w-full text-orange-500">
            {t("allowFeedback")}
          </div>
          <Switch enabled={canShow} setEnabled={setCanShow} />
        </div>
        <div className="h-px w-full bg-orange-400/50" />
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <div className="flex justify-between items-center mb-3 px-4">
          <div className="text-xl w-full text-orange-500">{t("language")}</div>
          <div className="flex gap-2">
            <button
              className={`text-md px-2 py-1 rounded ${
                locale === "en"
                  ? "bg-orange-500 text-white"
                  : "text-orange-500/70 border border-orange-400"
              }`}
              onClick={() => handleLocaleChange("en")}
            >
              {t("english")}
            </button>
            <button
              className={`text-md px-2 py-1 rounded ${
                locale === "es"
                  ? "bg-orange-500 text-white"
                  : "text-orange-500/70 border border-orange-400"
              }`}
              onClick={() => handleLocaleChange("es")}
            >
              {t("spanish")}
            </button>
          </div>
        </div>
        <div className="h-px w-full bg-orange-400/50" />
      </motion.div>
    </motion.div>
  );
}