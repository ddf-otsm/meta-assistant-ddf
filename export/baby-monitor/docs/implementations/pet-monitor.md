# Pet Monitor Domain Example

This document provides a sample implementation of the Pet Monitor domain, demonstrating how the generator system can be extended to different monitoring contexts.

## Pet Monitor Domain Configuration

```json
{
  "domain": "pet",
  "entityName": "Pet",
  "entityMapping": {
    "Baby": "Pet",
    "Parent": "Owner",
    "Doctor": "Veterinarian"
  },
  "metricMapping": {
    "temperature": "temperature",
    "weight": "weight",
    "height": "height",
    "feeding": "feeding",
    "sleep": "sleep",
    "diaper": "waste"
  },
  "componentMapping": {
    "BabyHealthMetrics": "PetHealthMetrics",
    "FeedingTracker": "FeedingTracker",
    "GrowthChart": "GrowthChart",
    "SleepTracker": "SleepTracker",
    "BabyProfile": "PetProfile",
    "DiaperTracker": "WasteTracker"
  },
  "filePathMapping": {
    "client/src/pages/Baby.tsx": "client/src/pages/Pet.tsx",
    "client/src/pages/BabyVision.tsx": "client/src/pages/PetVision.tsx",
    "server/routes/baby.ts": "server/routes/pet.ts",
    "server/routes/parent.ts": "server/routes/owner.ts"
  },
  "entityProperties": {
    "Pet": [
      { "name": "id", "type": "string" },
      { "name": "name", "type": "string" },
      { "name": "species", "type": "string" },
      { "name": "breed", "type": "string" },
      { "name": "birthdate", "type": "Date" },
      { "name": "currentState", "type": "PetState" },
      { "name": "metrics", "type": "PetMetrics" },
      { "name": "ownerId", "type": "string" },
      { "name": "lastUpdated", "type": "Date" }
    ]
  },
  "customCode": {
    "PetState": "enum PetState { RESTING = 'resting', ACTIVE = 'active', EATING = 'eating', SLEEPING = 'sleeping', ILL = 'ill' }"
  },
  "skipFiles": [
    "client/src/pages/ContractionTracker.tsx",
    "client/src/pages/LullabyGenerator.tsx"
  ],
  "additionalComponents": [
    "VaccinationTracker",
    "MedicationReminder",
    "ExerciseLog"
  ]
}
```

## Pet-Specific Data Models

```typescript
// server/src/models/pet.ts
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthdate: Date;
  currentState: PetState;
  metrics: PetMetrics;
  ownerId: string;
  lastUpdated: Date;
}

export enum PetState {
  RESTING = 'resting',
  ACTIVE = 'active',
  EATING = 'eating',
  SLEEPING = 'sleeping',
  ILL = 'ill'
}

export interface PetMetrics {
  temperature: {
    value: number;
    unit: "celsius";
  };
  weight: {
    value: number;
    unit: "kg";
  };
  height: {
    value: number;
    unit: "cm";
  };
  feedingSchedule: {
    lastFed: Date;
    nextFeeding: Date;
    amount: number;
    unit: "grams" | "cups";
  };
  activity: {
    dailySteps: number;
    activeMinutes: number;
  };
}

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: Date;
  expirationDate: Date;
  veterinarianId: string;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "twice daily", "every 8 hours"
  startDate: Date;
  endDate: Date;
  instructions: string;
}
```

## Pet Monitor Dashboard

```tsx
// client/src/pages/PetDashboard.tsx
import React from 'react';
import { usePetContext } from '../context/PetContext';
import { PetList } from '../components/pet/PetList';
import { PetStatus } from '../components/pet/PetStatus';
import { PetMetricsChart } from '../components/pet/PetMetricsChart';
import { AddPetForm } from '../components/pet/AddPetForm';
import { VaccinationTracker } from '../components/pet/VaccinationTracker';
import { MedicationReminder } from '../components/pet/MedicationReminder';

export const PetDashboard: React.FC = () => {
  const { pets, selectedPetId, selectPet } = usePetContext();
  
  return (
    <div className="dashboard">
      <h1>Pet Health Monitor</h1>
      
      <div className="dashboard-grid">
        <div className="pet-list-container">
          <h2>Your Pets</h2>
          <PetList 
            pets={pets} 
            onSelectPet={selectPet}
            selectedPetId={selectedPetId} 
          />
          <AddPetForm />
        </div>
        
        {selectedPetId ? (
          <>
            <div className="pet-status-container">
              <PetStatus petId={selectedPetId} />
            </div>
            <div className="pet-metrics-container">
              <PetMetricsChart petId={selectedPetId} />
            </div>
            <div className="pet-health-container">
              <VaccinationTracker petId={selectedPetId} />
              <MedicationReminder petId={selectedPetId} />
            </div>
          </>
        ) : (
          <div className="no-pet-selected">
            <p>Select a pet to view their status and health metrics</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## Pet-Specific Components

```tsx
// client/src/components/pet/VaccinationTracker.tsx
import React, { useState, useEffect } from 'react';
import { usePetContext } from '../../context/PetContext';
import { fetchVaccinations, addVaccination } from '../../api/pet';
import { Vaccination } from '../../types/pet';

