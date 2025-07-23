import type { Metadata } from "next";
import { figtree } from "@/components/fonts";
import "./globals.css";
import LayoutClient from "@/app/layout-client";

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
        <LayoutClient>
          {children}
        </LayoutClient>
     </body>
   </html>
 );
}
