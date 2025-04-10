const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const { setupRepoRoutes } = require('./api/routes/repository');
const { setupGeneratorRoutes } = require('./api/routes/generator');
const { setupAnalysisRoutes } = require('./api/routes/analysis');
const { setupWebSocketServer } = require('./api/websocket');
const logger = require('./core/utils/logger');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });
setupWebSocketServer(wss);

// API Routes
setupRepoRoutes(app);
setupGeneratorRoutes(app);
setupAnalysisRoutes(app);

// Serve static files from the UI build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'ui/build')));
  
  // All other GET requests not handled will return the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui/build', 'index.html'));
  });
}

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server }; 