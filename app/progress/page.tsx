// app/progress/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

// --- KOMPONEN FRACTION DISPLAY (copy dari modul utama) ---
function FractionDisplay({ text }: { text: string }) {
  if (text.includes('/')) {
    const [num, den] = text.split('/');
    return (
      <div className="flex flex-col items-center">
        <span className="text-lg leading-none font-bold">{num}</span>
        <span className="border-t-2 border-gray-500 w-7 my-0.5"></span>
        <span className="text-lg leading-none font-bold">{den}</span>
      </div>
    );
  }
  return <span className="text-lg font-bold">{text}</span>;
}

// --- INTERFACE ---
interface MiskonsepsiDetail {
  type: string;
  count: number;
  your_answer: string;
  correct_answer: string;
  question_text: string;
  explanation: string;
}

interface ProgressData {
  total_questions: number;
  correct: number;
  misconceptions: Record<string, number>;
  misconception_details: MiskonsepsiDetail[];
}

const typeLabels: Record<string, string> = {
  direct_addition: "Direct Addition",
  denominator_error: "Denominator Error",
  lcm_error: "LCM Error"
};

export default function ProgressPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
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
          setProgressData(response.data);
        } else {
          setError(response.detail || "Gagal mengambil data progress");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data");
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [router]);

  const totalLatihan = progressData?.total_questions || 0;
  const jawabanBenar = progressData?.correct || 0;
  const miskonsepsi = progressData?.misconceptions 
    ? Object.values(progressData.misconceptions).reduce((a, b) => a + b, 0)
    : 0;
  const jawabanSalahLainnya = totalLatihan - jawabanBenar - miskonsepsi;
  const persentase = totalLatihan > 0 ? Math.round((jawabanBenar / totalLatihan) * 100) : 0;

  const stats = [
    { label: "Jawaban Benar", value: jawabanBenar.toString(), icon: "check_circle", color: "text-emerald-500" },
    { label: "Miskonsepsi", value: miskonsepsi.toString(), icon: "warning", color: "text-amber-500" },
    { label: "Kesalahan Biasa", value: jawabanSalahLainnya.toString(), icon: "close", color: "text-red-500" },
  ];

  const miskonsepsiData = progressData?.misconception_details || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-5 text-on-surface-variant font-medium">Memuat data progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-bold">Terjadi Kesalahan</p>
          <p>{error}</p>
          <button 
            onClick={() => router.push("/learn")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-xl"
          >
            Kembali ke Belajar
          </button>
        </div>
      </div>
    );
  }

  if (!progressData || totalLatihan === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/40 to-indigo-50/40">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <TopAppBar title="Progres Belajarku" isSidebarOpen={isSidebarOpen} />
        <main className={`pt-24 px-edge-margin pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
          <div className="max-w-3xl mx-auto text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-300">analytics</span>
            <h3 className="text-2xl font-bold mt-4">Belum Ada Data</h3>
            <p className="text-on-surface-variant">Kamu belum mengerjakan soal apapun. Yuk, mulai belajar!</p>
            <button 
              onClick={() => router.push("/learn")}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold"
            >
              Mulai Belajar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 to-indigo-50/40 text-on-surface">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Progres Belajarku" isSidebarOpen={isSidebarOpen} />

      <main className={`pt-24 px-edge-margin pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
          
          {/* ===== HEADER BIRU ===== */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-8 rounded-2xl shadow-xl text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="relative flex items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">Luar Biasa, {userName}!</h2>
                <p className="opacity-90">Kamu sudah bekerja keras. Mari bedah hasil latihanmu hari ini.</p>
              </div>
              <div className="bg-white/10 border border-white/20 p-6 rounded-2xl text-center min-w-[140px] backdrop-blur-sm">
                <p className="text-3xl font-black text-white">{persentase}%</p>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Akurasi</p>
              </div>
            </div>
          </section>

          {/* ===== STATISTIK ===== */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`p-3 bg-gray-50 rounded-xl ${stat.color}`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ===== TABEL ANALISIS ===== */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">analytics</span>
              Ringkasan Analisis Kesalahan
            </h3>
            {miskonsepsiData.length === 0 ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-emerald-700 flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-medium">Tidak ada miskonsepsi terdeteksi! Pertahankan!</span>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-semibold text-on-surface-variant">Jenis</th>
                      <th className="p-4 font-semibold text-on-surface-variant">Jumlah Salah Miskonsepsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {miskonsepsiData.map((item, i) => (
                      <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-4 font-bold text-amber-700">{typeLabels[item.type] || item.type}</td>
                        <td className="p-4 font-mono text-amber-900">{item.count} Soal</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ===== POJOK PERBAIKAN KESALAHAN ===== */}
          {miskonsepsiData.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">school</span> 
                Pojok Perbaikan Kesalahan
              </h3>

              {miskonsepsiData.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4">
                  <h4 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                    Miskonsepsi: {typeLabels[item.type] || item.type}
                  </h4>
                  
                  {/* Soal */}
                  <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-on-surface-variant font-medium mb-2">Soal:</p>
                    <div className="flex items-center gap-2 text-lg font-bold text-on-surface">
                      {/* Tampilkan soal dalam bentuk pecahan vertikal */}
                      {item.question_text && item.question_text.includes('/') ? (
                        <span className="flex items-center gap-2 flex-wrap">
                          {item.question_text.split(/\s+/).map((part, idx) => {
                            if (part === '+' || part === '-') {
                              return <span key={idx} className="text-xl text-gray-600">{part === '-' ? '−' : '+'}</span>;
                            }
                            if (part.includes('/')) {
                              return <FractionDisplay key={idx} text={part} />;
                            }
                            return <span key={idx} className="text-xl">{part}</span>;
                          })}
                        </span>
                      ) : (
                        <span>{item.question_text || "Soal tidak ditemukan"}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Jawaban Siswa */}
                    <div className="bg-red-50/80 p-4 rounded-xl border border-red-200">
                      <p className="text-xs text-red-600 font-medium mb-2">Jawabanmu:</p>
                      <div className="flex items-center gap-2">
                        <FractionDisplay text={item.your_answer} />
                      </div>
                    </div>

                    {/* Jawaban Benar */}
                    <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
                      <p className="text-xs text-emerald-600 font-medium mb-2">Jawaban yang Benar:</p>
                      <div className="flex items-center gap-2">
                        <FractionDisplay text={item.correct_answer} />
                      </div>
                    </div>
                  </div>

                  {/* Penjelasan */}
                  <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800 leading-relaxed">
                      <span className="font-bold">Penjelasan:</span> {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ===== KESALAHAN BIASA ===== */}
          {jawabanSalahLainnya > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-red-900 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">error</span>
                Kesalahan Ketelitian
              </h4>
              <p className="text-sm text-red-800">
                Ada beberapa jawaban yang kurang tepat. Tidak ditemukan pola miskonsepsi di sini, mungkin hanya karena kurang teliti.
              </p>
              <div className="bg-red-50/80 p-4 rounded-xl border border-red-100">
                <p className="font-bold text-sm text-red-900">Saran:</p>
                <p className="text-sm text-red-800">Lain kali lebih teliti ya ngerjainnya! Lakukan pengecekan ulang hitunganmu sebelum dikumpulkan.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}