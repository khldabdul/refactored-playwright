import { checkbox, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { exec } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { promisify } from "util";

// Use the specialized 'search' prompt for autocomplete functionality
import { search } from "@inquirer/prompts";

const execAsync = promisify(exec);

// --- Type Definitions ---
interface TestOptions {
  project: string;
  environment: string;
  browsers: string[];
  selectionMode: "tag" | "grep" | "files" | "all";
  grep?: string;
  testFiles?: string[];
  headed: boolean;
  debug: boolean;
  parallel: boolean;
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
    options: { project: "pcf", environment: "dev", browsers: ["chromium"], selectionMode: "tag", grep: "@smoke" },
  },
  {
    name: "🔄 MSS Regression (Staging)",
    description: "Runs the full MSS regression suite on all browsers.",
    options: {
      project: "mss",
      environment: "staging",
      browsers: ["chromium", "firefox", "webkit"],
      selectionMode: "tag",
      grep: "@regression",
    },
  },
  {
    name: "🌟 Ilham Auth (UAT)",
    description: "Runs authentication tests for Ilham in the UAT environment.",
    options: { project: "ilham", environment: "uat", browsers: ["chromium"], selectionMode: "tag", grep: "@auth" },
  },
];

// --- Helper Functions to Scan for Tests and Tags ---

/**
 * Recursively finds all test files in a directory.
 * @param dirPath - The directory to search.
 * @returns An array of full file paths.
 */
function findTestFiles(dirPath: string): string[] {
  let files: string[] = [];
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(findTestFiles(fullPath));
      } else if (entry.name.endsWith(".spec.ts")) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(chalk.red(`Error reading directory ${dirPath}:`), err);
  }
  return files;
}

/**
 * Scans all test files for a given project and extracts unique tags.
 * @param project - The project to scan (e.g., 'pcf').
 * @returns A promise that resolves to an array of unique tags.
 */
