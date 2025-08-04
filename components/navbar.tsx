"use client";

import Link from "next/link";
import Image from "next/image";
import { Cog6ToothIcon, FireIcon, StarIcon } from "@heroicons/react/24/solid";
import { useSession, signOut } from "next-auth/react";
import { rethinkSans } from "@/components/fonts";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations("navbar");
  const { data: session } = useSession();
  const [streakCount, setStreakCount] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);
  const [prevPoints, setPrevPoints] = useState(0);
  // new display states for count-up
  const [displayedStreak, setDisplayedStreak] = useState(0);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  // Helper to refetch streak
  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/streak", {
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as { streak_count: number };
        setStreakCount(data.streak_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch streak", error);
    }
  };

  // Fetch points helper
  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/points", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { points: number };
        setPointsCount(data.points);
      }
    } catch (err) {
      console.error("Failed to fetch points", err);
    }
  };

  // fetch on session change
  useEffect(() => {
    if (!session) return;

    // initial load
    fetchStreak();
    fetchPoints();

    // handle your custom event
    const handleStatsUpdate = () => {
      fetchStreak();
      fetchPoints();
    };

    window.addEventListener("statsUpdate", handleStatsUpdate);
    return () => {
      window.removeEventListener("statsUpdate", handleStatsUpdate);
    };
  }, [session]);

  // animate points count-up
  useEffect(() => {
    // Only animate if pointsCount actually changed
    if (pointsCount === displayedPoints) return;

    const start = prevPoints;
    const end = pointsCount;
    const duration = 800;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      setDisplayedPoints(value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    setPrevPoints(pointsCount);
  }, [pointsCount]);

  // animate streak count-up
  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayedStreak(Math.floor(progress * streakCount));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [streakCount]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <motion.div
      className="flex flex-row items-center justify-between w-full pt-8 px-20 h-[10vh]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 3.3 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 3.5, ease: "easeOut" }}
      >
        <Link href="/">
          <div className="-space-y-3 hover:opacity-80 transition-opacity duration-200">
            <h1
              className={`${rethinkSans.className} antialiased font-extrabold text-[40px] text-orange-600`}
            >
              quokka
            </h1>
            <h1 className="font-medium text-orange-600">{t("subtitle")}</h1>
          </div>
        </Link>
      </motion.div>

      <motion.div
        className="flex items-center space-x-6"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 3.7, ease: "easeOut" }}
      >
        {session && !isLoginPage && (
          <>
            {/* Points Badge */}
            <Link href="/stats" aria-label="View your points">
              <motion.div className="flex items-center bg-gradient-to-r from-yellow-100 to-yellow-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition">
                <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <span
                  className={`${rethinkSans.className} text-yellow-600 font-medium text-sm`}
                >
                  {displayedPoints}
                </span>
              </motion.div>
            </Link>

            {/* Streak Badge */}
            <Link href="/stats" aria-label="View your streak">
              <motion.div className="flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition">
                <FireIcon className="w-5 h-5 text-orange-600 mr-2" />
                <span
                  className={`${rethinkSans.className} text-orange-600 font-medium text-sm`}
                >
                  {t("streak", { count: displayedStreak })}
                </span>
              </motion.div>
            </Link>
          </>
        )}

        <div className="relative" ref={dropdownRef}>
          {session?.user?.image ? (
            <div>
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Profile"}
                width={40}
                height={40}
                className="rounded-full cursor-pointer hover:opacity-80 hover:scale-110 transition-[transform, opacity] duration-500"
                onClick={toggleDropdown}
              />

              <div
                className={`
                  absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10
                  transform transition-all duration-300 ease-in-out origin-top-right
                  ${
                    isDropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }
                `}
              >
                <div className="py-1">
                  <h1 className="px-4 py-2 text-sm font-semibold text-gray-700">
                    {session?.user?.name}
                  </h1>
                  <Link
                    href="/stats"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t("stats")}
                  </Link>
                  {!isLoginPage && (
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t("settings")}
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  >
                    {t("logout")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            !isLoginPage && (
              <Link href="/settings">
                <Cog6ToothIcon className="w-12 h-12 text-orange-600" />
              </Link>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
