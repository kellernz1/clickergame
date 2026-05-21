import { D, getXpRequired, REBIRTH_THRESHOLD, state } from "./gameState.js";
import { buyGenerator, GENERATORS, getBulkGeneratorPrice, getGeneratorPrice, getMaxAffordable, getTotalDps, isGeneratorUnlocked } from "./generators.js";
import { canRebirth, buyRebirthUpgrade, calculateRebirthGems, getCriticalChance, REBIRTH_UPGRADES } from "./rebirth.js";
import { buyUpgrade, getAchievementClickMultiplier, getUpgradeCost, UPGRADES } from "./upgrades.js";

const dom = {};

/**
 * Formats large Decimal values into compact readable labels.
 * @param {Decimal|number|string} value
 * @returns {string}
 */
export function formatNumber(value) {
  const number = D(value);
  if (number.lt(1000)) return number.toDecimalPlaces(0).toString();
  const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  const exponent = Math.floor(number.log(1000).toNumber());
  const unitIndex = Math.min(exponent, units.length) - 1;
  if (unitIndex >= units.length) return number.toExponential(2);
  return `${number.div(D(1000).pow(unitIndex + 1)).toDecimalPlaces(1).toString()}${units[unitIndex]}`;
}

/**
 * Initializes UI references and event listeners.
 * @param {object} handlers
 * @returns {void}
 */
export function initUi(handlers) {
  Object.assign(dom, {
    coins: document.querySelector("#coins-stat"),
    runTotal: document.querySelector("#run-total-stat"),
    dps: document.querySelector("#dps-stat"),
    click: document.querySelector("#click-stat"),
    level: document.querySelector("#level-stat"),
    rebirths: document.querySelector("#rebirths-stat"),
    gems: document.querySelector("#gems-stat"),
    crit: document.querySelector("#crit-stat"),
    xp: document.querySelector("#xp-stat"),
    xpFill: document.querySelector("#xp-fill"),
    mainClick: document.querySelector("#main-click"),
    effects: document.querySelector("#effects-layer"),
    generators: document.querySelector("#generators-list"),
    upgrades: document.querySelector("#upgrades-list"),
    rebirthShop: document.querySelector("#rebirth-shop-list"),
    rebirthButton: document.querySelector("#rebirth-button"),
    rebirthReadyLabel: document.querySelector("#rebirth-ready-label"),
    rebirthStatusText: document.querySelector("#rebirth-status-text"),
    rebirthFill: document.querySelector("#rebirth-fill"),
    log: document.querySelector("#action-log"),
    modal: document.querySelector("#modal-root"),
    toastStack: document.querySelector("#toast-stack"),
    autosave: document.querySelector("#autosave-status"),
    autosavePanel: document.querySelector("#autosave-panel-status"),
  });

  dom.mainClick.addEventListener("click", (event) => handlers.onMainClick(event));
  dom.rebirthButton.addEventListener("click", handlers.onRebirthClick);
  document.querySelector("#reset-game").addEventListener("click", handlers.onResetGame);
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });
  document.querySelectorAll(".buy-mode-button").forEach((button) => {
    button.addEventListener("click", () => setBuyMode(button.dataset.buyMode));
  });
  dom.generators.addEventListener("pointerdown", handleGeneratorPurchase);
  dom.upgrades.addEventListener("pointerdown", handleUpgradePurchase);
  dom.rebirthShop.addEventListener("pointerdown", handleRebirthUpgradePurchase);
}

/**
 * Renders frequently changing HUD values without rebuilding shop buttons.
 * @returns {void}
 */
