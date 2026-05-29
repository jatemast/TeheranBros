import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { useGameStore } from '../../store/gameStore';
import type { WorldId, WorldName } from '../../types';

interface WorldOption {
  id: WorldId;
  name: WorldName;
  color: number;
  bgColor: string;
  icon: string;
  locked: boolean;
}

export class WorldSelectScene extends Phaser.Scene {
  private audio!: AudioManager;
  private worlds: WorldOption[] = [];
  private selectedWorld = 0;
  private worldTexts: Phaser.GameObjects.Text[] = [];
  private previewBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'WorldSelectScene' });
  }

  create() {
    this.audio = AudioManager.getInstance();
    this.selectedWorld = 0;
    this.worldTexts = [];
    this.audio.stopMusic();

    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(300);
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const store = useGameStore.getState();

    this.worlds = [
      { id: 1, name: 'Pradera' as WorldName, color: 0x00a651, bgColor: '#5c94fc', icon: '🌿', locked: false },
      { id: 2, name: 'Desierto' as WorldName, color: 0xf4a460, bgColor: '#f4a460', icon: '🏜️', locked: !store.unlockedWorlds.includes(2 as WorldId) },
      { id: 3, name: 'Nieve' as WorldName, color: 0xffffff, bgColor: '#e0f0ff', icon: '❄️', locked: !store.unlockedWorlds.includes(3 as WorldId) },
      { id: 4, name: 'Lava' as WorldName, color: 0xff4500, bgColor: '#2a0000', icon: '🌋', locked: !store.unlockedWorlds.includes(4 as WorldId) },
      { id: 5, name: 'Castillo' as WorldName, color: 0x808080, bgColor: '#1a1a2e', icon: '🏰', locked: !store.unlockedWorlds.includes(5 as WorldId) },
    ];

    // Preview background
    this.previewBg = this.add.graphics();
    this.updatePreview();

    // Título
    const title = this.add.text(width / 2, 40, 'SELECCIONAR MUNDO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#FBD000',
    });
    title.setOrigin(0.5);

    // Instrucción
    this.add.text(width / 2, height - 30, 'USA ← → PARA NAVEGAR, ENTER PARA SELECCIONAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#888888',
    }).setOrigin(0.5);

    // Crear opciones de mundo
    this.worlds.forEach((world, index) => {
      const x = width / 2 + (index - 2) * 140;
      const y = height / 2;

      // Marco del mundo
      const border = this.add.rectangle(x, y, 120, 160, world.locked ? 0x333333 : world.color, 0.3);
      border.setStrokeStyle(2, index === 0 ? 0xfbd000 : 0x666666);

      // Icono
      const iconText = this.add.text(x, y - 40, world.locked ? '🔒' : world.icon, {
        fontSize: '40px',
      });
      iconText.setOrigin(0.5);

      // Nombre del mundo
      const nameText = this.add.text(x, y + 30, `MUNDO ${world.id}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: world.locked ? '#666666' : '#ffffff',
      });
      nameText.setOrigin(0.5);

      // Nombre
      const worldNameText = this.add.text(x, y + 50, world.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: world.locked ? '#444444' : '#cccccc',
      });
      worldNameText.setOrigin(0.5);

      this.worldTexts.push(nameText);

      if (!world.locked) {
        border.setInteractive({ useHandCursor: true });
        border.on('pointerover', () => {
          this.selectedWorld = index;
          this.updateSelection();
        });
        border.on('pointerdown', () => {
          this.selectWorld(index);
        });
      }
    });

    this.updateSelection();

    // Input
    this.input.keyboard!.on('keydown-LEFT', () => {
      this.navigateWorlds(-1);
    });
    this.input.keyboard!.on('keydown-RIGHT', () => {
      this.navigateWorlds(1);
    });
    this.input.keyboard!.on('keydown-ENTER', () => {
      if (!this.worlds[this.selectedWorld].locked) {
        this.selectWorld(this.selectedWorld);
      }
    });
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (!this.worlds[this.selectedWorld].locked) {
        this.selectWorld(this.selectedWorld);
      }
    });
    this.input.keyboard!.on('keydown-ESC', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  private navigateWorlds(dir: number) {
    let newIndex = this.selectedWorld + dir;
    while (newIndex >= 0 && newIndex < this.worlds.length && this.worlds[newIndex].locked) {
      newIndex += dir;
    }
    if (newIndex >= 0 && newIndex < this.worlds.length) {
      this.selectedWorld = newIndex;
      this.updateSelection();
      this.audio.playCoin();
    }
  }

  private updateSelection() {
    this.updatePreview();
    this.worldTexts.forEach((text, index) => {
      if (index === this.selectedWorld && !this.worlds[index].locked) {
        text.setColor('#FBD000');
      } else {
        text.setColor(this.worlds[index].locked ? '#666666' : '#ffffff');
      }
    });
  }

  private updatePreview() {
    const world = this.worlds[this.selectedWorld];
    const { width } = this.cameras.main;

    this.previewBg.clear();
    this.previewBg.fillStyle(world.color, 0.1);
    this.previewBg.fillRect(width / 2 - 200, 70, 400, 3);
    this.previewBg.fillRect(width / 2 - 200, this.cameras.main.height - 70, 400, 3);
  }

  private selectWorld(index: number) {
    const world = this.worlds[index];
    if (world.locked) return;

    this.audio.playPowerUp();
    const store = useGameStore.getState();
    store.setCurrentWorld(world.id);
    store.setCurrentPhase(1);

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { worldId: world.id, phaseId: 1 });
    });
  }
}
