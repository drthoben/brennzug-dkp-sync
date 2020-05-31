import { PLAYER_CLASSES, RAIDS } from '../constants';


export interface Evaluation {
  raid: keyof typeof RAIDS;
  date: string,
  participants: Participant[];
  loot: LootEntry[];
}

export interface Participant {
  player: string;
  class?: PlayerClass;
  group?: number;
  dkp?: number;
}

export interface LootEntry {
  itemId: string;
  itemName: string;
  sourceGUID: string;
  sourceName?: string;
  givenTo?: GivenTo;
}

export interface GivenTo {
  player: string;
  dkp: number;
}

export type PlayerClass = keyof typeof PLAYER_CLASSES;
