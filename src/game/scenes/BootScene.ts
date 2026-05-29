import Phaser from 'phaser';

/**
 * Escena de arranque - Genera todos los assets proceduralmente
 * usando la API de gráficos de Phaser (texturas generadas en código)
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'CARGANDO...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.generateAllAssets();
  }

  create() {
    this.scene.start('PreloadScene');
  }

  private createSprite(key: string, draw: (g: Phaser.GameObjects.Graphics) => void) {
    const g = this.add.graphics();
    draw(g);
    g.generateTexture(key, 16, 40);
    g.destroy();
  }

  private generateAllAssets() {
    this.generatePlayerSprites();
    this.generateEnemySprites();
    this.generateBlockSprites();
    this.generateItemSprites();
    this.generateBackgroundSprites();
    this.generateEffectSprites();
    this.generateTileSprites();
    this.generateUISprites();
  }

  private generatePlayerSprites() {
    // Mario pequeño - idle
    this.createSprite('player-small-idle', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x049cd8); g.fillRect(4, 16, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 4, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 6, 2, 2); g.fillRect(10, 6, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 4);
      g.fillStyle(0x8b4513); g.fillRect(4, 24, 4, 4); g.fillRect(10, 24, 4, 4);
    });
    this.createSprite('player-small-run1', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x049cd8); g.fillRect(4, 16, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 4, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 6, 2, 2); g.fillRect(10, 6, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 4);
      g.fillStyle(0x8b4513); g.fillRect(2, 24, 4, 4); g.fillRect(10, 24, 4, 4);
    });
    this.createSprite('player-small-run2', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x049cd8); g.fillRect(4, 16, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 4, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 6, 2, 2); g.fillRect(10, 6, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 4);
      g.fillStyle(0x8b4513); g.fillRect(4, 24, 4, 4); g.fillRect(12, 24, 4, 4);
    });
    this.createSprite('player-small-jump', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x049cd8); g.fillRect(4, 16, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 4, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 6, 2, 2); g.fillRect(10, 6, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 4);
      g.fillStyle(0x8b4513); g.fillRect(2, 22, 4, 4); g.fillRect(12, 22, 4, 4);
    });
    // Mario grande
    this.createSprite('player-big-idle', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 16, 8, 12);
      g.fillStyle(0x049cd8); g.fillRect(4, 28, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x000000); g.fillRect(6, 10, 2, 2); g.fillRect(10, 10, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 8);
      g.fillStyle(0x8b4513); g.fillRect(4, 36, 4, 4); g.fillRect(10, 36, 4, 4);
      g.fillStyle(0x8b4513); g.fillRect(6, 14, 6, 2);
    });
    this.createSprite('player-big-run1', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 16, 8, 12);
      g.fillStyle(0x049cd8); g.fillRect(4, 28, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x000000); g.fillRect(6, 10, 2, 2); g.fillRect(10, 10, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 8);
      g.fillStyle(0x8b4513); g.fillRect(2, 36, 4, 4); g.fillRect(10, 36, 4, 4);
      g.fillStyle(0x8b4513); g.fillRect(6, 14, 6, 2);
    });
    this.createSprite('player-big-jump', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 16, 8, 12);
      g.fillStyle(0x049cd8); g.fillRect(4, 28, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x000000); g.fillRect(6, 10, 2, 2); g.fillRect(10, 10, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 8);
      g.fillStyle(0x8b4513); g.fillRect(2, 34, 4, 4); g.fillRect(12, 34, 4, 4);
      g.fillStyle(0x8b4513); g.fillRect(6, 14, 6, 2);
    });
    this.createSprite('player-fire-idle', (g) => {
      g.fillStyle(0xffffff); g.fillRect(4, 16, 8, 12);
      g.fillStyle(0xe52521); g.fillRect(4, 28, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0x000000); g.fillRect(6, 10, 2, 2); g.fillRect(10, 10, 2, 2);
      g.fillStyle(0xffffff); g.fillRect(4, 0, 8, 8);
      g.fillStyle(0x8b4513); g.fillRect(4, 36, 4, 4); g.fillRect(10, 36, 4, 4);
      g.fillStyle(0x8b4513); g.fillRect(6, 14, 6, 2);
    });
  }

  private generateEnemySprites() {
    this.createSprite('goomba', (g) => {
      g.fillStyle(0x8b4513); g.fillRect(4, 8, 8, 8);
      g.fillStyle(0xdeb887); g.fillRect(4, 0, 8, 8);
      g.fillStyle(0x000000); g.fillRect(6, 2, 2, 2); g.fillRect(10, 2, 2, 2);
      g.fillStyle(0x000000); g.fillRect(4, 16, 4, 4); g.fillRect(10, 16, 4, 4);
      g.fillStyle(0x000000); g.fillRect(4, 0, 8, 2);
    });
    this.createSprite('goomba-flat', (g) => {
      g.fillStyle(0x8b4513); g.fillRect(4, 12, 8, 4);
      g.fillStyle(0xdeb887); g.fillRect(4, 8, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 9, 2, 1); g.fillRect(10, 9, 2, 1);
    });
    this.createSprite('koopa', (g) => {
      g.fillStyle(0x00a651); g.fillRect(4, 4, 8, 12);
      g.fillStyle(0xfbd000); g.fillRect(4, 0, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 1, 2, 2); g.fillRect(10, 1, 2, 2);
      g.fillStyle(0xfbd000); g.fillRect(2, 16, 4, 4); g.fillRect(10, 16, 4, 4);
      g.fillStyle(0x00a651); g.fillRect(6, 4, 4, 4);
    });
    this.createSprite('koopa-shell', (g) => {
      g.fillStyle(0x00a651); g.fillRect(2, 2, 12, 12);
      g.fillStyle(0x006633); g.fillRect(4, 4, 8, 8);
    });
    this.createSprite('piranha', (g) => {
      g.fillStyle(0x00a651); g.fillRect(6, 8, 4, 8);
      g.fillStyle(0xe52521); g.fillRect(2, 0, 12, 10);
      g.fillStyle(0xffffff); g.fillRect(4, 2, 3, 3); g.fillRect(9, 2, 3, 3);
      g.fillStyle(0x000000); g.fillRect(5, 3, 2, 2); g.fillRect(10, 3, 2, 2);
      g.fillStyle(0x00a651); g.fillRect(2, 8, 12, 2);
    });
    this.createSprite('lakitu', (g) => {
      g.fillStyle(0xffffff); g.fillRect(4, 4, 8, 8); g.fillRect(2, 6, 12, 4);
      g.fillStyle(0x00a651); g.fillRect(4, 12, 8, 4);
      g.fillStyle(0xfbd000); g.fillRect(4, 8, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 9, 2, 2); g.fillRect(10, 9, 2, 2);
    });
    this.createSprite('boo', (g) => {
      g.fillStyle(0xffffff); g.fillRect(2, 2, 12, 12);
      g.fillStyle(0x000000); g.fillRect(4, 4, 3, 4); g.fillRect(9, 4, 3, 4);
      g.fillStyle(0x000000); g.fillRect(5, 10, 6, 2);
    });
    this.createSprite('bullet', (g) => {
      g.fillStyle(0x333333); g.fillRect(2, 4, 12, 8);
      g.fillStyle(0x666666); g.fillRect(0, 5, 4, 6);
      g.fillStyle(0xe52521); g.fillRect(4, 5, 2, 2); g.fillRect(4, 9, 2, 2);
      g.fillStyle(0xffffff); g.fillRect(8, 6, 2, 4);
    });
    this.createSprite('boss', (g) => {
      g.fillStyle(0x8b0000); g.fillRect(4, 8, 16, 16);
      g.fillStyle(0xdeb887); g.fillRect(4, 0, 16, 8);
      g.fillStyle(0x000000); g.fillRect(6, 2, 3, 3); g.fillRect(15, 2, 3, 3);
      g.fillStyle(0x000000); g.fillRect(4, 0, 16, 2);
      g.fillStyle(0x8b4513); g.fillRect(4, 24, 6, 4); g.fillRect(14, 24, 6, 4);
    });
  }

  private generateBlockSprites() {
    this.createSprite('ground', (g) => {
      g.fillStyle(0x8b4513); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x654321); g.fillRect(0, 0, 16, 2); g.fillRect(0, 0, 2, 16); g.fillRect(14, 0, 2, 16); g.fillRect(0, 14, 16, 2);
    });
    this.createSprite('ground-top', (g) => {
      g.fillStyle(0x00a651); g.fillRect(0, 0, 16, 4);
      g.fillStyle(0x8b4513); g.fillRect(0, 4, 16, 12);
      g.fillStyle(0x654321); g.fillRect(0, 4, 2, 12); g.fillRect(14, 4, 2, 12);
    });
    this.createSprite('brick', (g) => {
      g.fillStyle(0x8b4513); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x654321); g.fillRect(0, 0, 16, 1); g.fillRect(0, 7, 16, 1); g.fillRect(0, 15, 16, 1);
      g.fillRect(0, 0, 1, 8); g.fillRect(8, 0, 1, 8); g.fillRect(4, 7, 1, 9); g.fillRect(12, 7, 1, 9);
      g.fillStyle(0x000000); g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(3, 8, 1, 8); g.fillRect(11, 8, 1, 8);
    });
    this.createSprite('question', (g) => {
      g.fillStyle(0xfbd000); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xcc9900); g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
      g.fillStyle(0x8b4513); g.fillRect(6, 3, 4, 2); g.fillRect(8, 5, 2, 2); g.fillRect(6, 7, 4, 2); g.fillRect(6, 10, 4, 2); g.fillRect(7, 12, 2, 2);
    });
    this.createSprite('hard', (g) => {
      g.fillStyle(0x808080); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x666666); g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
      g.fillStyle(0x999999); g.fillRect(2, 2, 5, 5); g.fillRect(9, 2, 5, 5); g.fillRect(2, 9, 5, 5); g.fillRect(9, 9, 5, 5);
    });
    this.createSprite('pipe-top', (g) => {
      g.fillStyle(0x00a651); g.fillRect(0, 0, 16, 8);
      g.fillStyle(0x006633); g.fillRect(0, 0, 2, 8); g.fillRect(14, 0, 2, 8); g.fillRect(0, 7, 16, 1);
    });
    this.createSprite('pipe-body', (g) => {
      g.fillStyle(0x00a651); g.fillRect(2, 0, 12, 16);
      g.fillStyle(0x006633); g.fillRect(2, 0, 2, 16); g.fillRect(12, 0, 2, 16);
    });
  }

  private generateItemSprites() {
    this.createSprite('coin', (g) => {
      g.fillStyle(0xfbd000); g.fillRect(2, 0, 12, 16);
      g.fillStyle(0xffd700); g.fillRect(4, 2, 8, 12);
      g.fillStyle(0xcc9900); g.fillRect(2, 0, 2, 16); g.fillRect(12, 0, 2, 16);
    });
    this.createSprite('coin2', (g) => {
      g.fillStyle(0xfbd000); g.fillRect(4, 2, 8, 12);
      g.fillStyle(0xffd700); g.fillRect(5, 3, 6, 10);
    });
    this.createSprite('mushroom', (g) => {
      g.fillStyle(0xe52521); g.fillRect(2, 0, 12, 8);
      g.fillStyle(0xffffff); g.fillRect(2, 0, 12, 2); g.fillRect(2, 8, 12, 6);
      g.fillStyle(0x000000); g.fillRect(4, 10, 2, 2); g.fillRect(10, 10, 2, 2);
    });
    this.createSprite('flower', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 0, 8, 6);
      g.fillStyle(0xfbd000); g.fillRect(4, 6, 8, 6);
      g.fillStyle(0x00a651); g.fillRect(6, 12, 4, 4);
      g.fillStyle(0x000000); g.fillRect(5, 2, 2, 2); g.fillRect(9, 2, 2, 2);
    });
    this.createSprite('star', (g) => {
      g.fillStyle(0xfbd000); g.fillRect(2, 4, 12, 8); g.fillRect(4, 2, 8, 12); g.fillRect(0, 6, 16, 4);
      g.fillStyle(0xffd700); g.fillRect(4, 6, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 7, 2, 2); g.fillRect(10, 7, 2, 2);
    });
    this.createSprite('flag', (g) => {
      g.fillStyle(0x00a651); g.fillRect(7, 0, 2, 32);
      g.fillStyle(0x00ff00); g.fillRect(9, 2, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(9, 4, 6, 4);
      g.fillStyle(0xfbd000); g.fillRect(6, 0, 4, 4);
    });
    this.createSprite('checkpoint', (g) => {
      g.fillStyle(0xcccccc); g.fillRect(7, 0, 2, 32);
      g.fillStyle(0xfbd000); g.fillRect(3, 0, 10, 4);
      g.fillStyle(0xcccccc); g.fillRect(3, 4, 10, 2);
    });
    this.createSprite('checkpoint-active', (g) => {
      g.fillStyle(0xcccccc); g.fillRect(7, 0, 2, 32);
      g.fillStyle(0x00ff00); g.fillRect(3, 0, 10, 4);
      g.fillStyle(0x00ff00); g.fillRect(3, 4, 10, 2);
    });
  }

  private generateBackgroundSprites() {
    this.createSprite('cloud', (g) => {
      g.fillStyle(0xffffff); g.fillRect(4, 4, 8, 8); g.fillRect(2, 6, 12, 4);
      g.fillStyle(0xf0f0f0); g.fillRect(4, 6, 8, 4);
    });
    this.createSprite('bush', (g) => {
      g.fillStyle(0x00a651); g.fillRect(2, 8, 12, 8); g.fillRect(0, 10, 16, 6);
      g.fillStyle(0x008000); g.fillRect(2, 8, 12, 2);
    });
    this.createSprite('hill', (g) => {
      g.fillStyle(0x00a651); g.fillRect(0, 8, 16, 8); g.fillRect(2, 6, 12, 2); g.fillRect(4, 4, 8, 2); g.fillRect(6, 2, 4, 2);
      g.fillStyle(0x008000); g.fillRect(0, 8, 16, 1);
    });
    this.createSprite('tree', (g) => {
      g.fillStyle(0x8b4513); g.fillRect(6, 12, 4, 4);
      g.fillStyle(0x00a651); g.fillRect(2, 4, 12, 8); g.fillRect(4, 2, 8, 2); g.fillRect(6, 0, 4, 2);
    });
    this.createSprite('cactus', (g) => {
      g.fillStyle(0x006633); g.fillRect(6, 4, 4, 12);
      g.fillStyle(0x008000); g.fillRect(6, 4, 4, 1);
      g.fillStyle(0x006633); g.fillRect(2, 6, 4, 4); g.fillRect(10, 8, 4, 4);
    });
    this.createSprite('snowman', (g) => {
      g.fillStyle(0xffffff); g.fillRect(4, 8, 8, 8); g.fillRect(2, 4, 12, 4);
      g.fillStyle(0x000000); g.fillRect(5, 5, 2, 2); g.fillRect(9, 5, 2, 2);
      g.fillStyle(0xe52521); g.fillRect(6, 7, 4, 2);
      g.fillStyle(0x000000); g.fillRect(4, 10, 2, 2); g.fillRect(10, 10, 2, 2);
    });
    this.createSprite('lava', (g) => {
      g.fillStyle(0xff4500); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xff6600); g.fillRect(0, 0, 16, 4); g.fillRect(4, 8, 8, 4);
      g.fillStyle(0xff0000); g.fillRect(0, 4, 16, 1); g.fillRect(0, 12, 16, 1);
    });
    this.createSprite('pillar', (g) => {
      g.fillStyle(0x808080); g.fillRect(2, 0, 12, 16);
      g.fillStyle(0x666666); g.fillRect(2, 0, 2, 16); g.fillRect(12, 0, 2, 16);
      g.fillStyle(0x999999); g.fillRect(0, 0, 16, 2); g.fillRect(0, 14, 16, 2);
    });
    this.createSprite('torch', (g) => {
      g.fillStyle(0x8b4513); g.fillRect(6, 8, 4, 8);
      g.fillStyle(0xff4500); g.fillRect(4, 2, 8, 6);
      g.fillStyle(0xff6600); g.fillRect(6, 4, 4, 4);
      g.fillStyle(0xfbd000); g.fillRect(7, 5, 2, 2);
    });
    this.createSprite('statue', (g) => {
      g.fillStyle(0x808080); g.fillRect(4, 4, 8, 12); g.fillRect(2, 0, 12, 4);
      g.fillStyle(0x666666); g.fillRect(4, 2, 2, 2); g.fillRect(10, 2, 2, 2); g.fillRect(5, 6, 6, 2);
    });
  }

  private generateEffectSprites() {
    this.createSprite('coin-particle', (g) => { g.fillStyle(0xfbd000); g.fillRect(0, 0, 4, 4); });
    this.createSprite('brick-particle', (g) => { g.fillStyle(0x8b4513); g.fillRect(0, 0, 4, 4); });
    this.createSprite('explosion', (g) => {
      g.fillStyle(0xff4500); g.fillRect(2, 2, 12, 12);
      g.fillStyle(0xfbd000); g.fillRect(4, 4, 8, 8);
      g.fillStyle(0xffffff); g.fillRect(6, 6, 4, 4);
    });
    this.createSprite('fireball', (g) => {
      g.fillStyle(0xff4500); g.fillRect(1, 1, 6, 6);
      g.fillStyle(0xfbd000); g.fillRect(2, 2, 4, 4);
      g.fillStyle(0xffffff); g.fillRect(3, 3, 2, 2);
    });
    this.createSprite('bubble', (g) => {
      g.fillStyle(0x87ceeb); g.fillRect(1, 1, 6, 6);
      g.fillStyle(0xadd8e6); g.fillRect(2, 2, 4, 4);
    });
  }

  private generateTileSprites() {
    this.createSprite('tile-grass', (g) => {
      g.fillStyle(0x00a651); g.fillRect(0, 0, 16, 4);
      g.fillStyle(0x8b4513); g.fillRect(0, 4, 16, 12);
    });
    this.createSprite('tile-desert', (g) => {
      g.fillStyle(0xf4a460); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xd2691e); g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1);
    });
    this.createSprite('tile-snow', (g) => {
      g.fillStyle(0xffffff); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xe0e0e0); g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1);
      g.fillStyle(0xcccccc); g.fillRect(0, 4, 16, 1);
    });
    this.createSprite('tile-lava', (g) => {
      g.fillStyle(0x333333); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x444444); g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1);
    });
    this.createSprite('tile-castle', (g) => {
      g.fillStyle(0x555555); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x666666); g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
      g.fillStyle(0x777777); g.fillRect(2, 2, 5, 5); g.fillRect(9, 2, 5, 5); g.fillRect(2, 9, 5, 5); g.fillRect(9, 9, 5, 5);
    });
  }

  private generateUISprites() {
    // Corazón (vidas)
    this.createSprite('heart', (g) => {
      g.fillStyle(0xe52521);
      g.fillRect(2, 2, 4, 4); g.fillRect(10, 2, 4, 4);
      g.fillRect(0, 4, 16, 4);
      g.fillRect(2, 8, 12, 4);
      g.fillRect(4, 12, 8, 2);
      g.fillRect(6, 14, 4, 2);
    });
    // Icono de moneda
    this.createSprite('coin-icon', (g) => {
      g.fillStyle(0xfbd000); g.fillRect(2, 0, 12, 16);
      g.fillStyle(0xffd700); g.fillRect(4, 2, 8, 12);
    });
    // Icono de Mario
    this.createSprite('mario-icon', (g) => {
      g.fillStyle(0xe52521); g.fillRect(4, 4, 8, 8);
      g.fillStyle(0xfbd000); g.fillRect(4, 0, 8, 4);
      g.fillStyle(0x000000); g.fillRect(6, 1, 2, 2); g.fillRect(10, 1, 2, 2);
      g.fillStyle(0x049cd8); g.fillRect(4, 12, 8, 4);
      g.fillStyle(0x8b4513); g.fillRect(4, 16, 4, 4); g.fillRect(10, 16, 4, 4);
    });
    // Flecha para UI
    this.createSprite('arrow', (g) => {
      g.fillStyle(0xffffff);
      g.fillRect(4, 0, 8, 4); g.fillRect(2, 4, 12, 4); g.fillRect(0, 8, 16, 4);
    });
    // Partículas de polvo
    this.createSprite('dust', (g) => {
      g.fillStyle(0xcccccc);
      g.fillRect(0, 0, 4, 4);
    });
  }
}
