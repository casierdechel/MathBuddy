// app/progress/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

function FractionDisplay({ text }: { text: string }) {
  if (text.includes('/')) {
    const [num, den] = text.split('/');
    return (
      <div className="flex flex-col items-center">
        <span className="text-xl leading-none font-bold">{num}</span>
        <span className="border-t-2 border-gray-500 w-10 my-1"></span>
        <span className="text-xl leading-none font-bold">{den}</span>
      </div>
    );
  }
  return <span className="text-xl font-bold">{text}</span>;
}

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
  misconception_wrong: number;
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
      if (!token || !userId) { router.push("/login"); return; }
      setUserName(name || "Siswa");
      try {
        const response = await api.progress.get(parseInt(userId), token);
        if (response.status === "success") setProgressData(response.data);
        else setError(response.detail || "Gagal mengambil data");
      } catch (err) { setError("Terjadi kesalahan"); } finally { setLoading(false); }
    };
    fetchProgress();
  }, [router]);

  const total = progressData?.total_questions || 0;
  const benar = progressData?.correct || 0;
  const miskonsepsi = progressData?.misconception_wrong || 0;
  const salahLain = total - benar - miskonsepsi;
  const persen = total > 0 ? Math.round((benar / total) * 100) : 0;

  const stats = [
    { label: "Benar", value: benar, icon: "check_circle", color: "text-emerald-600 bg-emerald-100" },
    { label: "Miskonsepsi", value: miskonsepsi, icon: "warning", color: "text-amber-600 bg-amber-100" },
    { label: "Salah Biasa", value: salahLain, icon: "close", color: "text-red-600 bg-red-100" },
  ];

  const misData = progressData?.misconception_details || [];

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay error={error} />;
  if (!progressData || total === 0) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/70 via-blue-50 to-indigo-100/70">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Progres Belajar" isSidebarOpen={isSidebarOpen} />
      <main className={`pt-24 px-6 pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-xl text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Luar Biasa, {userName}!</h2>
                <p className="text-blue-100 text-lg">Lihat hasil belajarmu</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                <p className="text-4xl font-black">{persen}%</p>
                <p className="text-sm text-blue-100">Akurasi</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 flex items-center gap-4">
                <div className={`p-3 rounded-full ${s.color}`}>
                  <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabel */}
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">analytics</span> Ringkasan Kesalahan
            </h3>
            {misData.length === 0 ? (
              <div className="bg-emerald-50 p-4 rounded-xl text-emerald-700 flex items-center gap-3 text-lg">
                <span className="material-symbols-outlined">check_circle</span> Tidak ada miskonsepsi!
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-base">Jenis</th>
                      <th className="p-4 text-base">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misData.map((item, i) => (
                      <tr key={i} className="border-b hover:bg-amber-50/30">
                        <td className="p-4 font-bold text-amber-700 text-lg">{typeLabels[item.type] || item.type}</td>
                        <td className="p-4 text-amber-900 text-lg">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail miskonsepsi */}
          {misData.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">school</span> Pojok Perbaikan
              </h3>
              {misData.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md border border-amber-200 p-6 space-y-4">
                  <h4 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">warning</span> {typeLabels[item.type] || item.type}
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <p className="text-sm text-gray-500 mb-2">Soal:</p>
                    <div className="flex items-center gap-2 text-lg font-bold flex-wrap">
                      {item.question_text && item.question_text.includes('/') ? (
                        item.question_text.split(/\s+/).map((part, idx) => {
                          if (part === '+' || part === '-') return <span key={idx} className="text-xl text-gray-600">{part === '-' ? '−' : '+'}</span>;
                          if (part.includes('/')) return <FractionDisplay key={idx} text={part} />;
                          return <span key={idx} className="text-xl">{part}</span>;
                        })
                      ) : <span>{item.question_text || "Soal tidak ditemukan"}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                      <p className="text-sm text-red-600 font-medium">Jawabanmu:</p>
                      <FractionDisplay text={item.your_answer} />
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <p className="text-sm text-emerald-600 font-medium">Jawaban Benar:</p>
                      <FractionDisplay text={item.correct_answer} />
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-base"><span className="font-bold">Penjelasan:</span> {item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {salahLain > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-red-200 p-6">
              <h4 className="text-xl font-bold text-red-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">error</span> Kesalahan Ketelitian
              </h4>
              <p className="text-lg text-red-700">Ada jawaban yang kurang teliti. Tidak ada pola miskonsepsi.</p>
              <div className="bg-red-50 p-4 rounded-xl mt-2">
                <p className="font-bold">Saran: Cek kembali perhitunganmu.</p>
              </div>
            </div>
          )}
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
function ErrorDisplay({ error }: { error: string }) {
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
    <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
      <span className="material-symbols-outlined text-5xl text-red-500">error</span>
      <p className="text-xl mt-2">{error}</p>
      <button onClick={() => window.location.href = '/learn'} className="mt-4 px-6 py-2 bg-primary text-white rounded-2xl">Kembali</button>
    </div>
  </div>;
}
function EmptyState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/70 via-blue-50 to-indigo-100/70">
      <Sidebar isOpen={true} setIsOpen={()=>{}} />
      <TopAppBar title="Progres Belajar" isSidebarOpen={true} />
      <main className="pt-24 px-6 pb-12 ml-[280px]">
        <div className="max-w-3xl mx-auto text-center py-20">
          <span className="material-symbols-outlined text-7xl text-gray-300">analytics</span>
          <h3 className="text-3xl font-bold mt-4">Belum Ada Data</h3>
          <p className="text-xl text-gray-500">Mulai belajar untuk melihat progressmu!</p>
          <button onClick={() => window.location.href = '/learn'} className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl text-lg">Mulai Belajar</button>
        </div>
      </main>
    </div>
  );
}