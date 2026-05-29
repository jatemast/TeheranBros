import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import TouchControls from '../components/ui/TouchControls';

export default function GamePage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showTouch, setShowTouch] = useState(false);
  const gameRef = useGame(canvasRef);

  useEffect(() => {
    // Detectar si es dispositivo táctil
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouch(isTouchDevice);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Contenedor del canvas de Phaser */}
      <div
        ref={canvasRef}
        id="game-container"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {/* Controles táctiles para móvil */}
      {showTouch && <TouchControls />}
    </div>
  );
}
