# Alert System Generator

This document describes the alert generator system that creates custom alerts for the Baby Monitor application.

## Generator Functionality

The alert generator is a configurable system that allows users to:

1. Define custom alert conditions
2. Create specialized notification templates
3. Set up escalation paths for different alert types

## Generator Schema

```json
{
  "name": "BabyMonitorAlert",
  "description": "Configurable alert generator for Baby Monitor",
  "properties": {
    "triggerConditions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {"type": "string", "enum": ["sound", "motion", "temperature"]},
          "threshold": {"type": "number"},
          "duration": {"type": "number"}
        }
      }
    },
    "notifications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "channel": {"type": "string", "enum": ["app", "sms", "email", "push"]},
          "template": {"type": "string"},
          "recipients": {"type": "array", "items": {"type": "string"}},
          "escalation": {"type": "boolean"}
        }
      }
    }
  }
}
```

## Example Usage

```javascript
// Creating a custom alert using the generator
const alertGenerator = new AlertGenerator();

const newAlert = alertGenerator.createAlert({
  name: "Loud Crying Alert",
  triggerConditions: [
    {
      type: "sound",
      threshold: 75, // dB
      duration: 10 // seconds
    }
  ],
  notifications: [
    {
      channel: "app",
      template: "loud-cry-alert",
      recipients: ["primary-caregiver"],
      escalation: false
    },
    {
      channel: "sms",
      template: "urgent-alert",
      recipients: ["secondary-caregiver"],
      escalation: true,
      escalationDelay: 60 // seconds
    }
  ]
});

// Register the new alert
babyMonitor.registerAlert(newAlert);
```

## Generator Implementation Details

The generator employs a factory pattern to create different types of alerts with customizable parameters while maintaining a consistent interface for the alert system. 