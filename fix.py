import sys
content = open('src/App.tsx', 'r', encoding='utf-8').read()

new_body = '''      <div className="app-body">
        {mode === 'practice' && (
          <div className="practice-layout">
            <MetricsDashboard 
              globalStats={algo.getGlobalStats()} 
              focusedSymbol={focusedSymbol} 
              focusedStats={stats[focusedSymbol] || {}} 
              dailyProgress={dailyProgress} 
            />
            <div className="practice-content">
              <main>
                <div className="typing-area">
                  {text.split('').map((char, idx) => {
                    let className = 'char ';
                    if (idx < cursorIdx) {
                      className += errors.has(idx) ? 'error ' : 'typed ';
                    }
                    if (idx === cursorIdx) className += 'cursor ';
                    return (
                      <span key={idx} className={className}>
                        {char === ' ' ? '\\u00A0' : char}
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
                        <div className="progress-bar" title="Current confidence">
                          <div className="progress-fill" style={{ width: `${confValue * 100}%` }}></div>
                        </div>
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
                    ? `Next unlock: ${algo.settings.strictUnlock ? 'current' : 'best'} conf ≥ 100% on ${algo.settings.strictUnlock ? `all ${activeSymbols.length} active symbols` : 'focused symbol'}`
                    : '🎉 All symbols unlocked!'}
                </p>
                {activeSymbols.length > 2 && (
                  <button 
                    className="reset-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to lock all symbols except the first two? This will reset your progress.')) {
                        algo.resetProgress();
                        setStats({ ...algo.getStats() });
                        setActiveSymbols(algo.getActiveSymbols());
                        setFocusedSymbol(algo.getFocusedSymbol());
                      }
                    }}
                  >
                    Reset Progress
                  </button>
                )}
              </aside>
            </div>
          </div>
        )}

        {mode === 'lessons' && (
          <div className="practice-content">
            <main>
              <div className="typing-area">
                {text.split('').map((char, idx) => {
                  let className = 'char ';
                  if (idx < cursorIdx) {
                    className += errors.has(idx) ? 'error ' : 'typed ';
                  }
                  if (idx === cursorIdx) className += 'cursor ';
                  return (
                    <span key={idx} className={className}>
                      {char === ' ' ? '\\u00A0' : char}
                    </span>
                  );
                })}
                {lessonStats.lastWpm > 0 && (
                  <div className="lesson-live-stats">
                    Last snippet: <strong>{lessonStats.lastWpm} WPM</strong> | <strong>{lessonStats.lastAccuracy}%</strong> acc
                  </div>
                )}
              </div>
              <Keyboard expectedChar={text[cursorIdx] || ''} />
            </main>
            <aside className="stats-dashboard">
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
            </aside>
          </div>
        )}

        {mode === 'settings' && ('''

start_idx = content.find('{mode === \'practice\' && (')
end_idx = content.find('{mode === \'settings\' ? (')
settings_end_idx = content.find('          </div>\n        ) : (')

if start_idx != -1 and end_idx != -1 and settings_end_idx != -1:
    new_content = content[:start_idx] + new_body + content[end_idx + len('{mode === \\'settings\\' ? ('):settings_end_idx] + '''          </div>
        )}
      </div>
    </div>
  );
};

export default App;
'''
    open('src/App.tsx', 'w', encoding='utf-8').write(new_content)
    print("Success")
else:
    print(f"Failed. {start_idx=} {end_idx=} {settings_end_idx=}")
