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
  const [stats, setStats] = useState({
    total: 0,
    benar: 0,
    miskonsepsi: 0,
  });
  const [topMisconception, setTopMisconception] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const name = localStorage.getItem("userName");

      if (!token || !userId) {
        router.push("/login");
        return;
      }

      setUserName(name || "Siswa");

      try {
        const response = await api.progress.get(parseInt(userId), token);
        if (response.status === "success") {
          const data = response.data as ProgressData;
          const totalMiskonsepsi = data.misconceptions
            ? Object.values(data.misconceptions).reduce((a, b) => a + b, 0)
            : 0;
          setStats({
            total: data.total_questions,
            benar: data.correct,
            miskonsepsi: totalMiskonsepsi,
          });

          if (data.misconceptions && Object.keys(data.misconceptions).length > 0) {
            const sorted = Object.entries(data.misconceptions).sort((a, b) => b[1] - a[1]);
            setTopMisconception(sorted[0][0]);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const totalSoal = stats.total;
  const akurasi = totalSoal > 0 ? Math.round((stats.benar / totalSoal) * 100) : 0;

  const misconceptionMap: Record<string, { label: string; color: string }> = {
    direct_addition: { label: "Direct Addition", color: "text-red-600" },
    denominator_error: { label: "Denominator Error", color: "text-orange-500" },
    lcm_error: { label: "LCM Error", color: "text-purple-500" },
  };

  const getMisconceptionLabel = (key: string | null) => {
    if (!key) return null;
    return misconceptionMap[key] || { label: key, color: "text-gray-500" };
  };

  const misInfo = getMisconceptionLabel(topMisconception);

  const getMotivation = () => {
    if (totalSoal === 0) return "Mulai petualanganmu dengan belajar pecahan!";
    if (totalSoal < 10) return "Langkah kecil yang baik! Teruslah belajar!";
    if (totalSoal < 20) return "Kamu sudah mulai konsisten. Pertahankan!";
    if (akurasi >= 80) return "Hebat! Pemahamanmu sangat baik!";
    if (akurasi >= 60) return "Kamu sudah di jalur yang benar! Terus semangat!";
    return "Setiap kesalahan adalah pelajaran. Jangan menyerah!";
  };

  const motivation = getMotivation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-5 text-on-surface-variant font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 text-on-surface">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Dashboard Belajar" isSidebarOpen={isSidebarOpen} />

      <main className={`pt-24 px-edge-margin pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
          
          {/* ===== HEADER - UKURAN FIX ===== */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-8 rounded-3xl shadow-xl text-white min-h-[160px] flex items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="relative w-full flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl">waving_hand</span>
                  <h3 className="text-2xl md:text-3xl font-bold">Halo, {userName}!</h3>
                </div>
                <p className="text-blue-100 max-w-lg text-sm md:text-base mt-1 leading-relaxed">
                  {motivation}
                </p>
                <Link 
                  href="/learn" 
                  className="inline-block mt-3 px-8 py-2.5 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 text-sm"
                >
                  <span className="flex items-center gap-2">
                    Mulai Belajar Pecahan
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </span>
                </Link>
              </div>
              <div className="hidden lg:flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shrink-0">
                <span className="material-symbols-outlined text-5xl text-white/90">calculate</span>
              </div>
            </div>
          </section>

          {/* ===== STATISTIK GRID ===== */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Total Soal</p>
                  <p className="text-3xl font-black text-on-surface mt-1">{totalSoal}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-2xl">format_list_numbered</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Benar</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{stats.benar}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Miskonsepsi</p>
                  <p className={`text-3xl font-black mt-1 ${stats.miskonsepsi > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {stats.miskonsepsi}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.miskonsepsi > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                  <span className="material-symbols-outlined text-2xl">{stats.miskonsepsi > 0 ? "warning" : "check_circle"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Akurasi</p>
                <p className="text-3xl font-black text-primary mt-1">{akurasi}%</p>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle 
                    cx="30" cy="30" r="24" 
                    fill="none" 
                    stroke="#0058be" 
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${akurasi * 1.5} ${(100 - akurasi) * 1.5}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{akurasi}%</span>
                </div>
              </div>
            </div>
          </section>

          {/* ===== REKOMENDASI ===== */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {misInfo && stats.miskonsepsi > 0 ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800">Area Perbaikan</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Kamu sering mengalami <span className="font-bold">{misInfo.label}</span>. 
                      Fokus latihan di materi ini!
                    </p>
                    <Link 
                      href="/learn" 
                      className="inline-block mt-3 text-sm font-bold text-amber-800 hover:text-amber-900 transition-colors"
                    >
                      Latihan Sekarang →
                    </Link>
                  </div>
                </div>
              </div>
            ) : stats.total > 0 ? (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    <span className="material-symbols-outlined text-emerald-600">star</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800">Pemahaman Sangat Baik!</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      Tidak ada pola miskonsepsi yang terdeteksi. Pertahankan!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    <span className="material-symbols-outlined text-blue-600">lightbulb</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800">Mulai Belajar</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Belum ada data latihan. Yuk, mulai belajar pecahan sekarang!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link 
              href="/progress" 
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Analisis Diagnostik</h4>
                  <p className="text-xs text-on-surface-variant">Lihat laporan detail pola kesalahanmu</p>
                </div>
              </div>
              <div className="mt-4 text-primary font-bold flex items-center gap-1 group-hover:gap-3 transition-all">
                Cek Evaluasi
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          </section>

          {/* ===== MODUL AKTIF ===== */}
          <section>
            <h4 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">book</span>
              Modul Aktif
            </h4>
            <Link 
              href="/learn" 
              className="block bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <div>
                  <h6 className="font-bold text-lg">Modul Utama: Operasi Pecahan</h6>
                  <p className="text-sm text-on-surface-variant">Penjumlahan & Pengurangan Pecahan • 3 Sesi</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-on-surface-variant">Siap dilanjutkan</span>
                  </div>
                </div>
                <span className="ml-auto material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}