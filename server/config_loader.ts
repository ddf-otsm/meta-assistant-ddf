import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { log } from './vite';

/**
 * Interface for application configuration
 */
export interface AppConfig {
  server: {
    port: number;
    host: string;
    environment: string;
    api_base_path: string;
  };
  database: {
    url: string;
    pool_size: number;
    connection_timeout_ms: number;
  };
  api_keys: {
    openai: string;
    azure_openai: string;
  };
  azure: {
    subscription_id: string;
    tenant_id: string;
    client_id: string;
    client_secret: string;
    openai: {
      endpoint: string;
      key: string;
      api_version: string;
      deployment_name: string;
    };
  };
  features: {
    pattern_recognition: boolean;
    meta_model_generation: boolean;
    specification_generation: boolean;
    template_generation: boolean;
    code_generation: boolean;
    ai_assistance: boolean;
  };
  logging: {
    level: string;
    file_path: string;
    max_size_mb: number;
    max_files: number;
    console: boolean;
  };
  security: {
    session_secret: string;
    session_expiry_hours: number;
    cors: {
      enabled: boolean;
      origins: string[];
    };
  };
}

/**
 * Load the configuration from YAML file and override with environment variables
 */
export function loadConfig(): AppConfig {
  try {
    // Default config file path
    const configFilePath = path.resolve(process.cwd(), 'config/config.yaml');
    
    // Check if the file exists
    if (!fs.existsSync(configFilePath)) {
      log(`Warning: Config file not found at ${configFilePath}. Using default values.`);
      return getDefaultConfig();
    }
    
    // Read and parse the YAML file
    const fileContents = fs.readFileSync(configFilePath, 'utf8');
    const config = yaml.load(fileContents) as AppConfig;
    
    // Override with environment variables
    return overrideWithEnvVars(config);
  } catch (error) {
    log(`Error loading configuration: ${error}`);
    return getDefaultConfig();
  }
}

/**
 * Get the default configuration values
 */
function getDefaultConfig(): AppConfig {
  return {
    server: {
      port: 5000,
      host: "0.0.0.0",
      environment: "development",
      api_base_path: "/api"
    },
    database: {
      url: "postgresql://postgres:postgres@localhost:5432/meta_assistant",
      pool_size: 10,
      connection_timeout_ms: 3000
    },
    api_keys: {
      openai: "",
      azure_openai: ""
    },
    azure: {
      subscription_id: "",
      tenant_id: "",
      client_id: "",
      client_secret: "",
      openai: {
        endpoint: "",
        key: "",
        api_version: "2023-12-01-preview",
        deployment_name: ""
      }
    },
    features: {
      pattern_recognition: true,
      meta_model_generation: true,
      specification_generation: true,
      template_generation: true,
      code_generation: true,
      ai_assistance: true
    },
    logging: {
      level: "info",
      file_path: "logs/app.log",
      max_size_mb: 10,
      max_files: 5,
      console: true
    },
    security: {
      session_secret: "meta-assistant-secret",
      session_expiry_hours: 24,
      cors: {
        enabled: true,
        origins: [
          "http://localhost:3000",
          "http://localhost:5000",
          "http://localhost:5173"
        ]
      }
    }
  };
}

/**
 * Override configuration with environment variables
 */
function overrideWithEnvVars(config: AppConfig): AppConfig {
  // Deep clone the config to avoid modifying the original
  const result = JSON.parse(JSON.stringify(config));
  
  // Server config
  if (process.env.PORT) result.server.port = parseInt(process.env.PORT, 10);
  if (process.env.HOST) result.server.host = process.env.HOST;
  if (process.env.NODE_ENV) result.server.environment = process.env.NODE_ENV;
  if (process.env.API_BASE_PATH) result.server.api_base_path = process.env.API_BASE_PATH;
  
  // Database config
  if (process.env.DATABASE_URL) result.database.url = process.env.DATABASE_URL;
  
  // API Keys
  if (process.env.OPENAI_API_KEY) result.api_keys.openai = process.env.OPENAI_API_KEY;
  if (process.env.AZURE_OPENAI_KEY) result.api_keys.azure_openai = process.env.AZURE_OPENAI_KEY;
  
  // Azure Config
  if (process.env.AZURE_SUBSCRIPTION_ID) result.azure.subscription_id = process.env.AZURE_SUBSCRIPTION_ID;
  if (process.env.AZURE_TENANT_ID) result.azure.tenant_id = process.env.AZURE_TENANT_ID;
  if (process.env.AZURE_CLIENT_ID) result.azure.client_id = process.env.AZURE_CLIENT_ID;
  if (process.env.AZURE_CLIENT_SECRET) result.azure.client_secret = process.env.AZURE_CLIENT_SECRET;
  
  // Azure OpenAI Config
  if (process.env.AZURE_OPENAI_ENDPOINT) result.azure.openai.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  if (process.env.AZURE_OPENAI_KEY) result.azure.openai.key = process.env.AZURE_OPENAI_KEY;
  if (process.env.AZURE_OPENAI_API_VERSION) result.azure.openai.api_version = process.env.AZURE_OPENAI_API_VERSION;
  if (process.env.AZURE_OPENAI_DEPLOYMENT_NAME) result.azure.openai.deployment_name = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  
  // Logging
  if (process.env.LOG_LEVEL) result.logging.level = process.env.LOG_LEVEL;
  
  // Security
  if (process.env.SESSION_SECRET) result.security.session_secret = process.env.SESSION_SECRET;
  
  return result;
}

// Export a singleton instance of the config
export const config = loadConfig(); 