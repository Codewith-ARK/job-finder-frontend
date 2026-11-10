import { httpClient } from "../../lib/http.client.ts";
import type { AgencyStatus, PlatformData } from "./platform.types.ts";

export async function getPlatformWorkspace(
  signal?: AbortSignal,
): Promise<PlatformData> {
  const { data } = await httpClient.get<PlatformData>("/platform/workspace", {
    signal,
  });
  return data;
}

export async function updateAgencyStatus(
  agencyId: string,
  status: AgencyStatus,
): Promise<PlatformData> {
  const { data } = await httpClient.patch<PlatformData>(
    `/platform/agencies/${agencyId}`,
    { status },
  );
  return data;
}
