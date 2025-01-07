import Link from "next/link";
import { Cog6ToothIcon, HeartIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { inter, rethinkSans } from "@/app/ui/fonts";

export default function Navbar() {
    return (
        <div className="flex flex-row items-center justify-between w-full pt-20 px-16 h-[10vh]">
            <div className="flex flex-row items-center justify-center gap-6 relative">
                <HeartIcon className="w-16 h-16 text-blue-600" />
                <div className="-space-y-3">
                    <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[40px] text-blue-600`}>iTHRiVE</h1>
                    <h1 className={`${inter.className} antialiased text-blue-600`}>For students, by students</h1>
                </div>
            </div>
            <Link 
                href="/settings" 
                className="flex flex-row items-center justify-center gap-2 bg-blue-500/25 hover:bg-blue-600/25 px-7 h-14 rounded-lg border border-blue-600">
                <Cog6ToothIcon className="w-8 h-8 text-blue-600" />
                <p className={`${rethinkSans.className} antialiased font-bold text-[20px] text-blue-600`}>Settings</p>
            </Link>
        </div>
    )
}
