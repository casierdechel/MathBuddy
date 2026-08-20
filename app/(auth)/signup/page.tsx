//app/(auth)/signup/page.tsx

"use client";

import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
        
        {/* Header Form */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Daftar Akun Baru</h1>
          <p className="text-sm text-on-surface-variant">
            Mulai petualangan belajarmu dan tingkatkan kemampuan matematika!
          </p>
        </div>

        {/* Form Sign Up */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Alex"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
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
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-on-surface-variant">
            <input type="checkbox" className="mt-0.5 rounded accent-primary" required />
            <span>
              Saya menyetujui seluruh <a href="#" className="text-primary font-semibold hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-primary font-semibold hover:underline">Kebijakan Privasi</a> yang berlaku.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
          >
            Daftar
          </button>
        </form>

        {/* Footer Form */}
        <p className="text-center text-sm text-on-surface-variant mt-8">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>

      </div>
    </div>
  );
}