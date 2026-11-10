import type { Metadata } from "next";
import { StaffWorkspace } from "@/features/staff/components/staff-workspace";

export const metadata: Metadata = { title: "Staff workspace" };

export default function StaffPage() {
  return <StaffWorkspace />;
}
