import { select, checkbox, confirm, input } from "@inquirer/prompts";
import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";
import { existsSync } from "fs";
import path from "path";

const execAsync = promisify(exec);

interface TestOptions {
  project: string;
  environment: string;
  browsers: string[];
  testType: string;
  headed: boolean;
  debug: boolean;
  parallel: boolean;
  customGrep?: string;
}

async function runInteractiveTests() {
  console.log(chalk.blue.bold("\n🎭 Playwright Multi-Project Test Runner\n"));
  console.log(chalk.gray("Configure your test execution with the interactive prompts below.\n"));

  try {
    // Select project
    const project = await select({
      message: "Select project:",
      choices: [
        { name: "🏢 PCF (Platform Core Framework)", value: "pcf" },
        { name: "📊 MSS (Management System Services)", value: "mss" },
        { name: "🌟 Ilham (Integration Layer)", value: "ilham" },
      ],
    });

    // Select environment based on project
    const environment = await select({
      message: "Select environment:",
      choices: getEnvironmentChoices(project),
    });

    // Validate environment file exists
    const envFile = path.join(process.cwd(), "config", `.env.${project}.${environment}`);
    if (!existsSync(envFile)) {
      console.error(chalk.red(`❌ Environment file not found: ${envFile}`));
      console.log(chalk.yellow("Please create the environment file before running tests."));
      process.exit(1);
    }

    // Select browsers
    const browsers = await checkbox({
      message: "Select browsers to test:",
      choices: [
        { name: "Chromium (Recommended)", value: "chromium", checked: true },
        { name: "Firefox", value: "firefox" },
        { name: "Safari (WebKit)", value: "webkit" },
        { name: "Mobile Chrome", value: "mobile", description: "iPhone 13 viewport" },
      ],
      validate: (choices) => {
        if (choices.length === 0) {
          return "Please select at least one browser";
        }
        return true;
      },
    });

    // Select test type
    const testType = await select({
      message: "Select test type:",
      choices: [
        {
          name: "💨 Smoke Tests (Fast)",
          value: "smoke",
          description: "Critical path tests only",
        },
        {
          name: "🔄 Regression Tests",
          value: "regression",
          description: "Comprehensive test suite",
        },
        {
          name: "📱 Mobile Tests",
          value: "mobile",
          description: "Mobile-specific tests",
        },
        {
          name: "🔐 Authentication Tests",
          value: "auth",
          description: "Login/logout flows",
        },
        {
          name: "📋 All Tests",
          value: "all",
          description: "Run complete test suite",
        },
        {
          name: "🎯 Custom Pattern",
          value: "custom",
          description: "Specify custom grep pattern",
        },
      ],
    });

    // Get custom grep pattern if selected
    let customGrep;
    if (testType === "custom") {
      customGrep = await input({
        message: 'Enter grep pattern (e.g., "login.*success"):',
        validate: (value) => {
          if (!value.trim()) {
            return "Please enter a valid grep pattern";
          }
          return true;
        },
      });
    }

    // Additional options
    const headed = await confirm({
      message: "Run in headed mode (show browser)?",
      default: false,
    });

    const debug = await confirm({
      message: "Enable debug mode?",
      default: false,
    });

    const parallel = await confirm({
      message: "Run tests in parallel?",
      default: true,
    });

    // Build and execute command
    const command = buildCommand({
      project,
      environment,
      browsers,
      testType,
      headed,
      debug,
      parallel,
      customGrep,
    });

    console.log(chalk.cyan("\n📋 Test Configuration Summary:"));
    console.log(chalk.gray(`   Project: ${project.toUpperCase()}`));
    console.log(chalk.gray(`   Environment: ${environment}`));
    console.log(chalk.gray(`   Browsers: ${browsers.join(", ")}`));
    console.log(chalk.gray(`   Test Type: ${testType}`));
    console.log(chalk.gray(`   Mode: ${headed ? "Headed" : "Headless"}`));
    console.log(chalk.gray(`   Debug: ${debug ? "Enabled" : "Disabled"}`));
    console.log(chalk.gray(`   Parallel: ${parallel ? "Enabled" : "Disabled"}`));

    const proceed = await confirm({
      message: "\n🚀 Start test execution?",
      default: true,
    });

    if (!proceed) {
      console.log(chalk.yellow("Test execution cancelled."));
      return;
    }

    console.log(chalk.gray(`\nExecuting: ${command}\n`));
    console.log(chalk.blue("⏳ Running tests...\n"));

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(command);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes("Warning")) console.error(chalk.red(stderr));

    console.log(chalk.green(`\n✅ Test run completed in ${duration}s!\n`));

    // Offer to open reports
    const openReport = await confirm({
      message: "Open Allure report?",
      default: true,
    });

    if (openReport) {
      console.log(chalk.blue("📊 Generating and opening Allure report..."));
      await execAsync("pnpm run report:serve");
    }
  } catch (error: any) {
    console.error(chalk.red("\n❌ Test execution failed:"));
    console.error(chalk.red(error.message));

    if (error.stdout) {
      console.log(chalk.yellow("\nStdout:"));
      console.log(error.stdout);
    }

    if (error.stderr) {
      console.log(chalk.red("\nStderr:"));
      console.log(error.stderr);
    }

    process.exit(1);
  }
}

function getEnvironmentChoices(project: string) {
  const environments = {
    pcf: [
      { name: "🔧 Development", value: "dev", description: "Latest features, may be unstable" },
      { name: "🧪 Staging", value: "staging", description: "Pre-production environment" },
      { name: "✅ UAT", value: "uat", description: "User acceptance testing" },
    ],
    mss: [
      { name: "🔧 Development", value: "dev", description: "Latest features, may be unstable" },
      { name: "🧪 Staging", value: "staging", description: "Pre-production environment" },
    ],
    ilham: [
      { name: "🔧 Development", value: "dev", description: "Latest features, may be unstable" },
      { name: "✅ UAT", value: "uat", description: "User acceptance testing" },
      { name: "🚀 JIT", value: "jit", description: "Just-in-time production-like environment" },
    ],
  };

  return environments[project as keyof typeof environments] || [];
}

function buildCommand(options: TestOptions): string {
  let cmd = "npx playwright test";

  // Set project and environment
  cmd = `PROJECT=${options.project} ENV=${options.environment} ${cmd}`;

  // Add test directory
  cmd += ` tests/${options.project}`;

  // Add browser projects
  const projectConfigs = options.browsers.map((browser) => {
    if (browser === "mobile") {
      return `${options.project}_${options.environment}_mobile`;
    }
    return `${options.project}_${options.environment}_${browser}`;
  });

  if (projectConfigs.length > 0) {
    cmd += ` --project="${projectConfigs.join(",")}"`;
  }

  // Add test filter
  if (options.testType !== "all") {
    if (options.testType === "custom" && options.customGrep) {
      cmd += ` --grep "${options.customGrep}"`;
    } else {
      cmd += ` --grep "@${options.testType}"`;
    }
  }

  // Add execution options
  if (options.headed) cmd += " --headed";
  if (options.debug) cmd += " --debug";
  if (!options.parallel) cmd += " --workers=1";

  return cmd;
}

// Export for use in other scripts
export { runInteractiveTests, buildCommand };

// Run if called directly
if (require.main === module) {
  runInteractiveTests();
}
