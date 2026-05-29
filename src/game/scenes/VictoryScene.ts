import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { useGameStore } from '../../store/gameStore';

/**
 * Escena de Victoria - Se muestra cuando el jugador completa todos los mundos
 */
export class VictoryScene extends Phaser.Scene {
  private audio!: AudioManager;
  private selectedOption = 0;
  private menuTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'VictoryScene' });
  }

  create() {
    this.audio = AudioManager.getInstance();
    this.audio.stopMusic();
    this.audio.playWin();

    this.selectedOption = 0;
    this.menuTexts = [];

    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(1000);
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Fondo de estrellas animadas
    for (let i = 0; i < 80; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: Phaser.Math.FloatBetween(0.1, 0.3) },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Fuegos artificiales (círculos de colores)
    for (let i = 0; i < 15; i++) {
      const colors = [0xe52521, 0x049cd8, 0xfbd000, 0x00a651, 0xff4500, 0xff69b4];
      const firework = this.add.circle(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50),
        Phaser.Math.Between(2, 6),
        Phaser.Math.RND.pick(colors),
        0.8
      );
      this.tweens.add({
        targets: firework,
        scaleX: { from: 0, to: Phaser.Math.FloatBetween(1, 3) },
        scaleY: { from: 0, to: Phaser.Math.FloatBetween(1, 3) },
        alpha: { from: 1, to: 0 },
        duration: Phaser.Math.Between(1000, 2000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        repeatDelay: Phaser.Math.Between(1000, 3000),
      });
    }

    // Título de victoria
    const titleShadow = this.add.text(width / 2 + 3, 103, '¡VICTORIA!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#000000',
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, 100, '¡VICTORIA!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#FBD000',
    }).setOrigin(0.5);

    // Animación del título
    this.tweens.add({
      targets: [title, titleShadow],
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 800,
      ease: 'Back.easeOut',
    });

    // Mensaje de felicitación
    const congratsText = this.add.text(width / 2, 170, '¡HAS COMPLETADO\nTODOS LOS MUNDOS!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Estadísticas
    const store = useGameStore.getState();
    const minutes = Math.floor(store.playTime / 60);
    const seconds = Math.floor(store.playTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const statsText = this.add.text(width / 2, 260, [
      `PUNTUACIÓN FINAL: ${store.score}`,
      `MONEDAS: ${store.coins}`,
      `TIEMPO: ${timeStr}`,
      '',
      'LOGROS:',
      ...store.achievements
        .filter((a) => a.unlocked)
        .map((a) => `${a.icon} ${a.name}`),
    ].join('\n'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 6,
    });
    statsText.setOrigin(0.5);

    // Opciones
    const options = [
      { text: 'JUGAR DE NUEVO', action: () => this.playAgain() },
      { text: 'MENÚ PRINCIPAL', action: () => this.goToMenu() },
    ];

    options.forEach((option, index) => {
      const y = height - 120 + index * 40;
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

    // Desbloquear logro de completista
    const allUnlocked = store.achievements.every((a) => a.unlocked || a.id === 'completionist');
    if (allUnlocked) {
      store.unlockAchievement('completionist');
    }
    store.unlockAchievement('world_traveler');
    store.setVictory(true);
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

  private playAgain() {
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
