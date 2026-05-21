import { D, state } from "./gameState.js";

export const UPGRADES = [
  {
    id: "ironGloves",
    name: "Iron Gloves",
    type: "Click",
    cost: D(500),
    description: "2x clickValue",
    unlockText: "Available from the start.",
    isUnlocked: () => true,
    apply: () => {
      state.clickValue = state.clickValue.times(2);
    },
  },
  {
    id: "steelFingers",
    name: "Steel Fingers",
    type: "Click",
    cost: D(50000),
    description: "5x clickValue",
    unlockText: "Buy Iron Gloves.",
    isUnlocked: () => Boolean(state.purchasedUpgrades.ironGloves),
    apply: () => {
      state.clickValue = state.clickValue.times(5);
    },
  },
  {
    id: "capitalismHands",
    name: "Hands of Capitalism",
    type: "Click",
    cost: D(5000000),
    description: "10x clickValue",
    unlockText: "Reach level 10.",
    isUnlocked: () => state.playerLevel >= 10,
    apply: () => {
      state.clickValue = state.clickValue.times(10);
    },
  },
  {
    id: "ventureKeyboard",
    name: "Venture Keyboard",
    type: "Click",
    cost: D(250000000),
    description: "4x clickValue",
    unlockText: "Reach level 20.",
    isUnlocked: () => state.playerLevel >= 20,
    apply: () => {
      state.clickValue = state.clickValue.times(4);
    },
  },
  {
    id: "executiveDesk",
    name: "Executive Desk",
    type: "Click",
    cost: D(25000000000),
    description: "8x clickValue",
    unlockText: "Reach level 35.",
    isUnlocked: () => state.playerLevel >= 35,
    apply: () => {
      state.clickValue = state.clickValue.times(8);
    },
  },
  {
    id: "freeCoffee",
    name: "Free Coffee",
    type: "Generator",
    cost: D(1000),
    description: "Sketchy Support produces 2x",
    unlockText: "Own 10 Sketchy Support generators.",
    isUnlocked: () => (state.generators.support || 0) >= 10,
    apply: () => {},
  },
  {
    id: "advancedAi",
    name: "Advanced AI",
    type: "Generator",
    cost: D(500000),
    description: "Factories produce 3x",
    unlockText: "Own 25 Factories.",
    isUnlocked: () => (state.generators.factory || 0) >= 25,
    apply: () => {},
  },
  {
    id: "franchiseManual",
    name: "Franchise Manual",
    type: "Generator",
    cost: D(25000),
    description: "Corner Stores produce 2x",
    unlockText: "Own 25 Corner Stores.",
    isUnlocked: () => (state.generators.cornerStore || 0) >= 25,
    apply: () => {},
  },
  {
    id: "boardRoom",
    name: "Board Room",
    type: "Generator",
    cost: D(10000000),
    description: "Corporations produce 2.5x",
    unlockText: "Own 15 Corporations.",
    isUnlocked: () => (state.generators.corporation || 0) >= 15,
    apply: () => {},
  },
  {
    id: "globalLogistics",
    name: "Global Logistics",
    type: "Generator",
    cost: D(500000000),
    description: "Conglomerates produce 4x",
    unlockText: "Own 10 Conglomerates.",
    isUnlocked: () => (state.generators.conglomerate || 0) >= 10,
    apply: () => {},
  },
  {
    id: "orbitalPayroll",
    name: "Orbital Payroll",
    type: "Generator",
    cost: D(10000000000),
    description: "Orbital Offices produce 5x",
    unlockText: "Own 8 Orbital Offices.",
    isUnlocked: () => (state.generators.orbitalOffice || 0) >= 8,
    apply: () => {},
  },
  {
    id: "lunarDrills",
    name: "Lunar Drills",
    type: "Generator",
    cost: D(250000000000),
    description: "Moon Mines produce 6x",
    unlockText: "Own 8 Moon Mines.",
    isUnlocked: () => (state.generators.moonMine || 0) >= 8,
    apply: () => {},
  },
  {
    id: "quantumLedger",
    name: "Quantum Ledger",
    type: "Generator",
    cost: D(10000000000000),
    description: "Quantum Banks produce 8x",
    unlockText: "Own 6 Quantum Banks.",
    isUnlocked: () => (state.generators.quantumBank || 0) >= 6,
    apply: () => {},
  },
  {
    id: "starTraders",
    name: "Star Traders",
    type: "Generator",
    cost: D(500000000000000),
    description: "Star Markets produce 10x",
    unlockText: "Own 5 Star Markets.",
    isUnlocked: () => (state.generators.starMarket || 0) >= 5,
    apply: () => {},
  },
  {
    id: "galacticMonopoly",
    name: "Galactic Monopoly",
    type: "Generator",
    cost: D(5000000000000000),
    description: "Galactic Exchanges produce 12x",
    unlockText: "Own 3 Galactic Exchanges.",
    isUnlocked: () => (state.generators.galacticExchange || 0) >= 3,
    apply: () => {},
  },
  {
    id: "managementSchool",
    name: "Management School",
    type: "Global",
    cost: D(2500000),
    description: "+25% total DPS",
    unlockText: "Reach level 12.",
    isUnlocked: () => state.playerLevel >= 12,
    apply: () => {},
  },
  {
    id: "hyperAutomation",
    name: "Hyper Automation",
    type: "Global",
    cost: D(100000000000),
    description: "2x total DPS",
    unlockText: "Reach level 30.",
    isUnlocked: () => state.playerLevel >= 30,
    apply: () => {},
  },
  {
    id: "autoHand",
    name: "Automatic Hand",
    type: "Autoclicker",
    cost: D(1000000),
    description: "Simulates 10 clicks/second",
    unlockText: "Available from the start.",
    isUnlocked: () => true,
    apply: () => {},
  },
  {
    id: "autoHandII",
    name: "Automatic Hand II",
    type: "Autoclicker",
    cost: D(100000000),
    description: "Adds 50 clicks/second",
    unlockText: "Buy Automatic Hand.",
    isUnlocked: () => Boolean(state.purchasedUpgrades.autoHand),
    apply: () => {},
  },
  {
    id: "autoDepartment",
    name: "Automation Department",
    type: "Autoclicker",
    cost: D(1000000000000),
    description: "Adds 250 clicks/second",
    unlockText: "Buy Automatic Hand II.",
    isUnlocked: () => Boolean(state.purchasedUpgrades.autoHandII),
    apply: () => {},
  },
];

