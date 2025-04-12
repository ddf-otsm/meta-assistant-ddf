# Monitor Domain Generator Implementation

This document outlines the core implementation of the generator system that transforms the Baby Monitor into other monitoring domains.

## Generator Structure

```
workflow_tasks/
├── generators/
│   ├── common/
│   │   ├── templates/
│   │   ├── utils/
│   │   └── validation/
│   ├── kettle-monitor/
│   ├── pet-monitor/
│   ├── student-monitor/
│   └── developer-monitor/
└── run_generator.js
```

## Core Generator Script

```javascript
// workflow_tasks/run_generator.js
const fs = require('fs');
const path = require('path');
const { transformDomain } = require('./generators/common/utils/transformer');
const { validateOutput } = require('./generators/common/utils/validator');

// Define generator parameters
const DOMAINS = {
  KETTLE: 'kettle',
  PET: 'pet',
  STUDENT: 'student', 
  DEVELOPER: 'developer'
};

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
  const domainConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  
  // 2. Transform domain
  const result = await transformDomain({
    sourceDomain,
    targetDomain,
    domainConfig,
    outputDir: outputDir || path.join(process.cwd(), `generated/${targetDomain}-monitor`),
  });
  
  // 3. Validate output if requested
  if (validate) {
    console.log('Validating generated code...');
    const validationResult = await validateOutput(result.outputDir, targetDomain);
    console.log(`Validation ${validationResult.success ? 'passed' : 'failed'}`);
    
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.errors);
    }
  }
  
  console.log(`Transformation complete. Output directory: ${result.outputDir}`);
  return result;
}

// Run when called directly
if (require.main === module) {
  const args = process.argv.slice(2);
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
```

## Domain Transformer Implementation

```javascript
// workflow_tasks/generators/common/utils/transformer.js
const fs = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');
const { loadTemplates } = require('./template-loader');
const { applyTransformations } = require('./code-transformations');

async function transformDomain(options) {
  const { sourceDomain, targetDomain, domainConfig, outputDir } = options;
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // 1. Load templates
  const templates = await loadTemplates(targetDomain);
  
  // 2. Generate core domain files
  await generateDomainModels(templates.models, domainConfig, outputDir);
  await generateApiEndpoints(templates.api, domainConfig, outputDir);
  await generateUiComponents(templates.ui, domainConfig, outputDir);
  
  // 3. Transform source domain files to target domain
  const sourceCodeDir = path.join(process.cwd(), 'submodules/baby-monitor');
  await transformSourceCode(sourceCodeDir, outputDir, {
    sourceDomain,
    targetDomain,
    domainConfig,
  });
  
  // 4. Copy and modify configuration files
  await setupConfiguration(sourceCodeDir, outputDir, targetDomain, domainConfig);
  
  // 5. Generate tests
  await generateTests(templates.tests, domainConfig, outputDir);
  
  return { 
    outputDir,
    generatedFiles: await listGeneratedFiles(outputDir) 
  };
}

async function transformSourceCode(sourceDir, outputDir, options) {
  // Implementation details for transforming source code
  // This uses the transformations defined in the domain config
  // to map source domain concepts to target domain concepts
  
  // Simplified implementation for brevity
  console.log('Transforming source code...');
  
  // Apply code transformations to mapped files
  await applyTransformations(sourceDir, outputDir, options);
  
  return true;
}

// Additional helper functions
// ...

module.exports = { transformDomain };
```

## Kettle Monitor Domain Config Example

