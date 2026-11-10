import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      {icon && (
        <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-white text-emerald-700 shadow-sm">
          {icon}
        </span>
      )}
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
