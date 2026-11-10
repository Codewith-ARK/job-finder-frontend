import type { ReactNode } from "react";

export type Metric = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "accent";
};

export function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              {metric.label}
            </p>
            {metric.icon && (
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  metric.tone === "accent"
                    ? "bg-lime text-forest-deep"
                    : "bg-slate-100 text-emerald-700"
                }`}
              >
                {metric.icon}
              </span>
            )}
          </div>
          <p className="metric-value mt-4 text-[30px] font-semibold leading-none text-ink">
            {metric.value}
          </p>
          {metric.hint && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {metric.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
