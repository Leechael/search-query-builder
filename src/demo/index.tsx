import React from 'react';
import ReactDOM from 'react-dom/client';
import { DemoPage } from './DemoPage';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoPage />
  </React.StrictMode>,
);