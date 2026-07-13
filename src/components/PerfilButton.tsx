import Link from "next/link";

export default function PerfilButton({ className }: { className?: string }) {
  return (
    <Link
      href="/perfil"
      aria-label="Perfil"
      className={
        className ??
        "tap-target px-5 rounded-button bg-white shadow-soft flex items-center justify-center text-xl text-gray-600 border border-gray-200"
      }
    >
      <span aria-hidden>👤</span>
    </Link>
  );
}
