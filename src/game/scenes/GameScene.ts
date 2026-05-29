import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { useGameStore } from '../../store/gameStore';
import { getPhaseData } from '../worlds/WorldData';
import type { WorldId, PhaseData, EnemyData, PowerUpType, PowerState } from '../../types';

const TILE = 32;
const GRAVITY = 1200;
const PLAYER_SPEED = 200;
const PLAYER_JUMP = -500;
const PLAYER_MAX_SPEED = 300;

type CollisionObj = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

/**
 * Escena principal del juego - Maneja toda la lógica de gameplay
 */
export class GameScene extends Phaser.Scene {
  private audio!: AudioManager;
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private blocks!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.StaticGroup;
  private checkpoints!: Phaser.Physics.Arcade.StaticGroup;
  private decorations!: Phaser.GameObjects.Group;
  private powerups!: Phaser.Physics.Arcade.Group;
  private fireballs!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyP!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  private worldId!: WorldId;
  private phaseId!: number;
  private phaseData!: PhaseData;
  private isJumping = false;
  private isDead = false;
  private isPaused = false;
  private isInvincible = false;
  private invincibleTimer = 0;
  private powerState: PowerState = 'small';
  private playerHeight = 32;
  private lastCheckpoint: { x: number; y: number } | null = null;
  private scorePopup!: Phaser.GameObjects.Group;
  private cameraFollow = true;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { worldId: WorldId; phaseId: number }) {
    this.worldId = data.worldId || 1;
    this.phaseId = data.phaseId || 1;
    this.isDead = false;
    this.isPaused = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.lastCheckpoint = null;
  }

  create() {
    this.audio = AudioManager.getInstance();
    this.audio.stopMusic();

    const store = useGameStore.getState();
    // star power state maps to small visually but with invincibility
    this.powerState = store.powerState === 'star' ? 'small' : store.powerState;
    this.playerHeight = this.powerState === 'small' ? 32 : 48;

    // Obtener datos de la fase
    this.phaseData = getPhaseData(this.worldId, this.phaseId);

    // Configurar mundo
    this.physics.world.setBounds(0, 0, this.phaseData.width, this.phaseData.height);
    this.cameras.main.setBounds(0, 0, this.phaseData.width, this.phaseData.height);
    this.cameras.main.setBackgroundColor(this.getWorldBgColor());

    // Crear decoraciones de fondo (parallax)
    this.createBackground();

    // Crear plataformas
    this.platforms = this.physics.add.staticGroup();
    this.phaseData.platforms.forEach((plat) => {
      const tile = this.platforms.create(plat.x + plat.width / 2, plat.y + plat.height / 2, 'ground-top') as Phaser.Physics.Arcade.Sprite;
      tile.setDisplaySize(plat.width, plat.height);
      tile.refreshBody();
    });

    // Crear bloques
    this.blocks = this.physics.add.staticGroup();
    this.phaseData.blocks.forEach((block) => {
      const key = block.type === 'question' ? 'question' : block.type === 'brick' ? 'brick' : 'hard';
      const b = this.blocks.create(block.x + TILE / 2, block.y + TILE / 2, key) as Phaser.Physics.Arcade.Sprite;
      b.setData('blockData', block);
      b.setData('hit', false);
      b.refreshBody();
    });

    // Crear monedas
    this.coins = this.physics.add.staticGroup();
    this.phaseData.coins.forEach((coin) => {
      if (!coin.collected) {
        const c = this.coins.create(coin.x, coin.y, 'coin') as Phaser.Physics.Arcade.Sprite;
        c.refreshBody();
      }
    });

    // Crear enemigos
    this.enemies = this.physics.add.group();
    this.phaseData.enemies.forEach((enemy) => {
      if (enemy.alive) {
        this.createEnemy(enemy);
      }
    });

    // Crear boss si existe
    if (this.phaseData.boss && this.phaseData.boss.alive) {
      this.createEnemy(this.phaseData.boss);
    }

    // Crear power-ups group
    this.powerups = this.physics.add.group();
    this.fireballs = this.physics.add.group();

    // Crear checkpoints
    this.checkpoints = this.physics.add.staticGroup();
    this.phaseData.checkpoints.forEach((cp) => {
      const flag = this.checkpoints.create(cp.x + 8, cp.y - 16, 'checkpoint') as Phaser.Physics.Arcade.Sprite;
      flag.setOrigin(0.5, 0);
      flag.refreshBody();
    });

    // Crear decoraciones
    this.decorations = this.add.group();
    this.phaseData.decorations.forEach((dec) => {
      const sprite = this.add.sprite(dec.x, dec.y, dec.type);
      sprite.setAlpha(0.5);
      this.decorations.add(sprite);
    });

    // Crear jugador
    const startX = this.lastCheckpoint ? this.lastCheckpoint.x : this.phaseData.playerStart.x;
    const startY = this.lastCheckpoint ? this.lastCheckpoint.y : this.phaseData.playerStart.y;
    const playerKey = this.powerState === 'small' ? 'player-small-idle' : 'player-big-idle';
    this.player = this.physics.add.sprite(startX, startY, playerKey);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setSize(16, this.playerHeight);
    this.player.setOffset(8, this.powerState === 'small' ? 8 : 0);

    // Puntaje popup
    this.scorePopup = this.add.group();

    // Colisiones - usando cast a any para evitar problemas de tipos de Phaser
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.blocks, this.hitBlock as any, undefined, this);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.blocks);
    this.physics.add.collider(this.powerups, this.platforms);
    this.physics.add.collider(this.fireballs, this.platforms, this.hitFireballWall as any, undefined, this);

    // Overlaps
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy as any, undefined, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp as any, undefined, this);
    this.physics.add.overlap(this.player, this.checkpoints, this.activateCheckpoint as any, undefined, this);
    this.physics.add.overlap(this.fireballs, this.enemies, this.fireballHitEnemy as any, undefined, this);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyP = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Cámara sigue al jugador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);

    // Música del mundo
    const musicMap: Record<number, string> = { 1: 'overworld', 2: 'desert', 3: 'snow', 4: 'lava', 5: 'castle' };
    this.audio.playMusic(musicMap[this.worldId] || 'overworld');

    // Iniciar UI
    this.scene.launch('UIScene', { gameScene: this });

    // Auto-guardado periódico
    this.time.addEvent({
      delay: 30000,
      callback: () => store.saveGame(),
      loop: true,
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead || this.isPaused) return;

    const store = useGameStore.getState();
    const speed = this.keyShift.isDown ? PLAYER_MAX_SPEED : PLAYER_SPEED;

    // Movimiento horizontal
    const left = this.cursors.left.isDown || this.keyA.isDown;
    const right = this.cursors.right.isDown || this.keyD.isDown;

    if (left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
      this.updatePlayerAnim('run');
    } else if (right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      this.updatePlayerAnim('run');
    } else {
      this.player.setVelocityX(0);
      this.updatePlayerAnim('idle');
    }

    // Salto
    const jumpPressed = this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown;
    const onGround = this.player.body?.blocked.down || false;

    if (jumpPressed && onGround && !this.isJumping) {
      this.player.setVelocityY(PLAYER_JUMP);
      this.isJumping = true;
      this.audio.playJump();
    }

    if (!jumpPressed) {
      this.isJumping = false;
    }

    // Variable jump height
    if (jumpPressed && this.player.body!.velocity.y < -100) {
      this.player.setVelocityY(this.player.body!.velocity.y * 1.02);
    }

    // Animación de salto
    if (!onGround) {
      this.updatePlayerAnim('jump');
    }

    // Disparar bolas de fuego
    if (this.powerState === 'fire' && Phaser.Input.Keyboard.JustDown(this.keyShift)) {
      this.shootFireball();
    }

    // Invincibilidad
    if (this.isInvincible) {
      this.invincibleTimer -= delta;
      this.player.setAlpha(Math.sin(this.invincibleTimer * 0.01) > 0 ? 1 : 0.3);
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.player.setAlpha(1);
      }
    }

    // Caer al vacío
    if (this.player.y > this.phaseData.height + 50) {
      this.playerDeath();
    }

    // Pausa
    if (Phaser.Input.Keyboard.JustDown(this.keyP) || Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.togglePause();
    }

    // Actualizar enemigos
    this.enemies.getChildren().forEach((enemy) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      const data = e.getData('enemyData') as EnemyData;
      if (!data || !data.alive) return;

      // Movimiento de patrulla
      if (data.type !== 'piranha') {
        if (e.x <= data.patrolRange[0]) {
          data.direction = 1;
          e.setFlipX(true);
        } else if (e.x >= data.patrolRange[1]) {
          data.direction = -1;
          e.setFlipX(false);
        }
        e.setVelocityX(data.speed * data.direction * 60);
      }

      // Piranha emerge
      if (data.type === 'piranha') {
        const playerDist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
        if (playerDist < 200) {
          e.setVelocityY(-30);
        } else {
          e.setVelocityY(30);
        }
        if (e.y <= data.patrolRange[0]) e.setVelocityY(0);
        if (e.y >= data.patrolRange[0] + 64) e.setVelocityY(0);
      }
    });

    // Actualizar store
    store.addPlayTime(delta / 1000);
  }

  private updatePlayerAnim(state: string) {
    const prefix = this.powerState === 'small' ? 'player-small' : 'player-big';
    let key = `${prefix}-idle`;

    if (state === 'run') {
      const frame = Math.floor(this.time.now / 150) % 2;
      key = `${prefix}-run${frame + 1}`;
    } else if (state === 'jump') {
      key = `${prefix}-jump`;
    }

    if (this.player.texture.key !== key) {
      this.player.setTexture(key);
    }
  }

  private createEnemy(enemyData: EnemyData) {
    const key = enemyData.type === 'boss' ? 'boss' : enemyData.type;
    const enemy = this.physics.add.sprite(enemyData.x, enemyData.y, key);
    enemy.setData('enemyData', { ...enemyData });
    enemy.setSize(enemyData.width, enemyData.height);
    enemy.setBounce(0);
    enemy.setCollideWorldBounds(true);

    if (enemyData.type === 'boss') {
      enemy.setScale(2);
      enemy.setData('health', enemyData.health);
    }

    this.enemies.add(enemy);
  }

  private collectCoin(obj1: CollisionObj, obj2: CollisionObj) {
    const c = (obj2 as Phaser.Physics.Arcade.Sprite);
    if (!c.active) return;
    c.destroy();
    this.audio.playCoin();
    const store = useGameStore.getState();
    store.addCoins(1);
    store.addScore(100);
    this.showScorePopup(c.x, c.y, '100');
  }

  private hitBlock(obj1: CollisionObj, obj2: CollisionObj) {
    const b = obj2 as Phaser.Physics.Arcade.Sprite;
    const data = b.getData('blockData') as any;
    if (!data || data.hit) return;

    // Solo golpear desde abajo
    if (this.player.body!.velocity.y >= 0) return;

    data.hit = true;
    b.setData('hit', true);

    if (data.type === 'question') {
      b.setTexture('hard');
      this.audio.playBlockHit();

      if (data.contains === 'coin') {
        // Spawnear moneda arriba
        const coin = this.add.sprite(b.x, b.y - 32, 'coin');
        this.tweens.add({
          targets: coin,
          y: b.y - 64,
          alpha: 0,
          duration: 500,
          onComplete: () => coin.destroy(),
        });
        const store = useGameStore.getState();
        store.addCoins(1);
        store.addScore(200);
        this.audio.playCoin();
        this.showScorePopup(b.x, b.y - 32, '200');
      } else if (data.contains === 'powerup') {
        this.spawnPowerUp(b.x, b.y - TILE);
      }
    } else if (data.type === 'brick') {
      if (this.powerState !== 'small') {
        // Romper ladrillo
        b.destroy();
        this.audio.playBreakBlock();
        const store = useGameStore.getState();
        store.addScore(50);
        // Partículas
        for (let i = 0; i < 4; i++) {
          const particle = this.add.sprite(b.x, b.y, 'brick-particle');
          this.tweens.add({
            targets: particle,
            x: b.x + Phaser.Math.Between(-30, 30),
            y: b.y + Phaser.Math.Between(-30, 30),
            alpha: 0,
            duration: 400,
            onComplete: () => particle.destroy(),
          });
        }
      } else {
        this.audio.playBlockHit();
        data.hit = false;
        b.setData('hit', false);
      }
    }
  }

  private spawnPowerUp(x: number, y: number) {
    const store = useGameStore.getState();
    let type: PowerUpType = 'mushroom';
    if (store.score > 5000) type = 'flower';
    if (store.score > 10000) type = 'star';

    const key = type === 'mushroom' ? 'mushroom' : type === 'flower' ? 'flower' : 'star';
    const powerup = this.physics.add.sprite(x, y, key);
    powerup.setData('powerType', type);
    powerup.setBounce(0.2);
    powerup.setVelocity(50, -200);
    this.powerups.add(powerup);
  }

  private collectPowerUp(obj1: CollisionObj, obj2: CollisionObj) {
    const powerup = obj2 as Phaser.Physics.Arcade.Sprite;
    const type = powerup.getData('powerType') as PowerUpType;
    powerup.destroy();

    const store = useGameStore.getState();
    this.audio.playPowerUp();
    store.addScore(1000);
    store.unlockAchievement('power_up');

    if (type === 'mushroom') {
      this.powerState = 'big';
      this.playerHeight = 48;
      this.player.setSize(16, 48);
      this.player.setOffset(8, 0);
      this.player.setTexture('player-big-idle');
      store.setPowerState('big');
    } else if (type === 'flower') {
      this.powerState = 'fire';
      this.player.setTexture('player-fire-idle');
      store.setPowerState('fire');
    } else if (type === 'star') {
      this.isInvincible = true;
      this.invincibleTimer = 10000;
      store.unlockAchievement('star_power');
      this.audio.playStar();
    }

    this.showScorePopup(powerup.x, powerup.y, '1000');
  }

  private shootFireball() {
    const fb = this.physics.add.sprite(this.player.x, this.player.y, 'fireball');
    fb.setVelocity(this.player.flipX ? -400 : 400, -100);
    fb.setBounce(1);
    fb.setCollideWorldBounds(true);
    this.fireballs.add(fb);
    this.audio.playFireball();

    // Destruir después de tiempo
    this.time.delayedCall(2000, () => {
      if (fb.active) fb.destroy();
    });
  }

  private hitFireballWall(obj1: CollisionObj, obj2: CollisionObj) {
    // La bola de fuego rebota
  }

  private fireballHitEnemy(obj1: CollisionObj, obj2: CollisionObj) {
    (obj1 as Phaser.Physics.Arcade.Sprite).destroy();
    this.killEnemy(obj2 as Phaser.Physics.Arcade.Sprite);
  }

  private hitEnemy(obj1: CollisionObj, obj2: CollisionObj) {
    if (this.isInvincible) return;

    const e = obj2 as Phaser.Physics.Arcade.Sprite;
    const data = e.getData('enemyData') as EnemyData;

    // Si el jugador está cayendo sobre el enemigo
    if (this.player.body!.velocity.y > 0 && this.player.y < e.y - 10) {
      this.stompEnemy(e);
    } else {
      this.playerHit();
    }
  }

  private stompEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    const data = enemy.getData('enemyData') as EnemyData;
    this.audio.playStomp();
    this.player.setVelocityY(-300); // Rebote

    const store = useGameStore.getState();

    if (data.type === 'goomba') {
      enemy.setTexture('goomba-flat');
      enemy.setVelocity(0, 0);
      enemy.body!.enable = false;
      this.time.delayedCall(500, () => enemy.destroy());
      store.addScore(200);
      this.showScorePopup(enemy.x, enemy.y, '200');
      store.unlockAchievement('first_blood');
    } else if (data.type === 'koopa') {
      // Koopa se esconde en caparazón
      enemy.setTexture('koopa-shell');
      enemy.setVelocity(0, 0);
      data.type = 'koopa-shell' as any;
      store.addScore(200);
      this.showScorePopup(enemy.x, enemy.y, '200');
    } else if (data.type === 'boss') {
      data.health--;
      enemy.setData('enemyData', data);
      store.addScore(500);
      this.showScorePopup(enemy.x, enemy.y, '500');

      if (data.health <= 0) {
        this.defeatBoss();
      } else {
        // Flash de daño
        this.tweens.add({
          targets: enemy,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 3,
        });
      }
    }
  }

  private defeatBoss() {
    this.audio.playWin();
    const store = useGameStore.getState();
    store.addScore(5000);

    // Mostrar victoria de fase
    const text = this.add.text(this.cameras.main.scrollX + 400, 200, '¡BOSS DERROTADO!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#FBD000',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: 150,
      alpha: { from: 1, to: 0 },
      duration: 2000,
    });

    // Ir a siguiente mundo/fase o victoria
    this.time.delayedCall(2000, () => {
      this.completePhase();
    });
  }

  private playerHit() {
    if (this.isInvincible || this.isDead) return;

    this.audio.playHit();

    if (this.powerState === 'big' || this.powerState === 'fire') {
      this.powerState = 'small';
      this.playerHeight = 32;
      this.player.setSize(16, 32);
      this.player.setOffset(8, 8);
      this.player.setTexture('player-small-idle');
      this.isInvincible = true;
      this.invincibleTimer = 2000;
      const store = useGameStore.getState();
      store.setPowerState('small');
    } else {
      this.playerDeath();
    }
  }

  private playerDeath() {
    if (this.isDead) return;
    this.isDead = true;

    this.audio.playDeath();
    this.player.setVelocity(0, -400);
    this.player.body!.enable = false;

    const store = useGameStore.getState();
    store.setLives(store.lives - 1);

    this.time.delayedCall(1500, () => {
      if (store.lives <= 0) {
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene');
      } else {
        // Reiniciar fase
        this.scene.restart({ worldId: this.worldId, phaseId: this.phaseId });
      }
    });
  }

  private activateCheckpoint(obj1: CollisionObj, obj2: CollisionObj) {
    const flag = obj2 as Phaser.Physics.Arcade.Sprite;
    if (flag.getData('activated')) return;

    flag.setData('activated', true);
    flag.setTexture('checkpoint-active');
    this.lastCheckpoint = { x: flag.x, y: flag.y - 32 };
    this.audio.playCheckpoint();

    const store = useGameStore.getState();
    store.saveGame();
    this.showScorePopup(flag.x, flag.y, 'CHECKPOINT!');
  }

  private completePhase() {
    const store = useGameStore.getState();
    this.audio.playFlag();

    // Verificar si hay más fases en este mundo
    const totalPhases = 3;
    if (this.phaseId < totalPhases) {
      // Avanzar a la siguiente fase del mismo mundo
      store.setCurrentPhase(this.phaseId + 1);
      store.saveGame();
      this.scene.restart({ worldId: this.worldId, phaseId: this.phaseId + 1 });
    } else {
      // Mundo completado (fase 3 = jefe final)
      const nextWorld = (this.worldId + 1) as WorldId;

      if (nextWorld <= 5) {
        // Desbloquear el siguiente mundo
        store.unlockWorld(nextWorld);
        store.saveGame();
      }

      // Desbloquear logro por completar mundo
      const worldNames = ['', 'Pradera', 'Desierto', 'Nieve', 'Lava', 'Castillo'];
      store.unlockAchievement(`world_${this.worldId}`);

      // Retornar al selector de mundos
      this.scene.stop('UIScene');
      this.audio.stopMusic();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (nextWorld > 5) {
          // Todos los mundos completados → pantalla de victoria
          this.scene.start('VictoryScene');
        } else {
          this.scene.start('WorldSelectScene');
        }
      });
    }
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    const store = useGameStore.getState();
    store.setPaused(this.isPaused);

    if (this.isPaused) {
      this.physics.pause();
      const { scrollX, scrollY } = this.cameras.main;
      const overlay = this.add.rectangle(scrollX + 400, scrollY + 300, 800, 600, 0x000000, 0.7);
      overlay.setName('pauseOverlay');

      const pauseText = this.add.text(scrollX + 400, scrollY + 250, 'PAUSA', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '32px',
        color: '#FBD000',
      }).setOrigin(0.5).setName('pauseText');

      const resumeText = this.add.text(scrollX + 400, scrollY + 320, 'P / ESC PARA CONTINUAR', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffffff',
      }).setOrigin(0.5).setName('resumeText');

      const menuText = this.add.text(scrollX + 400, scrollY + 360, 'M - MENÚ PRINCIPAL', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaaaa',
      }).setOrigin(0.5).setName('menuText');

      this.input.keyboard!.once('keydown-M', () => {
        this.scene.stop('UIScene');
        this.audio.stopMusic();
        this.scene.start('MainMenuScene');
      });
    } else {
      this.physics.resume();
      this.children.getAll().forEach((child) => {
        if (child.name === 'pauseOverlay' || child.name === 'pauseText' || child.name === 'resumeText' || child.name === 'menuText') {
          child.destroy();
        }
      });
    }
  }

  private killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    const data = enemy.getData('enemyData') as EnemyData;
    if (!data || !data.alive) return;
    data.alive = false;
    enemy.setData('enemyData', data);

    this.audio.playStomp();
    const store = useGameStore.getState();
    store.addScore(200);

    // Efecto de muerte
    this.tweens.add({
      targets: enemy,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => enemy.destroy(),
    });
  }

  private showScorePopup(x: number, y: number, text: string) {
    const popup = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy(),
    });
  }

  private createBackground() {
    const { width } = this.phaseData;
    const bgColor = this.getWorldBgColor();
    this.cameras.main.setBackgroundColor(bgColor);

    // Nubes decorativas
    for (let x = 0; x < width; x += Phaser.Math.Between(200, 400)) {
      const cloud = this.add.sprite(x, Phaser.Math.Between(30, 80), 'cloud');
      cloud.setAlpha(0.6);
      cloud.setScrollFactor(0.2);
    }

    // Montañas/colinas de fondo
    for (let x = 0; x < width; x += Phaser.Math.Between(300, 500)) {
      const hill = this.add.sprite(x, 400, 'hill');
      hill.setAlpha(0.3);
      hill.setScrollFactor(0.3);
      hill.setScale(2);
    }
  }

  private getWorldBgColor(): number {
    const colors: Record<number, number> = {
      1: 0x5c94fc, 2: 0xf4a460, 3: 0xe0f0ff, 4: 0x2a0000, 5: 0x1a1a2e,
    };
    return colors[this.worldId] || 0x5c94fc;
  }
}
