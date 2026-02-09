/**
 * Aggregated seed data from all versions
 *
 * Each version exports its own array of SeedEntry objects.
 * This file combines them all into a single array for seeding.
 */
import type { SeedEntry } from './types';

import { af01Seeds } from './af-01';
import { gt01Seeds } from './gt-01';
import { fp01Seeds } from './fp-01';
import { fp02Seeds } from './fp-02';
import { fp03Seeds } from './fp-03';
import { ap01Seeds } from './ap-01';
import { ap02Seeds } from './ap-02';
import { cs01Seeds } from './cs-01';
import { fo01Seeds } from './fo-01';
import { fo02Seeds } from './fo-02';
import { fo03Seeds } from './fo-03';
import { fo04Seeds } from './fo-04';
import { fo05Seeds } from './fo-05';
import { fo06Seeds } from './fo-06';
import { fo07Seeds } from './fo-07';
import { fo08Seeds } from './fo-08';
import { fo09Seeds } from './fo-09';
import { fo10Seeds } from './fo-10';

export const allSeeds: SeedEntry[] = [
  ...af01Seeds,
  ...gt01Seeds,
  ...fp01Seeds,
  ...fp02Seeds,
  ...fp03Seeds,
  ...ap01Seeds,
  ...ap02Seeds,
  ...cs01Seeds,
  ...fo01Seeds,
  ...fo02Seeds,
  ...fo03Seeds,
  ...fo04Seeds,
  ...fo05Seeds,
  ...fo06Seeds,
  ...fo07Seeds,
  ...fo08Seeds,
  ...fo09Seeds,
  ...fo10Seeds,
];

export type { SeedEntry };
