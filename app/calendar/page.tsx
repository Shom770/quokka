"use client";

import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import { rethinkSans } from "@/components/fonts";
import type {
  CalendarAssignment,
  CalendarAssignmentPayload,
} from "@/utils/ical";
import { Context } from "@/app/layout-client";

type DisplayAssignment = CalendarAssignment & {
  displayStart: Date;
  displayEnd?: Date;
};

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

function mapAssignmentsFromPayload(
  payload: CalendarAssignmentPayload[] | undefined
): CalendarAssignment[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.reduce<CalendarAssignment[]>((accumulator, item) => {
    const parseDate = (value: string | undefined) => {
      if (!value) {
        return undefined;
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return undefined;
      }
      if (item.allDay) {
        return new Date(
          parsed.getUTCFullYear(),
          parsed.getUTCMonth(),
          parsed.getUTCDate()
        );
      }
      return parsed;
    };

    const start = parseDate(item.start);
    if (!start) {
      return accumulator;
    }

    const end = parseDate(item.end);

    accumulator.push({
      uid: item.uid,
      title: item.title,
      start,
      end,
      description: item.description,
      location: item.location,
      allDay: item.allDay,
    });

    return accumulator;
  }, []);
}

function normalizeAllDayDate(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatAssignmentDate(date: Date, allDay: boolean) {
  const dateToFormat = allDay ? normalizeAllDayDate(date) : date;

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateToFormat);
}

