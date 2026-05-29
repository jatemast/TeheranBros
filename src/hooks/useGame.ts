import { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { BootScene } from '../game/scenes/BootScene';
import { PreloadScene } from '../game/scenes/PreloadScene';
import { MainMenuScene } from '../game/scenes/MainMenuScene';
import { GameScene } from '../game/scenes/GameScene';
import { UIScene } from '../game/scenes/UIScene';
import { GameOverScene } from '../game/scenes/GameOverScene';
import { VictoryScene } from '../game/scenes/VictoryScene';
import { WorldSelectScene } from '../game/scenes/WorldSelectScene';

export function useGame(canvasRef: React.RefObject<HTMLDivElement | null>) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const initialized = useRef(false);

  const initGame = useCallback(() => {
    if (!canvasRef.current || initialized.current) return;
    initialized.current = true;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: canvasRef.current,
      backgroundColor: '#5c94fc',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 1200 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
      },
      scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        WorldSelectScene,
        GameScene,
        UIScene,
        GameOverScene,
        VictoryScene,
      ],
      input: {
        keyboard: true,
        gamepad: true,
        touch: true,
      },
      render: {
        pixelArt: true,
        antialias: false,
      },
    };

    gameRef.current = new Phaser.Game(config);
  }, [canvasRef]);

  useEffect(() => {
    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        initialized.current = false;
      }
    };
  }, [initGame]);

  return gameRef;
}
