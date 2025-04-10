# Meta Assistant Repository Generator

This system allows you to analyze any git repository and transform it into different domains using a template-based approach.

## Features

- Repository analysis to understand structure, technologies, and domain concepts
- Transformation of repositories to different domains based on rules and templates
- Template system for generating new files
- Command-line interface for easy use
- Support for custom domain configurations

## Directory Structure

```
scripts/generator/
├── README.md                   # This file
├── analyze-repo.ts             # Repository analysis script
├── transform-repo.ts           # Repository transformation script
├── ui.ts                       # Command-line interface
├── templates/                  # Templates for generated files
│   └── kettle/                 # Kettle domain templates
│       └── KettleModel.ts.hbs  # Template for kettle model
├── config/                     # Domain configurations
│   └── kettle.json             # Kettle domain configuration
├── analyzer/                   # Additional analyzer modules
└── transformer/                # Additional transformer modules
```

## Usage

### Command Line Interface

The easiest way to use the generator is through the CLI:

```bash
# Run the CLI
./scripts/generator-cli.sh
```

The CLI provides options to:
- Analyze a repository
- Transform a repository to a different domain
- Generate a new domain configuration

### Direct Script Usage

You can also use the scripts directly:

```bash
# Analyze a repository
tsx scripts/generator/analyze-repo.ts <repo-path-or-url> [output-path] [branch]

# Transform a repository
tsx scripts/generator/transform-repo.ts <source-repo-path> <target-domain> [target-path] [templates-path] [config-path]
```

## Creating a New Domain

To create a new domain transformation:

1. Generate a base configuration:
   ```bash
   tsx scripts/generator/ui.ts
   # Then select "Generate Domain Configuration" and follow the prompts
   ```

2. Edit the generated configuration file in `scripts/generator/config/<domain>.json`

3. Create templates for your domain in `scripts/generator/templates/<domain>/`

4. Use the transformation tool to apply your domain to a repository

## Domain Configuration

The domain configuration file (`config/<domain>.json`) defines how a repository should be transformed:

```json
{
  "domain": "domain-name",
  "entityMapping": {
    "SourceEntity": "TargetEntity"
  },
  "fileMapping": {
    "src/original.ts": "src/target.ts"
  },
  "customTransformations": [
    {
      "pattern": "regex-pattern",
      "replacement": "replacement-text",
      "flags": "g"
    }
  ]
}
```

## Templates

Templates use Handlebars syntax and can access the domain configuration through the `config` variable:

```handlebars
export interface {{config.entityMapping.SourceEntity}} {
  id: string;
  name: string;
  // Other properties
}
```

## Adding New Features

To extend the generator:

1. New analyzers: Add to the `analyzer/` directory and import in `analyze-repo.ts`
2. New transformers: Add to the `transformer/` directory and import in `transform-repo.ts`
3. New templates: Add to the `templates/<domain>/` directory 