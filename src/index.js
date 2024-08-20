import React from 'react';
import ReactDOM from 'react-dom/client'; // Cambiado de 'react-dom' a 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root')); // Crea una raíz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
