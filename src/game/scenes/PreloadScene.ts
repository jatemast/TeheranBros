import Phaser from 'phaser';

/**
 * Escena de precarga - Muestra pantalla de carga y transiciona al menú
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Título
    const title = this.add.text(width / 2, height / 2 - 60, 'TEHERAN\n  BROS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#FBD000',
      align: 'center',
    });
    title.setOrigin(0.5);

    // Texto de carga
    const loadText = this.add.text(width / 2, height / 2 + 40, 'PREPARANDO MUNDOS...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
    });
    loadText.setOrigin(0.5);

    // Animación de puntos suspensivos
    let dots = 0;
    const dotTimer = this.time.addEvent({
      delay: 400,
      callback: () => {
        dots = (dots + 1) % 4;
        loadText.setText('PREPARANDO MUNDOS' + '.'.repeat(dots));
      },
      loop: true,
    });

    // Transición al menú principal
    this.time.delayedCall(1500, () => {
      dotTimer.destroy();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}
