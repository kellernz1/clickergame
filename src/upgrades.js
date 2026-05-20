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
    id: "autoHand",
    name: "Automatic Hand",
    type: "Autoclicker",
    cost: D(1000000),
    description: "Simulates 10 clicks/second",
    unlockText: "Available from the start.",
    isUnlocked: () => true,
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
  if (!upgrade || state.purchasedUpgrades[upgradeId] || !upgrade.isUnlocked() || state.coins.lt(upgrade.cost)) return { ok: false, upgrade };
  state.coins = state.coins.minus(upgrade.cost);
  state.purchasedUpgrades[upgradeId] = true;
  upgrade.apply();
  return { ok: true, upgrade };
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
  return state.purchasedUpgrades.autoHand ? D(10) : D(0);
}
