import { FC, ReactNode, SVGProps, forwardRef } from "react";
import { motion } from "framer-motion";
import { rethinkSans } from "../fonts";

interface CardProps {
  title: string;
  text: ReactNode;
  icon: FC<SVGProps<SVGSVGElement>>;
  color: string;
  iconColor: string;
  rotate: string;
  zIndex: number;
  position: string;
  delay?: number;
}

// Helper to create a lighter version of a hex color by mixing with white
function lightenHex(hex: string, amount: number): string {
  // Normalize hex like #RRGGBB
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return hex;
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const rr = mix(r).toString(16).padStart(2, "0");
  const gg = mix(g).toString(16).padStart(2, "0");
  const bb = mix(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}


const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      text,
      icon: Icon,
      color,
      iconColor,
      rotate,
      zIndex,
      position,
      delay = 0,
    },
    ref
  ) => {
    const lightColor = lightenHex(color, 0.4);
    // build a subtle static noise pattern using SVG
    return (
      <motion.div
        ref={ref}
        key={title}
        className={`absolute ${position} flex flex-col px-8 items-center justify-around py-4 gap-2 w-[360px] h-[400px] rounded-2xl transition-all duration-150 ease-in-out cursor-pointer`}
        style={{
          backgroundColor: color,
          backgroundImage: `radial-gradient(circle at 100% 100%, ${lightColor} 0%, rgba(255,255,255,0) 75%)`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex,
        }}
        whileHover={{
          zIndex: 20,
          transform: `rotate(${rotate}) scale(1.07)`,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 10,
          },
        }}
        initial={{
          opacity: 0,
          y: 20,
          transform: `rotate(${rotate}) scale(1.0)`,
          zIndex,
        }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeInOut", delay },
        }}
      >
        <h1
          className={`text-white text-[28px] font-extrabold ${rethinkSans.className} antialiased`}
        >
          {title}
        </h1>
        <Icon className="w-40 h-40" fill={iconColor} />
        <h1 className={`text-white text-lg text-center leading-[1.2] mb-4`}>
          {text}
        </h1>
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export default Card;
