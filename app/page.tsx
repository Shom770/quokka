"use client";

import Cards from "@/components/landing/cards";
import { libreBodoni } from "@/components/fonts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const animationVariants = {
  pageContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  },
  leftSection: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 0.2 } }
  },
  rightSection: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.6, delay: 0.4 } }
  },
  gradientBackground: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 1.0, delay: 0.6, type: "spring", stiffness: 100, damping: 15 } },
    hover: { scale: 1.1, opacity: 1, transition: { duration: 0.4 } }
  },
  quoteText: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 1.2, delay: 0.8 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } }
  },
  authorText: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 1.4 } },
    hover: { scale: 1.05, transition: { duration: 0.3 } }
  }
};

export default function Page() {
  const quotes = [
    { quote: '"You must be the change you wish to see in the world."', author: "Mahatma Gandhi" },
    { quote: '"In the middle of difficulty lies opportunity."', author: "Albert Einstein" },
    { quote: '"The only way to do great work is to love what you do."', author: "Steve Jobs" },
    { quote: '"It does not matter how slowly you go as long as you do not stop."', author: "Confucius" },
    { quote: '"Our greatest glory is not in never falling, but in rising every time we fall."', author: "Confucius" },
    { quote: '"The only limit to our realization of tomorrow is our doubts of today."', author: "Franklin D. Roosevelt" },
    { quote: '"The future belongs to those who believe in the beauty of their dreams."', author: "Eleanor Roosevelt" },
    { quote: '"Do not wait to strike till the iron is hot; but make it hot by striking."', author: "William Butler Yeats" },
    { quote: '"What lies behind us and what lies before us are tiny matters compared to what lies within us."', author: "Ralph Waldo Emerson" },
    { quote: '"The best way to predict the future is to create it."', author: "Peter Drucker" },
    { quote: '"You cannot find peace by avoiding life."', author: "Virginia Woolf" },
    { quote: '"The strongest principle of growth lies in the human choice."', author: "George Eliot" },
    { quote: '"Focus more on your desire than on your doubt, and the dream will take care of itself."', author: "Mark Twain" },
    { quote: '"We have to continually be jumping off cliffs and developing our wings on the way down."', author: "Kurt Vonnegut" },
    { quote: '"If a man does not keep pace with his companions, perhaps it is because he hears a different drummer. Let him step to the music which he hears, however measured or far away."', author: "Henry David Thoreau" },
    { quote: '"Start writing, no matter what. The water does not flow until the faucet is turned on."', author: "Louis L’Amour" },
    { quote: '"Get it down. Take chances. It may be bad, but it’s the only way you can do anything really good."', author: "William Faulkner" },
    { quote: '"The first draft is just you telling yourself the story."', author: "Terry Pratchett" },
    { quote: '"You don’t start out writing good stuff. You start out writing crap and thinking it’s good stuff, and then gradually you get better at it."', author: "Octavia E. Butler" },
    { quote: '"Be who you are and say what you feel, because those who mind don’t matter, and those who matter don’t mind."', author: "Bernard M. Baruch" },
    { quote: '"Keep your face always toward the sunshine, and shadows will fall behind you."', author: "Walt Whitman"}
  ];

  const [randomQuote, setRandomQuote] = useState<{quote: string, author: string} | null>(null);

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!randomQuote) return null; // or a loading spinner

  return (
    <motion.div 
      className="flex flex-row items-center justify-between w-4/5 h-full"
      {...animationVariants.pageContainer}
    >
      <motion.div 
        className="flex items-center justify-center relative w-[50%] h-[80%]"
        {...animationVariants.leftSection}
      >
        <Cards />
      </motion.div>
      <motion.div 
        className="relative flex flex-col justify-center w-2/5 h-2/5 gap-2"
        {...animationVariants.rightSection}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.3 }
        }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#F66B6B]/90 to-[#F5C114]/90 blur-[150px] rounded-xl z-0" 
          {...animationVariants.gradientBackground}
          whileHover={animationVariants.gradientBackground.hover}
        />
        <motion.h1 
          className={`${libreBodoni.className} antialiased text-5xl text-black/75 z-10`}
          {...animationVariants.quoteText}
          whileHover={animationVariants.quoteText.hover}
        >
          { randomQuote.quote }
        </motion.h1>
        <motion.h1 
          className="text-4xl font-bold text-black/75 z-10"
          {...animationVariants.authorText}
          whileHover={animationVariants.authorText.hover}
        >
          — { randomQuote.author} 
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}