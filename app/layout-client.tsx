"use client"

import "./globals.css";
import Navbar from "@/components/navbar";
import SurveyManager from "@/components/survey-manager";
import { useEffect, useState } from "react";
import React from "react";
import { SessionProvider } from "next-auth/react";

interface Context {
  canShow: boolean,
  setCanShow: React.Dispatch<React.SetStateAction<boolean>>
}

export const Context = React.createContext<Context>({ canShow: false, setCanShow: () => {} });

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
  

 const [canShow, setCanShow] = useState(() => {
   if (typeof window !== "undefined") {
     return JSON.parse(localStorage.getItem("canShow") ?? "true");
   }
   return true;
 });

 useEffect(() => {
  localStorage.setItem("canShow", JSON.stringify(canShow)); 
 }, [canShow])

 return (
   <SessionProvider>
     <Context.Provider value={{ canShow, setCanShow }}>
       <Navbar />
      <div className="flex flex-col items-center justify-center w-screen min-h-screen overflow-x-hidden">
        {children}
      </div>
       <SurveyManager />
     </Context.Provider>
   </SessionProvider>
 );
}