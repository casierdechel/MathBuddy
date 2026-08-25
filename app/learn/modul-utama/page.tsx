// app/learn/modul-utama/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";
import { api } from "@/services/api";

// --- KOMPONEN REPRESENTASI (diperbesar) ---

// VisualRepresentation dengan ukuran lebih besar
function VisualRepresentation({ a, b, c, d, operator, shape }: {
  a: number; b: number; c: number; d: number; operator: string; shape?: 'bar' | 'circle'
}) {
  const usedShape = shape || ['bar', 'circle'][(a + b + c + d) % 3];

  const BarShape = ({ num, den, color }: { num: number; den: number; color: string }) => (
    <div className="flex-1 h-16 border-2 border-gray-300 rounded-2xl overflow-hidden bg-white grid"
         style={{ gridTemplateColumns: `repeat(${den}, 1fr)` }}>
      {Array.from({ length: den }).map((_, i) => (
        <div key={i} className={`${i < num ? color : 'bg-white'} border-r border-gray-200 last:border-r-0`} />
      ))}
    </div>
  );

  const CircleShape = ({ num, den, color }: { num: number; den: number; color: string }) => {
    const size = 140;
    const cx = size/2, cy = size/2;
    const radius = 55;
    const angleStep = (2 * Math.PI) / den;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (num / den) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const sectorPath = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-32 h-32">
          <circle cx={cx} cy={cy} r={radius} fill="white" stroke="#888" strokeWidth="2.5" />
          {Array.from({ length: den }).map((_, i) => {
            const angle = -Math.PI/2 + i*angleStep;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ccc" strokeWidth="2" />;
          })}
          {num > 0 && <path d={sectorPath} fill={color} opacity="0.7" stroke="white" strokeWidth="1.5" />}
          {Array.from({ length: den }).map((_, i) => {
            const angle = -Math.PI/2 + i*angleStep;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return <line key={`border-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#999" strokeWidth="2" />;
          })}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#666" strokeWidth="2.5" />
        </svg>
      </div>
    );
  };

  const renderFraction = (num: number, den: number, color: string) => {
    switch (usedShape) {
      case 'bar': return <BarShape num={num} den={den} color={color} />;
      case 'circle': return <CircleShape num={num} den={den} color={color} />;
      default: return <BarShape num={num} den={den} color={color} />;
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex items-center gap-4">
        {renderFraction(a, b, 'bg-blue-500/70')}
      </div>
      <div className="flex justify-center py-1">
        <span className="w-12 h-12 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-3xl text-gray-600 shadow-md">
          {operator === '-' ? '−' : '+'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {renderFraction(c, d, 'bg-indigo-500/70')}
      </div>
    </div>
  );
}

// NumberLineRepresentation diperbesar
function NumberLineRepresentation({ a, b, c, d, operator }: { a: number; b: number; c: number; d: number; operator: string }) {
  const renderLine = (num: number, den: number, color: 'primary' | 'secondary') => {
    const step = 100 / den;
    const pos = (num / den) * 100;
    return (
      <div className="relative w-full h-16">
        <div className="absolute bottom-4 left-0 w-full h-1 bg-gray-400"></div>
        {Array.from({ length: den + 1 }).map((_, i) => {
          const left = (i / den) * 100;
          return <div key={i} className="absolute bottom-1 w-px h-5 bg-gray-400" style={{ left: `${left}%` }} />;
        })}
        <div className="absolute top-0 left-0 transform -translate-x-1/2 text-base font-medium text-gray-500">0</div>
        <div className="absolute top-0 right-0 transform translate-x-1/2 text-base font-medium text-gray-500">{den}/{den}</div>
        <div className="absolute bottom-1 transform -translate-x-1/2" style={{ left: `${pos}%` }}>
          <div className={`w-6 h-6 rounded-full border-2 border-${color} bg-white shadow-md`} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex-1">{renderLine(a, b, 'primary')}</div>
      <div className="flex justify-center py-1">
        <span className="w-12 h-12 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-3xl text-gray-600 shadow-md">
          {operator === '-' ? '−' : '+'}
        </span>
      </div>
      <div className="flex-1">{renderLine(c, d, 'secondary')}</div>
    </div>
  );
}

// SymbolicRepresentation diperbesar
function SymbolicRepresentation({ text }: { text: string }) {
  const parts = text.split(/\s+/).filter(s => s.length > 0);
  return (
    <div className="flex items-center justify-center gap-4 text-4xl font-bold text-on-surface flex-wrap">
      {parts.map((part, idx) => {
        if (part === '+' || part === '-') {
          return <span key={idx} className="text-4xl text-gray-600">{part === '-' ? '−' : '+'}</span>;
        }
        const fractionParts = part.split('/');
        if (fractionParts.length === 2) {
          return (
            <div key={idx} className="flex flex-col items-center mx-2">
              <span className="text-3xl leading-none">{fractionParts[0]}</span>
              <span className="border-t-2 border-gray-600 w-12 my-1"></span>
              <span className="text-3xl leading-none">{fractionParts[1]}</span>
            </div>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </div>
  );
}

// FractionDisplay (untuk opsi) diperbesar
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
  const [soalCount, setSoalCount] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(1200);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<"belum_target" | "sudah_target_sisa_waktu" | "waktu_habis" | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🔥 PERUBAHAN: Tambahkan state untuk loading feedback
  const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef<boolean>(false);
  const timeLeftRef = useRef<number>(timeLeft);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  function extractFractions(text: string) {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/(\d+)\/(\d+)\s*([+\-])\s*(\d+)\/(\d+)/);
    if (!match) return null;
    return { a: parseInt(match[1]), b: parseInt(match[2]), operator: match[3], c: parseInt(match[4]), d: parseInt(match[5]) };
  }

  function renderRepresentation(repType: string, text: string) {
    if (!text) return <div className="text-center text-gray-500 text-lg">Memuat soal...</div>;
    const fractions = extractFractions(text);
    if (!fractions) return <SymbolicRepresentation text={text} />;
    switch (repType) {
      case "visual": return <VisualRepresentation {...fractions} />;
      case "garis_bilangan": return <NumberLineRepresentation {...fractions} />;
      case "simbolik": return <SymbolicRepresentation text={text.split('=')[0].trim()} />;
      default: return <SymbolicRepresentation text={text} />;
    }
  }

  const fetchNextQuestion = useCallback(async (sessionIdParam?: number, tokenOverride?: string) => {
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
        if (data.session_id) setSessionId(data.session_id);
        if (data.sequence_number) setSoalCount(data.sequence_number);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [sessionId, representation, token]);

  // Timer: update ref
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Timer: hanya dijalankan sekali saat mount
  useEffect(() => {
    if (isTimeUp) return;

    timerRef.current = setInterval(() => {
      const currentTime = timeLeftRef.current;
      if (currentTime <= 1) {
        setIsTimeUp(true);
        setTimeLeft(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        const newTime = currentTime - 1;
        timeLeftRef.current = newTime;
        setTimeLeft(newTime);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // localStorage
  useEffect(() => {
    if (!hasInitialized.current) return;
    localStorage.setItem('sessionId', sessionId.toString());
    localStorage.setItem('soalCount', soalCount.toString());
    localStorage.setItem('representation', representation);
    localStorage.setItem('timeLeft', timeLeft.toString());
  }, [sessionId, soalCount, representation, timeLeft]);

  // Initialize
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (!storedToken || !storedUserId) { router.push('/login'); return; }
    setToken(storedToken);
    setUserId(parseInt(storedUserId, 10));
    const savedSessionId = localStorage.getItem('sessionId');
    const savedSoalCount = localStorage.getItem('soalCount');
    const savedRepresentation = localStorage.getItem('representation');
    const savedTimeLeft = localStorage.getItem('timeLeft');
    if (savedSessionId) setSessionId(parseInt(savedSessionId, 10));
    if (savedSoalCount) setSoalCount(parseInt(savedSoalCount, 10));
    if (savedRepresentation) setRepresentation(savedRepresentation);
    if (savedTimeLeft) { const parsed = parseInt(savedTimeLeft, 10); if (!isNaN(parsed) && parsed > 0) setTimeLeft(parsed); }
    const initialize = async () => {
      try {
        const response = await api.sessions.getStatus(storedToken);
        if (response.status === 'success') {
          const statuses = response.data;
          const currentSession = parseInt(localStorage.getItem('currentSession') || '1', 10);
          const sessionKey = `session_${currentSession}`;
          if (statuses[sessionKey] === 'completed') { router.push('/learn'); return; }
        }
      } catch (e) { console.error(e); }
      await fetchNextQuestion(sessionId, storedToken);
    };
    initialize();
  }, [router, fetchNextQuestion, sessionId]);

  // 🔥 PERUBAHAN: handleAnswer dengan loading feedback
  const handleAnswer = async (answer: string) => {
    if (isTimeUp || selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    // Tampilkan area feedback segera dengan loading
    setShowFeedback(true);
    setIsFeedbackLoading(true);
    // Reset feedback data agar tidak tampil feedback lama
    setFeedbackData(null);

    try {
      const response = await api.questions.submit({
        user_id: userId,
        question_id: currentQuestion.question_id,
        arm_id: armId,
        session_id: sessionId,
        answer,
        current_representation: representation
      }, token);
      if (response.status === 'success') {
        const data = response.data;
        setMisconception(data.misconception);
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
        setFeedbackData({ type: feedbackType, title: feedbackTitle, message: data.feedback });
        setRepresentation(data.next_representation || 'simbolik');
        if (data.current_session) localStorage.setItem('currentSession', data.current_session.toString());
      }
    } catch (e) {
      console.error(e);
      // Jika error, tampilkan feedback error
      setFeedbackData({ type: 'wrong', title: 'Terjadi Kesalahan', message: 'Gagal memproses jawaban. Coba lagi.' });
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleNextSoal = () => {
    if (soalCount >= 20) { setIsFinished(true); } else {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedbackData(null);
      setIsFeedbackLoading(false);
      setSoalCount(prev => prev + 1);
      fetchNextQuestion();
    }
  };

  const handleSelesaiClick = () => {
    if (isTimeUp) setActiveModal('waktu_habis');
    else if (soalCount < 20) setActiveModal('belum_target');
    else setActiveModal('sudah_target_sisa_waktu');
    localStorage.removeItem('timeLeft');
  };

  const eksekusiKeluar = () => { setActiveModal(null); router.push('/learn'); };
  const repLabel = { visual: 'Visual', garis_bilangan: 'Garis Bilangan', simbolik: 'Simbolik' };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-200">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/70 via-blue-50 to-indigo-100/70">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopAppBar title="Tantangan Aktif" showBackButton={false} isSidebarOpen={isSidebarOpen} />
      <main className={`pt-24 px-6 pb-12 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[78px]'}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header soal */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl shadow-xl text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">format_list_numbered</span>
                <span className="font-bold text-xl">Soal <span className="text-2xl">{soalCount}</span> / 20</span>
              </div>
              <div className={`flex items-center gap-3 px-5 py-2 rounded-full ${timeLeft < 300 ? 'bg-red-500/40 animate-pulse' : 'bg-white/20'}`}>
                <span className="material-symbols-outlined text-2xl">timer</span>
                <span className="font-mono font-bold text-xl tabular-nums">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Card utama */}
          <section className="bg-white rounded-3xl shadow-xl border border-blue-100/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">psychology</span>
              <div>
                <h3 className="font-bold text-xl">Evaluasi Mandiri</h3>
                <p className="text-base text-gray-500">Representasi: <span className="font-semibold">{repLabel[representation as keyof typeof repLabel] || representation}</span></p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {!selectedAnswer && (
                <div className="flex items-center gap-2 text-base text-amber-700 bg-amber-50/80 px-5 py-3 rounded-xl border border-amber-200/60">
                  <span className="material-symbols-outlined text-xl">lock_clock</span>
                  <span>Pilih dengan teliti! Jawaban terkunci setelah dipilih.</span>
                </div>
              )}
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100/60 p-8 flex flex-col items-center justify-center min-h-[300px] transition-all">
                {currentQuestion?.text ? renderRepresentation(representation, currentQuestion.text) : (
                  <div className="text-center text-gray-500 text-lg">Memuat soal...</div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentQuestion?.options && typeof currentQuestion.options === 'string'
                  ? JSON.parse(currentQuestion.options).map((opt: string, idx: number) => (
                      <button
                        key={`${opt}-${idx}`}
                        disabled={isTimeUp || selectedAnswer !== null}
                        onClick={() => handleAnswer(opt)}
                        className={`p-5 border-2 rounded-2xl font-bold transition-all flex items-center justify-center min-h-[100px] text-xl ${selectedAnswer === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-200' : selectedAnswer !== null ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 bg-white active:scale-95'}`}
                      >
                        <FractionDisplay text={opt} />
                      </button>
                    ))
                  : currentQuestion?.options?.map((opt: string, idx: number) => (
                      <button
                        key={`${opt}-${idx}`}
                        disabled={isTimeUp || selectedAnswer !== null}
                        onClick={() => handleAnswer(opt)}
                        className={`p-5 border-2 rounded-2xl font-bold transition-all flex items-center justify-center min-h-[100px] text-xl ${selectedAnswer === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-200' : selectedAnswer !== null ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 bg-white active:scale-95'}`}
                      >
                        <FractionDisplay text={opt} />
                      </button>
                    ))
                }
              </div>

              {/* 🔥 PERUBAHAN: Area feedback dengan loading */}
              {showFeedback && (
                <div className={`p-5 rounded-2xl border-2 text-lg ${
                  isFeedbackLoading ? 'border-blue-200 bg-blue-50/50' :
                  feedbackData?.type === 'correct' ? 'border-emerald-300 bg-emerald-50/80 text-emerald-700' :
                  feedbackData?.type === 'misconception' ? 'border-amber-300 bg-amber-50/80 text-amber-700' :
                  feedbackData?.type === 'wrong' ? 'border-red-300 bg-red-50/80 text-red-700' :
                  'border-blue-200 bg-blue-50/50'
                }`}>
                  <div className="flex items-start gap-3">
                    {isFeedbackLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent shrink-0 mt-1"></div>
                        <div>
                          <h4 className="font-bold text-blue-700 text-lg">Memeriksa jawaban...</h4>
                          <p className="text-blue-600 text-base mt-1">Mohon tunggu sebentar</p>
                        </div>
                      </>
                    ) : feedbackData ? (
                      <>
                        <span className="material-symbols-outlined text-2xl">
                          {feedbackData.type === 'correct' ? 'check_circle' :
                           feedbackData.type === 'misconception' ? 'psychology' : 'error'}
                        </span>
                        <div>
                          <h4 className="font-bold text-lg">{feedbackData.title}</h4>
                          <p className="text-base mt-1">{feedbackData.message}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500">Memuat feedback...</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <button onClick={handleSelesaiClick} className="px-6 py-3 border-2 border-red-300 text-red-600 font-bold rounded-2xl hover:bg-red-50 active:scale-95 transition-all text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">close</span>Selesai
                </button>
                {/* 🔥 PERUBAHAN: Tombol "Soal Selanjutnya" hanya muncul jika feedback sudah selesai loading */}
                {showFeedback && !isFeedbackLoading && feedbackData && (
                  <button onClick={handleNextSoal} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all text-lg flex items-center gap-2 shadow-md">
                    {soalCount >= 20 ? 'Lihat Hasil' : 'Soal Selanjutnya'}
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-amber-500 mb-3">warning</span>
              <h4 className="text-2xl font-bold">Misi Belum Selesai</h4>
              <p className="text-lg mt-2">Kamu baru mengerjakan {soalCount} dari 20 soal.</p>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={eksekusiKeluar} className="px-6 py-2 text-red-500 font-bold text-lg hover:bg-red-50 rounded-2xl transition-all">Tetap Keluar</button>
              <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-primary text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-6xl text-emerald-500 mb-3">check_circle</span>
            <h4 className="text-2xl font-bold">Misi Selesai</h4>
            <p className="text-lg mt-2">Kamu sudah menyelesaikan 20 soal. Lihat analisismu!</p>
            <button onClick={() => router.push('/progress')} className="mt-5 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 text-lg">
              <span className="material-symbols-outlined text-xl">analytics</span>Lihat Evaluasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}