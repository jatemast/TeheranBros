import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simular carga inicial
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleStart = () => {
    const store = useGameStore.getState();
    const hasSave = store.loadGame();
    if (!hasSave) {
      store.resetGame();
    }
    navigate('/game');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>SUPER MARIO<br />REACT</h1>
        <div className="loading-bar-container">
          <div
            className="loading-bar"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="loading-text">CARGANDO...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
        fontFamily: '"Press Start 2P", monospace',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Estrellas animadas de fondo */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
            animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Título */}
      <h1
        style={{
          fontSize: 'clamp(20px, 5vw, 36px)',
          color: '#fbd000',
          textShadow: '4px 4px 0 #000, 6px 6px 0 rgba(0,0,0,0.3)',
          textAlign: 'center',
          lineHeight: 1.4,
          marginBottom: '20px',
          animation: 'bounce 2s ease-in-out infinite',
        }}
      >
        SUPER MARIO<br />REACT
      </h1>

      {/* Mario decorativo */}
      <div
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#e52521',
          borderRadius: '8px',
          marginBottom: '40px',
          position: 'relative',
          boxShadow: '0 4px 0 #8b0000, 0 8px 16px rgba(0,0,0,0.3)',
          animation: 'bounce 1.5s ease-in-out infinite',
        }}
      >
        {/* Ojos */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '12px',
            height: '12px',
            backgroundColor: '#000',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '12px',
            height: '12px',
            backgroundColor: '#000',
            borderRadius: '50%',
          }}
        />
        {/* Bigote */}
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: '8px',
            right: '8px',
            height: '6px',
            backgroundColor: '#8b4513',
            borderRadius: '3px',
          }}
        />
        {/* Gorra */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '16px',
            backgroundColor: '#e52521',
            borderRadius: '8px 8px 0 0',
            borderBottom: '2px solid #8b0000',
          }}
        />
      </div>

      {/* Botón de inicio */}
      <button
        onClick={handleStart}
        style={{
          padding: '16px 48px',
          fontSize: 'clamp(10px, 2vw, 14px)',
          fontFamily: '"Press Start 2P", monospace',
          backgroundColor: '#e52521',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #8b0000, 0 6px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.1s, box-shadow 0.1s',
          textTransform: 'uppercase',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(4px)';
          e.currentTarget.style.boxShadow = '0 0px 0 #8b0000, 0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 0 #8b0000, 0 6px 12px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 0 #8b0000, 0 6px 12px rgba(0,0,0,0.3)';
        }}
      >
        JUGAR
      </button>

      <p
        style={{
          marginTop: '30px',
          fontSize: '8px',
          color: '#666',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Presiona JUGAR para comenzar<br />
        Compatible con teclado, táctil y gamepad
      </p>
    </div>
  );
}
