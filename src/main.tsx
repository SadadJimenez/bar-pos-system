import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Main.tsx starting...');
const container = document.getElementById('root');
if (!container) {
  console.error('Root container not found!');
} else {
  console.log('Root container found, mounting app...');
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
