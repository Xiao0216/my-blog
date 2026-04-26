import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100)
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`
const adminPassword =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "playwright-admin-password"
const inheritedEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] =>
      entry[1] !== undefined && entry[0] !== "FORCE_COLOR"
  )
)

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: [
      "rm -f .playwright/blog-smoke.sqlite .playwright/blog-smoke.sqlite-*",
      "mkdir -p .playwright",
      `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    ].join(" && "),
    env: {
      ...inheritedEnv,
      ADMIN_PASSWORD: adminPassword,
      BLOG_DATABASE_PATH: ".playwright/blog-smoke.sqlite",
      NEXT_PUBLIC_SITE_URL: baseURL,
      OPENAI_API_KEY: "",
      OPENAI_MODEL: "",
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
