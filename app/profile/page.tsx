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
  const [profileData, setProfileData] = useState({ name: "", school: "", nis: "", group_type: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) { router.push("/login"); return; }
      try {
        const response = await api.profile.get(parseInt(userId), token);
        if (response.status === "success") {
          const data = response.data;
          setProfileData({ name: data.name || "", school: data.school || "", nis: data.nis || "", group_type: data.group_type || "" });
        } else setError(response.detail || "Gagal mengambil data");
      } catch (err: any) { setError(err.message || "Terjadi kesalahan"); } finally { setIsLoading(false); }
    };
    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (isSaved) setIsSaved(false);
    if (error) setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) { router.push("/login"); return; }
    try {
      const response = await api.profile.update(parseInt(userId), { name: profileData.name, school: profileData.school }, token);
      if (response.status === "success") {
        setIsSaved(true);
        localStorage.setItem("userName", profileData.name);
        setTimeout(() => setIsSaved(false), 3000);
      } else setError(response.detail || "Gagal menyimpan");
    } catch (err: any) { setError(err.message || "Terjadi kesalahan"); } finally { setIsSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("groupType");
    router.push("/login");
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/70 via-blue-50 to-indigo-100/70">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Profil" isSidebarOpen={isSidebarOpen} />
      <main className={`pt-24 px-6 pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-2xl">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <h3 className="text-2xl font-bold">Data Diri</h3>
                <p className="text-base text-gray-500">No Absen Siswa: <span className="font-mono font-bold">{profileData.nis}</span> • Kelompok: <span className="font-bold">{profileData.group_type === "experiment" ? "Eksperimen" : "Kontrol"}</span></p>
              </div>
            </div>
            {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}
            <form onSubmit={handleSave} className="space-y-6 mt-6">
              <div>
                <label className="text-sm font-semibold">Nama Lengkap</label>
                <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-base focus:border-primary transition" required />
              </div>
              <div>
                <label className="text-sm font-semibold">Sekolah</label>
                <input type="text" name="school" value={profileData.school} onChange={handleInputChange} className="w-full px-5 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-base focus:border-primary transition" required />
              </div>
              {isSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span> Profil berhasil disimpan!
                </div>
              )}
              <button type="submit" disabled={isSaving} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition text-lg disabled:opacity-50">
                {isSaving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-6 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg text-red-700">Keluar</h4>
              <p className="text-sm text-gray-500">Akhiri sesi belajarmu</p>
            </div>
            <button onClick={handleLogout} className="px-6 py-3 border-2 border-red-300 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition text-lg flex items-center gap-2">
              <span className="material-symbols-outlined">logout</span> Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Loading() {
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
  </div>;
}