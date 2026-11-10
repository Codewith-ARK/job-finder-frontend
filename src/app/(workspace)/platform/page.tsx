import type { Metadata } from "next";
import { PlatformWorkspace } from "@/features/platform/components/platform-workspace";

export const metadata: Metadata = { title: "Platform workspace" };

export default function PlatformPage() {
  return <PlatformWorkspace />;
}
