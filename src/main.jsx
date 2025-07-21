import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // for global styles (including Tailwind if used)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);