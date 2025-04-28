"use client"

import { useContext } from "react";
import { rethinkSans } from "../ui/fonts";
import Switch from "../ui/settings/switch";
import { Context } from "../layout-client";

export default function Page() {
  const { canShow, setCanShow } = useContext(Context); 

  return (
    <div className="flex flex-col h-full mt-[8vw] gap-8 w-3/5">
      <h1 className={`text-orange-600 font-extrabold text-[46px] leading-[1] ${rethinkSans.className}`}>
        Settings
      </h1>
      
      <div className="w-full">
        <div className="flex justify-between mb-3 px-4">
          <div className="text-xl w-full text-orange-500">
            Dark mode
          </div>
          <div className="text-md text-nowrap text-orange-500/70">
            Coming soon...
          </div>
        </div>
        {/*<hr />*/} 
        <div className="h-px w-full bg-orange-500" />
      </div>

      <div className="w-full">
        <div className="flex justify-between mb-3 px-4">
          <div className="text-xl w-full text-orange-500">
            Allow App Feedback Questions 
          </div>
          <Switch enabled={canShow} setEnabled={setCanShow} />
        </div>
        {/*<hr />*/} 
        <div className="h-px w-full bg-orange-500" />
      </div>

      <div className="w-full">
        <div className="flex justify-between mb-3 px-4">
          <div className="text-xl w-full text-orange-500">
            Language
          </div>
          <div className="text-md text-orange-500/70">
            English
          </div>
        </div>
        {/*<hr />*/} 
      </div>
    </div>
  )
}
