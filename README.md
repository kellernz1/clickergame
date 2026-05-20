# Company Clicker

Company Clicker is a browser-based idle/clicker game built with HTML, CSS, JavaScript ES Modules, Vite, and decimal.js.

Start from a single click and grow into a massive automated business empire. Buy generators, unlock upgrades, gain levels, and perform Rebirths to earn permanent Cosmic Gem bonuses.

## Features

- Interactive main click button with floating numbers, particles, and critical hits
- XP and level system with an animated progress bar
- 10 automatic generator tiers with bulk purchase modes: x1, x10, x100, and Max
- Click upgrades, generator upgrades, global DPS upgrades, and autoclicker upgrades
- Rebirth system with Cosmic Gems and an expanded permanent upgrade shop
- Achievement system with toast notifications
- Dark modern responsive UI
- Browser autosave with localStorage
- Offline earnings capped at 8 hours
- Big number calculations powered by decimal.js

## Gameplay

Click the central coin button to earn coins. Use those coins to buy generators from the Generators tab. Generators produce passive DPS and keep earning money while the game is open.

Earning coins also grants XP. Leveling up increases click value by 10% and unlocks stronger upgrades.

Once you hold 1,000,000 coins at the same time, Rebirth becomes available. Rebirth resets the current run but grants Cosmic Gems. Cosmic Gems provide permanent money bonuses and can be spent in the Rebirth Shop.

## Generator Tiers

- Sketchy Support
- Corner Store
- Factory
- Corporation
- Conglomerate
- Orbital Office
- Moon Mine
- Quantum Bank
- Star Market
- Galactic Exchange

## Upgrade Types

- Click upgrades multiply click value.
- Generator upgrades multiply specific generator tiers.
- Global upgrades multiply total DPS.
- Autoclicker upgrades add automatic clicks per second.
- Rebirth upgrades persist between Rebirths and improve long-term scaling.

## Project Structure

```txt
.
├── index.html
├── styles.css
├── package.json
├── package-lock.json
├── vite.config.js
├── src
│   ├── gameState.js
│   ├── generators.js
│   ├── main.js
│   ├── rebirth.js
│   ├── save.js
│   ├── ui.js
│   └── upgrades.js
└── dist
```

## Modules

- `gameState.js` defines initial state, Decimal helpers, constants, serialization, and save hydration.
- `generators.js` defines generator data, price scaling, DPS calculations, and purchases.
- `upgrades.js` defines regular upgrade data and autoclicker calculations.
- `rebirth.js` defines Rebirth requirements, Cosmic Gem rewards, and permanent upgrades.
- `save.js` manages localStorage, autosave, loading, reset, and offline earnings.
- `ui.js` renders the HUD, shops, modals, particles, floating numbers, and toasts.
- `main.js` runs the 20 ticks/second game loop and coordinates gameplay events.

## Requirements

- Node.js
- npm

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

Tested locally at:

```txt
http://127.0.0.1:5173
```

Do not open `index.html` directly from the filesystem. The project relies on Vite and JavaScript module resolution.

## Build

```bash
npm run build
```

The production build is generated in:

```txt
dist/
```

## Preview

```bash
npm run preview
```

## GitHub Pages

This project includes a GitHub Actions workflow for GitHub Pages deployment:

```txt
.github/workflows/deploy.yml
```

In the repository settings, enable:

```txt
Settings > Pages > Build and deployment > Source > GitHub Actions
```

The Vite base path is configured automatically in `vite.config.js`.

## Save Data

The game saves automatically in the browser every 5 seconds and when the tab is closed. There is no manual save button.

Save data is stored under this localStorage key:

```txt
company-clicker-save-v1
```

The game also calculates offline earnings on load, capped at 8 hours.

## Core Formulas

Generator price scaling:

```txt
currentPrice = basePrice * (1.15 ^ ownedAmount)
```

XP required:

```txt
xpRequired = 100 * (1.5 ^ level)
```

Rebirth Cosmic Gems:

```txt
floor(sqrt(totalCoinsEarnedThisRun / 1,000,000))
```

Cosmic Gem money multiplier:

```txt
1 + cosmicGems * gemPower
```

By default, `gemPower` is 0.02. The Rebirth Shop can increase it to 0.03.

## License

This project is open-source and available under the MIT License.
