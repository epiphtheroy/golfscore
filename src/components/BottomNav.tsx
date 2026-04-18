"use client";

import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { icon: "🏠", label: "홈", path: "/" },
  { icon: "📋", label: "기록", path: "/rounds" },
  { icon: "📈", label: "추이", path: "/trends" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5"
      style={{
        background: "rgba(15, 20, 25, 0.95)",
        backdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#00E5FF] scale-105"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#00E5FF]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
