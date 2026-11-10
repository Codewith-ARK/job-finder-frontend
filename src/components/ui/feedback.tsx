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
    <Alert role={kind === "error" ? "alert" : "status"}>
      <div>
        {kind === "loading" && <Spinner aria-label="Loading" />}
        <h2>{title}</h2>
        {children && <p>{children}</p>}
        {action}
      </div>
    </Alert>
  );
}
