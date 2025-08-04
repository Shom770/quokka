import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/utils/locale";

export type Locale = (typeof locales)[number];

export const locales = ["en", "es"] as const;
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  let messages;
  switch (locale) {
    case "es":
      messages = (await import("@/messages/es.json")).default;
      break;
    default:
      messages = (await import("@/messages/en.json")).default;
      break;
  }

  return {
    locale,
    messages,
  };
});