import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Global Teardown - Cleaning up...');
  
  const fs = require('fs');
  
  // Clean up temporary files
  const tempFiles = ['auth-state.json'];
  
  for (const file of tempFiles) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️  Removed ${file}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to remove ${file}:`, error);
    }
  }
  
  // Generate test summary
  try {
    const resultsPath = 'test-results/results.json';
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      console.log('\n📊 Test Execution Summary:');
      console.log(`   Total: ${results.stats?.total || 0}`);
      console.log(`   Passed: ${results.stats?.passed || 0}`);
      console.log(`   Failed: ${results.stats?.failed || 0}`);
      console.log(`   Skipped: ${results.stats?.skipped || 0}`);
      console.log(`   Duration: ${((results.stats?.duration || 0) / 1000).toFixed(2)}s`);
    }
  } catch (error) {
    console.warn('⚠️  Failed to generate test summary:', error);
  }
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;