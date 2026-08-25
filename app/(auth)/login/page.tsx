// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🔥 TAMBAHKAN

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.auth.login(nis, password);
      if (response.status === "success") {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.user.id.toString());
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("groupType", response.user.group_type);
        localStorage.setItem("currentSession", response.user.current_session?.toString() || "1");
        router.push("/dashboard");
      } else {
        setError(response.detail || "Login gagal. Silakan coba lagi.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Periksa koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-100">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-200/60 p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">MathBuddy</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              No Absen Siswa
            </label>
            <input
              type="text"
              placeholder="Contoh : B01"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="w-full px-5 py-4 bg-white border-2 border-blue-200 rounded-2xl text-base focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white border-2 border-blue-200 rounded-2xl text-base focus:outline-none focus:border-primary transition-colors pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <span className="material-symbols-outlined text-2xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl text-lg hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}