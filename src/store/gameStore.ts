import { create } from 'zustand';
import type { WorldId, PlayerState, PowerState, Achievement, GameSave } from '../types';

interface GameStore {
  // Estado del jugador
  playerState: PlayerState;
  powerState: PowerState;
  lives: number;
  score: number;
  coins: number;
  invincible: boolean;

  // Estado del mundo
  currentWorld: WorldId;
  currentPhase: number;
  unlockedWorlds: WorldId[];
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  playTime: number;

  // Logros
  achievements: Achievement[];

  // Audio
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;

  // Acciones
  setPlayerState: (state: PlayerState) => void;
  setPowerState: (state: PowerState) => void;
  setLives: (lives: number) => void;
  addScore: (points: number) => void;
  addCoins: (count: number) => void;
  setInvincible: (invincible: boolean) => void;
  setCurrentWorld: (world: WorldId) => void;
  setCurrentPhase: (phase: number) => void;
  unlockWorld: (world: WorldId) => void;
  setPaused: (paused: boolean) => void;
  setGameOver: (gameOver: boolean) => void;
  setVictory: (victory: boolean) => void;
  addPlayTime: (seconds: number) => void;
  unlockAchievement: (id: string) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  resetGame: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
  getSaveData: () => GameSave;
}

const SAVE_KEY = 'teheranbros-save';

const defaultAchievements: Achievement[] = [
  { id: 'first_coin', name: '¡Primera Moneda!', description: 'Recolecta tu primera moneda', icon: '🪙', unlocked: false },
  { id: 'coin_master', name: 'Maestro de Monedas', description: 'Recolecta 100 monedas', icon: '💰', unlocked: false },
  { id: 'first_blood', name: 'Primer Enemigo', description: 'Derrota a tu primer enemigo', icon: '💀', unlocked: false },
  { id: 'goomba_slayer', name: 'Cazador de Goombas', description: 'Derrota 10 Goombas', icon: '👾', unlocked: false },
  { id: 'world_1', name: 'Héroe de la Pradera', description: 'Completa el Mundo 1: Pradera', icon: '🌿', unlocked: false },
  { id: 'world_2', name: 'Superviviente del Desierto', description: 'Completa el Mundo 2: Desierto', icon: '🏜️', unlocked: false },
  { id: 'world_3', name: 'Señor de la Nieve', description: 'Completa el Mundo 3: Nieve', icon: '❄️', unlocked: false },
  { id: 'world_4', name: 'Domador de Lava', description: 'Completa el Mundo 4: Lava', icon: '🌋', unlocked: false },
  { id: 'world_5', name: 'Conquistador del Castillo', description: 'Completa el Mundo 5: Castillo', icon: '🏰', unlocked: false },
  { id: 'world_traveler', name: 'Viajero Mundial', description: 'Completa todos los mundos', icon: '🌍', unlocked: false },
  { id: 'speedrunner', name: 'Velocista', description: 'Completa un mundo en menos de 5 minutos', icon: '⚡', unlocked: false },
  { id: 'immortal', name: 'Inmortal', description: 'Completa un mundo sin perder vidas', icon: '🛡️', unlocked: false },
  { id: 'power_up', name: 'Potenciado', description: 'Consigue tu primer power-up', icon: '🍄', unlocked: false },
  { id: 'star_power', name: 'Poder Estelar', description: 'Consigue una estrella', icon: '⭐', unlocked: false },
  { id: 'completionist', name: 'Completista', description: 'Consigue todos los logros', icon: '🏆', unlocked: false },
];

export const useGameStore = create<GameStore>((set, get) => ({
  playerState: 'idle',
  powerState: 'small',
  lives: 3,
  score: 0,
  coins: 0,
  invincible: false,

  currentWorld: 1 as WorldId,
  currentPhase: 1,
  unlockedWorlds: [1],
  isPaused: false,
  isGameOver: false,
  isVictory: false,
  playTime: 0,

  achievements: [...defaultAchievements],

  musicVolume: 0.5,
  sfxVolume: 0.7,
  isMuted: false,

  setPlayerState: (state) => set({ playerState: state }),
  setPowerState: (state) => set({ powerState: state }),
  setLives: (lives) => set({ lives: Math.max(0, lives) }),
  addScore: (points) => set((s) => ({ score: s.score + points })),
  addCoins: (count) => {
    set((s) => ({ coins: s.coins + count }));
    const store = get();
    if (store.coins >= 1) store.unlockAchievement('first_coin');
    if (store.coins >= 100) store.unlockAchievement('coin_master');
  },
  setInvincible: (invincible) => set({ invincible }),

  setCurrentWorld: (world) => set({ currentWorld: world, currentPhase: 1 }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  unlockWorld: (world) =>
    set((s) => ({
      unlockedWorlds: s.unlockedWorlds.includes(world) ? s.unlockedWorlds : [...s.unlockedWorlds, world],
    })),

  setPaused: (paused) => set({ isPaused: paused }),
  setGameOver: (gameOver) => set({ isGameOver: gameOver, playerState: gameOver ? 'dead' : 'idle' }),
  setVictory: (victory) => set({ isVictory: victory, playerState: victory ? 'win' : 'idle' }),
  addPlayTime: (seconds) => set((s) => ({ playTime: s.playTime + seconds })),

  unlockAchievement: (id) =>
    set((s) => ({
      achievements: s.achievements.map((a) =>
        a.id === id && !a.unlocked ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
      ),
    })),

  setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
  setSfxVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
  setMuted: (muted) => set({ isMuted: muted }),

  resetGame: () =>
    set({
      playerState: 'idle',
      powerState: 'small',
      lives: 3,
      score: 0,
      coins: 0,
      invincible: false,
      currentWorld: 1 as WorldId,
      currentPhase: 1,
      unlockedWorlds: [1],
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      playTime: 0,
      achievements: [...defaultAchievements],
    }),

  saveGame: () => {
    const state = get();
    const saveData: GameSave = {
      currentWorld: state.currentWorld,
      currentPhase: state.currentPhase,
      player: {
        lives: state.lives,
        score: state.score,
        coins: state.coins,
        powerState: state.powerState,
      },
      unlockedWorlds: state.unlockedWorlds,
      achievements: state.achievements,
      volume: state.musicVolume,
      sfxVolume: state.sfxVolume,
      lastSaved: Date.now(),
      playTime: state.playTime,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.warn('No se pudo guardar la partida:', e);
    }
  },

  loadGame: () => {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return false;
      const save: GameSave = JSON.parse(data);
      set({
        currentWorld: save.currentWorld,
        currentPhase: save.currentPhase,
        lives: save.player.lives,
        score: save.player.score,
        coins: save.player.coins,
        powerState: save.player.powerState,
        unlockedWorlds: save.unlockedWorlds,
        achievements: save.achievements,
        musicVolume: save.volume,
        sfxVolume: save.sfxVolume,
        playTime: save.playTime,
      });
      return true;
    } catch {
      return false;
    }
  },

  getSaveData: () => {
    const state = get();
    return {
      currentWorld: state.currentWorld,
      currentPhase: state.currentPhase,
      player: {
        lives: state.lives,
        score: state.score,
        coins: state.coins,
        powerState: state.powerState,
      },
      unlockedWorlds: state.unlockedWorlds,
      achievements: state.achievements,
      volume: state.musicVolume,
      sfxVolume: state.sfxVolume,
      lastSaved: Date.now(),
      playTime: state.playTime,
    };
  },
}));
