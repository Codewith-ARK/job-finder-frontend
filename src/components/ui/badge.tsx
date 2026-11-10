const tones = {
  neutral: "border-slate-200 bg-slate-100/80 text-slate-700",
  accent: "border-transparent bg-lime text-forest-deep",
  warning: "border-amber/40 bg-amber/20 text-[#7a4f00]",
  danger: "border-coral/25 bg-coral/10 text-[#a13e2c]",
  info: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[11px] font-semibold leading-5 ${tones[tone]} ${className}`}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        />
      )}
      {children}
    </span>
  );
}
