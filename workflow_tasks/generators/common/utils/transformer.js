const fs = require('fs/promises');
const path = require('path');
const Handlebars = require('handlebars');

/**
 * Transforms source domain files to target domain
 * @param {Object} options Transformation options
 * @param {string} options.sourceDomain Source domain name
 * @param {string} options.targetDomain Target domain name
 * @param {Object} options.domainConfig Domain configuration
 * @param {string} options.sourceDir Source directory
 * @param {string} options.outputDir Output directory
 * @returns {Promise<boolean>} Success flag
 */
async function transformSourceCode(options) {
  const {
    sourceDomain,
    targetDomain,
    domainConfig,
    sourceDir,
    outputDir
  } = options;
  
  console.log('Transforming source code...');
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${outputDir}`);
  
  // In a real implementation, this would:
  // 1. Scan source files
  // 2. Apply transformation rules defined in domainConfig
  // 3. Generate new files in the target directory
  
  // This is a simplified mock implementation
  const modelDir = path.join(outputDir, 'server/src/models');
  await fs.mkdir(modelDir, { recursive: true });
  
  // Generate entity model using the template
  await generateEntityModel(domainConfig, modelDir);
  
  return true;
}

/**
 * Generates entity model from template
 * @param {Object} domainConfig Domain configuration
 * @param {string} outputDir Output directory
 * @returns {Promise<string>} Generated file path
 */
async function generateEntityModel(domainConfig, outputDir) {
  const templateDir = path.join(__dirname, '../templates');
  const templateFile = path.join(templateDir, 'EntityModel.ts.template');
  
  // Read the template
  const templateContent = await fs.readFile(templateFile, 'utf8');
  
  // Compile the template
  const template = Handlebars.compile(templateContent);
  
  // Prepare template data
  const templateData = {
    EntityName: domainConfig.entityName,
    entityName: domainConfig.entityName.toLowerCase(),
    entityProperties: domainConfig.entityProperties || [],
    metrics: getMetrics(domainConfig),
    customEnums: getCustomEnums(domainConfig)
  };
  
  // Generate content
  const content = template(templateData);
  
  // Write to file
  const outputFile = path.join(outputDir, `${domainConfig.entityName.toLowerCase()}.ts`);
  await fs.writeFile(outputFile, content);
  
  console.log(`Generated entity model: ${outputFile}`);
  
  return outputFile;
}

/**
 * Extracts metrics from domain config
 * @param {Object} domainConfig Domain configuration
 * @returns {Array} Metrics array
 */
function getMetrics(domainConfig) {
  // In a real implementation, this would extract from metricMapping
  // This is a simplified mock
  
  const defaultMetrics = [];
  
  if (domainConfig.domain === 'kettle') {
    defaultMetrics.push(
      { name: 'temperature', type: 'number', unit: 'celsius' },
      { name: 'waterLevel', type: 'number', unit: 'percentage' }
    );
  } else if (domainConfig.domain === 'pet') {
    defaultMetrics.push(
      { name: 'temperature', type: 'number', unit: 'celsius' },
      { name: 'weight', type: 'number', unit: 'kg' }
    );
  } else {
    defaultMetrics.push(
      { name: 'status', type: 'number', unit: 'percentage' }
    );
  }
  
  return domainConfig.metrics || defaultMetrics;
}

/**
 * Extracts custom enums from domain config
 * @param {Object} domainConfig Domain configuration
 * @returns {Array} Custom enums array
 */
function getCustomEnums(domainConfig) {
  // In a real implementation, this would extract from customCode
  // This is a simplified mock
  
  if (!domainConfig.customCode) {
    return [];
  }
  
  // For simplicity, we'll just create hardcoded enums based on domain
  const enums = [];
  
  if (domainConfig.domain === 'kettle') {
    enums.push({
      name: 'KettleState',
      values: [
        { name: 'OFF', value: 'off' },
        { name: 'HEATING', value: 'heating' },
        { name: 'BOILED', value: 'boiled' },
        { name: 'KEEP_WARM', value: 'keepWarm' }
      ]
    });
  } else if (domainConfig.domain === 'pet') {
    enums.push({
      name: 'PetState',
      values: [
        { name: 'RESTING', value: 'resting' },
        { name: 'ACTIVE', value: 'active' },
        { name: 'EATING', value: 'eating' },
        { name: 'SLEEPING', value: 'sleeping' }
      ]
    });
  }
  
  return enums;
}

module.exports = {
  transformSourceCode
}; 