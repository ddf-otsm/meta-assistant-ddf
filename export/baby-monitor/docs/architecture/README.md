# Baby Monitor Architecture

This directory contains documentation related to the architecture of the Baby Monitor application.

## System Overview

The Baby Monitor system is designed with a modular architecture that separates concerns between:

1. **Device Layer** - Handles audio/video capture and hardware interactions
2. **Processing Layer** - Manages signal processing, activity detection, and monitoring
3. **UI Layer** - Provides user interaction and visualization

## Key Components

- **Audio Processing Module**: Handles noise filtering and sound detection
- **Video Processing Module**: Manages video streaming and motion detection
- **Alert System**: Dispatches notifications based on configurable triggers
- **Data Storage**: Manages event logs and recording storage

## Diagrams

[Architecture Diagram](./architecture-diagram.md)
[Data Flow Diagram](./data-flow.md) 