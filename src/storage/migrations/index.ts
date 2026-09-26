import type { Migration } from '../migrations.js';
import { foundation } from './0001_foundation.js';

/** All migrations in order. Append only; never edit a migration that has shipped. */
export const allMigrations: readonly Migration[] = [foundation];
