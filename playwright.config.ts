import { defineConfig, devices } from "@playwright/test";
import chalk from "chalk";
import dotenv from "dotenv";
import path from "path";

// --- 1. Define All Possible Project Configurations ---
// This central array is the single source of truth for all test configurations.
const allProjects = [
  // PCF Projects
  { name: "pcf_dev_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/pcf\/.*\.spec\.ts/ },
  { name: "pcf_staging_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/pcf\/.*\.spec\.ts/ },
  { name: "pcf_uat_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/pcf\/.*smoke.*\.spec\.ts/ },
  { name: "pcf_dev_firefox", use: { ...devices["Desktop Firefox"] }, testMatch: /tests\/pcf\/.*\.spec\.ts/ },
  { name: "pcf_dev_webkit", use: { ...devices["Desktop Safari"] }, testMatch: /tests\/pcf\/.*\.spec\.ts/ },
  { name: "pcf_dev_mobile", use: { ...devices["iPhone 13"] }, testMatch: /tests\/pcf\/.*mobile.*\.spec\.ts/ },

  // MSS Projects
  { name: "mss_dev_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/mss\/.*\.spec\.ts/ },
  { name: "mss_staging_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/mss\/.*\.spec\.ts/ },

  // Ilham Projects
  { name: "ilham_dev_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/ilham\/.*\.spec\.ts/ },
  { name: "ilham_uat_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/ilham\/.*\.spec\.ts/ },
  { name: "ilham_jit_chromium", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/ilham\/.*smoke.*\.spec\.ts/ },
];

// --- 2. Environment Validation Logic ---
// This block runs before Playwright starts and ensures the environment is correctly configured.

// Dynamically get all unique targets (e.g., 'chromium', 'mobile') from the allProjects array.
const AVAILABLE_TARGETS = [...new Set(allProjects.map((p) => p.name.split("_")[2]))];

// We skip this validation when running the interactive runner, since it sets the variables itself.
const isInteractive = process.env.npm_lifecycle_event === "test:interactive";

if (!isInteractive) {
  console.log(chalk.cyan("Validating environment variables..."));

  // Validate PROJECT
  if (!process.env.PROJECT) {
    console.error(chalk.red("❌ Error: PROJECT environment variable is not set."));
    console.error(chalk.yellow("   Please set it to one of your projects (e.g., pcf, mss, ilham)."));
    process.exit(1);
  }

  // Validate ENV
  if (!process.env.ENV) {
    console.error(chalk.red("❌ Error: ENV environment variable is not set."));
    console.error(chalk.yellow("   Please set it to a valid environment (e.g., dev, staging, uat)."));
    process.exit(1);
  }

  // Validate TARGETS
  if (!process.env.TARGETS) {
    console.error(chalk.red("❌ Error: TARGETS environment variable is not set."));
    console.error(chalk.yellow("   Please set it to one or more of the following (comma-separated):"));
    console.error(chalk.yellow(`   Available targets: ${AVAILABLE_TARGETS.join(", ")}`));
    process.exit(1);
  }

  // Validate the values within TARGETS
  const givenTargets = process.env.TARGETS.split(",");
  for (const target of givenTargets) {
    if (!AVAILABLE_TARGETS.includes(target)) {
      console.error(chalk.red(`❌ Error: Invalid target '${target}' found in TARGETS.`));
      console.error(chalk.yellow(`   Available targets: ${AVAILABLE_TARGETS.join(", ")}`));
      process.exit(1);
    }
  }
  console.log(chalk.green("✅ Environment variables validated successfully."));
}

// --- 3. Load and Filter Configuration ---
const project = process.env.PROJECT || "pcf";
const environment = process.env.ENV || "dev";
const targets = (process.env.TARGETS || "chromium").split(",");

// Load the correct .env file
dotenv.config({
  path: path.join(__dirname, `config/.env.${project}.${environment}`),
});

// --- 4. Define and Export the Final Playwright Config ---
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: {
    timeout: parseInt(process.env.TIMEOUT_EXPECT || "10000"),
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? parseInt(process.env.MAX_RETRIES || "2") : 0,
  workers: process.env.CI ? "50%" : parseInt(process.env.PARALLEL_WORKERS || "4"),

  reporter: [
    ["line"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    [
      "allure-playwright",
      {
        outputFolder: "allure-results",
        environmentInfo: {
          PROJECT: project.toUpperCase(),
          ENVIRONMENT: environment.toUpperCase(),
          NODE_VERSION: process.version,
          OS: process.platform,
        },
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    trace: process.env.CI ? "on-first-retry" : "on",
    screenshot: process.env.CI ? "only-on-failure" : "on",
    video: process.env.CI ? "retain-on-failure" : "off",
    actionTimeout: parseInt(process.env.TIMEOUT_ACTION || "15000"),
  },

  // Dynamically filter the projects to run based on the validated environment variables
  projects: allProjects.filter((p) => {
    // This logic is only active for non-interactive runs
    if (isInteractive) return true; // In interactive mode, let the runner's --project flag decide

    const [pProject, pEnv, pTarget] = p.name.split("_");
    return pProject === project && pEnv === environment && targets.includes(pTarget);
  }),

  outputDir: "test-results/",
  globalSetup: require.resolve("./scripts/global-setup.ts"),
  globalTeardown: require.resolve("./scripts/global-teardown.ts"),
});
