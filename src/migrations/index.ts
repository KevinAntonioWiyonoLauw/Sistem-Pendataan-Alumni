import * as migration_20251016_060934 from './20251016_060934';

export const migrations = [
  {
    up: migration_20251016_060934.up,
    down: migration_20251016_060934.down,
    name: '20251016_060934'
  },
];