async function getProjectTestTags(project: string): Promise<string[]> {
  const projectDir = path.join(process.cwd(), "tests", project);
  if (!existsSync(projectDir)) return [];

  const testFiles = findTestFiles(projectDir);
  const tagRegex = /@\w+/g;
  const tags = new Set<string>();

  for (const file of testFiles) {
    try {
      const content = readFileSync(file, "utf-8");
      // Updated regex to find tags in titles like: test('title @tag', ...)
      const titleTagRegex = /(?:test|describe)\((`|'|").*?(@\w+).*?\1/g;
      let match;
      while ((match = titleTagRegex.exec(content)) !== null) {
        tags.add(match[2]);
      }
    } catch (err) {
      console.error(chalk.red(`Error reading file ${file}:`), err);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Gets a list of all test suites for a project.
 * @param project - The project to scan.
 * @returns A promise that resolves to an array of choices for the checkbox prompt.
 */
async function getProjectTestSuites(project: string): Promise<{ name: string; value: string }[]> {
  const projectDir = path.join(process.cwd(), "tests", project);
  if (!existsSync(projectDir)) return [];

  return findTestFiles(projectDir).map((file) => ({
    name: path.relative(path.join(process.cwd(), "tests"), file),
    value: path.relative(process.cwd(), file),
  }));
}

// --- Main Runner Logic ---
async function runInteractiveRunner() {
  try {
    // The while(true) loop has been removed to ensure the script exits after one action.
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

    // If the user selects 'exit', we'll just let the function end naturally.
    if (action === "exit") {
      // Intentionally empty. The script will proceed to the "Goodbye!" message.
    } else if (action === "new_run") {
      await configureAndRun();
    } else if (action === "preset_run") {
      await runFromPreset();
    } else if (action === "report") {
      await generateReport();
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
  if (options) await executeTestRun(options);
}

async function runFromPreset() {
  const selectedPreset = await select({
    message: "Choose a preset configuration:",
    choices: presets.map((p) => ({ name: p.name, description: p.description, value: p.options })),
  });

  const fullOptions: TestOptions = {
    headed: false,
    debug: false,
    parallel: true,
    grep: "",
    ...selectedPreset,
  } as TestOptions;

  await executeTestRun(fullOptions);
}

async function generateReport() {
  console.log(chalk.blue("\n📊 Generating and opening Allure report..."));
  try {
    await execAsync("pnpm run report:serve");
  } catch (err: any) {
    console.error(chalk.red("\n❌ Error generating report. Ensure test results exist in 'allure-results/'."));
    if (err.stderr) console.error(chalk.gray(err.stderr));
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

  const envFile = path.join(process.cwd(), "config", `.env.${options.project}.${options.environment}`);
  if (!existsSync(envFile)) {
    console.error(chalk.red(`\n❌ Environment file not found: ${envFile}`));
    return null;
  }

  options.browsers = await checkbox({
    message: "Select browsers:",
    choices: getBrowserChoices(),
    validate: (c) => c.length > 0 || "Select at least one browser.",
  });

  // New dynamic test selection
  const selectionMode = await select({
    message: "How would you like to select tests?",
    choices: [
      {
        name: "By test tag (e.g., @smoke)",
        value: "tag",
        description: "Searchable list of all tags found in the project.",
      },
      { name: "By test file(s)", value: "files", description: "Select one or more specific test files to run." },
      {
        name: "By test title (grep)",
        value: "grep",
        description: "Enter a custom text/regex pattern to match test titles.",
      },
      {
        name: "Run all tests for the project",
        value: "all",
        description: "Runs every test found for the selected project.",
      },
    ],
  });

  options.selectionMode = selectionMode as any;

  if (selectionMode === "tag") {
    const tags = await getProjectTestTags(options.project!);
    if (tags.length === 0) {
      console.log(chalk.yellow("No tags found. Please add tags like '@smoke' to your test or describe titles."));
      return null;
    }
    options.grep = await search({
      // Using the search prompt for autocomplete
      message: "Select a test tag:",
      source: async (input) =>
        tags
          .filter((tag) => !input || tag.toLowerCase().includes(input.toLowerCase()))
          .map((tag) => ({ value: tag, name: tag })),
    });
  } else if (selectionMode === "files") {
    const suites = await getProjectTestSuites(options.project!);
    if (suites.length === 0) {
      console.log(chalk.yellow("No test files found for this project."));
      return null;
    }
    options.testFiles = await checkbox({
      message: "Select test suites/files to run:",
      choices: suites,
      validate: (c) => c.length > 0 || "Select at least one file.",
    });
  } else if (selectionMode === "grep") {
    options.grep = await input({
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
    if (err.stdout) console.log(err.stdout);
  }
}

function buildCommand(options: TestOptions): string {
  const targets = options.browsers.join(",");
  const envVars = `PROJECT=${options.project} ENV=${options.environment} TARGETS=${targets}`;
  let cmd = `${envVars} npx playwright test`;

  // Append specific test files if selected
  if (options.selectionMode === "files" && options.testFiles && options.testFiles.length > 0) {
    cmd += ` ${options.testFiles.join(" ")}`;
  }

  const projectConfigs = options.browsers.map((b) =>
    b === "mobile"
      ? `${options.project}_${options.environment}_mobile`
      : `${options.project}_${options.environment}_${b}`
  );
  for (const config of projectConfigs) {
    cmd += ` --project=${config}`;
  }

  // Add grep only if a pattern is provided
  if (options.grep) {
    cmd += ` --grep "${options.grep}"`;
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
  console.log(chalk.gray(`   Browsers:    ${options.browsers.join(", ")}`));
  if (options.selectionMode === "tag" || options.selectionMode === "grep") {
    console.log(chalk.gray(`   Grep:        ${options.grep}`));
  }
  if (options.selectionMode === "files") {
    console.log(chalk.gray(`   Files:       ${options.testFiles?.join(", ") ?? "None"}`));
  }
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
const getYesNoChoices = (useLong = false, yes = "Yes", no = "No") => [
  { name: useLong ? yes : "Yes", value: true },
  { name: useLong ? no : "No", value: false },
];
const getEnvironmentChoices = (project: string) => {
  const envs: Record<string, string[]> = {
    pcf: ["dev", "staging", "uat"],
    mss: ["dev", "staging"],
    ilham: ["dev", "uat", "jit"],
  };
  return (envs[project] || []).map((e) => ({
    name: e.charAt(0).toUpperCase() + e.slice(1),
    value: e,
  }));
};

// --- Script Entry Point ---
if (require.main === module) {
  runInteractiveRunner();
}
