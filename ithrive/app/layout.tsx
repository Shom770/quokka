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
        className={`flex flex-col items-center bg-white ${figtree.className} antialiased bg-blue-100`}
      >
        <Navbar />
        <div className="flex flex-col items-center justify-center w-screen h-[90vh]">
          { children }
        </div>
      </body>
    </html>
  );
}
