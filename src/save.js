import { hydrateState, OFFLINE_CAP_SECONDS, replaceState, SAVE_KEY, serializeValue, state } from "./gameState.js";
import { getTotalDps } from "./generators.js";

/**
 * Saves the complete game state into localStorage.
 * @returns {void}
 */
export function saveGame() {
  state.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeValue(state)));
}

/**
 * Loads saved game state and returns offline gain information.
 * @returns {{offlineSeconds: number, offlineGain: Decimal|null}}
 */
export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return { offlineSeconds: 0, offlineGain: null };
  try {
    const loaded = hydrateState(JSON.parse(raw));
    replaceState(loaded);
    const offlineSeconds = Math.min(Math.max(0, Math.floor((Date.now() - loaded.lastSavedAt) / 1000)), OFFLINE_CAP_SECONDS);
    const offlineGain = getTotalDps().times(offlineSeconds);
    if (offlineGain.gt(0)) {
      loaded.coins = loaded.coins.plus(offlineGain);
      loaded.totalCoins = loaded.totalCoins.plus(offlineGain);
      loaded.runCoins = loaded.runCoins.plus(offlineGain);
    }
    return { offlineSeconds, offlineGain };
  } catch (error) {
    console.error("Falha ao carregar save", error);
    return { offlineSeconds: 0, offlineGain: null };
  }
}

/**
 * Clears persisted game data.
 * @returns {void}
 */
export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
