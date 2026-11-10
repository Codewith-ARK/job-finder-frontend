import { loadEnvFile } from "node:process";

// Load the public flag without forwarding --env-file into Next's worker options.
loadEnvFile(".env.example");
process.argv.splice(1, 1, "next", "dev");
await import("next/dist/bin/next");
