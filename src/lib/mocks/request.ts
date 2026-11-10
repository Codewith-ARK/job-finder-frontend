import { requireMockMode } from "../mock-mode.ts";

export async function mockRequest<T>(
  read: () => T,
  signal?: AbortSignal,
  delay = 250,
): Promise<T> {
  requireMockMode();
  signal?.throwIfAborted();
  await new Promise<void>((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, delay);
    signal?.addEventListener("abort", cancel, { once: true });
  });
  signal?.throwIfAborted();
  return structuredClone(read());
}
