// app/kuesioner/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KuesionerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect langsung ke Google Form
    window.location.href = "https://forms.gle/Qj6ppQ5PbezM5AAV9";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Mengarahkan ke kuesioner...</p>
    </div>
  );
}