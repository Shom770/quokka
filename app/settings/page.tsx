"use client";

import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { rethinkSans } from "@/components/fonts";
import Switch from "@/components/settings/switch";
import { Context } from "@/app/layout-client";
import { motion } from "framer-motion";
import { setUserLocale, getUserLocale } from "@/utils/locale";
import { useTranslations } from "next-intl";
import { LinkIcon } from "@heroicons/react/24/solid";

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
  const tCalendar = useTranslations("calendar");
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);
  type CalendarLinkStatus = "loading" | "connected" | "missing" | "error";
  const [calendarStatus, setCalendarStatus] =
    useState<CalendarLinkStatus>("loading");
  const [calendarLink, setCalendarLink] = useState("");
  const [calendarInput, setCalendarInput] = useState("");
  const [calendarFormOpen, setCalendarFormOpen] = useState(false);
  const [calendarSaving, setCalendarSaving] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      const cookie = typeof document !== "undefined" ? document.cookie : "";
      setIsGuest(cookie.split("; ").some((c) => c.startsWith("guest=1")));
    } catch {
      setIsGuest(false);
    }
  }, []);

  const loadCalendarLink = useCallback(async () => {
    setCalendarStatus("loading");
    setCalendarError(null);
    setCalendarSuccess(null);
    try {
      const response = await fetch("/api/calendar/ical", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 404) {
        setCalendarStatus("missing");
        setCalendarLink("");
        setCalendarInput("");
        setCalendarFormOpen(true);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        icalUrl?: string;
        message?: string;
      };

      if (!response.ok) {
        const message =
          typeof data.message === "string"
            ? data.message
            : t("calendarErrorGeneric");
        throw new Error(message);
      }

      const nextUrl = data.icalUrl ?? "";
      setCalendarStatus("connected");
      setCalendarLink(nextUrl);
      setCalendarInput(nextUrl);
      setCalendarFormOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("calendarErrorGeneric");
      setCalendarError(message);
      setCalendarStatus("error");
      setCalendarFormOpen(true);
    }
  }, [t]);

  useEffect(() => {
    void loadCalendarLink();
  }, [loadCalendarLink]);

  const handleLocaleChange = async (newLocale: "en" | "es") => {
    setLocale(newLocale);
    await setUserLocale(newLocale);
  };

  const handleCalendarSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = calendarInput.trim();
    if (!trimmed) {
      setCalendarError(tCalendar("inputError"));
      setCalendarSuccess(null);
      return;
    }

    setCalendarSaving(true);
    setCalendarError(null);
    setCalendarSuccess(null);

    try {
      const response = await fetch("/api/calendar/ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        cache: "no-store",
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        icalUrl?: string;
      };

      if (!response.ok) {
        const message =
          typeof data.message === "string"
            ? data.message
            : t("calendarErrorGeneric");
        throw new Error(message);
      }

      const nextUrl = data.icalUrl ?? trimmed;
      setCalendarLink(nextUrl);
      setCalendarInput(nextUrl);
      setCalendarStatus("connected");
      setCalendarFormOpen(false);
      setCalendarSuccess(t("calendarSaved"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("calendarErrorGeneric");
      setCalendarError(message);
      setCalendarStatus("error");
      setCalendarFormOpen(true);
    } finally {
      setCalendarSaving(false);
    }
  };

  const showCalendarForm =
    calendarFormOpen ||
    calendarStatus === "missing" ||
    calendarStatus === "error";

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

      {isGuest && (
        <motion.div variants={itemVariants} className="w-full">
          <div className="flex justify-between items-center mb-3 px-4">
            <div className="text-xl w-full text-orange-500">Guest mode</div>
            <button
              className="text-md px-2 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 self-start whitespace-nowrap"
              onClick={() => {
                try {
                  // Expire the guest cookie
                  document.cookie = "guest=; Path=/; Max-Age=0; SameSite=Lax";
                } catch {}
                router.push("/login");
              }}
            >
              Exit guest mode
            </button>
          </div>
          <div className="h-px w-full bg-orange-400/50" />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="w-full">
        <div className="rounded-3xl border border-orange-200 bg-white/80 backdrop-blur-sm shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-orange-600">
                {t("calendarSectionTitle")}
              </h2>
              <p className="text-sm text-gray-600">
                {t("calendarSectionDescription")}
              </p>
            </div>
            {calendarStatus === "connected" && !showCalendarForm && (
              <button
                type="button"
                onClick={() => {
                  setCalendarFormOpen(true);
                  setCalendarError(null);
                  setCalendarSuccess(null);
                  setCalendarInput(calendarLink);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                {t("calendarUpdateButton")}
              </button>
            )}
          </div>

          {calendarStatus === "loading" && (
            <div className="text-sm text-gray-500">{tCalendar("loading")}</div>
          )}

          {calendarStatus === "missing" && (
            <p className="text-sm text-orange-600">
              {t("calendarStatusMissing")}
            </p>
          )}

          {calendarStatus === "connected" && !showCalendarForm && (
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              <p className="font-semibold">{t("calendarStatusConnected")}</p>
              {calendarLink && (
                <p className="mt-1 break-words text-orange-600">{calendarLink}</p>
              )}
              <p className="mt-2 text-xs text-orange-500">
                {t("calendarRefreshHint")}
              </p>
            </div>
          )}

          {calendarError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {calendarError}
            </div>
          )}

          {calendarSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {calendarSuccess}
            </div>
          )}

          {showCalendarForm && (
            <form
              onSubmit={handleCalendarSubmit}
              className="space-y-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="settings-calendar-url" className="sr-only">
                  {tCalendar("inputLabel")}
                </label>
                <div className="relative flex-1 flex items-center rounded-2xl border border-orange-200 bg-orange-50/60 transition focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400">
                  <LinkIcon className="ml-3 mr-2 h-5 w-5 text-orange-500 flex-shrink-0" />
                  <input
                    id="settings-calendar-url"
                    type="url"
                    required
                    placeholder={tCalendar("placeholder")}
                    value={calendarInput}
                    onChange={(event) => setCalendarInput(event.target.value)}
                    className="w-full bg-transparent pr-4 py-3 text-sm sm:text-base text-gray-800 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={calendarSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm sm:text-base font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {calendarSaving ? t("calendarSaving") : t("calendarConnectButton")}
                </button>
                {calendarStatus === "connected" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarFormOpen(false);
                      setCalendarError(null);
                      setCalendarSuccess(null);
                      setCalendarInput(calendarLink);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-200 px-5 py-3 text-sm sm:text-base font-semibold text-orange-600 transition hover:bg-orange-50"
                  >
                    {tCalendar("cancelButton")}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