export const VaccinationTracker: React.FC<{ petId: string }> = ({ petId }) => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    const loadVaccinations = async () => {
      try {
        setLoading(true);
        const data = await fetchVaccinations(petId);
        setVaccinations(data);
      } catch (error) {
        console.error('Error loading vaccinations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVaccinations();
  }, [petId]);
  
  const handleAddVaccination = async (newVaccination: Omit<Vaccination, 'id'>) => {
    try {
      const added = await addVaccination({
        ...newVaccination,
        petId
      });
      setVaccinations(prev => [...prev, added]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding vaccination:', error);
    }
  };
  
  // Sort by date, most recent first
  const sortedVaccinations = [...vaccinations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="vaccination-tracker">
      <div className="section-header">
        <h3>Vaccinations</h3>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Vaccination'}
        </button>
      </div>
      
      {showForm && (
        <VaccinationForm onSubmit={handleAddVaccination} onCancel={() => setShowForm(false)} />
      )}
      
      {loading ? (
        <p>Loading vaccinations...</p>
      ) : sortedVaccinations.length > 0 ? (
        <ul className="vaccination-list">
          {sortedVaccinations.map(v => (
            <li key={v.id} className="vaccination-item">
              <div className="vaccination-name">{v.name}</div>
              <div className="vaccination-date">Date: {new Date(v.date).toLocaleDateString()}</div>
              <div className="vaccination-expiry">
                Expires: {new Date(v.expirationDate).toLocaleDateString()}
                {new Date(v.expirationDate) < new Date() && 
                  <span className="expired-badge">Expired</span>
                }
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No vaccinations recorded yet.</p>
      )}
    </div>
  );
};
```

## Additional Pet-Specific API Endpoints

```typescript
// server/routes/pet.ts
import express from 'express';
import { PetController } from '../controllers/pet.controller';
import { VaccinationController } from '../controllers/vaccination.controller';
import { MedicationController } from '../controllers/medication.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const petController = new PetController();
const vaccinationController = new VaccinationController();
const medicationController = new MedicationController();

// Pet CRUD endpoints
router.get('/', authMiddleware, petController.getAllPets);
router.get('/:id', authMiddleware, petController.getPet);
router.post('/', authMiddleware, petController.createPet);
router.put('/:id', authMiddleware, petController.updatePet);
router.delete('/:id', authMiddleware, petController.deletePet);

// Pet state endpoints
router.post('/:id/state', authMiddleware, petController.updatePetState);

// Metrics endpoints
router.get('/:id/metrics', authMiddleware, petController.getPetMetrics);
router.post('/:id/metrics', authMiddleware, petController.updatePetMetrics);
router.get('/:id/metrics/history', authMiddleware, petController.getPetMetricsHistory);

// Vaccination endpoints
router.get('/:id/vaccinations', authMiddleware, vaccinationController.getVaccinations);
router.post('/:id/vaccinations', authMiddleware, vaccinationController.addVaccination);
router.put('/:id/vaccinations/:vaccinationId', authMiddleware, vaccinationController.updateVaccination);
router.delete('/:id/vaccinations/:vaccinationId', authMiddleware, vaccinationController.deleteVaccination);

// Medication endpoints
router.get('/:id/medications', authMiddleware, medicationController.getMedications);
router.post('/:id/medications', authMiddleware, medicationController.addMedication);
router.put('/:id/medications/:medicationId', authMiddleware, medicationController.updateMedication);
router.delete('/:id/medications/:medicationId', authMiddleware, medicationController.deleteMedication);

export default router;
```

## E2E Test Example for Pet Monitor

```typescript
// tests/e2e/pet-monitor.test.ts
import { test, expect } from '@playwright/test';

test.describe('Pet Monitor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  });

  test('should display pet list and select a pet', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify pets are loaded
    await expect(page.locator('.pet-list')).toBeVisible();
    
    // Click on the first pet
    await page.click('.pet-list-item:first-child');
    
    // Verify pet details are shown
    await expect(page.locator('.pet-status')).toBeVisible();
    await expect(page.locator('.pet-metrics-chart')).toBeVisible();
  });

  test('should add a new pet', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click the "Add Pet" button
    await page.click('button:text("Add Pet")');
    
    // Fill out the form
    await page.fill('input[name="name"]', 'Fluffy');
    await page.fill('input[name="species"]', 'Cat');
    await page.fill('input[name="breed"]', 'Persian');
    await page.fill('input[name="birthdate"]', '2020-01-15');
    
    // Submit the form
    await page.click('button:text("Save")');
    
    // Verify the new pet appears in the list
    await expect(page.locator('.pet-list')).toContainText('Fluffy');
  });

  test('should track vaccination history', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Select the first pet
    await page.click('.pet-list-item:first-child');
    
    // Navigate to vaccinations
    await expect(page.locator('.vaccination-tracker')).toBeVisible();
    
    // Add a new vaccination
    await page.click('.vaccination-tracker button:text("Add Vaccination")');
    await page.fill('input[name="name"]', 'Rabies');
    await page.fill('input[name="date"]', '2023-05-10');
    await page.fill('input[name="expirationDate"]', '2024-05-10');
    await page.fill('input[name="veterinarianId"]', 'vet123');
    
    await page.click('button:text("Save Vaccination")');
    
    // Verify the new vaccination appears
    await expect(page.locator('.vaccination-list')).toContainText('Rabies');
  });
});
```

## Key Differences from Baby Monitor

The Pet Monitor implementation demonstrates how the generator system can adapt the Baby Monitor to a different domain while preserving the core monitoring functionality:

1. **Domain-Specific Entities**: Added pet-specific properties like species, breed
2. **Enhanced Health Tracking**: Added vaccination and medication tracking specific to pets
3. **Different State Model**: Pet states (active, resting, eating, etc.) vs. baby states
4. **Custom Components**: Added pet-specific components like VaccinationTracker
5. **Adapted Terminology**: Changed parent->owner, doctor->veterinarian, etc.

The generator preserves the core architecture and monitoring capabilities while adapting the terminology, data models, and functionality to the pet domain. 