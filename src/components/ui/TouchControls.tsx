import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Botones táctiles para dispositivos móviles
 * Emula eventos de teclado para interactuar con Phaser
 */
export default function TouchControls() {
  const keysRef = useRef<Set<string>>(new Set());

  const dispatchKeyEvent = useCallback((key: string, type: 'keydown' | 'keyup') => {
    const event = new KeyboardEvent(type, {
      key,
      code: key === ' ' ? 'Space' : key,
      keyCode: key === ' ' ? 32 : key.charCodeAt(0),
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  const handleTouchStart = useCallback((key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!keysRef.current.has(key)) {
      keysRef.current.add(key);
      dispatchKeyEvent(key, 'keydown');
    }
  }, [dispatchKeyEvent]);

  const handleTouchEnd = useCallback((key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (keysRef.current.has(key)) {
      keysRef.current.delete(key);
      dispatchKeyEvent(key, 'keyup');
    }
  }, [dispatchKeyEvent]);

  // Limpiar teclas al desmontar
  useEffect(() => {
    return () => {
      keysRef.current.forEach((key) => {
        dispatchKeyEvent(key, 'keyup');
      });
      keysRef.current.clear();
    };
  }, [dispatchKeyEvent]);

  return (
    <div className="touch-controls">
      {/* D-Pad */}
      <div className="dpad">
        <div className="empty" />
        <button
          onTouchStart={handleTouchStart('ArrowUp')}
          onTouchEnd={handleTouchEnd('ArrowUp')}
          onMouseDown={handleTouchStart('ArrowUp')}
          onMouseUp={handleTouchEnd('ArrowUp')}
          onMouseLeave={handleTouchEnd('ArrowUp')}
        >
          ▲
        </button>
        <div className="empty" />
        <button
          onTouchStart={handleTouchStart('ArrowLeft')}
          onTouchEnd={handleTouchEnd('ArrowLeft')}
          onMouseDown={handleTouchStart('ArrowLeft')}
          onMouseUp={handleTouchEnd('ArrowLeft')}
          onMouseLeave={handleTouchEnd('ArrowLeft')}
        >
          ◀
        </button>
        <div className="empty" />
        <button
          onTouchStart={handleTouchStart('ArrowRight')}
          onTouchEnd={handleTouchEnd('ArrowRight')}
          onMouseDown={handleTouchStart('ArrowRight')}
          onMouseUp={handleTouchEnd('ArrowRight')}
          onMouseLeave={handleTouchEnd('ArrowRight')}
        >
          ▶
        </button>
        <div className="empty" />
        <button
          onTouchStart={handleTouchStart('ArrowDown')}
          onTouchEnd={handleTouchEnd('ArrowDown')}
          onMouseDown={handleTouchStart('ArrowDown')}
          onMouseUp={handleTouchEnd('ArrowDown')}
          onMouseLeave={handleTouchEnd('ArrowDown')}
        >
          ▼
        </button>
      </div>

      {/* Botones de acción */}
      <div className="action-buttons">
        <button
          onTouchStart={handleTouchStart(' ')}
          onTouchEnd={handleTouchEnd(' ')}
          onMouseDown={handleTouchStart(' ')}
          onMouseUp={handleTouchEnd(' ')}
          onMouseLeave={handleTouchEnd(' ')}
        >
          SALTAR
        </button>
        <button
          onTouchStart={handleTouchStart('Shift')}
          onTouchEnd={handleTouchEnd('Shift')}
          onMouseDown={handleTouchStart('Shift')}
          onMouseUp={handleTouchEnd('Shift')}
          onMouseLeave={handleTouchEnd('Shift')}
        >
          CORRER
        </button>
      </div>
    </div>
  );
}
