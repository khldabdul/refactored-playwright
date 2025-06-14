const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const projects = ['pcf', 'mss', 'ilham'];
const environments = {
  pcf: ['dev', 'staging', 'uat'],
  mss: ['dev', 'staging'],
  ilham: ['dev', 'uat', 'jit']
};

async function checkProject(project, env) {
  return new Promise((resolve) => {
    const command = `PROJECT=${project} ENV=${env} npx playwright test tests/${project} --grep @smoke --reporter=json --max-failures=1`;
    
    console.log(chalk.blue(`Checking ${project}-${env}...`));
    
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      let passed = false;
      let testCount = 0;
      let errorMessage = '';
      
      if (!error) {
        try {
          const results = JSON.parse(stdout);
          testCount = results.suites?.reduce((acc, suite) => acc + (suite.specs?.length || 0), 0) || 0;
          passed = results.stats?.expected === results.stats?.passed;
        } catch (parseError) {
          passed = !error;
        }
      } else {
        errorMessage = error.message;
        if (stderr) {
          errorMessage += `\nStderr: ${stderr}`;
        }
      }
      
      resolve({ 
        project, 
        env, 
        passed, 
        testCount,
        error: errorMessage,
        duration: Date.now()
      });
    });
  });
}

async function checkEnvironmentFiles() {
  console.log(chalk.yellow('🔍 Checking environment files...'));
  
  const missingFiles = [];
  
  for (const project of projects) {
    for (const env of environments[project]) {
      const envFile = path.join(process.cwd(), 'config', `.env.${project}.${env}`);
      if (!fs.existsSync(envFile)) {
        missingFiles.push(`.env.${project}.${env}`);
      }
    }
  }
  
  if (missingFiles.length > 0) {
    console.log(chalk.red('❌ Missing environment files:'));
    missingFiles.forEach(file => console.log(chalk.red(`   - ${file}`)));
    return false;
  } else {
    console.log(chalk.green('✅ All environment files present'));
    return true;
  }
}

async function checkDependencies() {
  console.log(chalk.yellow('📦 Checking dependencies...'));
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      '@playwright/test',
      'playwright-elements',
      '@faker-js/faker',
      '@inquirer/prompts',
      'allure-playwright'
    ];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.devDependencies?.[dep] && !packageJson.dependencies?.[dep]
    );
    
    if (missingDeps.length > 0) {
      console.log(chalk.red('❌ Missing dependencies:'));
      missingDeps.forEach(dep => console.log(chalk.red(`   - ${dep}`)));
      return false;
    } else {
      console.log(chalk.green('✅ All dependencies present'));
      return true;
    }
  } catch (error) {
    console.log(chalk.red('❌ Error reading package.json'));
    return false;
  }
}

async function runHealthCheck() {
  console.log(chalk.blue.bold('🏥 Running Framework Health Check...\n'));
  
  const startTime = Date.now();
  
  // Check prerequisites
  const envFilesOk = await checkEnvironmentFiles();
  const depsOk = await checkDependencies();
  
  if (!envFilesOk || !depsOk) {
    console.log(chalk.red('\n❌ Prerequisites check failed. Please fix the issues above before running tests.'));
    process.exit(1);
  }
  
  console.log(chalk.yellow('\n🧪 Running smoke tests for all project/environment combinations...\n'));
  
  const results = [];
  
  // Run tests for all combinations
  for (const project of projects) {
    for (const env of environments[project]) {
      try {
        const result = await checkProject(project, env);
        results.push(result);
      } catch (error) {
        results.push({ 
          project, 
          env, 
          passed: false, 
          testCount: 0,
          error: error.message 
        });
      }
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 Health Check Results:\n');
  
  // Create summary table
  const summary = results.map(r => ({
    'Project-Env': `${r.project}-${r.env}`,
    'Status': r.passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL'),
    'Tests': r.testCount,
    'Error': r.error ? r.error.slice(0, 50) + '...' : ''
  }));
  
  console.table(summary);
  
  const passing = results.filter(r => r.passed);
  const failing = results.filter(r => !r.passed);
  
  console.log(chalk.cyan(`\n📈 Summary:`));
  console.log(chalk.green(`   ✅ Passing: ${passing.length}/${results.length}`));
  console.log(chalk.red(`   ❌ Failing: ${failing.length}/${results.length}`));
  console.log(chalk.gray(`   ⏱️  Total time: ${totalTime}s`));
  
  if (failing.length > 0) {
    console.log(chalk.red('\n❌ Failing configurations:'));
    failing.forEach(f => {
      console.log(chalk.red(`   - ${f.project}-${f.env}:`));
      if (f.error) {
        console.log(chalk.gray(`     ${f.error.split('\n')[0]}`));
      }
    });
    
    console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
    console.log(chalk.gray('   - Check if the application URLs are accessible'));
    console.log(chalk.gray('   - Verify test data and credentials'));
    console.log(chalk.gray('   - Run individual tests with --headed flag for debugging'));
    console.log(chalk.gray('   - Check environment-specific configuration'));
    
    process.exit(1);
  } else {
    console.log(chalk.green('\n🎉 All configurations healthy!'));
    console.log(chalk.gray('Framework is ready for test execution.'));
  }
}

// Export for use in other scripts
module.exports = { runHealthCheck, checkProject };

// Run if called directly
if (require.main === module) {
  runHealthCheck().catch(error => {
    console.error(chalk.red('Health check failed:'), error);
    process.exit(1);
  });
}