```json
{
  "domain": "kettle",
  "entityName": "Kettle",
  "entityMapping": {
    "Baby": "Kettle",
    "Parent": "User",
    "Doctor": "Maintenance"
  },
  "metricMapping": {
    "temperature": "temperature",
    "weight": "waterLevel",
    "height": null,
    "feeding": "heatingCycle",
    "sleep": "idleTime"
  },
  "componentMapping": {
    "BabyHealthMetrics": "KettleMetrics",
    "FeedingTracker": "HeatingCycleTracker",
    "GrowthChart": "UsagePatternChart",
    "SleepTracker": "IdleTimeTracker",
    "BabyProfile": "KettleProfile"
  },
  "filePathMapping": {
    "client/src/pages/Baby.tsx": "client/src/pages/Kettle.tsx",
    "client/src/pages/BabyVision.tsx": "client/src/pages/KettleStatus.tsx",
    "server/routes/baby.ts": "server/routes/kettle.ts"
  },
  "entityProperties": {
    "Kettle": [
      { "name": "id", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "model", "type": "string" },
      { "name": "maxCapacity", "type": "number" },
      { "name": "currentState", "type": "KettleState" },
      { "name": "metrics", "type": "KettleMetrics" },
      { "name": "lastUpdated", "type": "Date" }
    ]
  },
  "customCode": {
    "KettleState": "enum KettleState { OFF = 'off', HEATING = 'heating', BOILED = 'boiled', KEEP_WARM = 'keepWarm' }"
  },
  "skipFiles": [
    "client/src/pages/ContractionTracker.tsx",
    "client/src/pages/LullabyGenerator.tsx"
  ]
}
```

## Template Example

```typescript
// workflow_tasks/generators/common/templates/EntityModel.ts.template
export interface {{EntityName}} {
  id: string;
  name: string;
  {{#each entityProperties}}
  {{name}}: {{type}};
  {{/each}}
  lastUpdated: Date;
}

{{#if customEnums}}
{{#each customEnums}}
export enum {{name}} {
  {{#each values}}
  {{name}} = "{{value}}",
  {{/each}}
}
{{/each}}
{{/if}}

export interface {{EntityName}}Metrics {
  {{#each metrics}}
  {{name}}: {
    value: {{type}};
    unit: "{{unit}}";
  };
  {{/each}}
}
```

## Usage Example 

To transform the baby monitor into a kettle monitor:

```bash
# From the project root directory
node workflow_tasks/run_generator.js kettle ./generated/kettle-monitor
```

## E2E Test Generator Example

```javascript
// workflow_tasks/generators/common/utils/test-generator.js
const fs = require('fs/promises');
const path = require('path');
const handlebars = require('handlebars');

async function generateE2ETests(domainConfig, outputDir) {
  // Load E2E test templates
  const templateDir = path.join(__dirname, '../templates/tests');
  const testsOutputDir = path.join(outputDir, 'tests/e2e');
  
  await fs.mkdir(testsOutputDir, { recursive: true });
  
  // Load domain-specific E2E test templates
  const domainTemplateDir = path.join(
    __dirname, 
    `../../${domainConfig.domain}-monitor/templates/tests`
  );
  
  // Generate basic E2E tests
  await generateBasicE2ETests(templateDir, testsOutputDir, domainConfig);
  
  // Generate domain-specific tests if templates exist
  try {
    await fs.access(domainTemplateDir);
    await generateDomainSpecificTests(domainTemplateDir, testsOutputDir, domainConfig);
  } catch (err) {
    console.log(`No domain-specific test templates found for ${domainConfig.domain}`);
  }
  
  return testsOutputDir;
}

// Implementations of test generator functions
// ...

module.exports = { generateE2ETests };
```

## Integration into CI/CD Pipeline

The generator is designed to be integrated into CI/CD pipelines for automated testing:

```yaml
# .github/workflows/test-generators.yml
name: Test Domain Generators

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-generators:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        domain: [kettle, pet, student, developer]
        
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
        
      - name: Generate ${{ matrix.domain }} monitor
        run: node workflow_tasks/run_generator.js ${{ matrix.domain }} ./generated/${{ matrix.domain }}-monitor
        
      - name: Run tests on generated code
        run: |
          cd ./generated/${{ matrix.domain }}-monitor
          npm install
          npm test
```

The generator system follows a template-based approach combined with transformation rules to convert the baby monitor application into different monitoring domains while preserving the core functionality and architecture. 