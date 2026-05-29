// ============================================================
// Tipos globales del juego Super Mario React
// ============================================================

export type WorldId = 1 | 2 | 3 | 4 | 5;
export type WorldName = 'Pradera' | 'Desierto' | 'Nieve' | 'Lava' | 'Castillo';

export interface WorldConfig {
  id: WorldId;
  name: WorldName;
  phases: number;
  color: string;
  bgColor: string;
  groundColor: number;
  skyColor: number;
  musicKey: string;
  enemyTypes: EnemyType[];
  bossType: EnemyType;
  difficulty: number;
  parallaxLayers: number;
}

export type EnemyType = 'goomba' | 'koopa' | 'piranha' | 'bullet' | 'lakitu' | 'boo' | 'hammer' | 'boss';

export type PowerUpType = 'mushroom' | 'flower' | 'star' | 'feather';

export type BlockType = 'brick' | 'question' | 'hard' | 'pipe' | 'ground' | 'platform';

export type ItemType = 'coin' | 'powerup' | 'flag' | 'checkpoint';

export type PlayerState = 'idle' | 'running' | 'jumping' | 'falling' | 'dead' | 'win';

export type PowerState = 'small' | 'big' | 'fire' | 'star';

export interface PlayerData {
  x: number;
  y: number;
  state: PlayerState;
  powerState: PowerState;
  lives: number;
  score: number;
  coins: number;
  invincible: boolean;
  invincibleTimer: number;
  speed: number;
  maxSpeed: number;
  jumpForce: number;
  isOnGround: boolean;
  facingRight: boolean;
}

export interface EnemyData {
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number;
  alive: boolean;
  health: number;
  maxHealth: number;
  patrolRange: [number, number];
}

export interface CoinData {
  x: number;
  y: number;
  collected: boolean;
}

export interface BlockData {
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  broken: boolean;
  hit: boolean;
  contains?: ItemType;
}

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  moving?: boolean;
  moveRange?: [number, number];
  moveSpeed?: number;
  moveAxis?: 'x' | 'y';
}

export interface CheckpointData {
  x: number;
  y: number;
  activated: boolean;
  flagRaised: boolean;
}

export interface PhaseData {
  id: number;
  worldId: WorldId;
  name: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  flagPosition: { x: number; y: number };
  platforms: PlatformData[];
  blocks: BlockData[];
  enemies: EnemyData[];
  coins: CoinData[];
  checkpoints: CheckpointData[];
  pipes: PipeData[];
  decorations: DecorationData[];
  boss?: EnemyData;
}

export interface PipeData {
  x: number;
  y: number;
  height: number;
  width: number;
  enterable?: boolean;
  destination?: { worldId: WorldId; phaseId: number; x: number; y: number };
}

export interface DecorationData {
  type: 'bush' | 'cloud' | 'hill' | 'tree' | 'cactus' | 'snowman' | 'lava' | 'torch' | 'pillar' | 'statue';
  x: number;
  y: number;
  scale?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameSave {
  currentWorld: WorldId;
  currentPhase: number;
  player: {
    lives: number;
    score: number;
    coins: number;
    powerState: PowerState;
  };
  unlockedWorlds: WorldId[];
  achievements: Achievement[];
  volume: number;
  sfxVolume: number;
  lastSaved: number;
  playTime: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  run: boolean;
  action: boolean;
  pause: boolean;
}

export interface GamepadState {
  connected: boolean;
  index: number;
  buttons: boolean[];
  axes: number[];
}

export interface TouchControl {
  id: string;
  x: number;
  y: number;
  active: boolean;
  action: keyof InputState;
}
