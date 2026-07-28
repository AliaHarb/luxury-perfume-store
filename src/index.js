import React, { StrictMode } from 'react';
import './style.css'; 
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);