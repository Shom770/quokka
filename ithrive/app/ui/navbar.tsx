import Link from "next/link";
import { Cog6ToothIcon, HeartIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { inter, rethinkSans } from "@/app/ui/fonts";

export default function Navbar() {
    return (
        <div className="flex flex-row items-center justify-between w-full p-20 h-[15vh]">
            <div className="flex flex-row items-center justify-center gap-6 relative">
                {/* Sparkles */}
                <div className="relative w-20 h-20 rounded-full bg-blue-200">
                    <HeartIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-500" />
                </div>
                <div className="-space-y-3">
                    <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[40px] text-blue-500`}>iTHRiVE</h1>
                    <h1 className={`${inter.className} antialiased text-blue-500`}>For students, by students</h1>
                </div>
            </div>
            <Link 
                href="/settings" 
                className="flex flex-row items-center justify-center gap-2 bg-blue-500/25 hover:bg-blue-600/35 px-7 h-14 rounded-lg">
                <Cog6ToothIcon className="w-8 h-8 text-blue-500" />
                <p className={`${rethinkSans.className} antialiased font-bold text-[20px] text-blue-500`}>Settings</p>
            </Link>
        </div>
    )
}
