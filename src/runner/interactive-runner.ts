import { checkbox, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { exec } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// --- Type Definitions ---
interface TestOptions {
  project: string;
  environment: string;
  browsers: string[];
  testType: string;
  headed: boolean;
  debug: boolean;
  parallel: boolean;
  customGrep: string;
}

interface Preset {
  name: string;
  description: string;
  options: Partial<TestOptions>;
}

// --- Preset Definitions ---
const presets: Preset[] = [
  {
    name: "💨 PCF Smoke (Dev)",
    description: "Runs critical path tests for PCF on Chromium.",
    options: {
      project: "pcf",
      environment: "dev",
      browsers: ["chromium"],
      testType: "smoke",
    },
  },
  {
    name: "🔄 MSS Regression (Staging)",
    description: "Runs the full MSS regression suite on all browsers.",
    options: {
      project: "mss",
      environment: "staging",
      browsers: ["chromium", "firefox", "webkit"],
      testType: "regression",
    },
  },
  {
    name: "🌟 Ilham Auth (UAT)",
    description: "Runs authentication tests for Ilham in the UAT environment.",
    options: {
      project: "ilham",
      environment: "uat",
      browsers: ["chromium"],
      testType: "auth",
    },
  },
];

// --- Main Runner Logic ---
async function runInteractiveRunner() {
  try {
    while (true) {
      console.log(chalk.blue.bold("\n🎭 Playwright Multi-Project Test Runner\n"));
      const action = await select({
        message: "Select an action:",
        choices: [
          { name: "🚀 Configure and run tests", value: "new_run" },
          { name: "⚡️ Run a preset configuration", value: "preset_run" },
          { name: "📊 Generate Allure test report", value: "report" },
          { name: "❌ Exit", value: "exit" },
        ],
      });

      if (action === "exit") {
        break; // Exit the loop
      }

      switch (action) {
        case "new_run":
          await configureAndRun();
          break;
        case "preset_run":
          await runFromPreset();
          break;
        case "report":
          await generateReport();
          break;
      }
    }
  } catch (error: any) {
    // Gracefully handle Ctrl+C (ExitPromptError)
    if (error.constructor.name === "ExitPromptError" || (error.message && error.message.includes("force closed"))) {
      console.log(chalk.yellow("\n\n👋 Runner closed. Goodbye!"));
      process.exit(0);
    }
    // Handle other errors
    console.error(chalk.red("\n❌ An unexpected error occurred:"));
    console.error(error);
    process.exit(1);
  }
  console.log(chalk.yellow("\n👋 Goodbye!"));
}

// --- Action Handlers ---
async function configureAndRun() {
  const options = await promptForOptions();
  if (options) {
    await executeTestRun(options);
  }
}

async function runFromPreset() {
  const selectedPreset = await select({
    message: "Choose a preset configuration:",
    choices: presets.map((p) => ({
      name: p.name,
      description: p.description,
      value: p.options,
    })),
  });

  // Merge preset with defaults to create full options object
  const fullOptions: TestOptions = {
    headed: false,
    debug: false,
    parallel: true,
    customGrep: "",
    ...selectedPreset,
  } as TestOptions;

  await executeTestRun(fullOptions);
}

async function generateReport() {
  console.log(chalk.blue("\n📊 Generating and opening Allure report..."));
  try {
    await execAsync("pnpm run report:serve");
  } catch (err: any) {
    console.error(chalk.red("\n❌ Error generating report."));
    console.error(chalk.yellow("   Ensure you have test results in 'allure-results/' and Allure is installed."));
    if (err.stderr) {
      console.error(chalk.gray(err.stderr));
    }
  }
}

// --- Core Functions ---
async function promptForOptions(): Promise<TestOptions | null> {
  const options: Partial<TestOptions> = {};

  options.project = await select({ message: "Select project:", choices: getProjectChoices() });
  options.environment = await select({
    message: "Select environment:",
    choices: getEnvironmentChoices(options.project!),
  });

  // File validation
  const envFile = path.join(process.cwd(), "config", `.env.${options.project}.${options.environment}`);
  if (!existsSync(envFile)) {
    console.error(chalk.red(`\n❌ Environment file not found: ${envFile}`));
    console.log(chalk.yellow("Please create the file before running tests.\n"));
    return null;
  }

  options.browsers = await checkbox({
    message: "Select browsers:",
    choices: getBrowserChoices(),
    validate: (c) => c.length > 0 || "Select at least one browser.",
  });
  options.testType = await select({ message: "Select test type:", choices: getTestTypeChoices() });

  if (options.testType === "custom") {
    options.customGrep = await input({
      message: "Enter custom grep pattern:",
      validate: (v) => (v.trim() ? true : "Pattern cannot be empty."),
    });
  }

  options.headed = await select({ message: "Run in headed mode?", choices: getYesNoChoices(), default: false });
  options.debug = await select({ message: "Enable debug mode?", choices: getYesNoChoices(), default: false });
  options.parallel = await select({ message: "Run in parallel?", choices: getYesNoChoices(), default: true });

  return options as TestOptions;
}

async function executeTestRun(options: TestOptions) {
  const command = buildCommand(options);
  displaySummary(options);

  const proceed = await select({
    message: "🚀 Start test execution?",
    choices: getYesNoChoices(true, "Yes, run tests", "No, go back"),
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("\nTest run cancelled."));
    return;
  }

  console.log(chalk.gray(`\nExecuting: ${command}\n`));
  console.log(chalk.blue("⏳ Running tests...\n"));
  const startTime = Date.now();
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes("Warning")) console.error(chalk.red(stderr));
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(chalk.green(`\n✅ Test run completed in ${duration}s!\n`));
  } catch (err: any) {
    console.error(chalk.red("\n❌ Test execution failed. See output above for details."));
    // The stdout from the failed command is often the most useful part
    if (err.stdout) console.log(err.stdout);
  }
}

