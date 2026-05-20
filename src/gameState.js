import Decimal from "decimal.js";

export const DecimalCtor = Decimal;

DecimalCtor.set({ precision: 64, toExpPos: 1e9, toExpNeg: -9 });

export const SAVE_KEY = "company-clicker-save-v1";
export const TICK_MS = 50;
export const TICKS_PER_SECOND = 20;
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
export const REBIRTH_THRESHOLD = new DecimalCtor(1000000);

/**
 * Converts a value into a Decimal instance for consistent big-number math.
 * @param {Decimal|number|string} value
 * @returns {Decimal}
 */
export function D(value) {
  return new DecimalCtor(value || 0);
}

/**
 * Returns the XP needed to advance from a given level.
 * Formula: 100 * (1.5 ^ level).
 * @param {number} level
 * @returns {Decimal}
 */
export function getXpRequired(level) {
  return D(100).times(D(1.5).pow(level));
}

/**
 * Builds the complete initial state for a fresh Company Clicker run.
 * @returns {object}
 */
export function createInitialState() {
  return {
    coins: D(0),
    totalCoins: D(0),
    runCoins: D(0),
    clickValue: D(1),
    clickCount: 0,
    playerLevel: 1,
    xp: D(0),
    xpRequired: getXpRequired(1),
    rebirths: 0,
    cosmicGems: D(0),
    lastSavedAt: Date.now(),
    generators: {
      support: 0,
      cornerStore: 0,
      factory: 0,
      corporation: 0,
      conglomerate: 0,
      orbitalOffice: 0,
      moonMine: 0,
      quantumBank: 0,
      starMarket: 0,
      galacticExchange: 0,
    },
    purchasedUpgrades: {},
    purchasedRebirthUpgrades: {},
    achievements: {},
    actionLog: ["Welcome to Company Clicker."],
    settings: {
      buyMode: "1",
      activeTab: "generators",
    },
  };
}

/**
 * Serializes Decimal values and plain objects into localStorage-friendly data.
 * @param {unknown} value
 * @returns {unknown}
 */
export function serializeValue(value) {
  if (value instanceof DecimalCtor) return value.toString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeValue(item)]));
  }
  return value;
}

/**
 * Rehydrates a saved object into the current state shape with Decimal values restored.
 * @param {object} saved
 * @returns {object}
 */
export function hydrateState(saved) {
  const state = createInitialState();
  const merged = { ...state, ...saved };
  merged.coins = D(saved?.coins);
  merged.totalCoins = D(saved?.totalCoins);
  merged.runCoins = D(saved?.runCoins);
  merged.clickValue = D(saved?.clickValue || 1);
  merged.xp = D(saved?.xp);
  merged.xpRequired = getXpRequired(merged.playerLevel || 1);
  merged.cosmicGems = D(saved?.cosmicGems);
  merged.generators = { ...state.generators, ...(saved?.generators || {}) };
  merged.purchasedUpgrades = { ...(saved?.purchasedUpgrades || {}) };
  merged.purchasedRebirthUpgrades = { ...(saved?.purchasedRebirthUpgrades || {}) };
  merged.achievements = { ...(saved?.achievements || {}) };
  merged.actionLog = Array.isArray(saved?.actionLog) ? saved.actionLog.slice(0, 30) : state.actionLog;
  merged.settings = { ...state.settings, ...(saved?.settings || {}) };
  merged.lastSavedAt = Number(saved?.lastSavedAt || Date.now());
  return merged;
}

export let state = createInitialState();

export function replaceState(nextState) {
  state = nextState;
}
