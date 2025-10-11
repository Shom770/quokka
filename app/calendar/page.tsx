"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import { rethinkSans } from "@/components/fonts";
import type {
  CalendarAssignment,
  CalendarAssignmentPayload,
} from "@/utils/ical";

export const runtime = "edge";

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const listVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const assignmentVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } },
};

function formatAssignmentTime(assignment: CalendarAssignment) {
  const { start, end, allDay } = assignment;

  if (allDay) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(start);
  }

  const startFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const endFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
  });

  if (end) {
    return `${startFormatter.format(start)} – ${endFormatter.format(end)}`;
  }

  return startFormatter.format(start);
}

export default function CalendarImportPage() {
  const t = useTranslations("calendar");
  const [feedUrl, setFeedUrl] = useState("");
  const [assignments, setAssignments] = useState<CalendarAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const upcomingAssignments = useMemo(() => {
    if (!assignments.length) return [];
    const now = new Date();
    return assignments.filter((item) => item.end
      ? item.end.getTime() >= now.getTime()
      : item.start.getTime() >= now.getTime()
    );
  }, [assignments]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedUrl.trim()) {
      setError(t("inputError"));
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/calendar/ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl.trim() }),
        cache: "no-store",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        const message = typeof data.message === "string"
          ? data.message
          : t("fetchError");
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        assignments?: CalendarAssignmentPayload[];
      };

      const parsed = Array.isArray(payload.assignments)
        ? payload.assignments
        : [];

      const mapped: CalendarAssignment[] = parsed
        .map((item) => ({
          uid: item.uid,
          title: item.title,
          start: new Date(item.start),
          end: item.end ? new Date(item.end) : undefined,
          description: item.description,
          location: item.location,
          allDay: item.allDay,
        }))
        .filter(
          (item) => !Number.isNaN(item.start.getTime())
        );

      setAssignments(mapped);
      setLastUpdated(new Date());

      if (!mapped.length) {
        setError(t("emptyFeed"));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("unexpectedError");
      setError(message);
      setAssignments([]);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAssignments = assignments.length > 0;

  return (
    <motion.div
      className="flex flex-col items-center w-full min-h-screen py-12 px-4 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col items-center text-center gap-4 mb-10 w-full max-w-4xl"
        variants={containerVariants}
      >
        <div className="flex items-center justify-center gap-3 rounded-full bg-orange-100 px-5 py-2 text-sm sm:text-base font-semibold text-orange-600 border border-orange-200">
          <CalendarDaysIcon className="h-5 w-5 flex-shrink-0" />
          <span>{t("badge")}</span>
        </div>
        <h1
          className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-3xl sm:text-4xl md:text-[46px] leading-[1.05] px-4`}
        >
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
          {t("description")}
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-orange-100/70 p-5 sm:p-6 md:p-7 space-y-4 sm:space-y-5"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <label htmlFor="calendar-url" className="sr-only">
            {t("inputLabel")}
          </label>
          <div className="relative flex-1 flex items-center rounded-2xl border border-orange-200 bg-orange-50/60 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-400 transition">
            <LinkIcon className="ml-3 mr-2 h-5 w-5 text-orange-500 flex-shrink-0" />
            <input
              id="calendar-url"
              type="url"
              required
              placeholder={t("placeholder")}
              value={feedUrl}
              onChange={(event) => setFeedUrl(event.target.value)}
              className="w-full bg-transparent pr-4 py-3 text-sm sm:text-base text-gray-800 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300 md:w-40"
          >
            {isLoading ? t("loading") : t("importButton")}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {lastUpdated && !error && (
          <p className="text-xs text-gray-500 text-right md:text-left">
            {t("lastUpdated", {
              timestamp: new Intl.DateTimeFormat(undefined, {
                hour: "numeric",
                minute: "numeric",
                month: "short",
                day: "numeric",
              }).format(lastUpdated),
            })}
          </p>
        )}
      </motion.form>

      {!isLoading && assignments.length > 0 && (
        <motion.section
          className="w-full max-w-3xl mt-12 px-1 sm:px-0"
          variants={listVariants}
        >
          <div className="flex items-center gap-2 mb-6 px-1">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-orange-700">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-orange-500 shrink-0" />
              {t("sectionTitle")}
            </h2>
          </div>

          <AnimatePresence>
            {!hasAssignments ? (
              <motion.div
                key="placeholder"
                className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-8 sm:p-10 text-center text-orange-500"
                variants={assignmentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {t("placeholderMessage")}
              </motion.div>
            ) : (
              <motion.div
                key="assignments"
                className="flex flex-col gap-4 mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {upcomingAssignments.map((assignment) => {
                  const key =
                    assignment.uid ??
                    `${assignment.title}-${assignment.start.getTime()}`;
                  return (
                    <motion.article
                      key={key}
                      variants={assignmentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="rounded-3xl border border-orange-100/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-6">
                        <div className="space-y-2 w-full lg:max-w-xl">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                            {assignment.title}
                          </h3>
                          <p className="text-sm font-medium text-orange-600">
                            {formatAssignmentTime(assignment)}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 text-sm text-gray-600">
                          {assignment.location && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-orange-700 text-xs font-semibold">
                              📍 {assignment.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {assignment.description && (
                        <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
                          {assignment.description}
                        </p>
                      )}
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {hasAssignments && upcomingAssignments.length === 0 && (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {t("caughtUpMessage")}
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}