/**
 * Purchases an upgrade and applies its multiplier effect immediately.
 * @param {string} upgradeId
 * @returns {{ok: boolean, upgrade?: object}}
 */
export function buyUpgrade(upgradeId) {
  const upgrade = UPGRADES.find((item) => item.id === upgradeId);
  const cost = upgrade ? getUpgradeCost(upgrade) : D(0);
  if (!upgrade || state.purchasedUpgrades[upgradeId] || !upgrade.isUnlocked() || state.coins.lt(cost)) return { ok: false, upgrade };
  state.coins = state.coins.minus(cost);
  state.purchasedUpgrades[upgradeId] = true;
  upgrade.apply();
  return { ok: true, upgrade };
}

/**
 * Calculates the current cost of a regular upgrade after permanent discounts.
 * @param {object} upgrade
 * @returns {Decimal}
 */
export function getUpgradeCost(upgrade) {
  let cost = upgrade.cost;
  if (state.purchasedRebirthUpgrades.trainingBudget) cost = cost.times(0.9);
  if (state.purchasedRebirthUpgrades.executiveCoupons) cost = cost.times(0.8);
  return cost;
}

/**
 * Calculates click value modifiers from achievements only.
 * Upgrade multipliers are applied directly when purchased.
 * @returns {Decimal}
 */
export function getAchievementClickMultiplier() {
  let multiplier = D(1);
  if (state.achievements.firstClick) multiplier = multiplier.times(1.01);
  if (state.achievements.naturalClicker) multiplier = multiplier.times(1.05);
  return multiplier;
}

/**
 * Calculates how many automated clicks occur per second.
 * @returns {Decimal}
 */
export function getAutoClicksPerSecond() {
  let clicks = D(0);
  if (state.purchasedUpgrades.autoHand) clicks = clicks.plus(10);
  if (state.purchasedUpgrades.autoHandII) clicks = clicks.plus(50);
  if (state.purchasedUpgrades.autoDepartment) clicks = clicks.plus(250);
  if (state.purchasedRebirthUpgrades.autoClickCore) clicks = clicks.plus(25);
  if (state.purchasedRebirthUpgrades.autoClickSingularity) clicks = clicks.times(2);
  return clicks;
}