function buildCommand(options: TestOptions): string {
  const targets = options.browsers!.join(",");
  const envVars = `PROJECT=${options.project} ENV=${options.environment} TARGETS=${targets}`;
  let cmd = `${envVars} npx playwright test tests/${options.project}`;

  const projectConfigs = options.browsers!.map((b) =>
    b === "mobile"
      ? `${options.project}_${options.environment}_mobile`
      : `${options.project}_${options.environment}_${b}`
  );

  // FIX: Removed quotes around the joined project names
  if (projectConfigs.length > 0) {
    cmd += ` --project=${projectConfigs.join(",")}`;
  }

  if (options.testType !== "all") {
    const grep = options.testType === "custom" ? options.customGrep : `@${options.testType}`;
    cmd += ` --grep "${grep}"`;
  }

  if (options.headed) cmd += " --headed";
  if (options.debug) cmd += " --debug";
  if (!options.parallel) cmd += " --workers=1";

  return cmd;
}

// --- Helpers & UI ---
function displaySummary(options: TestOptions) {
  console.log(chalk.cyan("\n📋 Test Configuration Summary:"));
  console.log(chalk.gray(`   Project:     ${options.project.toUpperCase()}`));
  console.log(chalk.gray(`   Environment: ${options.environment}`));
  console.log(chalk.gray(`   Browsers:    ${options.browsers!.join(", ")}`));
  console.log(chalk.gray(`   Test Type:   ${options.testType}`));
  if (options.testType === "custom") console.log(chalk.gray(`   Grep:        ${options.customGrep}`));
  console.log(chalk.gray(`   Mode:        ${options.headed ? "Headed" : "Headless"}`));
  console.log(chalk.gray(`   Debug:       ${options.debug ? "Enabled" : "Disabled"}`));
  console.log(chalk.gray(`   Parallel:    ${options.parallel ? "Enabled" : "Disabled"}\n`));
}

const getProjectChoices = () => [
  { name: "🏢 PCF", value: "pcf" },
  { name: "📊 MSS", value: "mss" },
  { name: "🌟 Ilham", value: "ilham" },
];
const getBrowserChoices = () => [
  { name: "Chromium", value: "chromium" },
  { name: "Firefox", value: "firefox" },
  { name: "WebKit", value: "webkit" },
  { name: "Mobile", value: "mobile" },
];
const getTestTypeChoices = () => [
  { name: "💨 Smoke", value: "smoke" },
  { name: "🔄 Regression", value: "regression" },
  { name: "📱 Mobile", value: "mobile" },
  { name: "🔐 Auth", value: "auth" },
  { name: "📋 All", value: "all" },
  { name: "🎯 Custom", value: "custom" },
];
const getYesNoChoices = (useLong = false, yes = "Yes", no = "No") => [
  { name: useLong ? yes : "Yes", value: true },
  { name: useLong ? no : "No", value: false },
];
const getEnvironmentChoices = (project: string) => {
  const envs = { pcf: ["dev", "staging", "uat"], mss: ["dev", "staging"], ilham: ["dev", "uat", "jit"] };
  return (envs[project as keyof typeof envs] || []).map((e) => ({
    name: e.charAt(0).toUpperCase() + e.slice(1),
    value: e,
  }));
};

// --- Script Entry Point ---
if (require.main === module) {
  runInteractiveRunner();
}
