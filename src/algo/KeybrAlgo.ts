/**
 * Faithful port of the keybr algorithm for special characters.
 *
 * Key sources from aradzie/keybr.com:
 *  - packages/keybr-math/lib/filter.ts           → exponential smoothing
 *  - packages/keybr-textinput/lib/histogram.ts   → per-session avg timeToType + outlier rejection
 *  - packages/keybr-result/lib/keystats.ts        → MutableKeyStats, bestTimeToType
 *  - packages/keybr-lesson/lib/target.ts          → confidence = speedToTime(target) / timeToType
 *  - packages/keybr-result/lib/result.ts          → speedToTime: ms = 1000 / (cpm / 60)
 *  - packages/keybr-textinput-events/lib/timetotype.ts → timeToType = delta / (modifiers + 1)
 *  - packages/keybr-lesson/lib/guided.ts          → unlock when ALL bestConfidence >= 1
 *                                                    focus = lowest current confidence
 */

// ─── Exponential smoothing filter (alpha = 0.1), exact copy of keybr's makeFilter ───
function makeFilter(alpha: number) {
  let n = 0;
  let value = NaN;
  return {
    get n() { return n; },
    get value() { return value; },
    set(newN: number, newValue: number) {
      n = newN;
      value = newValue;
    },
    add(v: number): number {
      n++;
      if (n > 1) {
        value = alpha * v + (1 - alpha) * value;
      } else {
        value = v;
      }
      return value;
    },
  };
}

// ─── speedToTime: converts CPM → ms/char, exact copy from keybr's result.ts ─────────
// speedToTime(cpm) = 1000 / (cpm / 60)
// Target is expressed in CPM (chars per minute). Default keybr target = 175 CPM ≈ 35 WPM.
const TARGET_CPM = 175;
function speedToTime(cpm: number): number {
  return 1000 / (cpm / 60); // returns ms per char at that speed
}
const TARGET_TIME_TO_TYPE = speedToTime(TARGET_CPM); // ms per char at target speed

// ─── Outlier bounds from keybr's histogram.ts ────────────────────────────────────────
const MIN_TIME_TO_TYPE = 40;    // < 40ms  → too fast (impossible), reject
const MAX_TIME_TO_TYPE = 12000; // > 12000ms → too slow (paused), reject

export type CharStats = {
  char: string;
  /** Exponentially smoothed timeToType in ms/char (lower = faster). null until first session. */
  timeToType: number | null;
  /** Best (lowest) filteredTimeToType ever recorded. null until first session. */
  bestTimeToType: number | null;
  /** Confidence based on current timeToType. null until first session. */
  confidence: number | null;
  /** Confidence based on best timeToType. null until first session. */
  bestConfidence: number | null;
  /** Total hits ever */
  hitCount: number;
  /** Total misses (typos) ever */
  missCount: number;
};

// ─── Per-character state ──────────────────────────────────────────────────────────────
type CharState = {
  stats: CharStats;
  filter: ReturnType<typeof makeFilter>;
  // Accumulators for the CURRENT in-progress lesson (cleared each new snippet)
  sessionTime: number;
  sessionCount: number;
  sessionHits: number;
  sessionMisses: number;
};

export class KeybrAlgo {
  // Symbol progression: ordered from most to least frequently used in C++
  public readonly symbolProgression = [
    ';', '(', ')', '{', '}', '=', '!', '<', '>', '&', '*', '+', '-', '/', '[', ']', '"', "'", '_'
  ];

  private charState: Record<string, CharState> = {};
  private activeCount: number = 3; // start with first 3 unlocked

  // For computing per-keystroke timeToType, exactly as keybr does:
  // timeToType = (timestamp_now - timestamp_prev) / (modifiers_held + 1)
  private lastKeystrokeTime: number = 0;
  private modifiersHeld: number = 0; // how many Shift/Alt keys are currently held

  constructor() {
    this.initEmptyState();
    this.load();
  }

  private initEmptyState() {
    this.activeCount = 3;
    for (const sym of this.symbolProgression) {
      this.charState[sym] = {
        stats: {
          char: sym,
          timeToType: null,
          bestTimeToType: null,
          confidence: null,
          bestConfidence: null,
          hitCount: 0,
          missCount: 0,
        },
        filter: makeFilter(0.3),
        sessionTime: 0,
        sessionCount: 0,
        sessionHits: 0,
        sessionMisses: 0,
      };
    }
  }

  public resetProgress() {
    this.initEmptyState();
    localStorage.removeItem('cpp-keybr-progress');
  }

  public forceUnlock(sym: string) {
    const idx = this.symbolProgression.indexOf(sym);
    if (idx >= 0 && idx >= this.activeCount) {
      this.activeCount = Math.min(idx + 1, this.symbolProgression.length);
      this.save();
    }
  }

