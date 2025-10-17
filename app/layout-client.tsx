"use client"

import "./globals.css";
import Navbar from "@/components/navbar";
import SurveyManager from "@/components/survey-manager";
import { useEffect, useState } from "react";
import React from "react";
import { SessionProvider } from "next-auth/react";

interface AppContext {
  canShow: boolean;
  setCanShow: React.Dispatch<React.SetStateAction<boolean>>;
  motivationMode: boolean;
  setMotivationMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Context = React.createContext<AppContext>({
  canShow: false,
  setCanShow: () => {},
  motivationMode: false,
  setMotivationMode: () => {},
});

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

  const [motivationMode, setMotivationMode] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("motivationMode") ?? "false");
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("canShow", JSON.stringify(canShow));
  }, [canShow]);

  useEffect(() => {
    localStorage.setItem("motivationMode", JSON.stringify(motivationMode));
  }, [motivationMode]);

 return (
   <SessionProvider>
     <Context.Provider value={{ canShow, setCanShow, motivationMode, setMotivationMode }}>
       <Navbar />
      <div className="flex flex-col items-center w-screen overflow-x-hidden">
        {children}
      </div>
       <SurveyManager />
     </Context.Provider>
   </SessionProvider>
 );
}
