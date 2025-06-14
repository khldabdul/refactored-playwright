import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load project and environment from env variables
const project = process.env.PROJECT || "pcf";
const environment = process.env.ENV || "dev";

// Load environment-specific config
dotenv.config({
  path: path.join(__dirname, `config/.env.${project}.${environment}`),
});

const config = defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: {
    timeout: parseInt(process.env.TIMEOUT_EXPECT || "10000"),
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? parseInt(process.env.MAX_RETRIES || "2") : 0,
  workers: process.env.CI
    ? "50%"
    : parseInt(process.env.PARALLEL_WORKERS || "4"),

  reporter: [
    ["line"],
    [
      "html",
      {
        open: "never",
        outputFolder: "playwright-report",
      },
    ],
    [
      "json",
      {
        outputFile: "test-results/results.json",
      },
    ],
    [
      "junit",
      {
        outputFile: "test-results/junit.xml",
      },
    ],
    [
      "allure-playwright",
      {
        outputFolder: "allure-results",
        environmentInfo: {
          PROJECT: project.toUpperCase(),
          ENVIRONMENT: environment.toUpperCase(),
          NODE_VERSION: process.version,
          OS: process.platform,
          BASE_URL: process.env.BASE_URL || "",
          API_URL: process.env.API_URL || "",
        },
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    trace: process.env.ENABLE_TRACE === "true" ? "on-first-retry" : "off",
    video:
      process.env.VIDEO_ON_FAILURE === "true" ? "retain-on-failure" : "off",
    screenshot:
      process.env.SCREENSHOT_ON_FAILURE === "true" ? "only-on-failure" : "off",
    actionTimeout: parseInt(process.env.TIMEOUT_ACTION || "15000"),
    navigationTimeout: parseInt(process.env.TIMEOUT_NAVIGATION || "30000"),
    ignoreHTTPSErrors: true,
    locale: "en-US",
    timezoneId: "UTC",
  },

  projects: [
    // PCF Projects
    {
      name: "pcf_dev_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/pcf\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "pcf" && process.env.ENV === "dev" ? ".*" : "$^"
      ),
    },
    {
      name: "pcf_staging_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/pcf\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "pcf" && process.env.ENV === "staging"
          ? ".*"
          : "$^"
      ),
    },
    {
      name: "pcf_uat_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/pcf\/.*smoke.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "pcf" && process.env.ENV === "uat"
          ? "@smoke"
          : "$^"
      ),
    },

    // MSS Projects
    {
      name: "mss_dev_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/mss\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "mss" && process.env.ENV === "dev" ? ".*" : "$^"
      ),
    },
    {
      name: "mss_staging_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/mss\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "mss" && process.env.ENV === "staging"
          ? ".*"
          : "$^"
      ),
    },

    // Ilham Projects
    {
      name: "ilham_dev_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/ilham\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "ilham" && process.env.ENV === "dev"
          ? ".*"
          : "$^"
      ),
    },
    {
      name: "ilham_uat_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/ilham\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "ilham" && process.env.ENV === "uat"
          ? ".*"
          : "$^"
      ),
    },
    {
      name: "ilham_jit_chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /tests\/ilham\/.*smoke.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "ilham" && process.env.ENV === "jit"
          ? "@smoke"
          : "$^"
      ),
    },

    // Mobile variants for critical projects
    {
      name: "pcf_dev_mobile",
      use: {
        ...devices["iPhone 13"],
      },
      testMatch: /tests\/pcf\/.*mobile.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "pcf" && process.env.ENV === "dev"
          ? "@mobile"
          : "$^"
      ),
    },

    // Firefox variants
    {
      name: "pcf_dev_firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
      testMatch: /tests\/pcf\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "pcf" && process.env.ENV === "dev" ? ".*" : "$^"
      ),
    },

    // Safari/WebKit variants
    {
      name: "pcf_dev_webkit",
      use: {
        ...devices["Desktop Safari"],
      },
      testMatch: /tests\/pcf\/.*\.spec\.ts/,
      grep: new RegExp(
        process.env.PROJECT === "pcf" && process.env.ENV === "dev" ? ".*" : "$^"
      ),
    },
  ],

  // Output directories
  outputDir: "test-results/",

  // Global setup and teardown
  globalSetup: require.resolve("./scripts/global-setup.ts"),
  globalTeardown: require.resolve("./scripts/global-teardown.ts"),
});

export default config;
