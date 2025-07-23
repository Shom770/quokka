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
    <Link className={`flex flex-row items-center justify-around ${backgroundColor} rounded-[36px] w-full h-full py-6 transition-colors duration-300`} href={link}>
      <div className="relative w-2/5 h-1/2 flex justify-center items-center px-3">
        <p className="text-6xl">{icon}</p>
      </div>
      <div className="space-y-2 w-3/5">
        <p className={`${rethinkSans.className} text-black font-bold text-[28px] leading-tight`}>{title}</p>
        <p className={`text-black ${inter.className} text-sm font-light w-5/6`}>{description}</p>
      </div>
    </Link>
  )
}
