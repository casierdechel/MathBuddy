// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Siswa");
  const [userInitial, setUserInitial] = useState("S");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Siswa";
    setUserName(name);
    setUserInitial(name.charAt(0).toUpperCase());
  }, []);

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("groupType");
    router.push("/login");
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-50 to-white border-r border-blue-100 flex flex-col z-50 transition-all duration-300 ${isOpen ? "w-[280px]" : "w-[78px]"}`}>
      <div className={`h-20 flex items-center px-4 ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen && (
          <div className="pl-2">
            <h1 className="font-bold text-primary">MathBuddy</h1>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className={`w-10 h-12 rounded-2xl flex items-center justify-center active:scale-90 transition-all border shadow-md ${isOpen ? "bg-white text-primary border-blue-200" : "bg-primary text-white border-primary"}`}>
          <span className="material-symbols-outlined">{isOpen ? "arrow_back_ios_new" : "arrow_forward_ios"}</span>
        </button>
      </div>
      <nav className="flex-1 space-y-2 px-3">
        {[
          { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
          { path: "/learn", label: "Belajar", icon: "school" },
          { path: "/progress", label: "Progress", icon: "trending_up" },
          { path: "/profile", label: "Profil", icon: "person" },
          { path: "/kuesioner", label: "Isi Kuesioner", icon: "feedback" },
        ].map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} href={item.path} className={`flex items-center gap-4 py-4 rounded-2xl transition-all active:scale-95 ${isOpen ? "px-4" : "justify-center px-0"} ${active ? "text-primary font-bold bg-blue-100/50 border-r-4 border-primary" : "text-gray-600 hover:bg-blue-50"}`}>
              <span className={`material-symbols-outlined text-2xl ${active ? "text-primary" : ""}`}>{item.icon}</span>
              {isOpen && <span className="text-base">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`mt-auto border-t border-blue-100 pt-4 pb-6 ${isOpen ? "px-4" : "px-2"}`}>
        <Link href="/profile" className={`flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition-colors ${!isOpen && "justify-center"}`}>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold border border-blue-200 shrink-0 text-lg">
            {userInitial}
          </div>
          {isOpen && (
            <div className="flex-1">
              <p className="font-bold text-base truncate">{userName}</p>
              <p className="text-xs text-gray-500">Siswa</p>
            </div>
          )}
        </Link>
        {isOpen && <div className="my-2 border-t border-blue-100/50"></div>}
        <button onClick={handleLogout} className={`flex items-center gap-4 py-3 rounded-xl transition-all hover:bg-red-50 text-red-600 hover:text-red-700 w-full ${isOpen ? "px-4 justify-start" : "justify-center px-0"}`}>
          <span className="material-symbols-outlined text-xl">logout</span>
          {isOpen && <span className="text-base font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}