function formatAssignmentTimeRange(
  start: Date,
  end: Date | undefined,
  allDay: boolean
) {
  if (allDay) {
    return "";
  }

  const hasValidStart = !Number.isNaN(start.getTime());
  if (!hasValidStart) {
    return "";
  }

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
  });

  const startTime = timeFormatter.format(start);
  if (end && !Number.isNaN(end.getTime())) {
    const endTime = timeFormatter.format(end);
    if (endTime !== startTime) {
      return `${startTime} – ${endTime}`;
    }
  }

  return startTime;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarImportPage() {
  const t = useTranslations("calendar");
  const { motivationMode, setMotivationMode } = useContext(Context);
  const [feedUrl, setFeedUrl] = useState("");
  const [assignments, setAssignments] = useState<CalendarAssignment[]>([]);
  const [viewState, setViewState] = useState<"boot" | "needsUrl" | "ready">(
    "boot"
  );
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showForm, setShowForm] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedAssignments, setExpandedAssignments] = useState<
    Record<string, boolean>
  >({});
  const [showMotivationModal, setShowMotivationModal] = useState(false);

  const fetchStoredAssignments = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setIsFetching(true);
      }
      setError(null);

      try {
        const response = await fetch("/api/calendar/ical", {
          method: "GET",
          cache: "no-store",
        });
        let data: {
          assignments?: CalendarAssignmentPayload[];
          message?: string;
        } = {};
        try {
          data = (await response.json()) as {
            assignments?: CalendarAssignmentPayload[];
            message?: string;
          };
        } catch {
          data = {};
        }

        if (response.status === 404) {
          setAssignments([]);
          setLastUpdated(null);
          setViewState("needsUrl");
          setShowForm(true);
          return "missing" as const;
        }

        if (!response.ok) {
          const message =
            typeof data.message === "string"
              ? data.message
              : t("fetchError");
          throw new Error(message);
        }

        const mapped = mapAssignmentsFromPayload(data.assignments);
        setAssignments(mapped);
        setLastUpdated(new Date());
        setViewState("ready");
        setShowForm(false);
        setError(null);
        return "ready" as const;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("unexpectedError");
        setError(message);
        setViewState((prev) => {
          if (prev === "boot") {
            setShowForm(true);
            return "needsUrl";
          }
          return prev;
        });
        return "error" as const;
      } finally {
        if (!silent) {
          setIsFetching(false);
        }
      }
    },
    [t]
  );

  useEffect(() => {
    void fetchStoredAssignments();
  }, [fetchStoredAssignments]);

  useEffect(() => {
    setExpandedAssignments({});
  }, [assignments, motivationMode]);

  useEffect(() => {
    if (motivationMode) {
      setShowMotivationModal(false);
    }
  }, [motivationMode]);

  const shiftDateForMotivation = useCallback(
    (input: Date) => {
      if (!motivationMode) {
        return input;
      }
      const cloned = new Date(input);
      if (Number.isNaN(cloned.getTime())) {
        return input;
      }
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const candidateDay = new Date(
        cloned.getFullYear(),
        cloned.getMonth(),
        cloned.getDate()
      );
      if (candidateDay <= todayStart) {
        return input;
      }
      cloned.setDate(cloned.getDate() - 1);
      return cloned;
    },
    [motivationMode]
  );

  const displayedAssignments = useMemo<DisplayAssignment[]>(
    () =>
      assignments.map((assignment) => {
        const displayStart = shiftDateForMotivation(assignment.start);
        const displayEnd = assignment.end
          ? shiftDateForMotivation(assignment.end)
          : undefined;
        return {
          ...assignment,
          displayStart,
          displayEnd,
        };
      }),
    [assignments, shiftDateForMotivation]
  );

  const visibleAssignments = useMemo<DisplayAssignment[]>(() => {
    if (!displayedAssignments.length) return [];
    const now = new Date();

    return displayedAssignments.filter((item) => {
      const startTime = item.displayStart.getTime();
      const endTime = item.displayEnd?.getTime() ?? startTime;

      if (Number.isNaN(startTime)) {
        return false;
      }

      if (!Number.isNaN(endTime) && endTime >= now.getTime()) {
        return true;
      }

      const startIsToday = isSameDay(item.displayStart, now);
      const endIsToday =
        item.displayEnd && !Number.isNaN(endTime)
          ? isSameDay(item.displayEnd, now)
          : false;

      return startIsToday || endIsToday;
    });
  }, [displayedAssignments]);

  const weekdayLabels = useMemo(() => {
    const base = new Date(Date.UTC(2021, 0, 3)); // Sunday baseline
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
        date
      );
    });
  }, []);

  const calendarMeta = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfGrid = new Date(startOfMonth);
    startOfGrid.setDate(startOfGrid.getDate() - startOfMonth.getDay());

    const assignmentsByDay = new Map<string, DisplayAssignment[]>();
    displayedAssignments.forEach((assignment) => {
      const key = toDateKey(assignment.displayStart);
      const existing = assignmentsByDay.get(key);
      if (existing) {
        existing.push(assignment);
      } else {
        assignmentsByDay.set(key, [assignment]);
      }
    });

    const days = Array.from({ length: 42 }, (_, index) => {
      const day = new Date(startOfGrid);
      day.setDate(startOfGrid.getDate() + index);
      const key = toDateKey(day);
      const assignmentsForDay = assignmentsByDay.has(key)
        ? [...(assignmentsByDay.get(key) ?? [])].sort(
            (a, b) =>
              a.displayStart.getTime() - b.displayStart.getTime()
          )
        : [];

      return {
        date: day,
        assignments: assignmentsForDay,
        isCurrentMonth: day.getMonth() === startOfMonth.getMonth(),
        isToday: isSameDay(day, now),
      };
    });

    const monthLabel = new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(startOfMonth);

    return { days, monthLabel };
  }, [displayedAssignments]);

  const calendarDays = calendarMeta.days;
  const calendarMonthLabel = calendarMeta.monthLabel;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedUrl.trim()) {
      setError(t("inputError"));
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/calendar/ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl.trim() }),
        cache: "no-store",
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        const message = typeof data.message === "string"
          ? data.message
          : t("fetchError");
        throw new Error(message);
      }

      const result = await fetchStoredAssignments();
      if (result === "ready") {
        setFeedUrl("");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("unexpectedError");
      setError(message);
      if (viewState !== "ready") {
        setAssignments([]);
        setLastUpdated(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShowForm = viewState === "needsUrl" || showForm;
  const hasAnyAssignments = displayedAssignments.length > 0;
  const hasVisibleAssignments = visibleAssignments.length > 0;
  const isBootLoading =
    viewState === "boot" && (isFetching || !hasAnyAssignments);

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
          className={`${rethinkSans.className} antialiased text-orange-600 font-extrabold text-3xl sm:text-4xl md:text-5xl leading-[1.05] px-4`}
        >
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
          {t("description")}
        </p>
      </motion.div>

      <AnimatePresence initial={false}>
        {shouldShowForm && (
          <motion.form
            key="calendar-form"
            onSubmit={handleSubmit}
            className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-orange-100/70 p-5 sm:p-6 md:p-7 space-y-4 sm:space-y-5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.25 } }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
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
              <div className="flex flex-col w-full gap-2 sm:flex-row sm:w-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {isSaving ? t("loading") : t("importButton")}
                </button>
                {viewState === "ready" && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFeedUrl("");
                      setError(null);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-200 px-6 py-3 text-sm sm:text-base font-semibold text-orange-600 transition hover:bg-orange-50"
                  >
                    {t("cancelButton")}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {viewState === "ready" && !shouldShowForm && (
          <motion.div
            key="calendar-actions"
            className="w-full max-w-3xl mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-col gap-1">
              {lastUpdated && (
                <p className="text-xs text-gray-500">
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
              <p className="text-xs text-gray-400">
                {t("manageInSettings")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {!motivationMode && (
                <button
                  type="button"
                  onClick={() => setShowMotivationModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  {t("motivationButton")}
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setViewMode((mode) =>
                    mode === "calendar" ? "list" : "calendar"
                  )
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                {viewMode === "calendar"
                  ? t("viewListButton")
                  : t("viewCalendarButton")}
              </button>
              <button
                type="button"
                onClick={() => {
                  void fetchStoredAssignments();
                }}
                disabled={isFetching}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching ? t("loading") : t("refreshButton")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMotivationModal && !motivationMode && (
          <motion.div
            key="motivation-overlay"
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMotivationModal(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-orange-100 p-6 space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-orange-600">
                {t("motivationModalTitle")}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {t("motivationModalBody")}
              </p>
              <div className="flex flex-col sm:flex-row-reverse sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMotivationMode(true);
                    setShowMotivationModal(false);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600"
                >
                  {t("motivationModalConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMotivationModal(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                >
                  {t("motivationModalCancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {error && !shouldShowForm && (
          <motion.div
            key="calendar-error"
            className="w-full max-w-3xl mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {(viewState !== "needsUrl" || shouldShowForm || isFetching) && (
        <motion.section
          className="w-full mt-12 px-1 max-w-7xl sm:px-0"
          variants={listVariants}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-2 mb-6 px-1">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-orange-700">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-orange-500 shrink-0" />
              {t("sectionTitle")}
            </h2>
            {motivationMode && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full">
                {t("motivationModeActive")}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "calendar" ? (
              <motion.div
                key="calendar-view"
                className="w-full rounded-3xl border border-orange-100 bg-white p-4 sm:p-6 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {isBootLoading || isFetching ? (
                  <motion.div
                    key="calendar-loading"
                    className="flex flex-col items-center justify-center gap-3 py-16 text-orange-500"
                    variants={assignmentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div
                      className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <motion.span
                      className="text-sm font-medium"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                    >
                      {t("loading")}
                    </motion.span>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {calendarMonthLabel}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {t("calendarViewHint")}
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase text-gray-500">
                      {weekdayLabels.map((label) => (
                        <span key={label} className="text-center tracking-wide">
                          {label}
                        </span>
                      ))}
                    </div>
                    <motion.div
                      className="mt-2 grid grid-cols-7 gap-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {calendarDays.map((day) => {
                        const dayKey = toDateKey(day.date);
                        return (
                          <div
                            key={dayKey}
                            className={`rounded-2xl border p-2 flex flex-col gap-2 min-h-[120px] transition shadow-sm ${
                              day.isCurrentMonth
                                ? "bg-white border-orange-100"
                                : "bg-gray-50 border-gray-100 text-gray-400"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold ${
                                  day.isCurrentMonth
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {day.date.getDate()}
                              </span>
                              {day.isToday && (
                                <span className="text-[10px] font-semibold text-orange-500 bg-orange-100/80 px-2 py-0.5 rounded-full">
                                  {t("calendarTodayLabel")}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                              {day.assignments.length === 0 && day.isCurrentMonth ? (
                                <span className="text-[11px] text-gray-300">
                                  {t("calendarEmptyDay")}
                                </span>
                              ) : (
                                day.assignments.map((assignment) => {
                              const assignmentKey =
                                assignment.uid ??
                                `${assignment.title}-${assignment.displayStart.getTime()}`;
                              const timeLabel = formatAssignmentTimeRange(
                                assignment.displayStart,
                                assignment.displayEnd,
                                assignment.allDay
                              );
                              const detailLabel =
                                timeLabel ||
                                (assignment.allDay
                                  ? t("calendarAllDay")
                                  : "");
                              return (
                                <div
                                  key={assignmentKey}
                                  className="rounded-xl border border-orange-100 bg-orange-50 px-2 py-1"
                                >
                                  <p className="text-[11px] font-semibold text-orange-700 truncate">
                                    {assignment.title}
                                  </p>
                                  {detailLabel ? (
                                    <p className="text-[11px] text-orange-600">
                                      {detailLabel}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            })
                          )}
                        </div>
                          </div>
                        );
                      })}
                    </motion.div>
                    {!hasAnyAssignments && (
                      <motion.p
                        className="mt-6 text-sm text-gray-500 text-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        {t("calendarNoAssignmentsMonth")}
                      </motion.p>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <AnimatePresence mode="wait">
                  {isBootLoading || isFetching ? (
                    <motion.div
                      key="loading"
                      className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-8 sm:p-10 text-orange-500"
                      variants={assignmentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                      <span className="text-sm font-medium">{t("loading")}</span>
                    </motion.div>
                  ) : viewState === "ready" && hasVisibleAssignments ? (
                    <motion.div
                      key="assignments"
                      className="flex flex-col gap-4 mb-12"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {visibleAssignments.map((assignment) => {
                        const key =
                          assignment.uid ??
                          `${assignment.title}-${assignment.displayStart.getTime()}`;
                        const timeLabel = formatAssignmentTimeRange(
                          assignment.displayStart,
                          assignment.displayEnd,
                          assignment.allDay
                        );
                        const isExpanded = expandedAssignments[key] ?? false;
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
                              <div className="space-y-2 w-full">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                  {assignment.title}
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                                  <p className="text-sm font-medium text-orange-600">
                                    {formatAssignmentDate(
                                      assignment.displayStart,
                                      assignment.allDay
                                    )}
                                  </p>
                                  {timeLabel || assignment.allDay ? (
                                    <p className="text-sm text-gray-500 sm:text-right">
                                      {timeLabel || t("calendarAllDay")}
                                    </p>
                                  ) : null}
                                </div>
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
                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedAssignments((prev) => ({
                                      ...prev,
                                      [key]: !isExpanded,
                                    }))
                                  }
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
                                >
                                  {isExpanded
                                    ? t("hideDetails")
                                    : t("showDetails")}
                                  <motion.span
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="inline-flex"
                                  >
                                    <ChevronDownIcon className="h-4 w-4" />
                                  </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      key={`description-${key}`}
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: "easeOut" }}
                                      className="overflow-hidden"
                                    >
                                      <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                                        {assignment.description}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </motion.article>
                        );
                      })}
                    </motion.div>
                  ) : viewState === "ready" && hasAnyAssignments ? (
                    <motion.div
                      key="caught-up"
                      className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-7 text-center text-amber-700 shadow-sm"
                      variants={assignmentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {t("caughtUpMessage")}
                    </motion.div>
                  ) : viewState === "ready" ? (
                    <motion.div
                      key="empty"
                      className="rounded-3xl border border-orange-100/70 bg-white p-8 sm:p-10 text-center text-orange-600 shadow-sm"
                      variants={assignmentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {t("emptyFeed")}
                    </motion.div>
                  ) : (
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
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}
    </motion.div>
  );
}
