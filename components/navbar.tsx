"use client";

import Link from "next/link";
import Image from "next/image";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { useSession, signOut } from "next-auth/react";
import { rethinkSans } from "@/components/fonts";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const isLoginPage = pathname === "/login";

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
    <div className="flex flex-row items-center justify-between w-full pt-8 px-20 h-[10vh]">
      <Link href="/">
        <div className="-space-y-3 hover:opacity-80 transition-opacity duration-200">
          <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[40px] text-orange-600`}>
            quokka
          </h1>
          <h1 className="font-medium text-orange-600">
            Be the best version of yourself
          </h1>
        </div>
      </Link>

      <div className="flex items-center space-x-6">
        {/* Removed the standalone Stats link here */}
        
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
                    My Stats
                  </Link>
                  {!isLoginPage && (
                    <Link 
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                  >
                    Log out
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
      </div>
    </div>
  );
}