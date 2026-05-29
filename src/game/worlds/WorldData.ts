import Phaser from 'phaser';
import type { WorldId, PhaseData } from '../../types';

const TILE = 32;

/**
 * Genera datos procedurales para todos los mundos y fases
 */
export function getPhaseData(worldId: WorldId, phaseId: number): PhaseData {
  const key = `${worldId}-${phaseId}`;
  const generator = phaseGenerators[key];
  if (generator) return generator();
  // Fallback: generar fase procedural simple
  return generateFallbackPhase(worldId, phaseId);
}

const phaseGenerators: Record<string, () => PhaseData> = {
  '1-1': () => generateWorld1Phase1(),
  '1-2': () => generateWorld1Phase2(),
  '1-3': () => generateWorld1Phase3(),
  '2-1': () => generateWorld2Phase1(),
  '2-2': () => generateWorld2Phase2(),
  '2-3': () => generateWorld2Phase3(),
  '3-1': () => generateWorld3Phase1(),
  '3-2': () => generateWorld3Phase2(),
  '3-3': () => generateWorld3Phase3(),
  '4-1': () => generateWorld4Phase1(),
  '4-2': () => generateWorld4Phase2(),
  '4-3': () => generateWorld4Phase3(),
  '5-1': () => generateWorld5Phase1(),
  '5-2': () => generateWorld5Phase2(),
  '5-3': () => generateWorld5Phase3(),
};

function makePhase(id: number, worldId: WorldId, name: string, width: number): PhaseData {
  return {
    id, worldId, name, width: width * TILE, height: 15 * TILE,
    playerStart: { x: 3 * TILE, y: 12 * TILE }, flagPosition: { x: (width - 5) * TILE, y: 4 * TILE },
    platforms: [], blocks: [], enemies: [], coins: [], checkpoints: [], pipes: [], decorations: [],
  };
}

function addGround(phase: PhaseData, width: number, gaps: number[] = []) {
  for (let x = 0; x < width; x++) {
    if (gaps.includes(x)) continue;
    phase.platforms.push({ x: x * TILE, y: 14 * TILE, width: TILE, height: TILE });
    phase.platforms.push({ x: x * TILE, y: 13 * TILE, width: TILE, height: TILE });
  }
}

function addPlatform(phase: PhaseData, x: number, y: number, w: number) {
  phase.platforms.push({ x: x * TILE, y: y * TILE, width: w * TILE, height: TILE });
}

function addQuestion(phase: PhaseData, x: number, y: number, contains: 'coin' | 'powerup' = 'coin') {
  phase.blocks.push({ type: 'question', x: x * TILE, y: y * TILE, width: TILE, height: TILE, broken: false, hit: false, contains });
}

function addBrick(phase: PhaseData, x: number, y: number) {
  phase.blocks.push({ type: 'brick', x: x * TILE, y: y * TILE, width: TILE, height: TILE, broken: false, hit: false });
}

function addCoins(phase: PhaseData, positions: [number, number][]) {
  positions.forEach(([x, y]) => phase.coins.push({ x: x * TILE + 8, y: y * TILE + 8, collected: false }));
}

function addGoomba(phase: PhaseData, x: number, range: [number, number]) {
  phase.enemies.push({ type: 'goomba', x: x * TILE, y: 12 * TILE, width: TILE, height: TILE, speed: 1, direction: -1, alive: true, health: 1, maxHealth: 1, patrolRange: [range[0] * TILE, range[1] * TILE] });
}

function addKoopa(phase: PhaseData, x: number, range: [number, number]) {
  phase.enemies.push({ type: 'koopa', x: x * TILE, y: 12 * TILE, width: TILE, height: TILE, speed: 1.5, direction: -1, alive: true, health: 1, maxHealth: 1, patrolRange: [range[0] * TILE, range[1] * TILE] });
}

function addPiranha(phase: PhaseData, x: number) {
  phase.enemies.push({ type: 'piranha', x: x * TILE, y: 11 * TILE, width: TILE, height: TILE, speed: 0, direction: -1, alive: true, health: 1, maxHealth: 1, patrolRange: [x * TILE, x * TILE] });
}

