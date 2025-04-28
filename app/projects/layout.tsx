import { ReactNode } from "react";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgb(255, 255, 255) 0px, rgb(248, 248, 248) 2px, transparent 2px, transparent 10px)",
      }}
    >
      <div className="p-5 pb-20 max-w-[1024px] text-slate-800 md:p-20 font-[family-name:var(--font-bricolage-sans)] bg-slate-100 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}