  // ── Persistence ───────────────────────────────────────────────────────────────────
  public save() {
    try {
      const data = {
        activeCount: this.activeCount,
        chars: {} as Record<string, any>
      };
      
      for (const sym of this.symbolProgression) {
        data.chars[sym] = {
          stats: this.charState[sym].stats,
          filter: {
            n: this.charState[sym].filter.n,
            value: this.charState[sym].filter.value
          }
        };
      }
      
      localStorage.setItem('cpp-keybr-progress', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }

  private load() {
    try {
      const saved = localStorage.getItem('cpp-keybr-progress');
      if (!saved) return;
      
      const data = JSON.parse(saved);
      if (typeof data.activeCount === 'number') {
        this.activeCount = data.activeCount;
      }
      
      for (const sym of this.symbolProgression) {
        if (data.chars && data.chars[sym]) {
          this.charState[sym].stats = data.chars[sym].stats;
          const f = data.chars[sym].filter;
          if (f && typeof f.n === 'number' && typeof f.value === 'number') {
            this.charState[sym].filter.set(f.n, f.value);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  }

  // ── Called when Shift/Alt is pressed ──────────────────────────────────────────────
  public onModifierDown() {
    this.modifiersHeld++;
  }

  // ── Called when Shift/Alt is released ─────────────────────────────────────────────
  public onModifierUp() {
    this.modifiersHeld = Math.max(0, this.modifiersHeld - 1);
  }

  // ── Record every keystroke (letter or special char) ───────────────────────────────
  public recordKeystroke(char: string, typo: boolean, timeMs: number) {
    // Step 1: compute timeToType for this character (mirrors keybr's TimeToType.measure)
    // timeToType = elapsed / (modifiers + 1)
    let timeToType = 0;
    if (this.lastKeystrokeTime > 0) {
      const elapsed = timeMs - this.lastKeystrokeTime;
      const divisor = this.modifiersHeld + 1;
      timeToType = elapsed / divisor;
    }

    // Unlike real keybr (which has backspace to reset the clock), our app has no backspace.
    // If we always reset the clock, a typo + immediate correction records only ~20ms (artificially fast).
    // Instead: only advance the clock on CORRECT keystrokes, so the full time since the last
    // correct character — including all wrong attempts — is charged to that character.
    if (!typo) {
      this.lastKeystrokeTime = timeMs;
      this.modifiersHeld = 0;
    }

    // Only track special characters in our progression
    if (!this.symbolProgression.includes(char)) return;

    const state = this.charState[char];
    state.stats.hitCount++;
    if (typo) {
      state.stats.missCount++;
    }

    // Step 2: accumulate within current lesson session
    // keybr averages timeToType per-character within each lesson (histogram.ts lines 78-81)
    // Reject outliers: < 40ms (impossible) or > 12000ms (paused)
    if (!typo && timeToType >= MIN_TIME_TO_TYPE && timeToType <= MAX_TIME_TO_TYPE) {
      state.sessionTime += timeToType;
      state.sessionCount++;
    }
    state.sessionHits++;
    if (typo) state.sessionMisses++;
  }

  // ── Call this when a snippet is completed (equivalent to end of a keybr lesson) ───
  // In keybr, stats are updated per-Result (per completed lesson), not keystroke-by-keystroke.
  public onLessonComplete() {
    for (const sym of this.symbolProgression) {
      const state = this.charState[sym];
      if (state.sessionCount === 0) {
        // Reset session accumulators even if char wasn't typed this lesson
        state.sessionTime = 0;
        state.sessionCount = 0;
        state.sessionHits = 0;
        state.sessionMisses = 0;
        continue;
      }

      // Average timeToType for this session (histogram.ts line 89)
      const avgTimeToType = Math.round(state.sessionTime / state.sessionCount);

      // Apply exponential smoothing filter (keystats.ts line 137)
      const filteredTimeToType = state.filter.add(avgTimeToType);

      // Update timeToType (current) and bestTimeToType
      state.stats.timeToType = filteredTimeToType;
      state.stats.bestTimeToType = Math.min(
        state.stats.bestTimeToType ?? Infinity,
        filteredTimeToType
      );

      // Confidence = speedToTime(target) / timeToType  (target.ts line 22)
      // > 1.0 means you're faster than target, < 1.0 means slower
      state.stats.confidence = TARGET_TIME_TO_TYPE / state.stats.timeToType;
      state.stats.bestConfidence = TARGET_TIME_TO_TYPE / state.stats.bestTimeToType;

      // Reset session accumulators
      state.sessionTime = 0;
      state.sessionCount = 0;
      state.sessionHits = 0;
      state.sessionMisses = 0;
    }

    this.checkProgression();
    this.save();
  }

  // ── Unlock next character when ALL active keys have bestConfidence >= 1 ────────────
  // Exact logic from guided.ts lines 86-91 (recoverKeys=false branch, the default)
  private checkProgression() {
    if (this.activeCount >= this.symbolProgression.length) return;
    const active = this.symbolProgression.slice(0, this.activeCount);
    const allMastered = active.every(sym => (this.charState[sym].stats.bestConfidence ?? 0) >= 1);
    if (allMastered) {
      this.activeCount++;
    }
  }

  public getFocusedSymbol(): string {
    const active = this.symbolProgression.slice(0, this.activeCount);
    
    // Exact logic from keybr guided.ts lines 96-105:
    // Only consider keys that haven't been mastered yet (bestConfidence < 1)
    const unmastered = active.filter(sym => (this.charState[sym].stats.bestConfidence ?? 0) < 1);
    
    if (unmastered.length > 0) {
      // Find the one with the absolutely lowest bestConfidence
      let focused = unmastered[0];
      let lowest = this.charState[focused].stats.bestConfidence ?? 0;
      for (const sym of unmastered) {
        const conf = this.charState[sym].stats.bestConfidence ?? 0;
        if (conf < lowest) {
          lowest = conf;
          focused = sym;
        }
      }
      return focused;
    }
    
    // Fallback if everything active is already mastered (e.g., just before unlock)
    return active[active.length - 1];
  }

  public getActiveSymbols(): string[] {
    return this.symbolProgression.slice(0, this.activeCount);
  }

  public getStats(): Record<string, CharStats> {
    const result: Record<string, CharStats> = {};
    for (const sym of this.symbolProgression) {
      result[sym] = this.charState[sym].stats;
    }
    return result;
  }
}