function addCheckpoint(phase: PhaseData, x: number) {
  phase.checkpoints.push({ x: x * TILE, y: 12 * TILE, activated: false, flagRaised: false });
}

function addPipe(phase: PhaseData, x: number) {
  phase.pipes.push({ x: x * TILE, y: 11 * TILE, height: 3 * TILE, width: 2 * TILE });
}

function addDecor(phase: PhaseData, type: string, positions: [number, number][]) {
  positions.forEach(([x, y]) => phase.decorations.push({ type: type as any, x: x * TILE, y: y * TILE }));
}

// ============================================================
// MUNDO 1: PRADERA
// ============================================================

function generateWorld1Phase1(): PhaseData {
  const p = makePhase(1, 1, 'Fase 1-1', 200);
  addGround(p, 200);
  addPlatform(p, 15, 10, 4); addPlatform(p, 25, 9, 3); addPlatform(p, 35, 8, 5);
  addPlatform(p, 50, 10, 3); addPlatform(p, 65, 7, 4); addPlatform(p, 80, 9, 3);
  addPlatform(p, 95, 6, 4); addPlatform(p, 110, 8, 3); addPlatform(p, 130, 10, 4);
  addPlatform(p, 150, 7, 3); addPlatform(p, 170, 9, 4);
  addQuestion(p, 12, 9); addQuestion(p, 16, 7, 'powerup'); addQuestion(p, 22, 9);
  addQuestion(p, 40, 6); addQuestion(p, 70, 5, 'powerup'); addQuestion(p, 100, 4);
  for (let x = 14; x <= 18; x++) addBrick(p, x, 7);
  for (let x = 38; x <= 42; x++) addBrick(p, x, 6);
  addCoins(p, [[10,11],[11,11],[12,11],[20,10],[21,10],[30,9],[31,9],[32,9],[45,8],[46,8],[55,10],[56,10],[57,10],[75,7],[76,7],[85,9],[86,9],[87,9],[105,6],[106,6],[115,8],[116,8],[117,8],[135,10],[136,10],[155,7],[156,7],[157,7],[175,9],[176,9]]);
  addGoomba(p, 18, [16,22]); addGoomba(p, 28, [26,32]); addGoomba(p, 38, [35,42]);
  addKoopa(p, 48, [45,55]); addGoomba(p, 58, [55,62]); addGoomba(p, 72, [68,78]);
  addKoopa(p, 82, [78,88]); addGoomba(p, 98, [95,105]); addGoomba(p, 112, [108,118]);
  addKoopa(p, 128, [124,134]); addGoomba(p, 142, [138,148]); addGoomba(p, 160, [156,166]);
  addCheckpoint(p, 50); addCheckpoint(p, 100); addCheckpoint(p, 150);
  addPipe(p, 14); addPipe(p, 34); addPipe(p, 64); addPipe(p, 94); addPipe(p, 124);
  addDecor(p, 'cloud', [[10,2],[25,1],[40,3],[55,2],[70,1],[85,3],[100,2],[115,1],[130,3],[145,2],[160,1],[175,3]]);
  addDecor(p, 'bush', [[8,12],[28,12],[48,12],[68,12],[88,12],[108,12],[128,12],[148,12],[168,12]]);
  addDecor(p, 'hill', [[3,11],[33,11],[63,11],[93,11],[123,11],[153,11]]);
  return p;
}

