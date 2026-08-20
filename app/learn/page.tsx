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
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      setUserName(name || "Siswa");
      
      try {
        const response = await api.sessions.getStatus(token);
        if (response.status === 'success') {
          setSessions(response.data);
        }
      } catch (error) {
        console.error('Error fetching session status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [router]);

  const sessionData = [
    { 
      id: 1, 
      title: 'Sesi 1: Direct Addition', 
      description: 'Mengatasi miskonsepsi menjumlahkan pembilang & penyebut secara langsung',
      icon: 'add_box',
      status: sessions.session_1 
    },
    { 
      id: 2, 
      title: 'Sesi 2: Denominator Error', 
      description: 'Mengatasi miskonsepsi tidak menyamakan penyebut sebelum menjumlahkan',
      icon: 'equalizer',
      status: sessions.session_2 
    },
    { 
      id: 3, 
      title: 'Sesi 3: LCM Error', 
      description: 'Mengatasi miskonsepsi salah menentukan KPK dari dua penyebut',
      icon: 'calculate',
      status: sessions.session_3 
    }
  ];

  // Hitung progress berdasarkan sesi yang selesai (completed)
  const completedCount = Object.values(sessions).filter(s => s === 'completed').length;
  const totalSessions = 3;
  const progressPercent = Math.round((completedCount / totalSessions) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-5 text-on-surface-variant font-medium">Memuat sesi belajar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 text-on-surface">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Ruang Belajar Mandiri" isSidebarOpen={isSidebarOpen} />

      <main className={`pt-24 px-edge-margin pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          
          {/* HEADER */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-8 rounded-3xl shadow-xl text-white min-h-[160px] flex items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="relative w-full flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                  <h2 className="text-2xl md:text-3xl font-bold">Pilih Sesi Belajar, {userName}</h2>
                </div>
                <p className="text-blue-100 max-w-lg text-sm md:text-base mt-1 leading-relaxed">
                  Selesaikan sesi sebelumnya untuk membuka sesi berikutnya. Setiap sesi berisi 20 soal latihan.
                </p>
                
                <div className="mt-3 max-w-xs">
                  <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                    <span>Progress Belajar</span>
                    <span className="font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-200/80 mt-1">
                    {completedCount} dari {totalSessions} sesi selesai
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shrink-0">
                <span className="material-symbols-outlined text-5xl text-white/90">school</span>
              </div>
            </div>
          </section>

          {/* GRID SESSIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessionData.map((session) => {
              const isUnlocked = session.status === 'unlocked';
              const isCompleted = session.status === 'completed';
              const isLocked = session.status === 'locked';
              
              return (
                <div 
                  key={session.id} 
                  className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 flex flex-col ${
                    isUnlocked ? 'border-primary/30 hover:shadow-lg hover:-translate-y-1 hover:border-primary' :
                    isCompleted ? 'border-blue-200 bg-blue-50/50' :
                    'border-gray-200 opacity-60 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isUnlocked ? 'bg-primary/10 text-primary' :
                      isCompleted ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <span className="material-symbols-outlined text-2xl">
                        {session.icon}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-700' :
                      isCompleted ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {isUnlocked ? 'Terbuka' : isCompleted ? 'Selesai' : 'Terkunci'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-on-surface text-lg leading-tight">
                      {session.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                      {session.description}
                    </p>
                  </div>

                  <div className="mt-5">
                    {isUnlocked ? (
                      <Link 
                        href="/learn/modul-utama" 
                        className="inline-flex items-center justify-center w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-200 gap-2"
                      >
                        <span>Mulai Sesi</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </Link>
                    ) : isCompleted ? (
                      <button 
                        disabled 
                        className="w-full py-3 bg-blue-50 text-blue-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span>Selesai</span>
                      </button>
                    ) : (
                      <button 
                        disabled 
                        className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">lock</span>
                        <span>Terkunci</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TIPS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-sm">Tips Belajar</h4>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  Kerjakan setiap sesi dengan fokus. Sistem akan menyesuaikan tingkat kesulitan dan bentuk representasi soal berdasarkan jawabanmu. Semakin sering kamu berlatih, semakin cepat pemahamanmu meningkat.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}