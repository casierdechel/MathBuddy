// app/learn/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

export default function LearnIntroPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState({
    session_1: 'locked',
    session_2: 'locked',
    session_3: 'locked'
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      if (!token) { router.push('/login'); return; }
      setUserName(name || "Siswa");
      try {
        const response = await api.sessions.getStatus(token);
        if (response.status === 'success') setSessions(response.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchSessions();
  }, [router]);

  const sessionData = [
    { id: 1, title: 'Sesi 1: Direct Addition', desc: 'Menjumlahkan pembilang & penyebut langsung', icon: 'add_box', status: sessions.session_1 },
    { id: 2, title: 'Sesi 2: Denominator Error', desc: 'Menyamakan penyebut', icon: 'equalizer', status: sessions.session_2 },
    { id: 3, title: 'Sesi 3: LCM Error', desc: 'Menentukan KPK', icon: 'calculate', status: sessions.session_3 }
  ];

  const handleStartSession = (sessionId: number) => {
    // Simpan session yang dipilih ke localStorage
    localStorage.setItem('currentSession', sessionId.toString());
    router.push('/learn/modul-utama');
  };

  const completedCount = Object.values(sessions).filter(s => s === 'completed').length;
  const progressPercent = Math.round((completedCount / 3) * 100);

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
      <TopAppBar title="Ruang Belajar" isSidebarOpen={isSidebarOpen} />
      <main className={`pt-24 px-6 pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-xl text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl">school</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Pilih Sesi, {userName}</h2>
                <p className="text-blue-100 text-lg">Selesaikan sesi untuk membuka berikutnya</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="w-48 h-2 bg-blue-300/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-sm font-bold">{completedCount}/3 selesai</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Sesi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionData.map((s) => {
              const isUnlocked = s.status === 'unlocked';
              const isCompleted = s.status === 'completed';
              const isLocked = s.status === 'locked';
              return (
                <div key={s.id} className={`bg-white p-6 rounded-2xl shadow-md border transition-all flex flex-col ${isUnlocked ? 'border-blue-400 hover:shadow-lg' : isCompleted ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-blue-100 text-blue-600' : isCompleted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${isUnlocked ? 'bg-green-100 text-green-700' : isCompleted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isUnlocked ? 'Terbuka' : isCompleted ? 'Selesai' : 'Terkunci'}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm flex-1">{s.desc}</p>
                  <div className="mt-4">
                    {isUnlocked && (
                      <button
                        onClick={() => handleStartSession(s.id)}
                        className="block w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl text-center hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        Mulai
                      </button>
                    )}
                    {isCompleted && (
                      <button disabled className="w-full py-3 bg-blue-100 text-blue-400 font-bold rounded-xl cursor-default flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Selesai
                      </button>
                    )}
                    {isLocked && (
                      <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-default flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock</span> Terkunci
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="material-symbols-outlined text-2xl text-blue-600">lightbulb</span>
            </div>
            <div>
              <h4 className="font-bold text-lg">Tips Belajar</h4>
              <p className="text-base text-gray-600">Sistem akan menyesuaikan tingkat kesulitan dan bentuk soal berdasarkan jawabanmu.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}