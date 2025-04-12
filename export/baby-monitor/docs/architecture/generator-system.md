# Monitoring Domain Generator System

## Overview

This document outlines the generator system that will enable automated transformations of the Baby Monitor application into different monitoring domains such as Kettle Monitor, Pet Monitor, Student Monitor, and Developer Monitor. The generator system will provide tools and templates for creating domain-specific implementations that leverage the core monitoring infrastructure.

## Generator Architecture

The generator system follows a model-driven approach with these key components:

1. **Domain Model Descriptors**: JSON schema definitions for each monitoring domain
2. **Template Repository**: Reusable templates for code generation
3. **Transformation Rules**: Domain-specific mapping rules
4. **Code Generation Engine**: System to produce domain-specific code
5. **Validation Suite**: Tests to verify generated code functionality

```
         ┌─────────────────┐
         │  Domain Model   │
         │   Descriptors   │
         └────────┬────────┘
                  │
                  ▼
┌─────────────────────────────┐     ┌────────────────┐
│     Transformation Rules    │◄────┤   Template     │
└─────────────────┬───────────┘     │   Repository   │
                  │                 └────────────────┘
                  ▼
         ┌─────────────────┐
         │  Code Generation│
         │     Engine      │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Validation    │
         │     Suite       │
         └─────────────────┘
```

## Domain Model Descriptors

Domain model descriptors define the specific characteristics of each monitoring domain:

```json
{
  "domainType": "kettle",
  "entityName": "Kettle",
  "metrics": [
    {
      "name": "temperature",
      "type": "number",
      "unit": "celsius",
      "range": { "min": 0, "max": 100 },
      "alerts": [
        { "condition": "> 90", "severity": "warning", "message": "Water near boiling" }
      ]
    },
    {
      "name": "waterLevel",
      "type": "number",
      "unit": "percentage",
      "range": { "min": 0, "max": 100 },
      "alerts": [
        { "condition": "< 10", "severity": "warning", "message": "Water level low" }
      ]
    }
  ],
  "states": [
    { "name": "off", "description": "Kettle is turned off" },
    { "name": "heating", "description": "Kettle is heating water" },
    { "name": "boiled", "description": "Water has reached boiling point" },
    { "name": "keepWarm", "description": "Kettle is keeping water warm" }
  ],
  "events": [
    { "name": "turnOn", "description": "Kettle turned on", "stateChanges": ["off", "heating"] },
    { "name": "boilComplete", "description": "Water boiled", "stateChanges": ["heating", "boiled"] }
  ],
  "uiComponents": [
    { "type": "gauge", "metric": "temperature", "displayName": "Temperature" },
    { "type": "progressBar", "metric": "waterLevel", "displayName": "Water Level" },
    { "type": "stateIndicator", "states": ["off", "heating", "boiled", "keepWarm"] }
  ]
}
```

## Template Repository

The template repository contains reusable code templates for different aspects of the application:

1. **Data Models**: Templates for domain-specific data models
2. **API Endpoints**: Templates for REST API implementations
3. **UI Components**: Templates for user interface elements
4. **State Management**: Templates for domain-specific state management

Example template for a metric component:

```tsx
// Template: MetricDisplay.tsx
import React from 'react';
import { useMonitoringContext } from '../context/MonitoringContext';

interface MetricDisplayProps {
  metric: string;
  displayName: string;
  type: 'gauge' | 'progressBar' | 'numeric';
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  metric,
  displayName,
  type
}) => {
  const { metrics } = useMonitoringContext();
  const value = metrics[metric]?.value;
  const unit = metrics[metric]?.unit;
  
  // Render different visualizations based on type
  return (
    <div className="metric-display">
      <h3>{displayName}</h3>
      {type === 'gauge' && <GaugeComponent value={value} unit={unit} />}
      {type === 'progressBar' && <ProgressBarComponent value={value} unit={unit} />}
      {type === 'numeric' && <NumericDisplay value={value} unit={unit} />}
    </div>
  );
};
```

## Transformation Rules

Transformation rules define how to map domain-specific concepts to the generated code:

```yaml
# Example transformation rules for Baby → Kettle domain
transformations:
  - sourceEntity: "Baby"
    targetEntity: "Kettle"
    
  - sourceMetric: "temperature"
    targetMetric: "temperature"
    conversionFunction: "identity"
    
  - sourceMetric: "weight"
    targetMetric: "waterLevel"
    conversionFunction: "scaleToPercentage"
    
  - sourceEvent: "feeding"
    targetEvent: "heatingCycle"
    mappingFunction: "mapFeedingToHeatingCycle"
    
  - sourceComponent: "HealthChart"
    targetComponent: "OperatingMetricsChart"
    transformTemplate: "chart-transformation.js"
```

## Code Generation Engine

The code generation engine processes domain models, templates, and transformation rules to produce the domain-specific implementation:

1. Load domain model descriptor
2. Apply transformation rules to map generic concepts to domain-specific concepts
3. Generate code files using templates filled with domain-specific data
4. Create configuration files for the specific domain
5. Generate test files for validation

## Validation Suite

The validation suite tests the generated code to ensure it functions correctly:

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test integration between components
3. **E2E Tests**: Test complete user scenarios
4. **Performance Tests**: Verify monitoring performance under load

## E2E Test Generators

To facilitate testing of the different monitoring domains, the system includes E2E test generators:

```typescript
// Example E2E test generator
export function generateMonitoringE2ETest(domainConfig) {
  return `
    import { test, expect } from '@testing-library/react';
    import { render, screen, fireEvent } from '@testing-library/react';
    import { ${domainConfig.entityName}MonitoringProvider } from '../providers';
    import { ${domainConfig.entityName}Dashboard } from '../pages/Dashboard';

    test('monitors ${domainConfig.entityName.toLowerCase()} metrics correctly', async () => {
      // Set up mock monitoring data
      const mockMetrics = {
        ${domainConfig.metrics.map(m => `${m.name}: { value: ${m.range.min + (m.range.max - m.range.min) / 2}, unit: '${m.unit}' }`).join(',\n        ')}
      };
      
      render(
        <${domainConfig.entityName}MonitoringProvider initialMetrics={mockMetrics}>
          <${domainConfig.entityName}Dashboard />
        </${domainConfig.entityName}MonitoringProvider>
      );
      
      // Verify metrics are displayed
      ${domainConfig.metrics.map(m => `expect(screen.getByText('${m.name}')).toBeInTheDocument();`).join('\n      ')}
      
      // Test state changes
      ${domainConfig.events.map(e => `
      fireEvent.click(screen.getByText('${e.name}'));
      expect(screen.getByText('${e.stateChanges[1]}')).toBeInTheDocument();
      `).join('\n      ')}
    });
  `;
}
```

## Usage

To use the generator system for transforming the Baby Monitor into a different domain:

1. Create a domain model descriptor for the target domain
2. Configure transformation rules for mapping between domains
3. Run the code generation engine to produce the domain-specific implementation
4. Execute the validation suite to verify the implementation
5. Manually review and refine the generated code as needed

## Domain-Specific Generators

The system includes specialized generators for each target domain:

1. **Kettle Monitor Generator**: Transforms the baby monitor into a kettle monitoring system
2. **Pet Monitor Generator**: Adapts the baby monitor for pet monitoring
3. **Student Monitor Generator**: Creates a student monitoring system from the baby monitor
4. **Developer Monitor Generator**: Transforms the baby monitor into a developer/project monitoring tool

Each domain-specific generator includes:
- Predefined domain model
- Custom transformation rules
- Specialized templates
- Domain-specific test scenarios 