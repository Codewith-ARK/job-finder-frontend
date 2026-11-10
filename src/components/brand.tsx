import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand${light ? " brand-light" : ""}`}
      aria-label="Job Finder home"
    >
      <span className="brand-mark" aria-hidden="true">
        jf<span>↗</span>
      </span>
      <span>
        jobfinder<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
