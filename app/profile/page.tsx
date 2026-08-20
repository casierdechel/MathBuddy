// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    school: "",
    nis: "",
    group_type: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      if (!storedToken || !storedUserId) {
        router.push("/login");
        return;
      }

      try {
        const response = await api.profile.get(parseInt(storedUserId), storedToken);
        if (response.status === "success") {
          const data = response.data;
          setProfileData({
            name: data.name || "",
            school: data.school || "",
            nis: data.nis || "",
            group_type: data.group_type || ""
          });
        } else {
          setError(response.detail || "Gagal mengambil data profil");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (isSaved) setIsSaved(false);
    if (error) setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (!storedToken || !storedUserId) {
      router.push("/login");
      return;
    }

    try {
      const response = await api.profile.update(
        parseInt(storedUserId),
        { name: profileData.name, school: profileData.school },
        storedToken
      );
      
      if (response.status === "success") {
        setIsSaved(true);
        // Update nama di localStorage (untuk sidebar)
        localStorage.setItem("userName", profileData.name);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setError(response.detail || "Gagal menyimpan perubahan");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Hapus semua data session
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("groupType");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-on-surface-variant">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Pengaturan Akun" isSidebarOpen={isSidebarOpen} />

      <main 
        className={`pt-24 px-edge-margin pb-12 min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "ml-[280px]" : "ml-[78px]"
        }`}
      >
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          
          {/* Kartu Utama Form Profil */}
          <section className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm space-y-6">
            <div className="border-b border-outline-variant pb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <h3 className="text-xl font-bold">Informasi Data Diri</h3>
                <p className="text-xs text-on-surface-variant">
                  NIS: <span className="font-mono font-bold">{profileData.nis || "-"}</span>
                  {" "}• Kelompok: <span className="font-bold">{profileData.group_type === "experiment" ? "Eksperimen" : "Kontrol"}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Input Nama */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface" htmlFor="name">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              {/* Input Sekolah */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface" htmlFor="school">
                  Asal Sekolah
                </label>
                <input
                  type="text"
                  id="school"
                  name="school"
                  value={profileData.school}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="Masukkan nama sekolah"
                  required
                />
              </div>

              {/* Notifikasi Sukses */}
              {isSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Perubahan profil berhasil disimpan!</span>
                </div>
              )}

              {/* Tombol Save */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{isSaving ? "Menyimpan..." : "Simpan Profil"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Kartu Logout */}
          <section className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-red-700">Keluar dari Aplikasi</h4>
              <p className="text-xs text-on-surface-variant">Sesi belajarmu saat ini akan diakhiri setelah kamu keluar.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-sm rounded-xl active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Logout</span>
            </button>
          </section>

        </div>
      </main>
    </div>
  );
}