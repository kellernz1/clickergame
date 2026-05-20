import { D, state } from "./gameState.js";

export const GENERATORS = [
  { id: "support", name: "Sketchy Support", baseDps: D(1), basePrice: D(10) },
  { id: "cornerStore", name: "Corner Store", baseDps: D(50), basePrice: D(200) },
  { id: "factory", name: "Factory", baseDps: D(1000), basePrice: D(5000) },
  { id: "corporation", name: "Corporation", baseDps: D(50000), basePrice: D(200000) },
  { id: "conglomerate", name: "Conglomerate", baseDps: D(2000000), basePrice: D(10000000) },
  { id: "orbitalOffice", name: "Orbital Office", baseDps: D(90000000), basePrice: D(500000000) },
  { id: "moonMine", name: "Moon Mine", baseDps: D(4000000000), basePrice: D(25000000000) },
  { id: "quantumBank", name: "Quantum Bank", baseDps: D(180000000000), basePrice: D(1200000000000) },
  { id: "starMarket", name: "Star Market", baseDps: D(9000000000000), basePrice: D(80000000000000) },
  { id: "galacticExchange", name: "Galactic Exchange", baseDps: D(500000000000000), basePrice: D(5000000000000000) },
];

/**
 * Calculates the current price for one generator after previous purchases.
 * @param {object} generator
 * @param {number} owned
 * @returns {Decimal}
 */
export function getGeneratorPrice(generator, owned = state.generators[generator.id]) {
  return generator.basePrice.times(D(1.15).pow(owned));
}

/**
 * Calculates the total price for buying several generators at once.
 * @param {object} generator
 * @param {number} amount
 * @returns {Decimal}
 */
export function getBulkGeneratorPrice(generator, amount) {
  let total = D(0);
  const owned = state.generators[generator.id] || 0;
  for (let index = 0; index < amount; index += 1) {
    total = total.plus(getGeneratorPrice(generator, owned + index));
  }
  return total;
}

/**
 * Finds how many generators can be bought with current coins.
 * @param {object} generator
 * @returns {{amount: number, cost: Decimal}}
 */
export function getMaxAffordable(generator) {
  let amount = 0;
  let cost = D(0);
  let nextCost = getGeneratorPrice(generator, state.generators[generator.id] || 0);
  while (amount < 10000 && state.coins.gte(cost.plus(nextCost))) {
    cost = cost.plus(nextCost);
    amount += 1;
    nextCost = getGeneratorPrice(generator, (state.generators[generator.id] || 0) + amount);
  }
  return { amount, cost };
}

/**
 * Gets the production multiplier for a specific generator from upgrades.
 * @param {string} generatorId
 * @returns {Decimal}
 */
export function getGeneratorMultiplier(generatorId) {
  let multiplier = D(1);
  if (generatorId === "support" && state.purchasedUpgrades.freeCoffee) multiplier = multiplier.times(2);
  if (generatorId === "cornerStore" && state.purchasedUpgrades.franchiseManual) multiplier = multiplier.times(2);
  if (generatorId === "factory" && state.purchasedUpgrades.advancedAi) multiplier = multiplier.times(3);
  if (generatorId === "corporation" && state.purchasedUpgrades.boardRoom) multiplier = multiplier.times(2.5);
  if (generatorId === "conglomerate" && state.purchasedUpgrades.globalLogistics) multiplier = multiplier.times(4);
  if (generatorId === "orbitalOffice" && state.purchasedUpgrades.orbitalPayroll) multiplier = multiplier.times(5);
  if (generatorId === "moonMine" && state.purchasedUpgrades.lunarDrills) multiplier = multiplier.times(6);
  if (generatorId === "quantumBank" && state.purchasedUpgrades.quantumLedger) multiplier = multiplier.times(8);
  if (generatorId === "starMarket" && state.purchasedUpgrades.starTraders) multiplier = multiplier.times(10);
  if (generatorId === "galacticExchange" && state.purchasedUpgrades.galacticMonopoly) multiplier = multiplier.times(12);
  return multiplier;
}

/**
 * Calculates total DPS including generator upgrades, achievements, and rebirth bonuses.
 * @returns {Decimal}
 */
export function getTotalDps() {
  let total = D(0);
  for (const generator of GENERATORS) {
    total = total.plus(generator.baseDps.times(state.generators[generator.id] || 0).times(getGeneratorMultiplier(generator.id)));
  }
  if (state.achievements.magnate) total = total.times(1.1);
  if (state.purchasedUpgrades.managementSchool) total = total.times(1.25);
  if (state.purchasedUpgrades.hyperAutomation) total = total.times(2);
  return total.times(getGlobalMoneyMultiplier());
}

/**
 * Calculates the permanent money multiplier granted by Cosmic Gems.
 * @returns {Decimal}
 */
export function getGlobalMoneyMultiplier() {
  const gemPower = state.purchasedRebirthUpgrades.gemEfficiency ? D(0.03) : D(0.02);
  let multiplier = D(1).plus(state.cosmicGems.times(gemPower));
  if (state.purchasedRebirthUpgrades.cosmicPortfolio) multiplier = multiplier.times(1.25);
  if (state.purchasedRebirthUpgrades.darkMatterDividend) multiplier = multiplier.times(2);
  return multiplier;
}

/**
 * Purchases a generator amount when the player has enough coins.
 * @param {string} generatorId
 * @param {number|"max"} amount
 * @returns {{ok: boolean, bought: number, cost: Decimal, generator?: object}}
 */
export function buyGenerator(generatorId, amount) {
  const generator = GENERATORS.find((item) => item.id === generatorId);
  if (!generator) return { ok: false, bought: 0, cost: D(0) };

  const purchase = amount === "max" ? getMaxAffordable(generator) : { amount: Number(amount), cost: getBulkGeneratorPrice(generator, Number(amount)) };
  if (purchase.amount <= 0 || state.coins.lt(purchase.cost)) return { ok: false, bought: 0, cost: purchase.cost, generator };

  state.coins = state.coins.minus(purchase.cost);
  state.generators[generator.id] = (state.generators[generator.id] || 0) + purchase.amount;
  return { ok: true, bought: purchase.amount, cost: purchase.cost, generator };
}
