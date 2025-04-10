# Baby Monitor Transformation System

This project provides a framework for transforming the Baby Monitor application into various domain-specific monitoring applications such as Kettle Monitor, Pet Monitor, Student Monitor, and Developer Monitor.

## Project Structure

```
.
├── docs/
│   └── todos/
│       └── plans/
│           └── baby_monitor_transformation/
│               ├── README.md                    # This file
│               ├── transformation_plan.md       # Overall transformation strategy
│               ├── generator_system.md          # Generator architecture
│               ├── generator_implementation.md  # Implementation details for generators
│               ├── kettle_implementation.md     # Kettle monitor implementation example
│               └── pet_monitor_example.md       # Pet monitor implementation example
├── submodules/
│   └── baby-monitor/                           # Original baby monitor code (git submodule)
└── workflow_tasks/
    └── generators/                             # Generator implementation (to be created)
```

## Overview

The Baby Monitor Transformation System provides a generator framework for converting the Baby Monitor application into various domain-specific monitoring applications. The system uses a model-driven approach with transformation rules and templates to adapt the application to different monitoring contexts while preserving the core monitoring architecture.

## Supported Domains

The transformation system supports the following domains:

1. **Kettle Monitor**: Monitor electric kettles, tracking temperature, water level, and heating cycles
2. **Pet Monitor**: Track pet health, feeding, vaccinations, and medications
3. **Student Monitor**: Track student progress, attendance, and academic performance
4. **Developer Monitor**: Monitor development projects, code quality, and team performance

## Implementation Approach

The system follows these key principles:

1. **Domain Agnostic Core**: Create a core monitoring framework independent of the specific entity being monitored
2. **Pluggable Domain Modules**: Implement domain-specific modules that can be swapped based on the monitoring target
3. **Configurable UI**: Design UI components that adapt to different monitoring contexts
4. **Abstract Data Models**: Use abstract data models that can be specialized for each domain
5. **Consistent API Patterns**: Maintain consistent API patterns across different monitoring domains

## How to Use

### Prerequisites

- Node.js 18 or later
- Git

### Setup

1. Clone this repository
2. Initialize the baby-monitor submodule:
   ```bash
   git submodule init
   git submodule update
   ```

### Generating a Domain-Specific Monitor

To generate a domain-specific monitor:

```bash
# From the project root
node workflow_tasks/run_generator.js <domain> [output-dir] [config-path]
```

Where:
- `<domain>` is one of: `kettle`, `pet`, `student`, `developer`
- `[output-dir]` is the output directory (defaults to `./generated/<domain>-monitor`)
- `[config-path]` is an optional path to a custom domain configuration file

Example:
```bash
node workflow_tasks/run_generator.js kettle ./my-kettle-app
```

### Creating a Custom Domain

To create a custom monitoring domain:

1. Create a domain configuration file (see examples in documentation)
2. Create domain-specific templates (if needed)
3. Run the generator with your custom configuration

## Documentation

For more detailed information, see:

- [Transformation Plan](transformation_plan.md): Overall strategy for transforming the baby monitor
- [Generator System](generator_system.md): Architecture of the generator system
- [Generator Implementation](generator_implementation.md): Implementation details for the generators
- [Kettle Implementation](kettle_implementation.md): Example implementation for the kettle monitor
- [Pet Monitor Example](pet_monitor_example.md): Example implementation for the pet monitor

## E2E Testing

The system includes E2E test generators for each domain, which generate comprehensive test suites for the transformed applications. These tests ensure that the domain-specific functionality works correctly and maintains compatibility with the core monitoring framework.

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for your changes
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 