export function renderHud() {
  dom.coins.textContent = formatNumber(state.coins);
  dom.runTotal.textContent = formatNumber(state.runCoins);
  dom.dps.textContent = formatNumber(getTotalDps());
  dom.click.textContent = formatNumber(state.clickValue.times(getAchievementClickMultiplier()));
  dom.level.textContent = String(state.playerLevel);
  dom.rebirths.textContent = String(state.rebirths);
  dom.gems.textContent = formatNumber(state.cosmicGems);
  dom.crit.textContent = `${Math.round(getCriticalChance() * 100)}%`;
  dom.xp.textContent = `${formatNumber(state.xp)} / ${formatNumber(getXpRequired(state.playerLevel))}`;
  const xpPct = getPercent(state.xp, getXpRequired(state.playerLevel));
  dom.xpFill.style.width = `${xpPct}%`;
  dom.rebirthButton.classList.toggle("hidden", !canRebirth());
  dom.rebirthButton.classList.toggle("pulse", canRebirth());
  const rebirthProgress = getPercent(state.coins, REBIRTH_THRESHOLD);
  dom.rebirthFill.style.width = `${rebirthProgress}%`;
  dom.rebirthReadyLabel.textContent = canRebirth() ? "Available" : `${formatNumber(state.coins)} / 1M`;
  const missingForRebirth = REBIRTH_THRESHOLD.minus(state.coins);
  dom.rebirthStatusText.textContent = canRebirth()
    ? `Click Rebirth to reset and earn ${formatNumber(calculateRebirthGems())} Cosmic Gems.`
    : `${formatNumber(missingForRebirth.gt(0) ? missingForRebirth : D(0))} coins left to unlock Rebirth.`;
  updateShopButtonStates();
  renderLog();
}

/**
 * Renders all dynamic UI regions.
 * @returns {void}
 */
export function render() {
  renderHud();
  renderGenerators();
  renderUpgrades();
  renderRebirthShop();
  renderLog();
}

/**
 * Calculates a clamped 0-100 percentage with Decimal values.
 * @param {Decimal} current
 * @param {Decimal} required
 * @returns {number}
 */
function getPercent(current, required) {
  if (required.lte(0)) return 100;
  const percent = current.div(required).times(100);
  if (percent.lt(0)) return 0;
  if (percent.gt(100)) return 100;
  return percent.toNumber();
}

function renderGenerators() {
  dom.generators.innerHTML = GENERATORS.map((generator) => {
    const unlocked = isGeneratorUnlocked(generator);
    const amount = state.settings.buyMode === "max" ? getMaxAffordable(generator).amount : Number(state.settings.buyMode);
    const cost = state.settings.buyMode === "max" ? getMaxAffordable(generator).cost : getBulkGeneratorPrice(generator, amount);
    const disabled = !unlocked || amount <= 0 || state.coins.lt(cost);
    return `
      <article class="shop-card">
        <div>
          <h3>${generator.name} <span>x${state.generators[generator.id] || 0}</span></h3>
          <p>Base DPS: ${formatNumber(generator.baseDps)} | Producing: ${formatNumber(generator.baseDps.times(state.generators[generator.id] || 0))}/s</p>
          <p data-generator-status="${generator.id}" class="${unlocked ? "unlocked-text" : "locked-text"}">${unlocked ? `Next price: ${formatNumber(getGeneratorPrice(generator))}` : `Locked: ${generator.unlockText}`}</p>
        </div>
        <button class="buy-button" data-generator="${generator.id}" ${disabled ? "disabled" : ""}>
          ${unlocked ? `${state.settings.buyMode === "max" ? `Buy Max (${amount})` : `Buy x${amount}`}<br>${formatNumber(cost)}` : "Locked"}
        </button>
      </article>
    `;
  }).join("");
}

function renderUpgrades() {
  const visible = UPGRADES.filter((upgrade) => !state.purchasedUpgrades[upgrade.id]);
  dom.upgrades.innerHTML = visible.length ? visible.map((upgrade) => {
    const unlocked = upgrade.isUnlocked();
    const cost = getUpgradeCost(upgrade);
    const disabled = !unlocked || state.coins.lt(cost);
    return `
    <article class="shop-card">
      <div>
        <h3>${upgrade.name}</h3>
        <p>${upgrade.type} | ${upgrade.description}</p>
        <p data-upgrade-status="${upgrade.id}" class="${unlocked ? "unlocked-text" : "locked-text"}">${unlocked ? "Unlocked" : `Locked: ${upgrade.unlockText}`}</p>
      </div>
      <button class="buy-button" data-upgrade="${upgrade.id}" ${disabled ? "disabled" : ""}>Buy<br>${formatNumber(cost)}</button>
    </article>
  `;
  }).join("") : `<div class="rebirth-note">All upgrades for this run have been purchased.</div>`;
}

