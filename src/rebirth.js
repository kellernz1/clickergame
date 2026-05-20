import { D, getXpRequired, REBIRTH_THRESHOLD, state } from "./gameState.js";
import { GENERATORS } from "./generators.js";

export const REBIRTH_UPGRADES = [
  {
    id: "critChance",
    name: "+10% critical chance",
    cost: D(5),
    description: "Permanently increases critical chance.",
  },
  {
    id: "keepGenerator",
    name: "Keep 1 generator after Rebirth",
    cost: D(10),
    description: "Keeps 1 unit of your best owned generator.",
  },
  {
    id: "xpBoost",
    name: "+50% XP gained",
    cost: D(8),
    description: "Permanently increases XP gained.",
  },
];

/**
 * Checks whether rebirth is available from current coins.
 * @returns {boolean}
 */
export function canRebirth() {
  return state.coins.gte(REBIRTH_THRESHOLD);
}

/**
 * Calculates Cosmic Gems gained from current run coins.
 * Formula: floor(sqrt(totalCoinsEarnedThisRun / 1,000,000)).
 * @returns {Decimal}
 */
export function calculateRebirthGems() {
  return state.runCoins.div(1000000).sqrt().floor();
}

/**
 * Calculates total critical chance including permanent rebirth upgrades.
 * @returns {number}
 */
export function getCriticalChance() {
  return 0.05 + (state.purchasedRebirthUpgrades.critChance ? 0.1 : 0);
}

/**
 * Calculates XP gain multiplier from rebirth upgrades.
 * @returns {Decimal}
 */
export function getXpMultiplier() {
  return state.purchasedRebirthUpgrades.xpBoost ? D(1.5) : D(1);
}

/**
 * Purchases a permanent rebirth shop upgrade using Cosmic Gems.
 * @param {string} upgradeId
 * @returns {{ok: boolean, upgrade?: object}}
 */
export function buyRebirthUpgrade(upgradeId) {
  const upgrade = REBIRTH_UPGRADES.find((item) => item.id === upgradeId);
  if (!upgrade || state.purchasedRebirthUpgrades[upgradeId] || state.cosmicGems.lt(upgrade.cost)) return { ok: false, upgrade };
  state.cosmicGems = state.cosmicGems.minus(upgrade.cost);
  state.purchasedRebirthUpgrades[upgradeId] = true;
  return { ok: true, upgrade };
}

/**
 * Resets run progress, grants gems, and preserves permanent rebirth state.
 * @returns {{gemsGained: Decimal, keptGeneratorName: string}}
 */
export function performRebirth() {
  const gemsGained = calculateRebirthGems();
  const kept = getKeptGenerator();
  state.coins = D(0);
  state.runCoins = D(0);
  state.clickValue = D(1);
  state.playerLevel = 1;
  state.xp = D(0);
  state.xpRequired = getXpRequired(1);
  state.purchasedUpgrades = {};
  state.rebirths += 1;
  state.cosmicGems = state.cosmicGems.plus(gemsGained);
  state.generators = {
    support: 0,
    cornerStore: 0,
    factory: 0,
    corporation: 0,
    conglomerate: 0,
  };
  if (kept.id) state.generators[kept.id] = 1;
  return { gemsGained, keptGeneratorName: kept.name };
}

function getKeptGenerator() {
  if (!state.purchasedRebirthUpgrades.keepGenerator) return { id: "", name: "" };
  for (const generator of [...GENERATORS].reverse()) {
    if ((state.generators[generator.id] || 0) > 0) return generator;
  }
  return { id: "", name: "" };
}
