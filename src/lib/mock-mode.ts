export function isMockMode(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true"
  );
}

export function requireMockMode(): void {
  if (!isMockMode()) {
    throw new Error(
      "The demo is available only in development with mock mode enabled.",
    );
  }
}
