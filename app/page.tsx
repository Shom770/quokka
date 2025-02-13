import Cards from "@/app/ui/landing/cards";
import { libreBodoni } from "./ui/fonts";


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


 const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
  return (
   <div className="flex flex-row items-center justify-between w-4/5 h-full">
     <div className="flex items-center justify-center relative w-[50%] h-[80%]">
       <Cards />
     </div>
     <div className="relative flex flex-col justify-center w-2/5 h-2/5 gap-2" >
       <div className="absolute inset-0 bg-gradient-to-r from-[#F66B6B]/90 to-[#F5C114]/90 blur-[150px] rounded-xl z-0" />
       <h1 className={`${libreBodoni.className} antialiased text-5xl text-black/75 z-10`}>{ randomQuote.quote }</h1>
       <h1 className="text-4xl font-bold text-black/75 z-10">— { randomQuote.author} </h1>
     </div>
   </div>
 )
}