function generateWorld1Phase2(): PhaseData {
  const p = makePhase(2, 1, 'Fase 1-2', 180);
  addGround(p, 180, [20,21,22,50,51,52,80,81,82,110,111,112,140,141,142]);
  addPlatform(p, 18, 10, 6); addPlatform(p, 48, 9, 6); addPlatform(p, 78, 10, 6);
  addPlatform(p, 108, 8, 6); addPlatform(p, 138, 9, 6);
  addQuestion(p, 10, 9); addQuestion(p, 30, 7, 'powerup'); addQuestion(p, 60, 8);
  addQuestion(p, 90, 6); addQuestion(p, 120, 7, 'powerup'); addQuestion(p, 150, 5);
  addCoins(p, [[22,8],[23,8],[24,8],[25,8],[26,8],[52,7],[53,7],[54,7],[55,7],[56,7],[82,8],[83,8],[84,8],[85,8],[86,8]]);
  addGoomba(p, 15, [12,18]); addKoopa(p, 35, [30,42]); addGoomba(p, 55, [52,60]);
  addGoomba(p, 75, [70,78]); addKoopa(p, 95, [90,102]); addGoomba(p, 125, [120,130]);
  addGoomba(p, 155, [150,160]);
  addCheckpoint(p, 45); addCheckpoint(p, 90); addCheckpoint(p, 135);
  addPipe(p, 8); addPipe(p, 40); addPipe(p, 70); addPipe(p, 100); addPipe(p, 130);
  addDecor(p, 'tree', [[3,11],[23,11],[43,11],[63,11],[83,11],[103,11],[123,11],[143,11],[163,11]]);
  return p;
}

function generateWorld1Phase3(): PhaseData {
  const p = makePhase(3, 1, 'Fase 1-3 (Boss)', 120);
  addGround(p, 120);
  addPlatform(p, 50, 10, 20); addPlatform(p, 55, 7, 10); addPlatform(p, 60, 4, 5);
  addQuestion(p, 55, 5, 'powerup'); addQuestion(p, 65, 5);
  addCoins(p, [[52,6],[54,6],[56,6],[58,6],[60,6],[62,6],[64,6],[66,6],[68,6]]);
  addGoomba(p, 20, [15,25]); addKoopa(p, 35, [30,40]);
  p.boss = { type: 'boss', x: 65 * TILE, y: 10 * TILE, width: 2 * TILE, height: 2 * TILE, speed: 2, direction: -1, alive: true, health: 5, maxHealth: 5, patrolRange: [55 * TILE, 75 * TILE] };
  addCheckpoint(p, 45);
  addDecor(p, 'cloud', [[5,2],[30,2],[55,2],[80,2],[105,2]]);
  return p;
}

// ============================================================
// MUNDO 2: DESIERTO
// ============================================================

function generateWorld2Phase1(): PhaseData {
  const p = makePhase(1, 2, 'Fase 2-1', 180);
  addGround(p, 180);
  addPlatform(p, 20, 10, 4); addPlatform(p, 40, 8, 3); addPlatform(p, 60, 9, 5);
  addPlatform(p, 80, 7, 4); addPlatform(p, 100, 8, 3); addPlatform(p, 120, 10, 4);
  addPlatform(p, 140, 6, 3); addPlatform(p, 160, 9, 4);
  addQuestion(p, 15, 8); addQuestion(p, 35, 6, 'powerup'); addQuestion(p, 55, 7);
  addQuestion(p, 85, 5); addQuestion(p, 110, 6, 'powerup'); addQuestion(p, 145, 4);
  addCoins(p, [[22,8],[24,8],[26,8],[28,8],[42,6],[44,6],[46,6],[62,7],[64,7],[66,7],[68,7]]);
  addGoomba(p, 18, [14,22]); addKoopa(p, 38, [34,44]); addGoomba(p, 58, [54,64]);
  addPiranha(p, 78); addGoomba(p, 98, [94,104]); addKoopa(p, 118, [114,124]);
  addGoomba(p, 138, [134,144]); addPiranha(p, 158);
  addCheckpoint(p, 45); addCheckpoint(p, 90); addCheckpoint(p, 135);
  addPipe(p, 10); addPipe(p, 50); addPipe(p, 76); addPipe(p, 110); addPipe(p, 156);
  addDecor(p, 'cactus', [[5,12],[15,12],[30,12],[45,12],[60,12],[75,12],[90,12],[105,12],[120,12],[135,12],[150,12],[165,12]]);
  return p;
}

