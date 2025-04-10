#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { transformSourceCode } = require('./generators/common/utils/transformer');

// Define generator parameters
const DOMAINS = {
  KETTLE: 'kettle',
  PET: 'pet',
  STUDENT: 'student', 
  DEVELOPER: 'developer'
};

/**
 * Runs the domain transformation generator
 * @param {Object} options Generator options
 * @param {string} options.sourceDomain Source domain (default: 'baby')
 * @param {string} options.targetDomain Target domain to generate
 * @param {string} options.outputDir Output directory for generated code
 * @param {string} options.configPath Optional path to domain configuration
 * @param {boolean} options.validate Whether to validate the output
 * @returns {Promise<Object>} Generator result
 */
async function runGenerator(options) {
  const {
    sourceDomain = 'baby',
    targetDomain,
    outputDir,
    configPath,
    validate = true,
  } = options;
  
  if (!Object.values(DOMAINS).includes(targetDomain)) {
    throw new Error(`Invalid target domain: ${targetDomain}. Must be one of: ${Object.values(DOMAINS).join(', ')}`);
  }
  
  console.log(`Starting transformation from ${sourceDomain} monitor to ${targetDomain} monitor...`);
  
  // 1. Load domain config
  const configFile = configPath || path.join(__dirname, `generators/${targetDomain}-monitor/domain-config.json`);
  
  try {
    // Check if config file exists
    fs.accessSync(configFile, fs.constants.R_OK);
  } catch (error) {
    console.log(`Config file not found at ${configFile}. Creating example config...`);
    await createExampleConfig(targetDomain);
  }
  
  const domainConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  
  // 2. Create output directory
  const targetOutputDir = outputDir || path.join(process.cwd(), `generated/${targetDomain}-monitor`);
  
  if (!fs.existsSync(targetOutputDir)) {
    fs.mkdirSync(targetOutputDir, { recursive: true });
    console.log(`Created output directory: ${targetOutputDir}`);
  }
  
  // 3. Generate readme for the new domain
  generateReadme(targetDomain, targetOutputDir, domainConfig);
  
  // 4. Transform source code
  const sourceDir = path.join(process.cwd(), 'submodules/baby-monitor');
  
  await transformSourceCode({
    sourceDomain,
    targetDomain,
    domainConfig,
    sourceDir,
    outputDir: targetOutputDir
  });
  
  console.log(`Transformation complete. Output directory: ${targetOutputDir}`);
  
  return { 
    outputDir: targetOutputDir,
    domainConfig
  };
}

/**
 * Creates an example domain configuration
 * @param {string} domain Target domain
 * @returns {Promise<void>}
 */
async function createExampleConfig(domain) {
  const configDir = path.join(__dirname, `generators/${domain}-monitor`);
  const configFile = path.join(configDir, 'domain-config.json');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Create example config based on domain
  let config = {};
  
  switch (domain) {
    case DOMAINS.KETTLE:
      config = {
        domain: "kettle",
        entityName: "Kettle",
        entityMapping: {
          "Baby": "Kettle",
          "Parent": "User",
          "Doctor": "Maintenance"
        },
        metricMapping: {
          "temperature": "temperature",
          "weight": "waterLevel",
          "height": null,
          "feeding": "heatingCycle",
          "sleep": "idleTime"
        }
      };
      break;
    case DOMAINS.PET:
      config = {
        domain: "pet",
        entityName: "Pet",
        entityMapping: {
          "Baby": "Pet",
          "Parent": "Owner",
          "Doctor": "Veterinarian"
        },
        metricMapping: {
          "temperature": "temperature",
          "weight": "weight",
          "height": "height",
          "feeding": "feeding",
          "sleep": "sleep",
          "diaper": "waste"
        }
      };
      break;
    // Add other domains as needed
    default:
      config = {
        domain,
        entityName: domain.charAt(0).toUpperCase() + domain.slice(1),
        entityMapping: {
          "Baby": domain.charAt(0).toUpperCase() + domain.slice(1)
        },
        metricMapping: {}
      };
  }
  
  // Write config to file
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`Created example config at ${configFile}`);
}

/**
 * Generates a README for the target domain
 * @param {string} domain Target domain
 * @param {string} outputDir Output directory
 * @param {Object} config Domain configuration
 */
function generateReadme(domain, outputDir, config) {
  const entityName = config.entityName;
  const readmeFile = path.join(outputDir, 'README.md');
  
  const readme = `# ${entityName} Monitor

This application monitors ${domain}s and provides real-time tracking of metrics, events, and states.

## Features

- Real-time ${domain} monitoring
- Metric tracking and visualization
- Event logging and notifications
- State management and history
- User management and authentication

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Running the Application

\`\`\`bash
npm run dev
\`\`\`

## Project Structure

\`\`\`
.
├── client/             # Frontend React application
├── server/             # Backend Express server
├── shared/             # Shared code and utilities
├── config/             # Configuration files
└── tests/              # Test files
\`\`\`

## License

This project is licensed under the MIT License.
`;
  
  fs.writeFileSync(readmeFile, readme);
  console.log(`Generated README at ${readmeFile}`);
}

// Run when called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node run_generator.js <domain> [output-dir] [config-path]');
    console.error(`Supported domains: ${Object.values(DOMAINS).join(', ')}`);
    process.exit(1);
  }
  
  const options = {
    targetDomain: args[0],
    outputDir: args[1],
    configPath: args[2],
    validate: args[3] !== 'no-validate',
  };
  
  runGenerator(options)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Generator error:', err);
      process.exit(1);
    });
}

module.exports = { runGenerator, DOMAINS }; 