import { FC, SVGProps } from "react"
import { inter } from "@/app/ui/fonts"

export default function LandingCard({
    color,
    svgColor,
    icon: Icon,
    title,
    description

} : {
    color: string,
    svgColor: string,
    icon: FC<SVGProps<SVGSVGElement>>,
    title: string,
    description: string
}) {
    return (
        <div className={`flex flex-row items-center justify-around ${color} rounded-[42px] w-full h-full`}>
            <div className="relative w-2/5 h-1/2">
                <Icon className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${svgColor}`} />
            </div>
            <div className="space-y-2 w-3/5">
                <h1 className="text-black font-bold text-[28px] leading-tight">{title}</h1>
                <p className={`text-black ${inter.className} text-sm font-light w-5/6`}>{description}</p>
            </div>
        </div>
    )
}