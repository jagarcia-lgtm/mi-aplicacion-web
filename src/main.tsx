import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className="demo-notice">Demo local · Perfiles y comunicaciones simulados · Los datos se guardan solo en este navegador.</div>
    <div className="demo-content"><App /></div>
  </React.StrictMode>
);
