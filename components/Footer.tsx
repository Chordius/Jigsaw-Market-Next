import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-8 px-6 flex justify-between items-center border-t border-outline-variant bg-surface-container-lowest mt-auto">
      <div className="text-label-md font-black text-outline">Jigsaw</div>
      <div className="flex gap-6">
        <Link className="text-label-sm font-label text-outline hover:text-primary opacity-80 transition-colors" href="#">Terms</Link>
        <Link className="text-label-sm font-label text-outline hover:text-primary opacity-80 transition-colors" href="#">GitHub</Link>
        <Link className="text-label-sm font-label text-outline hover:text-primary opacity-80 transition-colors" href="#">Privacy</Link>
        <Link className="text-label-sm font-label text-outline hover:text-primary opacity-80 transition-colors" href="#">API</Link>
      </div>
      <div className="text-label-sm font-label text-outline">© 2024 Jigsaw Terminal</div>
    </footer>
  );
}
