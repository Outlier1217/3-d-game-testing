import { Vector3 } from '@babylonjs/core'

export interface PlatformDef {
  position: { x: number; y: number; z: number }
  size: { x: number; y: number; z: number }
  type: 'ground' | 'platform' | 'moving' | 'danger'
  move?: {
    axis: 'x' | 'y' | 'z'
    amplitude: number
    speed: number
  }
}

export interface EnemyDef {
  position: { x: number; y: number; z: number }
  patrolRange: number
  patrolAxis: 'x' | 'z'
  speed: number
}

export interface LevelData {
  playerStart: Vector3
  platforms: PlatformDef[]
  coins: Vector3[]
  enemies: EnemyDef[]
  goalPos: Vector3
}

// ─── LEVEL 1: The Neon Plains ───────────────────────────────────────────────
const level1: LevelData = {
  playerStart: new Vector3(0, 2, 0),

  platforms: [
    // Starting ground
    { position: { x: 0, y: 0, z: 0 },    size: { x: 10, y: 1, z: 10 }, type: 'ground' },
    // Step up
    { position: { x: 12, y: 1, z: 0 },   size: { x: 6, y: 1, z: 6 },  type: 'platform' },
    { position: { x: 20, y: 2, z: 0 },   size: { x: 5, y: 1, z: 5 },  type: 'platform' },
    // Gap then moving platform
    { position: { x: 30, y: 2, z: 0 },   size: { x: 4, y: 0.8, z: 4 }, type: 'moving',
      move: { axis: 'x', amplitude: 4, speed: 1.2 } },
    // Island
    { position: { x: 42, y: 3, z: 0 },   size: { x: 8, y: 1, z: 8 },  type: 'platform' },
    // Narrow path
    { position: { x: 54, y: 3, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'platform' },
    { position: { x: 60, y: 4, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'platform' },
    { position: { x: 66, y: 5, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'platform' },
    // Goal platform
    { position: { x: 74, y: 5, z: 0 },   size: { x: 8, y: 1, z: 8 },  type: 'ground' },
  ],

  coins: [
    new Vector3(0, 2.5, 2),
    new Vector3(0, 2.5, -2),
    new Vector3(12, 3.5, 0),
    new Vector3(20, 4.5, 0),
    new Vector3(30, 4.5, 0),
    new Vector3(42, 5.5, 2),
    new Vector3(42, 5.5, -2),
    new Vector3(42, 5.5, 0),
    new Vector3(54, 5.5, 0),
    new Vector3(60, 6.5, 0),
    new Vector3(66, 7.5, 0),
  ],

  enemies: [
    { position: { x: 12, y: 2.5, z: 0 }, patrolRange: 2, patrolAxis: 'x', speed: 1.5 },
    { position: { x: 42, y: 4.5, z: 0 }, patrolRange: 3, patrolAxis: 'x', speed: 1.8 },
    { position: { x: 42, y: 4.5, z: 3 }, patrolRange: 2, patrolAxis: 'z', speed: 1.5 },
  ],

  goalPos: new Vector3(74, 6, 0),
}

// ─── LEVEL 2: The Void Circuit ───────────────────────────────────────────────
const level2: LevelData = {
  playerStart: new Vector3(0, 2, 0),

  platforms: [
    { position: { x: 0, y: 0, z: 0 },    size: { x: 8, y: 1, z: 8 },  type: 'ground' },
    // Zigzag path
    { position: { x: 11, y: 1, z: 4 },   size: { x: 5, y: 0.8, z: 5 }, type: 'platform' },
    { position: { x: 20, y: 2, z: -4 },  size: { x: 5, y: 0.8, z: 5 }, type: 'platform' },
    { position: { x: 29, y: 3, z: 4 },   size: { x: 5, y: 0.8, z: 5 }, type: 'platform' },
    // Moving platforms section
    { position: { x: 38, y: 3, z: 0 },   size: { x: 4, y: 0.8, z: 4 }, type: 'moving',
      move: { axis: 'z', amplitude: 5, speed: 1.5 } },
    { position: { x: 47, y: 4, z: 0 },   size: { x: 4, y: 0.8, z: 4 }, type: 'moving',
      move: { axis: 'z', amplitude: 5, speed: -1.8 } },
    { position: { x: 56, y: 5, z: 0 },   size: { x: 4, y: 0.8, z: 4 }, type: 'moving',
      move: { axis: 'x', amplitude: 3, speed: 2.0 } },
    // Final stretch
    { position: { x: 65, y: 5, z: 4 },   size: { x: 5, y: 1, z: 5 },  type: 'platform' },
    { position: { x: 74, y: 6, z: 0 },   size: { x: 5, y: 1, z: 5 },  type: 'platform' },
    { position: { x: 83, y: 6, z: 0 },   size: { x: 10, y: 1, z: 10 }, type: 'ground' },
  ],

  coins: [
    new Vector3(0, 2.5, 2), new Vector3(0, 2.5, -2),
    new Vector3(11, 3.5, 4), new Vector3(20, 4.5, -4),
    new Vector3(29, 5.5, 4),
    new Vector3(38, 5.5, 0), new Vector3(47, 6.5, 0),
    new Vector3(56, 7.5, 0),
    new Vector3(65, 7.5, 4), new Vector3(74, 8.5, 0),
    new Vector3(83, 8.5, 2), new Vector3(83, 8.5, -2),
  ],

  enemies: [
    { position: { x: 11, y: 2.5, z: 4 },  patrolRange: 2,   patrolAxis: 'x', speed: 2.0 },
    { position: { x: 20, y: 3.5, z: -4 }, patrolRange: 2,   patrolAxis: 'z', speed: 2.0 },
    { position: { x: 65, y: 6.5, z: 4 },  patrolRange: 2,   patrolAxis: 'x', speed: 2.5 },
    { position: { x: 83, y: 7.5, z: 0 },  patrolRange: 3.5, patrolAxis: 'x', speed: 2.2 },
    { position: { x: 83, y: 7.5, z: 3 },  patrolRange: 2,   patrolAxis: 'z', speed: 1.8 },
  ],

  goalPos: new Vector3(83, 7.5, 0),
}

// ─── LEVEL 3: Hyperspace Gauntlet ────────────────────────────────────────────
const level3: LevelData = {
  playerStart: new Vector3(0, 2, 0),

  platforms: [
    { position: { x: 0,  y: 0, z: 0 },   size: { x: 6, y: 1, z: 6 },  type: 'ground' },
    // Small hops
    { position: { x: 9,  y: 1, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'platform' },
    { position: { x: 15, y: 2, z: 3 },   size: { x: 3, y: 0.8, z: 3 }, type: 'platform' },
    { position: { x: 21, y: 3, z: -3 },  size: { x: 3, y: 0.8, z: 3 }, type: 'platform' },
    // Moving gauntlet
    { position: { x: 28, y: 4, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'moving',
      move: { axis: 'x', amplitude: 3.5, speed: 2.5 } },
    { position: { x: 35, y: 5, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'moving',
      move: { axis: 'z', amplitude: 4, speed: -2.8 } },
    { position: { x: 42, y: 6, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'moving',
      move: { axis: 'y', amplitude: 2.5, speed: 2.0 } },
    { position: { x: 49, y: 7, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'moving',
      move: { axis: 'x', amplitude: 3, speed: 3.0 } },
    // Checkpoint
    { position: { x: 58, y: 7, z: 0 },   size: { x: 7, y: 1, z: 7 },  type: 'platform' },
    // Final push
    { position: { x: 68, y: 8, z: 3 },   size: { x: 3, y: 0.8, z: 3 }, type: 'moving',
      move: { axis: 'z', amplitude: 3, speed: 3.2 } },
    { position: { x: 77, y: 9, z: 0 },   size: { x: 3, y: 0.8, z: 3 }, type: 'moving',
      move: { axis: 'x', amplitude: 4, speed: 3.5 } },
    { position: { x: 86, y: 9, z: 0 },   size: { x: 12, y: 1, z: 12 }, type: 'ground' },
  ],

  coins: [
    new Vector3(9,  3.5, 0),  new Vector3(15, 4.5, 3),
    new Vector3(21, 5.5, -3), new Vector3(28, 6.5, 0),
    new Vector3(35, 7.5, 0),  new Vector3(42, 8.5, 0),
    new Vector3(49, 9.5, 0),
    new Vector3(58, 9.5, 2),  new Vector3(58, 9.5, -2), new Vector3(58, 9.5, 0),
    new Vector3(68, 10.5, 3), new Vector3(77, 11.5, 0),
    new Vector3(86, 11.5, 3), new Vector3(86, 11.5, -3), new Vector3(86, 11.5, 0),
  ],

  enemies: [
    { position: { x: 9,  y: 2.5, z: 0 },  patrolRange: 1.2, patrolAxis: 'x', speed: 2.5 },
    { position: { x: 15, y: 3.5, z: 3 },  patrolRange: 1.2, patrolAxis: 'z', speed: 2.8 },
    { position: { x: 58, y: 8.5, z: 0 },  patrolRange: 3,   patrolAxis: 'x', speed: 3.0 },
    { position: { x: 58, y: 8.5, z: 2.5}, patrolRange: 2.5, patrolAxis: 'z', speed: 2.5 },
    { position: { x: 86, y: 10.5, z: 0 }, patrolRange: 4,   patrolAxis: 'x', speed: 3.5 },
    { position: { x: 86, y: 10.5, z: 4 }, patrolRange: 3,   patrolAxis: 'z', speed: 3.0 },
    { position: { x: 86, y: 10.5, z:-4 }, patrolRange: 3,   patrolAxis: 'z', speed: 2.8 },
  ],

  goalPos: new Vector3(86, 11.5, 0),
}

export const LEVELS: LevelData[] = [level1, level2, level3]