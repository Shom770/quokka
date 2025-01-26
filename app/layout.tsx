import type { Metadata } from "next";
import { figtree } from "@/app/ui/fonts";
import "./globals.css";
import Navbar from "@/app/ui/navbar";

export const metadata: Metadata = {
  title: "iTHRiVE",
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
        className={`flex flex-col items-center bg-[#E2EDFF] ${figtree.className} antialiased bg-blue-100 overflow-hidden w-full`}
      >
        <Navbar />
        <div className="flex flex-col items-center justify-center w-screen h-[90vh] overflow-x-hidden">
          <div className="absolute w-1/2 h-full bg-[radial-gradient(closest-side,_rgba(248,148,255,0.65),_rgba(196,159,255,0.65))] blur-[300px] left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[-1]"></div>
          {children}
          <div className="absolute w-1/2 h-full bg-[radial-gradient(closest-side,_rgba(248,148,255,0.65),_rgba(196,159,255,0.65))] blur-[300px] right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-[-1]"></div>
        </div>
      </body>
    </html>
  );
}
