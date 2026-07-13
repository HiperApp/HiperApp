"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashRedirect({ destino }: { destino: string }) {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace(destino), 1100);
    return () => clearTimeout(t);
  }, [destino, router]);

  return (
    <div className="fixed inset-0 bg-hiper-red flex flex-col items-center justify-center px-8 text-center">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2 4.5 5.6 4c2-.3 3.7.7 4.9 2.2L12 8l1.5-1.8C14.7 4.7 16.4 3.7 18.4 4c3.6.5 5.2 4.1 3.6 7.7C19.5 16.4 12 21 12 21Z"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M2 12h5l1.5-3L11 15l2-6 1.5 3H22"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h1 className="text-white text-4xl font-bold mt-4">HiperApp</h1>
      <p className="text-white/90 mt-2">Cuidar da sua saúde nunca foi tão fácil.</p>
      <div className="absolute bottom-16 w-40 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-white rounded-full animate-pulse" />
      </div>
    </div>
  );
}
