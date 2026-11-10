import { Providers } from "@/app/providers";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <WorkspaceShell>{children}</WorkspaceShell>
    </Providers>
  );
}
