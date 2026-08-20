// app/learn/modul-utama/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

// --- KOMPONEN REPRESENTASI ---

function VisualRepresentation({ a, b, c, d, operator }: { a: number; b: number; c: number; d: number; operator: string }) {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-12 border-2 border-primary rounded-lg overflow-hidden bg-white grid" 
             style={{ gridTemplateColumns: `repeat(${b}, 1fr)` }}>
          {Array.from({ length: b }).map((_, i) => (
            <div 
              key={i} 
              className={`${i < a ? "bg-primary/60" : "bg-white"} border-r border-gray-300 last:border-r-0`} 
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center py-1">
        <span className="w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-lg text-gray-600 shadow-sm">
          {operator === '-' ? '−' : '+'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-12 border-2 border-secondary rounded-lg overflow-hidden bg-white grid" 
             style={{ gridTemplateColumns: `repeat(${d}, 1fr)` }}>
          {Array.from({ length: d }).map((_, i) => (
            <div 
              key={i} 
              className={`${i < c ? "bg-secondary/60" : "bg-white"} border-r border-gray-300 last:border-r-0`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberLineRepresentation({ a, b, c, d, operator }: { a: number; b: number; c: number; d: number; operator: string }) {
  const titik1 = a / b;
  const titik2 = c / d;
  const hasil = operator === '-' ? titik1 - titik2 : titik1 + titik2;
  const maxVal = Math.max(Math.abs(hasil), 1.5);

  return (
    <div className="w-full max-w-md">
      <div className="relative w-full h-28 bg-white border-b-2 border-gray-400 rounded-lg">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-400"></div>

        <div className="absolute bottom-0 left-0 transform -translate-x-1/2">
          <div className="w-px h-4 bg-gray-400 mx-auto"></div>
          <span className="text-xs font-bold text-gray-500">0</span>
        </div>
        <div className="absolute bottom-0 right-0 transform translate-x-1/2">
          <div className="w-px h-4 bg-gray-400 mx-auto"></div>
          <span className="text-xs font-bold text-gray-500">{Math.ceil(maxVal)}</span>
        </div>

        <div className="absolute bottom-0 transform -translate-x-1/2" style={{ left: `${(titik1 / maxVal) * 100}%` }}>
          <div className="w-5 h-5 bg-primary rounded-full border-2 border-primary -mb-1 mx-auto shadow-md flex items-center justify-center text-white text-[10px] font-bold">
            {a}/{b}
          </div>
        </div>

        <div className="absolute bottom-0 transform -translate-x-1/2" style={{ left: `${(titik2 / maxVal) * 100}%` }}>
          <div className="w-5 h-5 bg-secondary rounded-full border-2 border-secondary -mb-1 mx-auto shadow-md flex items-center justify-center text-white text-[10px] font-bold">
            {c}/{d}
          </div>
        </div>

        <div className="absolute bottom-0 transform -translate-x-1/2" style={{ left: `${(hasil / maxVal) * 100}%` }}>
          <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-emerald-600 -mb-1 mx-auto shadow-lg flex items-center justify-center text-white text-sm font-bold">
            ?
          </div>
        </div>
      </div>
    </div>
  );
}

function SymbolicRepresentation({ text }: { text: string }) {
  const parts = text.split(/\s+/).filter(s => s.length > 0);
  
  return (
    <div className="flex items-center justify-center gap-3 text-3xl font-bold text-on-surface flex-wrap">
      {parts.map((part, idx) => {
        if (part === '+' || part === '-') {
          return (
            <span key={idx} className="text-3xl font-bold text-gray-600">
              {part === '-' ? '−' : '+'}
            </span>
          );
        }
        const fractionParts = part.split('/');
        if (fractionParts.length === 2) {
          const numerator = fractionParts[0];
          const denominator = fractionParts[1];
          return (
            <div key={idx} className="flex flex-col items-center mx-1">
              <span className="text-2xl leading-none">{numerator}</span>
              <span className="border-t-2 border-gray-600 w-10 my-0.5"></span>
              <span className="text-2xl leading-none">{denominator}</span>
            </div>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </div>
  );
}

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

// --- KOMPONEN UTAMA ---
export default function ModulUtamaQuizPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [armId, setArmId] = useState<number>(1);
  const [misconception, setMisconception] = useState<string>("");
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [representation, setRepresentation] = useState<string>("visual");
  const [sessionId, setSessionId] = useState<number>(1);
  const [userId, setUserId] = useState<number>(1);
  const [token, setToken] = useState<string>("");

  const [soalCount, setSoalCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [activeModal, setActiveModal] = useState<"belum_target" | "sudah_target_sisa_waktu" | "waktu_habis" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (!storedToken || !storedUserId) {
      router.push('/login');
      return;
    }

    setToken(storedToken);
    setUserId(parseInt(storedUserId));

    const checkSession = async () => {
      try {
        const response = await api.sessions.getStatus(storedToken);
        if (response.status === 'success') {
          const statuses = response.data;
          const currentSession = parseInt(localStorage.getItem('currentSession') || '1');
          const sessionKey = `session_${currentSession}`;
          if (statuses[sessionKey] === 'completed') {
            router.push('/learn');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking session status:', error);
      }
      fetchNextQuestion(1, storedToken);
    };

    checkSession();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  function extractFractions(text: string) {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/(\d+)\/(\d+)\s*([+\-])\s*(\d+)\/(\d+)/);
    if (!match) return null;
    return {
      a: parseInt(match[1]),
      b: parseInt(match[2]),
      operator: match[3],
      c: parseInt(match[4]),
      d: parseInt(match[5])
    };
  }

  function renderRepresentation(repType: string, text: string) {
    if (!text || typeof text !== 'string') {
      return (
        <div className="w-full max-w-md text-center text-on-surface-variant">
          <p>Memuat soal...</p>
        </div>
      );
    }
    const fractions = extractFractions(text);
    if (!fractions) {
      return <SymbolicRepresentation text={text} />;
    }
    switch (repType) {
      case "visual":
        return (
          <VisualRepresentation 
            a={fractions.a} 
            b={fractions.b} 
            c={fractions.c} 
            d={fractions.d} 
            operator={fractions.operator}
          />
        );
      case "garis_bilangan":
        return (
          <NumberLineRepresentation 
            a={fractions.a} 
            b={fractions.b} 
            c={fractions.c} 
            d={fractions.d} 
            operator={fractions.operator}
          />
        );
      case "simbolik":
        const expression = text.split('=')[0].trim();
        return <SymbolicRepresentation text={expression} />;
    }
  }

  const fetchNextQuestion = async (sessionIdParam?: number, tokenOverride?: string) => {
    setIsLoading(true);
    try {
      const currentSession = sessionIdParam || sessionId;
      const tokenToUse = tokenOverride || token;
      const response = await api.questions.getNext(currentSession, representation, tokenToUse);
      
      if (response.status === 'success') {
        const data = response.data;
        setCurrentQuestion(data);
        setArmId(data.arm_id);
        setRepresentation(data.representation || "visual");
        if (data.session_id) {
          setSessionId(data.session_id);
        }
      } else {
        console.error("Error from backend:", response);
        if (response.detail && response.detail.includes('soal')) {
          router.push('/learn');
        }
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (isTimeUp || selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);

    try {
      const response = await api.questions.submit({
        user_id: userId,
        question_id: currentQuestion.question_id,
        arm_id: armId,
        session_id: sessionId,
        answer: answer,
        current_representation: representation
      }, token);

      if (response.status === 'success') {
        const data = response.data;
        setMisconception(data.misconception);
        
        // Tentukan tipe feedback
        let feedbackType = 'correct';
        let feedbackTitle = 'Jawaban Tepat';
        
        if (!data.is_correct) {
          if (data.misconception !== 'unknown' && data.misconception !== 'none') {
            feedbackType = 'misconception';
            feedbackTitle = 'Miskonsepsi Terdeteksi';
          } else {
            feedbackType = 'wrong';
            feedbackTitle = 'Jawaban Salah';
          }
        }
        
        setFeedbackData({
          type: feedbackType,
          title: feedbackTitle,
          message: data.feedback
        });
        
        setRepresentation(data.next_representation || "simbolik");

        if (data.current_session) {
          localStorage.setItem('currentSession', data.current_session.toString());
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleSelesaiClick = () => {
    if (isTimeUp) {
      setActiveModal("waktu_habis");
    } else if (soalCount < 20) {
      setActiveModal("belum_target");
    } else {
      setActiveModal("sudah_target_sisa_waktu");
    }
  };

  const eksekusiKeluar = () => {
    setActiveModal(null);
    router.push("/learn");
  };

  const handleNextSoal = () => {
    if (soalCount >= 20) {
      setIsFinished(true);
    } else {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setSoalCount((prev) => prev + 1);
      fetchNextQuestion();
    }
  };

  const repLabel: Record<string, string> = {
    visual: "Visual",
    garis_bilangan: "Garis Bilangan",
    simbolik: "Simbolik"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-5 text-on-surface-variant font-medium">Memuat soal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 to-indigo-50/40 text-on-surface">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Tantangan Aktif" showBackButton={false} isSidebarOpen={isSidebarOpen} />

      <main className={`pt-24 px-edge-margin pb-12 transition-all duration-300 ${isSidebarOpen ? "ml-[280px]" : "ml-[78px]"}`}>
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          
          {/* ===== HEADER SOAL ===== */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-5 rounded-2xl shadow-lg text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">format_list_numbered</span>
                <span className="font-bold text-sm">Soal <span className="text-lg">{soalCount}</span> / 20</span>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${
                timeLeft < 300 
                  ? "bg-red-500/30 text-white animate-pulse" 
                  : "bg-white/20 text-white"
              }`}>
                <span className="material-symbols-outlined text-sm">timer</span>
                <span className="font-mono font-bold text-sm tabular-nums">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* ===== CARD UTAMA ===== */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            
            {/* Header Card */}
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                <div>
                  <h3 className="font-bold text-on-surface text-sm">Evaluasi Mandiri</h3>
                  <p className="text-xs text-on-surface-variant">
                    Representasi: <span className="font-semibold">{repLabel[representation] || representation}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body Card */}
            <div className="p-6 space-y-6">
              
              {/* Peringatan */}
              {!selectedAnswer && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/80 px-4 py-2.5 rounded-lg border border-amber-200/60">
                  <span className="material-symbols-outlined text-sm">lock_clock</span>
                  <span>Pilih dengan teliti! Jawaban akan terkunci setelah kamu klik.</span>
                </div>
              )}

              {/* Canvas Representasi */}
              <div className="bg-gray-50/60 rounded-xl border border-gray-200/60 p-6 flex flex-col items-center justify-center min-h-[200px] transition-all">
                {currentQuestion?.text ? (
                  renderRepresentation(representation, currentQuestion.text)
                ) : (
                  <div className="text-center text-on-surface-variant">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm">Memuat soal...</p>
                  </div>
                )}
              </div>

              {/* Opsi Jawaban */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentQuestion?.options && typeof currentQuestion.options === 'string' 
                  ? JSON.parse(currentQuestion.options).map((opt: string, index: number) => (
                      <button
                        key={`${opt}-${index}`}
                        disabled={isTimeUp || selectedAnswer !== null}
                        onClick={() => handleAnswer(opt)}
                        className={`p-4 border-2 rounded-xl font-bold transition-all flex items-center justify-center min-h-[70px] ${
                          selectedAnswer === opt 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200" 
                            : selectedAnswer !== null 
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" 
                              : "border-gray-200 hover:border-primary hover:bg-primary/5 bg-white active:scale-95"
                        }`}
                      >
                        <FractionDisplay text={opt} />
                      </button>
                    ))
                  : currentQuestion?.options?.map((opt: string, index: number) => (
                      <button
                        key={`${opt}-${index}`}
                        disabled={isTimeUp || selectedAnswer !== null}
                        onClick={() => handleAnswer(opt)}
                        className={`p-4 border-2 rounded-xl font-bold transition-all flex items-center justify-center min-h-[70px] ${
                          selectedAnswer === opt 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200" 
                            : selectedAnswer !== null 
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" 
                              : "border-gray-200 hover:border-primary hover:bg-primary/5 bg-white active:scale-95"
                        }`}
                      >
                        <FractionDisplay text={opt} />
                      </button>
                    ))
                }
              </div>

              {/* Feedback */}
              {showFeedback && feedbackData && (
                <div className={`p-5 rounded-xl border animate-fadeIn ${
                  feedbackData.type === 'correct' 
                    ? "bg-emerald-50/80 border-emerald-200" 
                    : feedbackData.type === 'misconception'
                      ? "bg-amber-50/80 border-amber-200"
                      : "bg-red-50/80 border-red-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-lg mt-0.5 ${
                      feedbackData.type === 'correct' 
                        ? "text-emerald-600" 
                        : feedbackData.type === 'misconception'
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}>
                      {feedbackData.type === 'correct' 
                        ? "check_circle" 
                        : feedbackData.type === 'misconception'
                          ? "psychology"
                          : "error"}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-bold text-sm ${
                        feedbackData.type === 'correct' 
                          ? "text-emerald-700" 
                          : feedbackData.type === 'misconception'
                            ? "text-amber-700"
                            : "text-red-700"
                      }`}>
                        {feedbackData.title}
                      </h4>
                      <p className={`text-sm mt-1 leading-relaxed ${
                        feedbackData.type === 'correct' 
                          ? "text-emerald-700" 
                          : feedbackData.type === 'misconception'
                            ? "text-amber-800"
                            : "text-red-800"
                      }`}>
                        {feedbackData.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Aksi */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <button 
                  onClick={handleSelesaiClick}
                  className="px-5 py-2.5 border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 active:scale-95 transition-all text-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Selesai Modul
                </button>
                {showFeedback && (
                  <button 
                    onClick={handleNextSoal}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    {soalCount >= 20 ? "Lihat Hasil" : "Soal Selanjutnya"}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ===== MODAL ===== */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-amber-500 mb-3">warning</span>
              <h4 className="font-bold text-lg text-on-surface">Misi Belum Selesai</h4>
              <p className="text-sm text-on-surface-variant mt-2">
                Kamu baru mengerjakan {soalCount} dari 20 soal. Yakin mau keluar?
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={eksekusiKeluar}
                className="px-4 py-2 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-all"
              >
                Tetap Keluar
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SELESAI ===== */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <span className="material-symbols-outlined text-5xl text-emerald-500 mb-3">check_circle</span>
            <h4 className="text-xl font-bold text-on-surface">Misi Selesai</h4>
            <p className="text-sm text-on-surface-variant mt-2">
              Kamu sudah menyelesaikan 20 soal dengan baik. Lihat analisis kesalahanmu untuk memahami materi lebih dalam.
            </p>
            <button 
              onClick={() => router.push("/progress")}
              className="mt-5 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">analytics</span>
              Lihat Evaluasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}