function generateWorld2Phase2(): PhaseData {
  const p = makePhase(2, 2, 'Fase 2-2', 160);
  addGround(p, 160, [15,16,17,40,41,42,70,71,72,100,101,102,130,131,132]);
  addPlatform(p, 13, 10, 6); addPlatform(p, 38, 8, 6); addPlatform(p, 68, 9, 6);
  addPlatform(p, 98, 7, 6); addPlatform(p, 128, 9, 6);
  addQuestion(p, 20, 8); addQuestion(p, 45, 6, 'powerup'); addQuestion(p, 75, 7);
  addQuestion(p, 105, 5); addQuestion(p, 135, 6, 'powerup');
  addCoins(p, [[15,8],[16,8],[17,8],[40,6],[41,6],[42,6],[70,7],[71,7],[72,7],[100,5],[101,5],[102,5]]);
  addGoomba(p, 22, [18,26]); addKoopa(p, 48, [44,52]); addGoomba(p, 78, [74,82]);
  addPiranha(p, 55); addGoomba(p, 108, [104,112]); addKoopa(p, 138, [134,142]);
  addCheckpoint(p, 50); addCheckpoint(p, 95); addCheckpoint(p, 140);
  addPipe(p, 12); addPipe(p, 55); addPipe(p, 85); addPipe(p, 115);
  addDecor(p, 'cactus', [[8,12],[28,12],[58,12],[88,12],[118,12],[148,12]]);
  return p;
}

function generateWorld2Phase3(): PhaseData {
  const p = makePhase(3, 2, 'Fase 2-3 (Boss)', 100);
  addGround(p, 100);
  addPlatform(p, 40, 10, 20); addPlatform(p, 45, 7, 10); addPlatform(p, 50, 4, 5);
  addQuestion(p, 48, 5, 'powerup'); addQuestion(p, 58, 5);
  addCoins(p, [[42,6],[44,6],[46,6],[48,6],[50,6],[52,6],[54,6],[56,6],[58,6],[60,6]]);
  addGoomba(p, 15, [10,20]); addKoopa(p, 30, [25,35]);
  p.boss = { type: 'boss', x: 55 * TILE, y: 10 * TILE, width: 2 * TILE, height: 2 * TILE, speed: 2.5, direction: -1, alive: true, health: 7, maxHealth: 7, patrolRange: [45 * TILE, 65 * TILE] };
  addCheckpoint(p, 38);
  return p;
}

// ============================================================
// MUNDO 3: NIEVE
// ============================================================

function generateWorld3Phase1(): PhaseData {
  const p = makePhase(1, 3, 'Fase 3-1', 180);
  addGround(p, 180);
  addPlatform(p, 18, 10, 4); addPlatform(p, 30, 8, 3); addPlatform(p, 45, 9, 5);
  addPlatform(p, 60, 7, 4); addPlatform(p, 78, 8, 3); addPlatform(p, 95, 6, 4);
  addPlatform(p, 110, 9, 3); addPlatform(p, 130, 7, 4); addPlatform(p, 150, 8, 3);
  addQuestion(p, 14, 8); addQuestion(p, 28, 6, 'powerup'); addQuestion(p, 50, 7);
  addQuestion(p, 80, 5); addQuestion(p, 105, 6, 'powerup'); addQuestion(p, 140, 4);
  addCoins(p, [[20,8],[21,8],[22,8],[32,6],[33,6],[34,6],[48,7],[49,7],[50,7],[62,5],[63,5],[64,5],[80,6],[81,6],[82,6]]);
  addGoomba(p, 20, [16,24]); addKoopa(p, 38, [34,44]); addGoomba(p, 55, [50,60]);
  addKoopa(p, 75, [70,82]); addGoomba(p, 98, [94,104]); addKoopa(p, 125, [120,132]);
  addGoomba(p, 148, [144,154]); addGoomba(p, 165, [160,170]);
  addCheckpoint(p, 50); addCheckpoint(p, 100); addCheckpoint(p, 150);
  addPipe(p, 12); addPipe(p, 42); addPipe(p, 72); addPipe(p, 102); addPipe(p, 132);
  addDecor(p, 'snowman', [[8,12],[28,12],[58,12],[88,12],[118,12],[148,12],[168,12]]);
  addDecor(p, 'tree', [[5,11],[35,11],[65,11],[95,11],[125,11],[155,11]]);
  return p;
}

