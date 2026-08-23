// app/page.tsx (Dashboard)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

interface ProgressData {
  total_questions: number;
  correct: number;
  misconceptions: Record<string, number>;
  misconception_details: Array<{
    type: string;
    count: number;
    your_answer: string;
    correct_answer: string;
    explanation: string;
  }>;
}

export default function Home() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ total: 0, benar: 0, miskonsepsi: 0 });
  const [topMisconception, setTopMisconception] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const name = localStorage.getItem("userName");
      if (!token || !userId) { router.push("/login"); return; }
      setUserName(name || "Siswa");
      try {
        const response = await api.progress.get(parseInt(userId), token);
        if (response.status === "success") {
          const data = response.data as ProgressData;
          const totalMiskonsepsi = data.misconceptions
            ? Object.values(data.misconceptions).reduce((a, b) => a + b, 0)
            : 0;
          setStats({ total: data.total_questions, benar: data.correct, miskonsepsi: totalMiskonsepsi });
          if (data.misconceptions && Object.keys(data.misconceptions).length > 0) {
            const sorted = Object.entries(data.misconceptions).sort((a, b) => b[1] - a[1]);
            setTopMisconception(sorted[0][0]);
          }
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchDashboard();
  }, [router]);

  const totalSoal = stats.total;
  const akurasi = totalSoal > 0 ? Math.round((stats.benar / totalSoal) * 100) : 0;

  const misLabel: Record<string, string> = {
    direct_addition: "Direct Addition",
    denominator_error: "Denominator Error",
    lcm_error: "LCM Error"
  };

  const getMotivation = () => {
    if (totalSoal === 0) return "Ayo mulai belajar pecahan!";
    if (totalSoal < 10) return "Terus semangat!";
    if (totalSoal < 20) return "Kamu hebat, teruskan!";
    if (akurasi >= 80) return "Luar biasa!";
    if (akurasi >= 60) return "Bagus, tetap fokus!";
    return "Setiap kesalahan adalah pelajaran.";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/70 via-blue-50 to-indigo-100/70">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Dashboard Belajar" isSidebarOpen={isSidebarOpen} />
      <main className={`pt-24 px-6 pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-xl text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <span className="material-symbols-outlined text-5xl">auto_stories</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Halo, {userName}!</h2>
                <p className="text-blue-100 text-lg">{getMotivation()}</p>
                <Link href="/learn" className="inline-block mt-4 px-8 py-3 bg-white text-primary font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  Mulai Belajar
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="material-symbols-outlined text-3xl text-blue-600">format_list_numbered</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Soal</p>
                <p className="text-3xl font-bold text-primary">{totalSoal}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Benar</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.benar}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-amber-100 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <span className="material-symbols-outlined text-3xl text-amber-600">warning</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Miskonsepsi</p>
                <p className="text-3xl font-bold text-amber-600">{stats.miskonsepsi}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <span className="material-symbols-outlined text-3xl text-indigo-600">speed</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Akurasi</p>
                <p className="text-3xl font-bold text-indigo-600">{akurasi}%</p>
              </div>
            </div>
          </div>

          {/* Rekomendasi & Analisis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topMisconception && stats.miskonsepsi > 0 ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <span className="material-symbols-outlined text-2xl text-amber-600">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800 text-lg">Fokus Perbaiki</h4>
                    <p className="text-amber-700 text-base">Kamu sering salah di <strong>{misLabel[topMisconception] || topMisconception}</strong></p>
                    <Link href="/learn" className="inline-block mt-2 text-amber-800 font-bold hover:underline">Latihan →</Link>
                  </div>
                </div>
              </div>
            ) : stats.total > 0 ? (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <span className="material-symbols-outlined text-2xl text-emerald-600">star</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 text-lg">Pemahaman Baik!</h4>
                    <p className="text-emerald-700">Tidak ada miskonsepsi terdeteksi.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="material-symbols-outlined text-2xl text-blue-600">lightbulb</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800 text-lg">Mulai Belajar</h4>
                    <p className="text-blue-700">Belum ada data latihan.</p>
                  </div>
                </div>
              </div>
            )}

            <Link href="/progress" className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="material-symbols-outlined text-2xl text-blue-600">analytics</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-on-surface">Lihat Evaluasi</h4>
                  <p className="text-sm text-gray-500">Analisis kesalahanmu</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-blue-600 group-hover:translate-x-1 transition">arrow_forward</span>
            </Link>
          </div>

          {/* Modul Aktif */}
          <div>
            <h3 className="text-xl font-bold mb-4">Modul Aktif</h3>
            <Link href="/learn" className="block bg-white p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl text-white">
                  <span className="material-symbols-outlined text-4xl">menu_book</span>
                </div>
                <div>
                  <h5 className="font-bold text-xl">Operasi Pecahan</h5>
                  <p className="text-sm text-gray-500">Penjumlahan & Pengurangan • 3 Sesi</p>
                </div>
                <span className="ml-auto material-symbols-outlined text-gray-400">chevron_right</span>
              </div>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}