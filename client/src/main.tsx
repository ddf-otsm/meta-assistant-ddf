import React from 'react';
import ReactDOM from 'react-dom/client.js';
import App from './App.js';
import './index.css';
import { ProjectProvider } from './context/ProjectContext.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </React.StrictMode>
);
