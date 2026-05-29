import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { useGameStore } from '../../store/gameStore';

/**
 * Escena de Game Over - Se muestra cuando el jugador pierde todas las vidas
 */
export class GameOverScene extends Phaser.Scene {
  private audio!: AudioManager;
  private selectedOption = 0;
  private menuTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    this.audio = AudioManager.getInstance();
    this.audio.stopMusic();
    this.audio.playGameOver();

    this.selectedOption = 0;
    this.menuTexts = [];

    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);
    this.cameras.main.setBackgroundColor('#000000');

    // Fondo oscuro con efecto
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0x880000,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      this.tweens.add({
        targets: particle,
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Título GAME OVER
    const titleShadow = this.add.text(width / 2 + 3, 153, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '36px',
      color: '#000000',
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, 150, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '36px',
      color: '#e52521',
    }).setOrigin(0.5);

    // Animación del título
    this.tweens.add({
      targets: [title, titleShadow],
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Estadísticas
    const store = useGameStore.getState();
    const statsText = this.add.text(width / 2, height / 2 - 40, [
      `PUNTUACIÓN FINAL: ${store.score}`,
      `MONEDAS: ${store.coins}`,
      `MUNDO: ${store.currentWorld}-${store.currentPhase}`,
    ].join('\n'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 10,
    });
    statsText.setOrigin(0.5);

    // Opciones
    const options = [
      { text: 'REINTENTAR', action: () => this.restartGame() },
      { text: 'MENÚ PRINCIPAL', action: () => this.goToMenu() },
    ];

    options.forEach((option, index) => {
      const y = height - 150 + index * 40;
      const text = this.add.text(width / 2, y, option.text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: index === 0 ? '#FBD000' : '#ffffff',
      });
      text.setOrigin(0.5);
      this.menuTexts.push(text);
    });

    this.updateSelection();

    // Input
    this.input.keyboard!.on('keydown-UP', () => {
      this.selectedOption = (this.selectedOption - 1 + options.length) % options.length;
      this.updateSelection();
      this.audio.playCoin();
    });

    this.input.keyboard!.on('keydown-DOWN', () => {
      this.selectedOption = (this.selectedOption + 1) % options.length;
      this.updateSelection();
      this.audio.playCoin();
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.audio.playPowerUp();
      options[this.selectedOption].action();
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.audio.playPowerUp();
      options[this.selectedOption].action();
    });

    // Click en opciones
    this.menuTexts.forEach((text, index) => {
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        this.selectedOption = index;
        this.updateSelection();
      });
      text.on('pointerdown', () => {
        this.audio.playPowerUp();
        options[index].action();
      });
    });
  }

  private updateSelection() {
    this.menuTexts.forEach((text, index) => {
      if (index === this.selectedOption) {
        text.setColor('#FBD000');
        text.setFontSize(14);
      } else {
        text.setColor('#ffffff');
        text.setFontSize(12);
      }
    });
  }

  private restartGame() {
    const store = useGameStore.getState();
    store.resetGame();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { worldId: 1, phaseId: 1 });
    });
  }

  private goToMenu() {
    const store = useGameStore.getState();
    store.resetGame();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