function generateWorld3Phase2(): PhaseData {
  const p = makePhase(2, 3, 'Fase 3-2', 160);
  addGround(p, 160, [18,19,20,48,49,50,78,79,80,108,109,110,138,139,140]);
  addPlatform(p, 16, 10, 6); addPlatform(p, 46, 8, 6); addPlatform(p, 76, 9, 6);
  addPlatform(p, 106, 7, 6); addPlatform(p, 136, 9, 6);
  addQuestion(p, 12, 8); addQuestion(p, 35, 6, 'powerup'); addQuestion(p, 65, 7);
  addQuestion(p, 95, 5); addQuestion(p, 125, 6, 'powerup');
  addCoins(p, [[18,8],[19,8],[20,8],[48,6],[49,6],[50,6],[78,7],[79,7],[80,7],[108,5],[109,5],[110,5]]);
  addGoomba(p, 25, [20,30]); addKoopa(p, 55, [50,62]); addGoomba(p, 85, [80,92]);
  addKoopa(p, 115, [110,122]); addGoomba(p, 145, [140,152]);
  addCheckpoint(p, 50); addCheckpoint(p, 100); addCheckpoint(p, 145);
  addPipe(p, 10); addPipe(p, 40); addPipe(p, 70); addPipe(p, 100); addPipe(p, 130);
  addDecor(p, 'snowman', [[5,12],[35,12],[65,12],[95,12],[125,12],[155,12]]);
  return p;
}

function generateWorld3Phase3(): PhaseData {
  const p = makePhase(3, 3, 'Fase 3-3 (Boss)', 100);
  addGround(p, 100);
  addPlatform(p, 40, 10, 20); addPlatform(p, 45, 7, 10); addPlatform(p, 50, 4, 5);
  addQuestion(p, 48, 5, 'powerup'); addQuestion(p, 58, 5);
  addCoins(p, [[42,6],[44,6],[46,6],[48,6],[50,6],[52,6],[54,6],[56,6],[58,6],[60,6]]);
  addGoomba(p, 18, [12,22]); addKoopa(p, 32, [26,36]);
  p.boss = { type: 'boss', x: 55 * TILE, y: 10 * TILE, width: 2 * TILE, height: 2 * TILE, speed: 2, direction: -1, alive: true, health: 8, maxHealth: 8, patrolRange: [45 * TILE, 65 * TILE] };
  addCheckpoint(p, 38);
  return p;
}

// ============================================================
// MUNDO 4: LAVA
// ============================================================

function generateWorld4Phase1(): PhaseData {
  const p = makePhase(1, 4, 'Fase 4-1', 160);
  addGround(p, 160);
  addPlatform(p, 15, 10, 4); addPlatform(p, 28, 8, 3); addPlatform(p, 42, 9, 5);
  addPlatform(p, 58, 7, 4); addPlatform(p, 75, 8, 3); addPlatform(p, 90, 6, 4);
  addPlatform(p, 108, 9, 3); addPlatform(p, 125, 7, 4); addPlatform(p, 142, 8, 3);
  addQuestion(p, 12, 8); addQuestion(p, 25, 6, 'powerup'); addQuestion(p, 48, 7);
  addQuestion(p, 78, 5); addQuestion(p, 102, 6, 'powerup'); addQuestion(p, 135, 4);
  addCoins(p, [[17,8],[18,8],[19,8],[30,6],[31,6],[32,6],[45,7],[46,7],[47,7],[60,5],[61,5],[62,5],[78,6],[79,6],[80,6]]);
  addGoomba(p, 18, [14,22]); addKoopa(p, 35, [30,42]); addGoomba(p, 52, [48,58]);
  addPiranha(p, 70); addGoomba(p, 88, [84,94]); addKoopa(p, 105, [100,112]);
  addGoomba(p, 128, [124,134]); addPiranha(p, 148);
  addCheckpoint(p, 45); addCheckpoint(p, 90); addCheckpoint(p, 135);
  addPipe(p, 10); addPipe(p, 40); addPipe(p, 68); addPipe(p, 98); addPipe(p, 128);
  addDecor(p, 'torch', [[5,12],[25,12],[55,12],[85,12],[115,12],[145,12]]);
  return p;
}

