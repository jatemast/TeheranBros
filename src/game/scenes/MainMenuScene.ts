import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { useGameStore } from '../../store/gameStore';

/**
 * Escena del menú principal
 */
export class MainMenuScene extends Phaser.Scene {
  private audio!: AudioManager;
  private selectedOption = 0;
  private menuOptions: { text: string; action: () => void }[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private marioSprite!: Phaser.GameObjects.Sprite;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this.audio = AudioManager.getInstance();
    this.selectedOption = 0;
    this.menuTexts = [];
    this.menuOptions = [];

    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);

    // Fondo con gradiente
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Estrellas decorativas
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: Phaser.Math.FloatBetween(0.1, 0.5) },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Título del juego
    const titleShadow = this.add.text(width / 2 + 3, 83, 'TEHERAN\n  BROS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#000000',
      align: 'center',
    });
    titleShadow.setOrigin(0.5);

    const title = this.add.text(width / 2, 80, 'TEHERAN\n  BROS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#FBD000',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Animación del título
    this.tweens.add({
      targets: [title, titleShadow],
      y: { from: -100, to: 80 },
      duration: 800,
      ease: 'Bounce.easeOut',
    });

    // Sprite de Mario decorativo
    this.marioSprite = this.add.sprite(width / 2, height / 2 - 30, 'player-big-idle');
    this.marioSprite.setScale(3);
    this.tweens.add({
      targets: this.marioSprite,
      y: height / 2 - 20,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Opciones del menú
    const store = useGameStore.getState();
    const hasSave = store.loadGame();

    this.menuOptions = [
      {
        text: hasSave ? 'CONTINUAR' : 'NUEVO JUEGO',
        action: () => {
          if (!hasSave) store.resetGame();
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('WorldSelectScene');
          });
        },
      },
      {
        text: 'SELECCIONAR MUNDO',
        action: () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('WorldSelectScene');
          });
        },
      },
      {
        text: 'CONTROLES',
        action: () => this.showControls(),
      },
      {
        text: 'CRÉDITOS',
        action: () => this.showCredits(),
      },
    ];

    this.menuOptions.forEach((option, index) => {
      const y = height - 180 + index * 35;
      const text = this.add.text(width / 2, y, option.text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: index === 0 ? '#FBD000' : '#ffffff',
      });
      text.setOrigin(0.5);
      this.menuTexts.push(text);
    });

    this.updateMenuSelection();

    // Input de teclado
    this.input.keyboard!.on('keydown-UP', () => {
      this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
      this.updateMenuSelection();
      this.audio.playCoin();
    });

    this.input.keyboard!.on('keydown-DOWN', () => {
      this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
      this.updateMenuSelection();
      this.audio.playCoin();
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.audio.playPowerUp();
      this.menuOptions[this.selectedOption].action();
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.audio.playPowerUp();
      this.menuOptions[this.selectedOption].action();
    });

    // Click en opciones
    this.menuTexts.forEach((text, index) => {
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => {
        this.selectedOption = index;
        this.updateMenuSelection();
      });
      text.on('pointerdown', () => {
        this.audio.playPowerUp();
        this.menuOptions[index].action();
      });
    });

    // Música del menú
    this.audio.playMusic('menu');

    // Versión
    this.add.text(width - 5, height - 10, 'v1.0.0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#666666',
    }).setOrigin(1, 1);
  }

  private updateMenuSelection() {
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

  private showControls() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    const controls = [
      '← → : MOVERSE',
      '↑ / ESPACIO : SALTAR',
      '↓ : AGACHARSE',
      'SHIFT : CORRER',
      'ENTER : ACCIÓN',
      'P / ESC : PAUSA',
      '',
      'TÁCTIL:',
      'BOTONES EN PANTALLA',
      '',
      'GAMEPAD:',
      'COMPATIBLE CON MANDOS',
    ];

    const text = this.add.text(width / 2, height / 2 - 100, controls.join('\n'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
    });
    text.setOrigin(0.5);

    const backText = this.add.text(width / 2, height - 50, 'VOLVER (ESC)', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#FBD000',
    });
    backText.setOrigin(0.5);

    const close = () => {
      overlay.destroy();
      text.destroy();
      backText.destroy();
    };

    overlay.on('pointerdown', close);
    this.input.keyboard!.once('keydown-ESC', close);
  }

  private showCredits() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();

    const credits = [
      'SUPER MARIO REACT',
      '',
      'Desarrollado con:',
      'React + TypeScript + Vite',
      'Phaser.js + Zustand',
      'TailwindCSS',
      '',
      'Assets generados',
      'proceduralmente',
      '',
      '© 2026 - Proyecto Demo',
    ];

    const text = this.add.text(width / 2, height / 2 - 80, credits.join('\n'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6,
    });
    text.setOrigin(0.5);

    const backText = this.add.text(width / 2, height - 50, 'VOLVER (ESC)', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#FBD000',
    });
    backText.setOrigin(0.5);

    const close = () => {
      overlay.destroy();
      text.destroy();
      backText.destroy();
    };

    overlay.on('pointerdown', close);
    this.input.keyboard!.once('keydown-ESC', close);
  }
}
