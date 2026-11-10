import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}

export async function clearPrivateQueries(client: QueryClient) {
  await client.cancelQueries({ queryKey: ["private"] });
  client.removeQueries({ queryKey: ["private"] });
}
