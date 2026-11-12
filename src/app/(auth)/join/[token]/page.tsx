import type { Metadata } from "next";
import { ReferralJoin } from "@/features/referrals/components/referral-join";

export const metadata: Metadata = { title: "Join your agency" };

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ReferralJoin token={token} />;
}
