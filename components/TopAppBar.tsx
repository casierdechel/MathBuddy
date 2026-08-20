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

export default function TopAppBar({ 
  title = "Ruang Belajar", 
  showBackButton = false, 
  backButtonHref = "/learn",
  isSidebarOpen
}: TopAppBarProps) {
  const [userName, setUserName] = useState("Siswa");
  const [userInitial, setUserInitial] = useState("S");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Siswa";
    setUserName(name);
    setUserInitial(name.charAt(0).toUpperCase());
  }, []);

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-edge-margin z-40 transition-all duration-300 ${
        isSidebarOpen ? "left-[280px]" : "left-[78px]"
      }`}
    >
      <div>
        {showBackButton ? (
          <Link href={backButtonHref} className="text-primary flex items-center gap-2 font-semibold hover:underline text-sm">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-primary animate-fadeIn">
            <span className="material-symbols-outlined text-base">local_library</span>
            <span>{title}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        <Link href="/profile" className="flex items-center gap-3 group cursor-pointer">
          <span className="text-on-surface group-hover:text-primary transition-colors">
            {userName}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-200 font-bold text-xs flex items-center justify-center border border-outline-variant">
            {userInitial}
          </div>
        </Link>
      </div>
    </header>
  );
}