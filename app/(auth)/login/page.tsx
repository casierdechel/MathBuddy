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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.auth.login(nis, password);
      console.log("Login response:", response);

      if (response.status === "success") {
        // Simpan token dan user data ke localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.user.id.toString());
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("groupType", response.user.group_type);
        localStorage.setItem("currentSession", response.user.current_session?.toString() || "1");

        // Redirect ke halaman belajar
        router.push("/learn");
      } else {
        setError(response.detail || "Login gagal. Silakan coba lagi.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Terjadi kesalahan. Periksa koneksi internet atau server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Masuk ke MathBuddy</h1>
          <p className="text-sm text-on-surface-variant">
            Masukkan NIS dan password untuk mulai belajar pecahan.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              NIS (Nomor Induk Siswa)
            </label>
            <input
              type="text"
              placeholder="Contoh: 2024001"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant mt-8">
          * Password default: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">password123</span>
        </p>
      </div>
    </div>
  );
}