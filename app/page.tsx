"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
export default function App() {

  return (
    <div className="w-screen h-screen flex" style={{alignItems:'center'}}>
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto">
        <div className="w-full">
          <InteractiveAvatar />
        </div>
      </div>
    </div>
  );
}
