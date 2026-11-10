import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="Job Finder home"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-[13px] font-bold text-white">
        JF
      </span>
      <span
        className={`text-[15px] font-semibold tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        Job Finder
      </span>
    </Link>
  );
}
