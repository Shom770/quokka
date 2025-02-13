import type { Metadata } from "next";
import { figtree } from "@/app/ui/fonts";
import "./globals.css";
import Navbar from "@/app/ui/navbar";


export const metadata: Metadata = {
 title: "Quokka",
 description: "Mental health app made for students, by students.",
};


export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
   <html lang="en">
     <body
       className={`flex flex-col items-center bg-[#FCF4F0] ${figtree.className} antialiased overflow-hidden w-full`}
     >
       <Navbar />
       <div className="flex flex-col items-center justify-center w-screen h-[90vh] overflow-x-hidden">
         {children}
       </div>
     </body>
   </html>
 );
}