function renderRebirthShop() {
  dom.rebirthShop.innerHTML = REBIRTH_UPGRADES.filter((upgrade) => !state.purchasedRebirthUpgrades[upgrade.id]).map((upgrade) => `
    <article class="shop-card">
      <div>
        <h3>${upgrade.name}</h3>
        <p>${upgrade.description}</p>
      </div>
      <button class="buy-button" data-rebirth-upgrade="${upgrade.id}" ${state.cosmicGems.lt(upgrade.cost) ? "disabled" : ""}>${formatNumber(upgrade.cost)} Gems</button>
    </article>
  `).join("") || `<div class="rebirth-note">All permanent upgrades have been purchased.</div>`;
}

function handleGeneratorPurchase(event) {
  const button = event.target.closest("[data-generator]");
  if (!button || button.disabled) return;
  event.preventDefault();
  const result = buyGenerator(button.dataset.generator, state.settings.buyMode);
  if (result.ok) {
    addLog(`Bought ${result.bought}x ${result.generator.name}.`);
    window.dispatchEvent(new CustomEvent("company:generatorBought"));
  }
  render();
}

function handleUpgradePurchase(event) {
  const button = event.target.closest("[data-upgrade]");
  if (!button || button.disabled) return;
  event.preventDefault();
  const result = buyUpgrade(button.dataset.upgrade);
  if (result.ok) addLog(`Upgrade purchased: ${result.upgrade.name}.`);
  render();
}

function handleRebirthUpgradePurchase(event) {
  const button = event.target.closest("[data-rebirth-upgrade]");
  if (!button || button.disabled) return;
  event.preventDefault();
  const result = buyRebirthUpgrade(button.dataset.rebirthUpgrade);
  if (result.ok) addLog(`Permanent upgrade purchased: ${result.upgrade.name}.`);
  render();
}

function renderLog() {
  dom.log.innerHTML = state.actionLog.slice(0, 12).map((item) => `<li>${item}</li>`).join("");
}

function updateShopButtonStates() {
  dom.generators.querySelectorAll("[data-generator]").forEach((button) => {
    const generator = GENERATORS.find((item) => item.id === button.dataset.generator);
    if (!generator) return;
    const unlocked = isGeneratorUnlocked(generator);
    const status = dom.generators.querySelector(`[data-generator-status="${generator.id}"]`);
    const amount = state.settings.buyMode === "max" ? getMaxAffordable(generator).amount : Number(state.settings.buyMode);
    const cost = state.settings.buyMode === "max" ? getMaxAffordable(generator).cost : getBulkGeneratorPrice(generator, amount);
    button.disabled = !unlocked || amount <= 0 || state.coins.lt(cost);
    button.innerHTML = unlocked ? `${state.settings.buyMode === "max" ? `Buy Max (${amount})` : `Buy x${amount}`}<br>${formatNumber(cost)}` : "Locked";
    if (status) {
      status.className = unlocked ? "unlocked-text" : "locked-text";
      status.textContent = unlocked ? `Next price: ${formatNumber(getGeneratorPrice(generator))}` : `Locked: ${generator.unlockText}`;
    }
  });

  dom.upgrades.querySelectorAll("[data-upgrade]").forEach((button) => {
    const upgrade = UPGRADES.find((item) => item.id === button.dataset.upgrade);
    if (!upgrade) return;
    const unlocked = upgrade.isUnlocked();
    const cost = getUpgradeCost(upgrade);
    const status = dom.upgrades.querySelector(`[data-upgrade-status="${upgrade.id}"]`);
    button.disabled = !unlocked || state.coins.lt(cost);
    button.innerHTML = `Buy<br>${formatNumber(cost)}`;
    if (status) {
      status.className = unlocked ? "unlocked-text" : "locked-text";
      status.textContent = unlocked ? "Unlocked" : `Locked: ${upgrade.unlockText}`;
    }
  });

  dom.rebirthShop.querySelectorAll("[data-rebirth-upgrade]").forEach((button) => {
    const upgrade = REBIRTH_UPGRADES.find((item) => item.id === button.dataset.rebirthUpgrade);
    if (!upgrade) return;
    button.disabled = state.cosmicGems.lt(upgrade.cost);
  });
}

