export const SHEET_URL_REGEX = /^https:\/\/docs.google.com\/spreadsheets\/d\/(.*?)\//;

export const STORAGE_KEYS = {
  SHEET_URL: 'DKB_SHEET_URL',
  CREDENTIALS: 'DKB_CREDENTIALS',
};

export const RAIDS = {
  MOLTEN_CORE: 'MOLTEN_CORE',
  BLACKWING_LAIR: 'BLACKWING_LAIR',
  ZUL_GURUB: 'ZUL_GURUB',
};

export const RAID_NAMES = {
  [RAIDS.MOLTEN_CORE]: 'Molten Core',
  [RAIDS.BLACKWING_LAIR]: 'Blackwing Lair',
  [RAIDS.ZUL_GURUB]: 'Zul Gurub',
};

export const PLAYER_CLASSES = {
  DRUID: 'DRUID',
  HUNTER: 'HUNTER',
  MAGE: 'MAGE',
  PALADIN: 'PALADIN',
  PRIEST: 'PRIEST',
  ROGUE: 'ROGUE',
  SHAMAN: 'SHAMAN',
  WARLOCK: 'WARLOCK',
  WARRIOR: 'WARRIOR',
};

export const PLAYER_CLASS_NAMES = {
  [PLAYER_CLASSES.DRUID]: 'Druide',
  [PLAYER_CLASSES.HUNTER]: 'Jäger',
  [PLAYER_CLASSES.MAGE]: 'Magier',
  [PLAYER_CLASSES.PALADIN]: 'Paladin',
  [PLAYER_CLASSES.PRIEST]: 'Priester',
  [PLAYER_CLASSES.ROGUE]: 'Schurke',
  [PLAYER_CLASSES.SHAMAN]: 'Schamane',
  [PLAYER_CLASSES.WARLOCK]: 'Hexer',
  [PLAYER_CLASSES.WARRIOR]: 'Krieger',
};

export const DKP_LIST_COLUMNS = {
  PLAYER: 1,
  CLASS: 1,
  SPEC: 2,
  [RAIDS.MOLTEN_CORE]: 3,
  [RAIDS.BLACKWING_LAIR]: 4,
  [RAIDS.ZUL_GURUB]: 5,
  RECENT_LOOT: 6,
};
