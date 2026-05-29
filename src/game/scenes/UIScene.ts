import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';

/**
 * Escena de UI superpuesta al juego - Muestra HUD, minimapa, vidas, puntuación
 */
export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private worldText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private minimap!: Phaser.GameObjects.Graphics;
  private gameScene: Phaser.Scene | null = null;
  private coinIcon!: Phaser.GameObjects.Sprite;
  private heartIcon!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: Phaser.Scene }) {
    this.gameScene = data.gameScene;
  }

  create() {
    const store = useGameStore.getState();

    // Fondo semi-transparente superior
    const topBar = this.add.rectangle(400, 16, 800, 32, 0x000000, 0.5);
    topBar.setScrollFactor(0);

    // Icono de corazón
    this.heartIcon = this.add.sprite(20, 16, 'heart');
    this.heartIcon.setScale(1.5);

    // Vidas
    this.livesText = this.add.text(32, 8, `× ${store.lives}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    });

    // Icono de moneda
    this.coinIcon = this.add.sprite(140, 16, 'coin-icon');
    this.coinIcon.setScale(1.2);

    // Monedas
    this.coinsText = this.add.text(152, 8, `× ${store.coins}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#FBD000',
    });

    // Puntuación
    this.scoreText = this.add.text(280, 8, `SCORE: ${store.score}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    });

    // Mundo y fase
    const worldNames: Record<number, string> = { 1: 'PRA', 2: 'DES', 3: 'NIE', 4: 'LAV', 5: 'CAS' };
    this.worldText = this.add.text(520, 8, `${worldNames[store.currentWorld] || 'PRA'}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#FBD000',
    });

    this.phaseText = this.add.text(580, 8, `-${store.currentPhase}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    });

    // Minimapa
    this.minimap = this.add.graphics();
    this.minimap.setScrollFactor(0);
    this.drawMinimap();

    // Actualizar cada 500ms
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateHUD(),
      loop: true,
    });
  }

  update() {
    this.updateHUD();
    if (this.gameScene) {
      this.drawMinimap();
    }
  }

  private updateHUD() {
    const store = useGameStore.getState();
    this.livesText.setText(`× ${store.lives}`);
    this.coinsText.setText(`× ${store.coins}`);
    this.scoreText.setText(`SCORE: ${store.score}`);

    const worldNames: Record<number, string> = { 1: 'PRA', 2: 'DES', 3: 'NIE', 4: 'LAV', 5: 'CAS' };
    this.worldText.setText(`${worldNames[store.currentWorld] || 'PRA'}`);
    this.phaseText.setText(`-${store.currentPhase}`);
  }

  private drawMinimap() {
    if (!this.gameScene) return;
    this.minimap.clear();

    const gameScene = this.gameScene as any;
    const phaseData = gameScene.phaseData;
    if (!phaseData) return;

    const mapWidth = phaseData.width;
    const mapHeight = phaseData.height;
    const minimapX = 680;
    const minimapY = 8;
    const minimapW = 100;
    const minimapH = 20;
    const scaleX = minimapW / mapWidth;
    const scaleY = minimapH / mapHeight;

    // Fondo del minimapa
    this.minimap.fillStyle(0x000000, 0.5);
    this.minimap.fillRect(minimapX, minimapY, minimapW, minimapH);

    // Dibujar plataformas
    this.minimap.fillStyle(0x8b4513, 0.8);
    if (phaseData.platforms) {
      phaseData.platforms.forEach((plat: any) => {
        this.minimap.fillRect(
          minimapX + plat.x * scaleX,
          minimapY + plat.y * scaleY,
          Math.max(2, plat.width * scaleX),
          Math.max(2, plat.height * scaleY)
        );
      });
    }

    // Dibujar enemigos
    this.minimap.fillStyle(0xff0000, 0.8);
    if (phaseData.enemies) {
      phaseData.enemies.forEach((enemy: any) => {
        if (enemy.alive) {
          this.minimap.fillRect(
            minimapX + enemy.x * scaleX - 1,
            minimapY + enemy.y * scaleY - 1,
            3, 3
          );
        }
      });
    }

    // Dibujar monedas
    this.minimap.fillStyle(0xfbd000, 0.8);
    if (phaseData.coins) {
      phaseData.coins.forEach((coin: any) => {
        if (!coin.collected) {
          this.minimap.fillRect(
            minimapX + coin.x * scaleX - 1,
            minimapY + coin.y * scaleY - 1,
            2, 2
          );
        }
      });
    }

    // Posición del jugador
    if (gameScene.player && gameScene.player.active) {
      this.minimap.fillStyle(0x00ff00, 1);
      this.minimap.fillRect(
        minimapX + gameScene.player.x * scaleX - 2,
        minimapY + gameScene.player.y * scaleY - 2,
        4, 4
      );
    }
  }
}
