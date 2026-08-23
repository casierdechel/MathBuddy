// components/TopAppBar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface TopAppBarProps {
  title?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  isSidebarOpen: boolean;
}

export default function TopAppBar({ title = "Ruang Belajar", showBackButton = false, backButtonHref = "/learn", isSidebarOpen }: TopAppBarProps) {
  const [userName, setUserName] = useState("Siswa");
  const [userInitial, setUserInitial] = useState("S");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Siswa";
    setUserName(name);
    setUserInitial(name.charAt(0).toUpperCase());
  }, []);

  return (
    <header className={`fixed top-0 right-0 h-20 bg-white/90 backdrop-blur-sm border-b border-blue-100 flex items-center justify-between px-6 z-40 transition-all duration-300 ${isSidebarOpen ? "left-[280px]" : "left-[78px]"}`}>
      <div>
        {showBackButton ? (
          <Link href={backButtonHref} className="text-primary flex items-center gap-2 font-semibold text-base">
            <span className="material-symbols-outlined">arrow_back</span> Kembali
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="material-symbols-outlined text-2xl">local_library</span>
            <span>{title}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-3 group">
          <span className="text-base font-medium text-gray-700 group-hover:text-primary transition">{userName}</span>
          <div className="w-10 h-10 rounded-full bg-blue-100 font-bold text-base flex items-center justify-center border border-blue-200">
            {userInitial}
          </div>
        </Link>
      </div>
    </header>
  );
}