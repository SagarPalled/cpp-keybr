# C++ Keybr 🧑🏻‍💻⌨️

An adaptive, algorithm-driven touch-typing tutor specifically designed to help programmers master C++ special characters and complex Shift-key coordination.

## The Problem
Standard typing tutors (like keybr.com or typing.com) are fantastic for learning the alphabet, but they completely ignore the heavy use of symbols required in programming. If you are coding in C++, you are constantly reaching for `{}`, `()`, `[]`, `<<`, `>>`, `::`, `&&`, and `||`. 

## The Solution
**C++ Keybr** solves this by using a smart, exponentially-smoothed algorithm to track your typing speed on a per-character basis. It dynamically generates realistic C++ code snippets injected with targeted "muscle memory drills" specifically designed to train your weakest symbols.

### Key Features
* **Adaptive Learning Algorithm:** Tracks your typing speed down to the millisecond. If you struggle with the `&` key, the algorithm will dynamically weave more `&` symbols into your practice snippets until you master it.
* **Realistic C++ Context:** You aren't just typing random symbols; you are typing valid C++ syntax, variable declarations, loops, and pointers.
* **Advanced Muscle Memory Drills:** Interweaves specialized drills inspired by EdClub pedagogy (e.g., Cross-Keyboard Sandwiches and Shift-Coordination) to force proper touch-typing form.
* **Strict Shift-Key Enforcement:** Features a dynamic visual keyboard and hand overlay that lights up the exact finger you need to use, strictly enforcing opposite-hand Shift key usage.
* **Local Storage Persistence:** All your stats, heatmaps, and unlock progress are saved directly in your browser.

## How it Works
The app uses a 100% confidence threshold based on a target typing speed of **35 WPM (175 CPM)**. 
It starts you off with just 3 basic symbols (`;`, `(`, `)`). Once you prove you can type all active symbols at the target speed without looking, the algorithm automatically unlocks the next symbol in the progression sequence and begins integrating it into your lessons.

## Getting Started

### Run Locally
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Deploy to GitHub Pages
This project is pre-configured for GitHub pages. To deploy a live build:
```bash
npm run deploy
```

## Tech Stack
* **React 19**
* **Vite**
* **TypeScript**
* **Vanilla CSS** (No external UI libraries, purely bespoke CSS grids and flexbox)
