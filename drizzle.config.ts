import "dotenv/config"; // make sure to install dotenv package
import { defineConfig } from "drizzle-kit";
import { env } from "src/env.mjs";

export default defineConfig({
  dialect: "postgresql",
  out: "./src/db/drizzle",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
