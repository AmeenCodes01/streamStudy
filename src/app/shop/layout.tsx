import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-1 pr-7">
      <main
        className="flex flex-1 w-full h-full "
      >
        {children}
      </main>
    </div>
  );
}
