import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="Job Finder home"
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-[10px] transition-transform duration-200 group-hover:-rotate-3 ${
          light ? "bg-lime text-forest-deep" : "bg-forest text-lime"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 17 17 7M8 7h9v9"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="17" r="1.7" fill="currentColor" />
        </svg>
      </span>
      <span
        className={`text-[15px] font-semibold tracking-[-0.035em] ${
          light ? "text-white" : "text-ink"
        }`}
      >
        Job Finder
      </span>
    </Link>
  );
}
