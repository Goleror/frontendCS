import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: "newarch.db",
  },
});
