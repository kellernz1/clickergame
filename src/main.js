import { D, getXpRequired, replaceState, TICK_MS, TICKS_PER_SECOND, createInitialState, state } from "./gameState.js";
import { getGlobalMoneyMultiplier, getTotalDps } from "./generators.js";
import { clearSave, loadGame, saveGame } from "./save.js";
import { canRebirth, getCriticalChance, getCriticalMultiplier, getXpMultiplier, performRebirth } from "./rebirth.js";
import { getAchievementClickMultiplier, getAutoClicksPerSecond } from "./upgrades.js";
import {
  addLog,
  formatNumber,
  initUi,
  render,
  renderHud,
  setActiveTab,
  setSaveStatus,
  showFloatingGain,
  showLevelUp,
  showModal,
  showOfflinePopup,
  showRebirthConfirm,
  showToast,
} from "./ui.js";

let tickCounter = 0;

const offline = loadGame();

initUi({
  onMainClick: handleMainClick,
  onRebirthClick: () => {
    if (!canRebirth()) return;
    showRebirthConfirm(() => {
      const result = performRebirth();
      addLog(`Rebirth complete. Gems gained: ${formatNumber(result.gemsGained)}.`);
      if (result.keptGeneratorName) addLog(`Permanent upgrade kept ${result.keptGeneratorAmount}x ${result.keptGeneratorName}.`);
      checkAchievements();
      saveGame();
      render();
    });
  },
  onResetGame: () => {
    showModal({
      title: "Reset game",
      message: "This deletes all saved progress, including rebirths, gems, and permanent upgrades.",
      confirmText: "Reset",
      danger: true,
      onConfirm: () => {
        clearSave();
        replaceState(createInitialState());
        addLog("Game reset.");
        render();
      },
    });
  },
});

setActiveTab(state.settings.activeTab);
render();

if (offline.offlineGain && offline.offlineGain.gt(0) && offline.offlineSeconds > 30) {
  showOfflinePopup(offline.offlineSeconds, offline.offlineGain);
}

setInterval(tick, TICK_MS);
setInterval(() => {
  saveGame();
  setSaveStatus("Saved automatically");
}, 5000);
window.addEventListener("beforeunload", saveGame);
window.addEventListener("company:generatorBought", () => {
  checkAchievements();
  render();
});

/**
 * Runs the main game loop at 20 ticks per second.
 * @returns {void}
 */
function tick() {
  tickCounter += 1;
  const passiveGain = getTotalDps().div(TICKS_PER_SECOND);
  if (passiveGain.gt(0)) gainMoney(passiveGain, true);

  const autoClicks = getAutoClicksPerSecond().div(TICKS_PER_SECOND);
  if (autoClicks.gt(0)) {
    const criticalAverage = D(1).plus(D(getCriticalChance()).times(getCriticalMultiplier().minus(1)));
    const autoGain = state.clickValue
      .times(getAchievementClickMultiplier())
      .times(autoClicks)
      .times(criticalAverage)
      .times(getMoneyMultiplierWithoutDpsDoubleCount());
    gainMoney(autoGain, false);
  }

  if (tickCounter >= TICKS_PER_SECOND) {
    tickCounter = 0;
    checkAchievements();
  }
  renderHud();
}

function handleMainClick(event) {
  state.clickCount += 1;
  const critical = Math.random() < getCriticalChance();
  const gain = calculateClickGain(critical);
  gainMoney(gain, false);
  showFloatingGain(event, gain, critical);
  checkAchievements();
  render();
}

/**
 * Calculates a click reward with chained click, achievement, critical, and gem multipliers.
 * @param {boolean} critical
 * @returns {Decimal}
 */
function calculateClickGain(critical) {
  let gain = state.clickValue.times(getAchievementClickMultiplier()).times(getMoneyMultiplierWithoutDpsDoubleCount());
  if (critical) gain = gain.times(getCriticalMultiplier());
  return gain;
}

/**
 * Calculates the global money multiplier from accumulated Cosmic Gems.
 * @returns {Decimal}
 */
function getMoneyMultiplierWithoutDpsDoubleCount() {
  return getGlobalMoneyMultiplier();
}

/**
 * Adds money and proportional XP to the current run.
 * @param {Decimal} amount
 * @param {boolean} fromDps
 * @returns {void}
 */
function gainMoney(amount, fromDps) {
  if (amount.lte(0)) return;
  state.coins = state.coins.plus(amount);
  state.totalCoins = state.totalCoins.plus(amount);
  state.runCoins = state.runCoins.plus(amount);
  gainXp(amount);
  if (!fromDps && state.coins.gte(1000000)) {
    addLog("The Rebirth goal has been reached.");
  }
}

/**
 * Adds XP from money gained and handles repeated level-ups.
 * @param {Decimal} moneyGained
 * @returns {void}
 */
function gainXp(moneyGained) {
  state.xp = state.xp.plus(moneyGained.times(getXpMultiplier()));
  while (state.xp.gte(getXpRequired(state.playerLevel))) {
    state.xp = state.xp.minus(getXpRequired(state.playerLevel));
    state.playerLevel += 1;
    state.xpRequired = getXpRequired(state.playerLevel);
    state.clickValue = state.clickValue.times(1.1);
    addLog(`Level Up! You are now level ${state.playerLevel}.`);
    showLevelUp();
  }
}

function checkAchievements() {
  unlockAchievement("firstClick", "First Click", state.clickCount >= 1, () => addLog("Reward: +1% clickValue."));
  unlockAchievement("naturalClicker", "Born Clicker", state.clickCount >= 10000, () => addLog("Reward: +5% clickValue."));
  unlockAchievement("firstGenerator", "Starter Capitalist", Object.values(state.generators).some((value) => value > 0), () => {});
  unlockAchievement("magnate", "Tycoon", (state.generators.cornerStore || 0) >= 100, () => addLog("Reward: +10% total DPS."));
  unlockAchievement("reborn", "Reborn", state.rebirths >= 1, () => {
    state.cosmicGems = state.cosmicGems.plus(1);
    addLog("Reward: +1 bonus Cosmic Gem.");
  });
}

function unlockAchievement(id, name, condition, reward) {
  if (!condition || state.achievements[id]) return;
  state.achievements[id] = true;
  reward();
  showToast("Achievement unlocked", name);
  addLog(`Achievement: ${name}.`);
}
