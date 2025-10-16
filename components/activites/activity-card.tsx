import { inter, rethinkSans } from "@/components/fonts"
import Link from "next/link"

export default function LandingCard({
  title,
  icon,
  backgroundColor,
  link,
  description
}: {
  title: string,
  icon: string,
  backgroundColor: string,
  link: string,
  description: string,
}) {
  return (
    <Link className={`flex flex-row items-center justify-between ${backgroundColor} rounded-2xl md:rounded-[36px] w-full h-full py-3 md:py-6 px-4 md:px-6 transition-colors duration-300 overflow-hidden`} href={link}>
      <div className="relative w-1/4 md:w-2/5 flex justify-center items-center flex-shrink-0">
        <p className="text-3xl md:text-6xl">{icon}</p>
      </div>
      <div className="space-y-0.5 md:space-y-2 flex-1 min-w-0">
        <p className={`${rethinkSans.className} text-black font-bold text-sm md:text-[28px] leading-tight`}>{title}</p>
        <p className={`text-black ${inter.className} text-xs md:text-sm font-light leading-snug line-clamp-2`}>{description}</p>
      </div>
    </Link>
  )
}
