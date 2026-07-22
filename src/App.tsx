import { useEffect, useState, useRef, useMemo } from 'react';
import { KeybrAlgo } from './algo/KeybrAlgo';
import { SnippetGenerator } from './algo/SnippetGenerator';
import { Keyboard } from './components/Keyboard';
import './App.css';

function App() {
  const algo = useMemo(() => new KeybrAlgo(), []);
  const generator = useMemo(() => new SnippetGenerator(), []);
  
  const [text, setText] = useState<string>("");
  const [cursorIdx, setCursorIdx] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState(algo.getStats());
  const [activeSymbols, setActiveSymbols] = useState(algo.getActiveSymbols());
  const [focusedSymbol, setFocusedSymbol] = useState(algo.getFocusedSymbol());
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Load new snippet, call onLessonComplete() first if there's a completed lesson
  const nextLesson = (lessonJustFinished: boolean) => {
    if (lessonJustFinished) {
      algo.onLessonComplete();
    }
    const active = algo.getActiveSymbols();
    const focused = algo.getFocusedSymbol();
    const words = generator.generate(active, focused, 8);
    setText(words.join(" ") + " ");
    setCursorIdx(0);
    setErrors(new Set());
    setActiveSymbols(active);
    setFocusedSymbol(focused);
    setStats({ ...algo.getStats() });
  };

  useEffect(() => {
    nextLesson(false);
  }, []); // Run once on mount

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Track modifier keys so the algo can apply keybr's (elapsed / modifiers+1) formula
    if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'AltGraph') {
      algo.onModifierDown();
      return;
    }

    // Ignore other non-printable keys
    if (e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Space') return;
    
    // Prevent default browser actions for space and quotes
    if (e.key === ' ' || e.key === "'" || e.key === '"') e.preventDefault();
    
    const expectedChar = text[cursorIdx];
    const typedChar = e.key;
    
    const isError = expectedChar !== typedChar;

    if (isError) {
      setErrors(prev => new Set(prev).add(cursorIdx));
    }
    
    // Record stat for every keystroke (letters too — needed for correct timeToType delta)
    algo.recordKeystroke(expectedChar, isError, Date.now());

    if (!isError) {
      const newIdx = cursorIdx + 1;
      if (newIdx >= text.length) {
        // Snippet complete — commit session stats then load next
        nextLesson(true);
      } else {
        setCursorIdx(newIdx);
        // Stats update mid-lesson: session counts accumulate but filter not applied yet,
        // so we just refresh hitCount/missCount for the UI
        setStats({ ...algo.getStats() });
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Shift' || e.key === 'Alt' || e.key === 'AltGraph') {
      algo.onModifierUp();
    }
  };

  // Helper: format ms/char as a human-readable speed label
  const formatSpeed = (timeToType: number | null): string => {
    if (timeToType == null) return '—';
    const cpm = (1000 / timeToType) * 60;
    return `${Math.round(cpm / 5)} WPM`;
  };

  const formatConfidence = (confidence: number | null): string => {
    if (confidence == null) return '—';
    return `${Math.round(Math.min(confidence, 1) * 100)}%`;
  };

  return (
    <div 
      className="app-container" 
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0} 
      ref={containerRef}
    >
      <header>
        <h1>C++ Keybr</h1>
        <p>Master programming symbols adaptively</p>
        <button 
          className="reset-btn" 
          onClick={() => {
            if (confirm("Are you sure you want to completely wipe all your typing stats and start over?")) {
              algo.resetProgress();
              nextLesson(false);
            }
          }}
        >
          Reset Progress
        </button>
      </header>
      
      <main>
        <div className="typing-area">
          {text.split('').map((char, i) => {
            let className = 'char ';
            if (i < cursorIdx) className += errors.has(i) ? 'error ' : 'typed ';
            if (i === cursorIdx) className += 'cursor ';
            
            return (
              <span key={i} className={className}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
        <Keyboard expectedChar={text[cursorIdx] || ''} />
      </main>

      <aside className="stats-dashboard">
        <h2>Symbol Mastery</h2>
        <div className="symbols-grid">
          {algo.symbolProgression.map(sym => {
            const isActive = activeSymbols.includes(sym);
            const s = stats[sym];
            const isFocused = sym === focusedSymbol;
            const confValue = Math.min((s?.confidence ?? 0), 1);
            const bestConfValue = Math.min((s?.bestConfidence ?? 0), 1);
            return (
              <div 
                key={sym} 
                className={`symbol-card ${isFocused ? 'weakest' : ''} ${!isActive ? 'locked' : ''}`}
                onClick={() => {
                  if (!isActive) {
                    algo.forceUnlock(sym);
                    nextLesson(false);
                  }
                }}
                title={!isActive ? "Click to manually unlock this and all previous symbols" : ""}
              >
                <div className="sym-header">
                  <span className="sym-char">{sym}</span>
                  <span className="sym-conf">{isActive ? formatConfidence(s?.confidence) : 'Locked'}</span>
                </div>
                {/* Current confidence bar */}
                <div className="progress-bar" title="Current confidence">
                  <div className="progress-fill" style={{ width: `${confValue * 100}%` }}></div>
                </div>
                {/* Best confidence bar (dimmer) */}
                <div className="progress-bar best" title="Best confidence ever">
                  <div className="progress-fill best-fill" style={{ width: `${bestConfValue * 100}%` }}></div>
                </div>
                <div className="sym-details">
                  {isActive 
                    ? <small>{formatSpeed(s?.timeToType)} · {s?.hitCount} hits · {s?.missCount} err</small>
                    : <small>Pending</small>
                  }
                </div>
              </div>
            );
          })}
        </div>
        <p className="unlock-hint">
          {activeSymbols.length < algo.symbolProgression.length
            ? `Next unlock: best confidence ≥ 100% on all ${activeSymbols.length} active symbols`
            : '🎉 All symbols unlocked!'}
        </p>
      </aside>
    </div>
  );
}

export default App;