export function setSaveStatus(text) {
  dom.autosave.textContent = text;
  if (dom.autosavePanel) dom.autosavePanel.textContent = text;
}

export function addLog(message) {
  state.actionLog.unshift(message);
  state.actionLog = state.actionLog.slice(0, 30);
}

export function showFloatingGain(event, amount, critical = false) {
  const rect = dom.effects.getBoundingClientRect();
  const x = event ? event.clientX - rect.left : rect.width / 2;
  const y = event ? event.clientY - rect.top : rect.height / 2;
  const text = document.createElement("div");
  text.className = `float-text${critical ? " critical" : ""}`;
  text.style.left = `${x}px`;
  text.style.top = `${y}px`;
  text.textContent = critical ? `CRITICAL! +${formatNumber(amount)}` : `+${formatNumber(amount)}`;
  dom.effects.append(text);
  setTimeout(() => text.remove(), 950);
  spawnParticles(x, y);
  dom.mainClick.classList.add("pop");
  setTimeout(() => dom.mainClick.classList.remove("pop"), 90);
}

export function showLevelUp() {
  const banner = document.createElement("div");
  banner.className = "level-up-banner";
  banner.textContent = "Level Up!";
  dom.effects.append(banner);
  setTimeout(() => banner.remove(), 1250);
}

export function showToast(title, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  dom.toastStack.append(toast);
  setTimeout(() => toast.remove(), 4200);
}

export function showModal({ title, message, confirmText = "Confirm", cancelText = "Cancel", danger = false, onConfirm }) {
  dom.modal.classList.remove("hidden");
  dom.modal.innerHTML = `
    <section class="modal-card" role="dialog" aria-modal="true">
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="secondary-button" data-modal-cancel>${cancelText}</button>
        <button class="${danger ? "danger-button" : "secondary-button"}" data-modal-confirm>${confirmText}</button>
      </div>
    </section>
  `;
  dom.modal.querySelector("[data-modal-cancel]").addEventListener("click", closeModal);
  dom.modal.querySelector("[data-modal-confirm]").addEventListener("click", () => {
    closeModal();
    onConfirm?.();
  });
}

export function closeModal() {
  dom.modal.classList.add("hidden");
  dom.modal.innerHTML = "";
}

export function showOfflinePopup(seconds, gain) {
  const hours = D(seconds).div(3600).toDecimalPlaces(2).toString();
  showModal({
    title: "Offline earnings",
    message: `You were away for ${hours} hours and earned ${formatNumber(gain)} coins!`,
    confirmText: "Nice",
  });
}

export function showRebirthConfirm(onConfirm) {
  showModal({
    title: "Confirm Rebirth",
    message: `You will gain ${formatNumber(calculateRebirthGems())} Cosmic Gems. Coins, generators, upgrades, and level will reset.`,
    confirmText: "Rebirth",
    danger: true,
    onConfirm,
  });
}

export function setActiveTab(tab) {
  state.settings.activeTab = tab;
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  document.querySelectorAll(".tab-content").forEach((content) => content.classList.toggle("active", content.id === `${tab}-tab`));
}

function setBuyMode(mode) {
  state.settings.buyMode = mode;
  document.querySelectorAll(".buy-mode-button").forEach((button) => button.classList.toggle("active", button.dataset.buyMode === mode));
  render();
}

function spawnParticles(x, y) {
  for (let index = 0; index < 14; index += 1) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--dx", `${Math.cos(index * 0.72) * (42 + Math.random() * 38)}px`);
    particle.style.setProperty("--dy", `${Math.sin(index * 0.72) * (42 + Math.random() * 38)}px`);
    dom.effects.append(particle);
    setTimeout(() => particle.remove(), 700);
  }
}
