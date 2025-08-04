"use client";

import Link from "next/link";
import Image from "next/image";
import { Cog6ToothIcon, FireIcon } from "@heroicons/react/24/solid";
import { useSession, signOut } from "next-auth/react";
import { rethinkSans } from "@/components/fonts";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations('navbar');
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [isLoadingStreak, setIsLoadingStreak] = useState(true);
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
        const data = await res.json() as { streak_count: number };
        setStreakCount(data.streak_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch streak", error);
    } finally {
      setIsLoadingStreak(false);
    }
  };

  // Fetch streak on session change
  useEffect(() => {
    if (session) {
      fetchStreak();
    }
  }, [session]);

  // Listen for custom event to refetch streak
  useEffect(() => {
    const handleStreakUpdate = () => {
      if (streakCount === 0) {
        setIsLoadingStreak(true);
        fetchStreak();
      }
    };
    window.addEventListener("streakUpdate", handleStreakUpdate);
    return () => window.removeEventListener("streakUpdate", handleStreakUpdate);
  }, [streakCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[40px] text-orange-600`}>
              quokka
            </h1>
            <h1 className="font-medium text-orange-600">
              {t('subtitle')}
            </h1>
          </div>
        </Link>
      </motion.div>

      <motion.div 
        className="flex items-center space-x-6"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 3.7, ease: "easeOut" }}
      >
        {/* Streak Counter */}
        {session && !isLoginPage && (
          <Link href="/stats" tabIndex={0} aria-label="View your stats">
            <motion.div 
              className="flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:shadow-md transition"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              <FireIcon className="w-5 h-5 text-orange-600 mr-2" />
              {isLoadingStreak ? (
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <span className={`${rethinkSans.className} text-orange-600 font-medium text-sm ml-0.5`}>
                  {t('streak', { count: streakCount })}
                </span>
              )}
            </motion.div>
          </Link>
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
                  ${isDropdownOpen 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-95 pointer-events-none'}
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
                    {t('stats')}
                  </Link>
                  {!isLoginPage && (
                    <Link 
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t('settings')}
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  >
                    {t('logout')}
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