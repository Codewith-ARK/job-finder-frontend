import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="panel panel-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
        {icon && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-emerald-700">
            {icon}
          </span>
        )}
      </div>
      <p className="metric-value mt-4 text-[30px] font-semibold leading-none text-ink">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}
    </div>
  );
}