function generateWorld4Phase2(): PhaseData {
  const p = makePhase(2, 4, 'Fase 4-2', 140);
  addGround(p, 140, [15,16,17,40,41,42,70,71,72,100,101,102]);
  addPlatform(p, 13, 10, 6); addPlatform(p, 38, 8, 6); addPlatform(p, 68, 9, 6);
  addPlatform(p, 98, 7, 6); addPlatform(p, 125, 9, 4);
  addQuestion(p, 18, 8); addQuestion(p, 42, 6, 'powerup'); addQuestion(p, 72, 7);
  addQuestion(p, 102, 5); addQuestion(p, 128, 6, 'powerup');
  addCoins(p, [[15,8],[16,8],[17,8],[40,6],[41,6],[42,6],[70,7],[71,7],[72,7],[100,5],[101,5],[102,5]]);
  addGoomba(p, 22, [18,26]); addKoopa(p, 48, [44,54]); addGoomba(p, 78, [74,84]);
  addKoopa(p, 108, [104,114]); addGoomba(p, 132, [128,138]);
  addCheckpoint(p, 45); addCheckpoint(p, 90); addCheckpoint(p, 130);
  addPipe(p, 8); addPipe(p, 35); addPipe(p, 65); addPipe(p, 95);
  addDecor(p, 'torch', [[3,12],[33,12],[63,12],[93,12],[123,12]]);
  return p;
}

function generateWorld4Phase3(): PhaseData {
  const p = makePhase(3, 4, 'Fase 4-3 (Boss)', 100);
  addGround(p, 100);
  addPlatform(p, 35, 10, 25); addPlatform(p, 40, 7, 15); addPlatform(p, 45, 4, 8);
  addQuestion(p, 42, 5, 'powerup'); addQuestion(p, 55, 5);
  addCoins(p, [[38,6],[40,6],[42,6],[44,6],[46,6],[48,6],[50,6],[52,6],[54,6],[56,6]]);
  addGoomba(p, 15, [10,20]); addKoopa(p, 28, [22,32]);
  p.boss = { type: 'boss', x: 55 * TILE, y: 10 * TILE, width: 2 * TILE, height: 2 * TILE, speed: 3, direction: -1, alive: true, health: 10, maxHealth: 10, patrolRange: [40 * TILE, 65 * TILE] };
  addCheckpoint(p, 33);
  addDecor(p, 'torch', [[5,12],[25,12],[75,12],[95,12]]);
  return p;
}

// ============================================================
// MUNDO 5: CASTILLO
// ============================================================

function generateWorld5Phase1(): PhaseData {
  const p = makePhase(1, 5, 'Fase 5-1', 160);
  addGround(p, 160);
  addPlatform(p, 12, 10, 4); addPlatform(p, 25, 8, 3); addPlatform(p, 40, 9, 5);
  addPlatform(p, 55, 7, 4); addPlatform(p, 72, 8, 3); addPlatform(p, 88, 6, 4);
  addPlatform(p, 105, 9, 3); addPlatform(p, 120, 7, 4); addPlatform(p, 140, 8, 3);
  addQuestion(p, 10, 8); addQuestion(p, 22, 6, 'powerup'); addQuestion(p, 45, 7);
  addQuestion(p, 75, 5); addQuestion(p, 100, 6, 'powerup'); addQuestion(p, 130, 4);
  addCoins(p, [[14,8],[15,8],[16,8],[27,6],[28,6],[29,6],[42,7],[43,7],[44,7],[57,5],[58,5],[59,5],[74,6],[75,6],[76,6]]);
  addGoomba(p, 16, [12,20]); addKoopa(p, 32, [28,38]); addGoomba(p, 50, [46,56]);
  addKoopa(p, 68, [64,74]); addGoomba(p, 85, [80,90]); addKoopa(p, 102, [98,108]);
  addGoomba(p, 125, [120,130]); addKoopa(p, 145, [140,152]);
  addCheckpoint(p, 40); addCheckpoint(p, 85); addCheckpoint(p, 130);
  addPipe(p, 8); addPipe(p, 35); addPipe(p, 65); addPipe(p, 95); addPipe(p, 125);
  addDecor(p, 'pillar', [[5,12],[25,12],[55,12],[85,12],[115,12],[145,12]]);
  addDecor(p, 'statue', [[15,11],[45,11],[75,11],[105,11],[135,11]]);
  return p;
}

