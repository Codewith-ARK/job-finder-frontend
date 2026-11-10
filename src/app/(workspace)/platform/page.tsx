import type { Metadata } from "next";
import { PlatformWorkspace } from "@/features/platform/components/platform-workspace";
import { WorkspaceGuard } from "@/features/workspace/components/workspace-guard";

export const metadata: Metadata = { title: "Platform overview" };

export default function PlatformPage() {
  return (
    <WorkspaceGuard workspace="platform">
      <PlatformWorkspace />
    </WorkspaceGuard>
  );
}
