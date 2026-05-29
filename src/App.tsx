import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading de páginas
const GamePage = lazy(() => import('./pages/GamePage'));
const HomePage = lazy(() => import('./pages/HomePage'));

// Componente de carga
function LoadingFallback() {
  return (
    <div className="loading-screen">
      <h1>SUPER MARIO<br />REACT</h1>
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: '30%' }} />
      </div>
      <div className="loading-text">CARGANDO...</div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
