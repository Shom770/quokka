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
    return (
      <motion.div
        ref={ref}
        key={title}
        className={`absolute ${position} flex flex-col px-8 items-center justify-around py-4 gap-2 w-[360px] h-[400px] rounded-2xl transition-all duration-150 ease-in-out`}
        style={{
          backgroundColor: color,
          zIndex: zIndex,
        }}
        whileHover={{
          zIndex: 20, // Elevate on hover
          transform: `rotate(${rotate}) scale(1.07)`,
          transition: {
            type: "spring",
            stiffness: 100, // Adjust for bounciness
            damping: 10, // Controls the smoothness
          },
        }}
        initial={{
          opacity: 0,
          y: 20,
          transform: `rotate(${rotate}) scale(1.0)`,
        }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeInOut", delay: delay },
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
