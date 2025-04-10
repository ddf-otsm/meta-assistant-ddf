#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runGenerator, DOMAINS } = require('../run_generator');

/**
 * Tests the generator for all domains
 * @returns {Promise<void>}
 */
async function testGenerator() {
  console.log('Running generator tests...');
  
  // Create test directory
  const testDir = path.join(process.cwd(), 'generated/test');
  
  if (fs.existsSync(testDir)) {
    console.log('Cleaning test directory...');
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(testDir, { recursive: true });
  
  // Test each domain
  for (const domain of Object.values(DOMAINS)) {
    try {
      console.log(`\nTesting ${domain} monitor generation...`);
      const domainDir = path.join(testDir, domain);
      
      const result = await runGenerator({
        targetDomain: domain,
        outputDir: domainDir
      });
      
      // Verify expected files were created
      verifyFiles(domain, domainDir);
      
      console.log(`✅ ${domain} monitor generation test passed`);
    } catch (error) {
      console.error(`❌ ${domain} monitor generation test failed:`, error);
    }
  }
  
  console.log('\nGenerator tests completed.');
}

/**
 * Verifies that expected files were created
 * @param {string} domain Domain name
 * @param {string} outputDir Output directory
 */
function verifyFiles(domain, outputDir) {
  const requiredFiles = [
    'README.md',
    `server/src/models/${domain.toLowerCase()}.ts`,
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(outputDir, file);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file not found: ${file}`);
    }
    
    console.log(`  - Verified: ${file}`);
  }
  
  // Check content of model file
  const modelFile = path.join(outputDir, `server/src/models/${domain.toLowerCase()}.ts`);
  const modelContent = fs.readFileSync(modelFile, 'utf8');
  
  // Domain-specific content checks
  switch (domain) {
    case DOMAINS.KETTLE:
      if (!modelContent.includes('KettleMetrics') || !modelContent.includes('KettleState')) {
        throw new Error('Kettle model file missing expected content');
      }
      break;
    case DOMAINS.PET:
      if (!modelContent.includes('PetMetrics')) {
        throw new Error('Pet model file missing expected content');
      }
      break;
    // Add checks for other domains
  }
}

// Run when called directly
if (require.main === module) {
  testGenerator()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Test error:', err);
      process.exit(1);
    });
}

module.exports = { testGenerator }; 