function generateWorld5Phase2(): PhaseData {
  const p = makePhase(2, 5, 'Fase 5-2', 140);
  addGround(p, 140, [12,13,14,38,39,40,65,66,67,92,93,94]);
  addPlatform(p, 10, 10, 6); addPlatform(p, 36, 8, 6); addPlatform(p, 63, 9, 6);
  addPlatform(p, 90, 7, 6); addPlatform(p, 120, 9, 4);
  addQuestion(p, 15, 8); addQuestion(p, 40, 6, 'powerup'); addQuestion(p, 68, 7);
  addQuestion(p, 95, 5); addQuestion(p, 125, 6, 'powerup');
  addCoins(p, [[12,8],[13,8],[14,8],[38,6],[39,6],[40,6],[65,7],[66,7],[67,7],[92,5],[93,5],[94,5]]);
  addGoomba(p, 20, [16,24]); addKoopa(p, 45, [40,52]); addGoomba(p, 72, [68,78]);
  addKoopa(p, 100, [96,108]); addGoomba(p, 130, [126,136]);
  addCheckpoint(p, 40); addCheckpoint(p, 85); addCheckpoint(p, 125);
  addPipe(p, 6); addPipe(p, 32); addPipe(p, 60); addPipe(p, 88);
  addDecor(p, 'pillar', [[3,12],[28,12],[55,12],[82,12],[110,12],[135,12]]);
  return p;
}

function generateWorld5Phase3(): PhaseData {
  const p = makePhase(3, 5, 'Fase 5-3 (Boss Final)', 120);
  addGround(p, 120);
  addPlatform(p, 40, 10, 30); addPlatform(p, 45, 7, 20); addPlatform(p, 50, 4, 12);
  addQuestion(p, 48, 5, 'powerup'); addQuestion(p, 60, 5, 'powerup'); addQuestion(p, 72, 5);
  addCoins(p, [[42,6],[44,6],[46,6],[48,6],[50,6],[52,6],[54,6],[56,6],[58,6],[60,6],[62,6],[64,6],[66,6],[68,6],[70,6],[72,6]]);
  addGoomba(p, 18, [12,22]); addKoopa(p, 32, [26,36]);
  p.boss = { type: 'boss', x: 60 * TILE, y: 10 * TILE, width: 3 * TILE, height: 3 * TILE, speed: 3, direction: -1, alive: true, health: 15, maxHealth: 15, patrolRange: [45 * TILE, 75 * TILE] };
  addCheckpoint(p, 38);
  addDecor(p, 'pillar', [[5,12],[25,12],[95,12],[115,12]]);
  addDecor(p, 'statue', [[15,11],[105,11]]);
  return p;
}

function generateFallbackPhase(worldId: WorldId, phaseId: number): PhaseData {
  const p = makePhase(phaseId, worldId, `Fase ${worldId}-${phaseId}`, 100);
  addGround(p, 100);
  addPlatform(p, 20, 10, 5); addPlatform(p, 40, 8, 3);
  addPlatform(p, 60, 9, 4); addPlatform(p, 80, 7, 3);
  addQuestion(p, 25, 8); addQuestion(p, 50, 6, 'powerup');
  addCoins(p, [[22,8],[23,8],[24,8],[52,6],[53,6],[54,6]]);
  addGoomba(p, 30, [26,34]); addKoopa(p, 55, [50,62]);
  addCheckpoint(p, 40); addCheckpoint(p, 80);
  addPipe(p, 15); addPipe(p, 45); addPipe(p, 75);
  return p;
}