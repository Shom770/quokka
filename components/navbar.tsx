"use client";

import Link from "next/link";
import Image from "next/image";
import { Cog6ToothIcon, FireIcon, StarIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useSession, signOut } from "next-auth/react";
import { rethinkSans } from "@/components/fonts";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import NavbarLevel from "@/components/navbar-level";

export default function Navbar() {
  const t = useTranslations("navbar");
  const { data: session } = useSession();
  const [streakCount, setStreakCount] = useState(0);
  const [pointsCount, setPointsCount] = useState(0);
  const [displayedStreak, setDisplayedStreak] = useState(0);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPointsRef = useRef(0);

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
    const start = prevPointsRef.current;
    const end = pointsCount;
    const duration = 1000;
    const startTime = performance.now();

    // Ease-out function: easeOutCubic
    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = Math.floor(start + (end - start) * eased);
      setDisplayedPoints(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);

    prevPointsRef.current = pointsCount;
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

  const toggleMobileMenu = () => {
    console.log('Mobile menu toggled:', !isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <motion.div
        className="relative flex flex-row items-center justify-between w-full px-8 md:px-20 h-[10vh] border-b border-orange-400/25 md:border-b-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }} // <-- reduced delay
      >
        <Link href="/">
          <div className="hover:opacity-80 transition-opacity duration-200">
            <h1
              className={`${rethinkSans.className} antialiased font-extrabold text-3xl md:text-[40px] text-orange-600`}
            >
              quokka
            </h1>
            <h1 className="hidden md:block font-medium text-orange-600 text-base">{t("subtitle")}</h1>
          </div>
        </Link>
      </motion.div>

      <motion.div
        className="flex items-center space-x-2 md:space-x-6"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
      >
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
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

              {/* Level Component */}
              <NavbarLevel totalPoints={pointsCount} />

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
        </div>

        {/* Mobile Hamburger Menu */}
        {!isLoginPage && (
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        )}

        {/* Profile Section */}
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
                  absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50
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
                  <Link
                    href="/calendar"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t("calendar")}
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
                  <Link
                    href="https://data.quokka.school/feedback/issues"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {t("feedback")}
                  </Link>
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
                <Cog6ToothIcon className="w-8 h-8 md:w-12 md:h-12 text-orange-600" />
              </Link>
            )
          )}
        </div>
      </motion.div>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && !isLoginPage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden fixed top-[10vh] left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Stats Row - Smaller (only show if logged in) */}
              {session && (
                <div className="flex items-center justify-center space-x-3 mb-3">
                  {/* Points Badge */}
                  <Link href="/stats" aria-label="View your points">
                    <div className="flex items-center bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1.5 rounded-full shadow-sm">
                      <StarIcon className="w-4 h-4 text-yellow-500 mr-1.5" />
                      <span className={`${rethinkSans.className} text-yellow-600 font-medium text-sm`}>
                        {displayedPoints}
                      </span>
                    </div>
                  </Link>

                  {/* Level Badge - Small Pill */}
                  <Link href="/stats" aria-label="View your level">
                    <div className="flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 px-3 py-1.5 rounded-full shadow-sm">
                      <span className={`${rethinkSans.className} text-orange-600 font-medium text-sm`}>
                        Level {Math.floor(pointsCount / 100) + 1}
                      </span>
                    </div>
                  </Link>

                  {/* Streak Badge */}
                  <Link href="/stats" aria-label="View your streak">
                    <div className="flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 px-3 py-1.5 rounded-full shadow-sm">
                      <FireIcon className="w-4 h-4 text-orange-600 mr-1.5" />
                      <span className={`${rethinkSans.className} text-orange-600 font-medium text-sm`}>
                        {t("streak", { count: displayedStreak })}
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                <Link
                  href="/reflection"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Mental Health Reflection</span>
                </Link>
                <Link
                  href="/resources"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Mental Health Resources</span>
                </Link>
                <Link
                  href="/activities"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-medium">Activities</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
