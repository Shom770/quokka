"use client"

import { useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [hoursSlept, setHoursSlept] = useState(0);
  const [hoursInInput, setHoursInInput] = useState(0);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="relative flex flex-col justify-center gap-8 w-3/5 h-full">
        <h1 className="text-blue-500 font-extrabold text-[46px] leading-[1]">
        Track your sleep.
        </h1>
        <div className="h-1/2 w-full flex flex-row justify-between items-center gap-8">
            <div className="flex flex-col justify-center gap-1.5 w-1/2 h-full border border-blue-500 rounded-xl bg-blue-500/10 p-14">
                <h1 className="text-blue-500 font-bold text-2xl">Set Target Bedtime</h1>
                <p className="text-black text-xl">Choose a time when you want to be in bed and asleep.</p>

                <div className="relative flex justify-center items-center">
                    <div className="relative w-64 h-64 flex items-center justify-center bg-blue-500/25 rounded-full shadow-md">
                        {hours.map((hour) => (
                        <motion.div
                            key={hour}
                            className={`absolute flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200 
                            ${hour === selectedHour ? "bg-blue-500 text-white" : "bg-white text-blue-500"}`}
                            style={{
                            transform: `rotate(${(hour / 12) * 360}deg) translate(0, -90px) rotate(-${(hour / 12) * 360}deg)`
                            }}
                            onClick={() => setSelectedHour(hour)}
                        >
                            {hour}
                        </motion.div>
                        ))}

                        {minutes.map((minute) => (
                        <motion.div
                            key={minute}
                            className={`flex items-center justify-center absolute w-6 h-6 rounded-full cursor-pointer transition-all duration-200 text-sm
                            ${minute === selectedMinute ? "bg-blue-500 text-white" : "bg-white text-blue-500"}`}
                            style={{
                            transform: `rotate(${(minute / 60) * 360}deg) translate(0, -130px) rotate(-${(minute / 60) * 360}deg)`
                            }}
                            onClick={() => setSelectedMinute(minute)}
                        >
                            {minute}
                        </motion.div>
                        ))}

                        <div className="absolute flex flex-col items-center">
                        <span className="text-black font-extrabold text-lg">{selectedHour.toString().padStart(2, "0")}:{selectedMinute.toString().padStart(2, "0")} PM</span>
                        <span className="text-black text-sm">Selected Time</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center w-1/2 h-full border border-blue-500 rounded-xl bg-blue-500/10 p-14">
                <div className="flex flex-col items-start">
                    <h1 className="text-blue-500 font-bold text-2xl">Hours Slept Today</h1>
                    <h1 className="text-black font-medium text-lg">{hoursSlept} hours slept today.</h1>
                    <div className="flex flex-row-reverse w-full gap-2.5 justify-between items-center mt-4">
                        <button className="bg-blue-500 px-4 py-2 rounded-lg font-bold hover:bg-blue-600" onClick={() => setHoursSlept(hoursInInput)}><p>Set Hours</p></button>
                        <input 
                            className="bg-blue-500/10 border border-blue-500 pl-4 rounded-lg focus:outline-none flex-1 h-full text-black placeholder:text-gray-700"
                            placeholder="Enter hours slept"
                            onChange={(event) => setHoursInInput(parseInt(event.target.value))} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
