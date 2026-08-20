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

  // Ambil data user dari localStorage saat mount
  useEffect(() => {
    const name = localStorage.getItem("userName") || "Siswa";
    setUserName(name);
    setUserInitial(name.charAt(0).toUpperCase());
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Hapus semua data session
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("groupType");
    
    // Redirect ke halaman login
    router.push("/login");
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-surface border-r border-outline-variant flex flex-col z-50 transition-all duration-300 ${
        isOpen ? "w-[280px]" : "w-[78px]"
      }`}
    >
      {/* HEADER SIDEBAR */}
      <div className={`h-20 flex items-center px-4 mb-4 ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen && (
          <div className="pl-2 animate-fadeIn">
            <h1 className="text-[20px] font-bold text-primary leading-none tracking-tight">
              MathBuddy
            </h1>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">
              Solve your math misconceptions!
            </p>
          </div>
        )}

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all border border-outline-variant/50 shadow-sm ${
            isOpen ? "bg-surface-container-low text-primary" : "bg-primary text-white"
          }`}
          title={isOpen ? "Sembunyikan" : "Tampilkan"}
        >
          <span className="material-symbols-outlined text-sm font-bold">
            {isOpen ? "arrow_back_ios_new" : "arrow_forward_ios"}
          </span>
        </button>
      </div>
      
      {/* Menu Navigasi */}
      <nav className="flex-1 space-y-2 px-3">
        {[
          { path: "/", label: "Dashboard", icon: "dashboard" },
          { path: "/learn", label: "Learn", icon: "school" },
          { path: "/progress", label: "Progress", icon: "trending_up" },
          { path: "/profile", label: "Profile", icon: "person" },
        ].map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 py-3.5 rounded-xl transition-all active:scale-95 ${
                isOpen ? "px-4" : "justify-center px-0"
              } ${
                active 
                  ? "text-primary font-bold bg-surface-container-high border-r-4 border-primary rounded-r-none" 
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className={`material-symbols-outlined ${active ? "text-primary" : ""}`}>
                {item.icon}
              </span>
              {isOpen && <span className="animate-fadeIn text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Profil + Logout */}
      <div className={`mt-auto border-t border-outline-variant/60 pt-4 pb-6 ${isOpen ? "px-4" : "px-2"}`}>
        {/* Profil User */}
        <Link href="/profile" className={`flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors ${!isOpen && "justify-center"}`}>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
            {userInitial}
          </div>
          {isOpen && (
            <div className="animate-fadeIn overflow-hidden flex-1">
              <p className="font-bold text-on-surface text-sm truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-on-surface-variant">Siswa</p>
            </div>
          )}
        </Link>

        {/* Divider */}
        {isOpen && <div className="my-2 border-t border-outline-variant/30"></div>}

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-4 py-3 rounded-xl transition-all hover:bg-red-50 text-red-600 hover:text-red-700 w-full ${
            isOpen ? "px-4 justify-start" : "justify-center px-0"
          }`}
          title="Logout"
        >
          <span className="material-symbols-outlined text-red-500">logout</span>
          {isOpen && <span className="animate-fadeIn text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}