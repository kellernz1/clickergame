import { D, getXpRequired, REBIRTH_THRESHOLD, state } from "./gameState.js";
import { GENERATORS } from "./generators.js";

export const REBIRTH_UPGRADES = [
  {
    id: "orbitalPermit",
    name: "Orbital Permit",
    cost: D(2),
    description: "Unlocks Orbital Offices.",
  },
  {
    id: "lunarCharter",
    name: "Lunar Charter",
    cost: D(5),
    description: "Unlocks Moon Mines.",
  },
  {
    id: "quantumLicense",
    name: "Quantum License",
    cost: D(12),
    description: "Unlocks Quantum Banks.",
  },
  {
    id: "stellarPermit",
    name: "Stellar Permit",
    cost: D(30),
    description: "Unlocks Star Markets.",
  },
  {
    id: "galacticRights",
    name: "Galactic Rights",
    cost: D(75),
    description: "Unlocks Galactic Exchanges.",
  },
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
  {
    id: "cosmicMentor",
    name: "Cosmic Mentor",
    cost: D(35),
    description: "Doubles all XP gained.",
  },
  {
    id: "gemEfficiency",
    name: "Gem Efficiency",
    cost: D(15),
    description: "Each Cosmic Gem gives +3% money instead of +2%.",
  },
  {
    id: "cosmicPortfolio",
    name: "Cosmic Portfolio",
    cost: D(25),
    description: "Adds a permanent 1.25x global money multiplier.",
  },
  {
    id: "darkMatterDividend",
    name: "Dark Matter Dividend",
    cost: D(75),
    description: "Adds a permanent 2x global money multiplier.",
  },
  {
    id: "criticalTraining",
    name: "Critical Training",
    cost: D(20),
    description: "Critical clicks pay 5x instead of 3x.",
  },
  {
    id: "autoClickCore",
    name: "Auto Click Core",
    cost: D(18),
    description: "Permanently adds 25 automatic clicks/second.",
  },
  {
    id: "autoClickSingularity",
    name: "Auto Click Singularity",
    cost: D(60),
    description: "Doubles all automatic clicks/second.",
  },
  {
    id: "rebirthHarvester",
    name: "Rebirth Harvester",
    cost: D(40),
    description: "Earn 25% more Cosmic Gems from each Rebirth.",
  },
  {
    id: "keepGeneratorPlus",
    name: "Keep 5 generators after Rebirth",
    cost: D(50),
    description: "Keeps 5 units of your best owned generator after Rebirth.",
  },
  {
    id: "procurementOffice",
    name: "Procurement Office",
    cost: D(10),
    description: "All generator prices are 10% cheaper.",
  },
  {
    id: "quantumProcurement",
    name: "Quantum Procurement",
    cost: D(45),
    description: "All generator prices are another 20% cheaper.",
  },
  {
    id: "trainingBudget",
    name: "Training Budget",
    cost: D(10),
    description: "All regular upgrades are 10% cheaper.",
  },
  {
    id: "executiveCoupons",
    name: "Executive Coupons",
    cost: D(45),
    description: "All regular upgrades are another 20% cheaper.",
  },
  {
    id: "starterCapital",
    name: "Starter Capital",
    cost: D(12),
    description: "Start each Rebirth run with 1K coins.",
  },
  {
    id: "seedRound",
    name: "Seed Round",
    cost: D(35),
    description: "Start each Rebirth run with 100K coins.",
  },
  {
    id: "gemFoundry",
    name: "Gem Foundry",
    cost: D(90),
    description: "Earn 75% more Cosmic Gems from each Rebirth.",
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
  let gems = state.runCoins.div(1000000).sqrt().floor();
  if (state.purchasedRebirthUpgrades.rebirthHarvester) gems = gems.times(1.25).floor();
  if (state.purchasedRebirthUpgrades.gemFoundry) gems = gems.times(1.75).floor();
  return gems;
}

/**
 * Calculates total critical chance including permanent rebirth upgrades.
 * @returns {number}
 */
export function getCriticalChance() {
  return 0.05 + (state.purchasedRebirthUpgrades.critChance ? 0.1 : 0);
}

/**
 * Calculates the critical click reward multiplier.
 * @returns {Decimal}
 */
export function getCriticalMultiplier() {
  return state.purchasedRebirthUpgrades.criticalTraining ? D(5) : D(3);
}

/**
 * Calculates XP gain multiplier from rebirth upgrades.
 * @returns {Decimal}
 */
export function getXpMultiplier() {
  let multiplier = D(1);
  if (state.purchasedRebirthUpgrades.xpBoost) multiplier = multiplier.times(1.5);
  if (state.purchasedRebirthUpgrades.cosmicMentor) multiplier = multiplier.times(2);
  return multiplier;
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
 * @returns {{gemsGained: Decimal, keptGeneratorName: string, keptGeneratorAmount: number}}
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
  if (state.purchasedRebirthUpgrades.seedRound) state.coins = D(100000);
  else if (state.purchasedRebirthUpgrades.starterCapital) state.coins = D(1000);
  state.generators = {
    ...Object.fromEntries(GENERATORS.map((generator) => [generator.id, 0])),
  };
  if (kept.id) state.generators[kept.id] = kept.amount;
  return { gemsGained, keptGeneratorName: kept.name, keptGeneratorAmount: kept.amount };
}

function getKeptGenerator() {
  if (!state.purchasedRebirthUpgrades.keepGenerator && !state.purchasedRebirthUpgrades.keepGeneratorPlus) return { id: "", name: "", amount: 0 };
  for (const generator of [...GENERATORS].reverse()) {
    if ((state.generators[generator.id] || 0) > 0) {
      return {
        ...generator,
        amount: state.purchasedRebirthUpgrades.keepGeneratorPlus ? 5 : 1,
      };
    }
  }
  return { id: "", name: "", amount: 0 };
}
