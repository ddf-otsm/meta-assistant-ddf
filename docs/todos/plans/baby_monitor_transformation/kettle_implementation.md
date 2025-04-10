# Kettle Monitor Implementation

## Core Components

### Data Models

```typescript
// server/src/models/kettle.ts
export interface Kettle {
  id: string;
  name: string;
  model: string;
  maxCapacity: number; // in liters
  currentState: KettleState;
  metrics: KettleMetrics;
  lastUpdated: Date;
}

export enum KettleState {
  OFF = "off",
  HEATING = "heating",
  BOILED = "boiled",
  KEEP_WARM = "keepWarm"
}

export interface KettleMetrics {
  temperature: {
    value: number;
    unit: "celsius";
  };
  waterLevel: {
    value: number; // percentage of capacity
    unit: "percentage";
  };
  powerConsumption: {
    value: number;
    unit: "watts";
  };
  heatingCycles: {
    today: number;
    total: number;
  };
}
```

### API Endpoints

```typescript
// server/routes/kettle.ts
import express from 'express';
import { KettleController } from '../controllers/kettle.controller';

const router = express.Router();
const controller = new KettleController();

router.get('/', controller.getAllKettles);
router.get('/:id', controller.getKettle);
router.post('/', controller.createKettle);
router.put('/:id', controller.updateKettle);
router.delete('/:id', controller.deleteKettle);

// Kettle events
router.post('/:id/events/turnOn', controller.turnOn);
router.post('/:id/events/turnOff', controller.turnOff);
router.post('/:id/events/setTemperature', controller.setTemperature);
router.post('/:id/events/setKeepWarm', controller.setKeepWarm);

// Metrics
router.get('/:id/metrics', controller.getMetrics);
router.get('/:id/metrics/history', controller.getMetricsHistory);

export default router;
```

### UI Components

```tsx
// client/src/components/kettle/KettleStatus.tsx
import React from 'react';
import { useKettleContext } from '../../context/KettleContext';
import { TemperatureGauge } from '../ui/TemperatureGauge';
import { WaterLevelIndicator } from '../ui/WaterLevelIndicator';
import { KettleStateIndicator } from './KettleStateIndicator';

export const KettleStatus: React.FC<{ kettleId: string }> = ({ kettleId }) => {
  const { kettles, loading, error } = useKettleContext();
  const kettle = kettles.find(k => k.id === kettleId);
  
  if (loading) return <p>Loading kettle status...</p>;
  if (error) return <p>Error loading kettle data: {error}</p>;
  if (!kettle) return <p>Kettle not found</p>;
  
  return (
    <div className="kettle-status">
      <h2>{kettle.name}</h2>
      <div className="kettle-metrics">
        <TemperatureGauge 
          value={kettle.metrics.temperature.value} 
          unit={kettle.metrics.temperature.unit} 
        />
        <WaterLevelIndicator 
          value={kettle.metrics.waterLevel.value} 
          capacity={kettle.maxCapacity} 
        />
      </div>
      <KettleStateIndicator state={kettle.currentState} />
      <div className="kettle-controls">
        <button 
          disabled={kettle.currentState !== 'off'} 
          onClick={() => handleTurnOn(kettle.id)}
        >
          Turn On
        </button>
        <button 
          disabled={kettle.currentState === 'off'} 
          onClick={() => handleTurnOff(kettle.id)}
        >
          Turn Off
        </button>
        <button onClick={() => handleToggleKeepWarm(kettle.id)}>
          {kettle.currentState === 'keepWarm' ? 'Stop Keep Warm' : 'Keep Warm'}
        </button>
      </div>
    </div>
  );
};
```

### Dashboard View

```tsx
// client/src/pages/KettleDashboard.tsx
import React from 'react';
import { useKettleContext } from '../context/KettleContext';
import { KettleList } from '../components/kettle/KettleList';
import { KettleStatus } from '../components/kettle/KettleStatus';
import { KettleMetricsChart } from '../components/kettle/KettleMetricsChart';
import { AddKettleForm } from '../components/kettle/AddKettleForm';

export const KettleDashboard: React.FC = () => {
  const { kettles, selectedKettleId, selectKettle } = useKettleContext();
  
  return (
    <div className="dashboard">
      <h1>Kettle Monitoring Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="kettle-list-container">
          <h2>Your Kettles</h2>
          <KettleList 
            kettles={kettles} 
            onSelectKettle={selectKettle}
            selectedKettleId={selectedKettleId} 
          />
          <AddKettleForm />
        </div>
        
        {selectedKettleId ? (
          <>
            <div className="kettle-status-container">
              <KettleStatus kettleId={selectedKettleId} />
            </div>
            <div className="kettle-metrics-container">
              <KettleMetricsChart kettleId={selectedKettleId} />
            </div>
          </>
        ) : (
          <div className="no-kettle-selected">
            <p>Select a kettle to view its status and metrics</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Adapting from Baby Monitor

### Component Transformation Examples

| Baby Monitor Component | Kettle Monitor Component | Transformation Strategy |
|------------------------|--------------------------|-------------------------|
| `BabyHealthMetrics` | `KettleMetrics` | Replace health metrics with kettle operating metrics (temperature, water level) |
| `FeedingTracker` | `HeatingCycleTracker` | Convert feeding events to heating cycle events with similar tracking logic |
| `GrowthChart` | `UsagePatternChart` | Adapt growth visualization to show kettle usage patterns over time |
| `BabyStateMonitor` | `KettleStateMonitor` | Update state machine to reflect kettle states (off, heating, boiled, etc.) |
| `ParentControls` | `UserControls` | Simplify controls for kettle operations |

### Data Transformation Examples

| Baby Monitor Data | Kettle Monitor Data | Transformation Logic |
|-------------------|---------------------|----------------------|
| `babyTemperature` | `kettleTemperature` | Direct mapping with different normal range values |
| `weight` | `waterLevel` | Convert weight tracking to water level percentage |
| `feeding` events | `heatingCycle` events | Map feeding duration to heating duration |
| `sleep` patterns | `idleTime` patterns | Track periods when kettle is not in use |
| `growthData` | `usageData` | Convert growth metrics to usage frequency metrics |

## Integration with Monitoring Framework

The Kettle Monitor implementation will integrate with the core monitoring framework through:

1. **Plugins**: Register kettle-specific plugins with the core monitoring system
2. **Context Providers**: Implement `KettleMonitoringProvider` that extends the base `MonitoringProvider`
3. **Event Handlers**: Custom event handlers for kettle-specific events
4. **Visualization Adapters**: Custom visualizations for kettle metrics

## Sample Implementation Files

For a complete implementation, the following files would be generated:

1. Data models and interfaces
2. API controllers and routes
3. UI components for kettle monitoring
4. State management for kettle operations
5. Test suite for kettle monitoring functionality

The generator system would use the domain model descriptor and transformation rules to create these files from the baby monitor codebase, preserving the core monitoring functionality while adapting it to the kettle domain. 