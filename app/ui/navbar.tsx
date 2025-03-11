import Link from "next/link";
import ExportedImage from "next-image-export-optimizer";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { rethinkSans } from "@/app/ui/fonts";


export default function Navbar() {
   return (
       <div className="flex flex-row items-center justify-between w-full pt-8 px-20 h-[10vh]">
           <Link href="/" className="flex flex-row items-center justify-center">
                <ExportedImage src="/logo.svg" alt="Logo of Quokka" width={100} height={100} />
               <div className="-space-y-3">
                   <h1 className={`${rethinkSans.className} antialiased font-extrabold text-[40px] text-orange-600`}>quokka</h1>
                   <h1 className={`font-medium text-orange-600`}>Be the best version of yourself</h1>
               </div>
           </Link>
           <Link href="/settings">
               <Cog6ToothIcon className="w-12 h-12 text-orange-600" />
           </Link>
       </div>
   )
}
