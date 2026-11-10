import type { Metadata } from "next";
import { DemoPicker } from "@/features/auth/components/demo-picker";

export const metadata: Metadata = { title: "Explore the demo" };

export default function DemoPage() {
  return <DemoPicker />;
}
