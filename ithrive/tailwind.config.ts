import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { transform: 'scale(1) translateY(0)' },
          '50%': { transform: 'scale(1.25) translateY(-5px)' },
        },
        rainbow: {
          '0%': { transform: 'translateX(0)', opacity: "1" },
          '100%': { transform: 'translateX(50px)', opacity: "0" },
        }
      },
      animation: {
        sparkle: 'sparkle 1s infinite ease-in-out',
        sparkleDelay: 'sparkle 1s infinite ease-in-out 0.5s',
        rainbow: 'rainbow 1s infinite linear',
      },
    },
  },
  plugins: [],
} satisfies Config;
