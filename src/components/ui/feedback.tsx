import { Spinner } from "flowbite-react";

export function Feedback({
  title,
  children,
  action,
  kind = "info",
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  kind?: "info" | "error" | "loading";
}) {
  const isError = kind === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`rounded-2xl border p-6 ${
        isError ? "border-coral/25 bg-coral/5" : "border-slate-200 bg-surface"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            isError ? "bg-coral/10 text-coral" : "bg-slate-100 text-emerald-700"
          }`}
        >
          {kind === "loading" ? (
            <Spinner size="sm" aria-label="Loading" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {isError ? (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5v5.5M12 16.5h.01" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 7.5h.01" />
                </>
              )}
            </svg>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {children && (
            <div className="mt-1 text-sm leading-relaxed text-slate-600">
              {children}
            </div>
          )}
          {action && <div className="mt-4 flex flex-wrap gap-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}
