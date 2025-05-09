import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Add a MutationObserver to prevent aria-hidden on the root div
const rootElement = document.getElementById('root');
if (rootElement) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
        if (rootElement.getAttribute('aria-hidden') === 'true') {
          rootElement.removeAttribute('aria-hidden');
        }
      }
    });
  });
  
  observer.observe(rootElement, { attributes: true });
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 