# 🏢 Company Clicker

**Company Clicker** is a browser-based idle/clicker game built with **HTML**, **CSS**, **JavaScript ES Modules**, **Vite**, and **decimal.js**.

Start from a single click and grow into a massive automated business empire. Purchase generators, unlock upgrades, gain levels, and eventually perform powerful **Rebirths** to earn permanent **Cosmic Gem** bonuses.

---

## 🎮 Overview

The game combines:
- Incremental progression
- Idle mechanics
- Prestige systems
- Big-number scaling
- Reward-driven feedback loops

into a modern and polished clicker experience inspired by classic idle games.

The focus of the project is:
- scalable architecture,
- responsive UI,
- satisfying progression,
- and handling extremely large numbers safely using `decimal.js`.

---

## ✨ Features

---

### 🖱️ Interactive Main Click Button

The core gameplay starts with clicking the central coin button.

Includes:
- Floating coin numbers
- Particle effects
- Critical hits
- Animated feedback

---

### 📈 XP & Level System

Players gain XP while earning coins.

Leveling up:
- increases click value,
- unlocks stronger scaling,
- and updates an animated XP bar.

#### 📊 Level Bonus

Every level grants:
- **+10% click value**

---

### ⚙️ Automatic Generators

Unlock five passive income generators.

Features:
- Passive DPS generation
- Scaling prices
- Bulk purchase modes:
  - `x1`
  - `x10`
  - `x100`
  - `Max`

---

### ⬆️ Upgrade System

Multiple upgrade categories:

- Click upgrades
- Generator upgrades
- Autoclicker upgrades

These upgrades dramatically increase production efficiency over time.

---

### 🌌 Rebirth System

Once the player reaches:
```txt
1,000,000 coins
```

Rebirth becomes available.

Rebirth:
- Resets the current run
- Grants **Cosmic Gems**
- Unlocks permanent bonuses

#### 💎 Cosmic Gems

Each Cosmic Gem grants:

```txt
+2% permanent money bonus
```

---

### 🏆 Achievement System

Unlock achievements for:
- milestones,
- progression,
- production,
- and special actions.

Includes:
- Toast notifications
- Persistent unlock tracking

---

### 🌙 Modern Responsive UI

Features:
- Dark modern interface
- Responsive 3-panel layout
- Smooth transitions
- Hover feedback
- Animated panels

---

### 💾 Save & Offline Progress

The game automatically:
- Saves every 5 seconds
- Saves on tab close
- Calculates offline earnings

Offline progression is capped at:
```txt
8 hours
```

---

### 🔢 Big Number Support

Powered by:

```txt
decimal.js
```

This prevents floating-point precision issues during long idle sessions with huge values.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling |
| JavaScript ES Modules | Game architecture |
| Vite | Development/build tool |
| decimal.js | Big number calculations |
| localStorage | Save persistence |

---

## 📂 Project Structure

```text
.
├── index.html
├── styles.css
├── package.json
├── package-lock.json
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

---

## 🧠 Module Breakdown

### `gameState.js`

Defines:
- Initial state
- Decimal helpers
- Constants
- Save serialization
- State hydration

---

### `generators.js`

Handles:
- Generator data
- Price scaling
- DPS calculations
- Purchases

---

### `upgrades.js`

Defines:
- Upgrade data
- Click modifiers
- Autoclicker modifiers

---

### `rebirth.js`

Controls:
- Rebirth requirements
- Cosmic Gem rewards
- Permanent bonuses

---

### `save.js`

Manages:
- `localStorage`
- Autosaving
- Save loading
- Offline earnings
- Reset system

---

### `ui.js`

Responsible for:
- Rendering
- Floating numbers
- Particles
- Modals
- Toast notifications
- Shop panels

---

### `main.js`

Runs:
- Main game loop
- Tick system
- Event coordination

The game updates at:
```txt
20 ticks per second
```

---

## 🚀 Getting Started

### 📋 Requirements

- Node.js
- npm

---

## ⚙️ Installation

### 1. Install dependencies

```bash
npm install
```

---

## ▶️ Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

Tested locally at:

```txt
http://127.0.0.1:5173
```

> ⚠️ Do not open `index.html` directly from the filesystem.  
> The project relies on Vite and JavaScript module resolution.

---

## 📦 Build Production Version

```bash
npm run build
```

The production files will be generated inside:

```txt
dist/
```

---

## 👀 Preview Production Build

```bash
npm run preview
```

---

## 💾 Save Data

Save data is stored under the following localStorage key:

```txt
company-clicker-save-v1
```

Features include:
- Autosave every 5 seconds
- Save button
- Reset confirmation modal
- Offline earnings calculation

---

## 📐 Core Formulas

### 💰 Generator Price Scaling



---

### ⭐ XP Requirement Formula



---

### 🌌 Rebirth Cosmic Gems Formula



---

### 💎 Cosmic Gem Money Multiplier



---

## 🎨 Visual Style

Inspired by:
- Modern idle games
- Neon dashboard interfaces
- Minimalist dark UI
- Financial management apps

Includes:
- Animated gradients
- Floating particles
- Reactive UI feedback
- Smooth transitions

---

## 🔮 Future Improvements

- [ ] 🎵 Background music & SFX
- [ ] ☁️ Cloud save support
- [ ] 🏢 Additional generator tiers
- [ ] 🌎 Prestige worlds
- [ ] 📊 Statistics dashboard
- [ ] 🎰 Random events system
- [ ] 🧪 Temporary boosters
- [ ] 📱 Mobile optimization
- [ ] 🏆 Seasonal leaderboards

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Author

Developed by **Keller Nz**

---

## ⭐ Support

If you enjoyed this project, consider giving it a ⭐ on GitHub!
