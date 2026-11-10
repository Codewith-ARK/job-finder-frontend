import { Alert, Spinner } from "flowbite-react";

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
  return (
    <Alert
      color={kind === "error" ? "failure" : "info"}
      role={kind === "error" ? "alert" : "status"}
    >
      <div className="flex flex-col gap-3">
        {kind === "loading" && (
          <Spinner aria-label="Loading" size="sm" className="self-start" />
        )}
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {children && (
            <div className="mt-1 text-sm text-slate-600">{children}</div>
          )}
        </div>
        {action && <div className="flex gap-2">{action}</div>}
      </div>
    </Alert>
  );
}
