import { useEffect, useState, useRef, useMemo } from 'react';
import { KeybrAlgo } from './algo/KeybrAlgo';
import { SnippetGenerator } from './algo/SnippetGenerator';
import { LESSONS, generateLessonSnippet } from './algo/Lessons';
import { Keyboard } from './components/Keyboard';
import './App.css';

interface DailyProgress {
  date: string;
  activeTimeMs: number;
  targetMinutes: number;
}

function App() {
  const algo = useMemo(() => new KeybrAlgo(), []);
  const generator = useMemo(() => new SnippetGenerator(), []);
  
  const [text, setText] = useState<string>("");
  const [cursorIdx, setCursorIdx] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState(algo.getStats());
  const [activeSymbols, setActiveSymbols] = useState(algo.getActiveSymbols());
  const [focusedSymbol, setFocusedSymbol] = useState(algo.getFocusedSymbol());
  
  // New Modes
  const [mode, setMode] = useState<'practice' | 'lessons'>('practice');
  const [currentLessonId, setCurrentLessonId] = useState<number>(0);
  const [lessonStats, setLessonStats] = useState({ hits: 0, misses: 0, startTime: 0, lastWpm: 0, lastAccuracy: 0 });

  // Daily Timer
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => {
    const saved = localStorage.getItem('cpp-keybr-daily');
    const today = getTodayDateString();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed;
        return { date: today, activeTimeMs: 0, targetMinutes: parsed.targetMinutes || 15 };
      } catch (e) {
        console.error(e);
      }
    }
    return { date: today, activeTimeMs: 0, targetMinutes: 15 };
  });
  
  const lastKeystrokeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load new snippet, call onLessonComplete() first if there's a completed lesson
  const nextLesson = (lessonJustFinished: boolean) => {
    if (mode === 'lessons') {
      const words = generateLessonSnippet(currentLessonId, 15);
      setText(words.join(" ") + " ");
      setCursorIdx(0);
      setErrors(new Set());
      setLessonStats(prev => ({ ...prev, hits: 0, misses: 0, startTime: 0 }));
      return;
    }

    if (lessonJustFinished) {
      algo.onLessonComplete();
    }
    const active = algo.getActiveSymbols();
    const focused = algo.getFocusedSymbol();
    const words = generator.generate(active, focused, 15);
    setText(words.join(" ") + " ");
    setCursorIdx(0);
    setErrors(new Set());
    setActiveSymbols(active);
    setFocusedSymbol(focused);
    setStats({ ...algo.getStats() });
  };

  useEffect(() => {
    nextLesson(false);
  }, [mode, currentLessonId]); // Run on mount and mode/lesson changes

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

    // --- Daily Progress Tracking ---
    const now = Date.now();
    if (lastKeystrokeRef.current > 0) {
      const delta = now - lastKeystrokeRef.current;
      // Only accumulate active time if pause is < 12 seconds
      if (delta < 12000) {
        setDailyProgress(prev => {
          const next = { ...prev, activeTimeMs: prev.activeTimeMs + delta };
          localStorage.setItem('cpp-keybr-daily', JSON.stringify(next));
          return next;
        });
      }
    }
    lastKeystrokeRef.current = now;
    // -------------------------------

    if (isError) {
      setErrors(prev => new Set(prev).add(cursorIdx));
    }
    
    if (mode === 'practice') {
      // Record stat for every keystroke
      algo.recordKeystroke(expectedChar, isError, Date.now());
    }

    if (!isError) {
      const newIdx = cursorIdx + 1;
      
      if (mode === 'lessons') {
        // Start timer on first valid keystroke
        setLessonStats(prev => ({
          ...prev,
          hits: prev.hits + 1,
          startTime: prev.startTime === 0 ? Date.now() : prev.startTime
        }));
      }

      if (newIdx >= text.length) {
        if (mode === 'lessons') {
          // Calculate final stats for this snippet
          setLessonStats(prev => {
            const timeMins = (Date.now() - prev.startTime) / 60000;
            const words = (prev.hits + 1) / 5; // standard 5 chars per word
            const wpm = timeMins > 0 ? Math.round(words / timeMins) : 0;
            const acc = Math.round(((prev.hits + 1) / ((prev.hits + 1) + prev.misses)) * 100);
            return { ...prev, lastWpm: wpm, lastAccuracy: acc };
          });
        }
        // Snippet complete — commit session stats then load next
        nextLesson(true);
      } else {
        setCursorIdx(newIdx);
        if (mode === 'practice') {
          // Stats update mid-lesson
          setStats({ ...algo.getStats() });
        }
      }
    } else {
      if (mode === 'lessons') {
        setLessonStats(prev => ({ ...prev, misses: prev.misses + 1 }));
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
        <div className="header-titles">
          <h1>C++ Keybr</h1>
          <p>Master programming symbols adaptively</p>
        </div>
        <div className="header-controls">
          <div className="mode-toggle">
            <button 
              className={mode === 'practice' ? 'active' : ''} 
              onClick={() => setMode('practice')}
            >
              Practice
            </button>
            <button 
              className={mode === 'lessons' ? 'active' : ''} 
              onClick={() => setMode('lessons')}
            >
              Lessons
            </button>
          </div>
        </div>
      </header>
      
      <div className="app-body">
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
          {mode === 'lessons' && lessonStats.lastWpm > 0 && (
            <div className="lesson-live-stats">
              Last snippet: <strong>{lessonStats.lastWpm} WPM</strong> | <strong>{lessonStats.lastAccuracy}%</strong> acc
            </div>
          )}
        </div>
        <Keyboard expectedChar={text[cursorIdx] || ''} />
      </main>

      <aside className="stats-dashboard">
        {/* Daily Goal Widget */}
        <div className="daily-goal-widget">
          <div className="daily-goal-header">
            <h3>Daily Goal</h3>
            <button 
              className="edit-goal-btn"
              onClick={() => {
                const newTarget = prompt("Enter your daily target in minutes:", dailyProgress.targetMinutes.toString());
                if (newTarget && !isNaN(Number(newTarget)) && Number(newTarget) > 0) {
                  setDailyProgress(prev => {
                    const next = { ...prev, targetMinutes: Number(newTarget) };
                    localStorage.setItem('cpp-keybr-daily', JSON.stringify(next));
                    return next;
                  });
                }
              }}
            >
              Edit
            </button>
          </div>
          <div className="daily-goal-progress">
            <div className="daily-goal-text">
              <span className="current-time">{Math.floor(dailyProgress.activeTimeMs / 60000)}m {Math.floor((dailyProgress.activeTimeMs % 60000) / 1000)}s</span>
              <span className="target-time">/ {dailyProgress.targetMinutes}m</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill daily-fill" 
                style={{ width: `${Math.min(100, (dailyProgress.activeTimeMs / (dailyProgress.targetMinutes * 60000)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {mode === 'practice' ? (
          <>
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
            <button 
              className="reset-btn" 
              onClick={() => {
                if (window.confirm("Are you sure you want to completely wipe all your typing stats and start over?")) {
                  algo.resetProgress();
                  localStorage.removeItem('cpp-keybr-daily');
                  setDailyProgress(prev => ({ ...prev, activeTimeMs: 0 }));
                  nextLesson(false);
                }
              }}
            >
              Reset Progress
            </button>
          </>
        ) : (
          <>
            <h2>Lessons</h2>
            <div className="lessons-list">
              {LESSONS.map(lesson => (
                <div 
                  key={lesson.id} 
                  className={`lesson-card ${currentLessonId === lesson.id ? 'active' : ''}`}
                  onClick={() => setCurrentLessonId(lesson.id)}
                >
                  <span className="lesson-title">{lesson.title}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
      </div>
    </div>
  );
}

export default App;
