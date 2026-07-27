import React from 'react';
import './MetricsDashboard.css';
import type { CharStats } from '../algo/KeybrAlgo';

interface DailyProgress {
  date: string;
  activeTimeMs: number;
  targetMinutes: number;
}

interface MetricsDashboardProps {
  globalStats: { wpm: number; accuracy: number; score: number, lessonStreaks: { level: number, length: number }[] };
  focusedSymbol: string;
  focusedStats: CharStats;
  dailyProgress: DailyProgress;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  globalStats,
  focusedSymbol,
  focusedStats,
  dailyProgress,
}) => {
  const formatWpm = (wpm: number) => (wpm > 0 ? wpm.toFixed(1) : '0.0');
  
  const currentWpm = focusedStats.timeToType ? (60000 / focusedStats.timeToType) / 5 : 0;
  const topWpm = focusedStats.bestTimeToType ? (60000 / focusedStats.bestTimeToType) / 5 : 0;

  const progressPercent = Math.min(100, (dailyProgress.activeTimeMs / (dailyProgress.targetMinutes * 60000)) * 100);

  return (
    <div className="metrics-dashboard">
      <div className="metric-row">
        <span className="metric-label">Metrics:</span>
        <div className="metric-values">
          <span className="metric-item">
            Speed: <span className="metric-val">{formatWpm(globalStats.wpm)}wpm</span>
          </span>
          <span className="metric-item">
            Accuracy: <span className="metric-val">{globalStats.accuracy.toFixed(2)}%</span>
          </span>
        </div>
      </div>

      <div className="metric-row">
        <span className="metric-label">Current key:</span>
        <div className="metric-values">
          <div className="current-key-box">{focusedSymbol}</div>
          <span className="metric-item">
            Last speed: <span className="metric-val">{formatWpm(currentWpm)}wpm</span>
          </span>
          <span className="metric-item">
            Top speed: <span className="metric-val">{formatWpm(topWpm)}wpm</span>
          </span>
        </div>
      </div>

      <div className="metric-row">
        <span className="metric-label">Accuracy:</span>
        <div className="metric-values">
          <span className="metric-val text-muted">
            {globalStats.lessonStreaks.some(s => s.length > 0)
              ? globalStats.lessonStreaks
                  .filter(s => s.length > 0)
                  .map(s => (
                    <span key={s.level}>
                      {s.length === 1 ? 'One lesson' : `${s.length} lessons`} with <span className="metric-val">{Math.round(s.level * 100)}%</span> accuracy.
                    </span>
                  ))
                  .reduce((prev, curr) => [prev, ' ', curr] as any)
              : 'No accuracy streaks.'
            }
          </span>
        </div>
      </div>

      <div className="metric-row">
        <span className="metric-label">Daily goal:</span>
        <div className="metric-values daily-goal-row">
          <span className="metric-val text-muted">
            {Math.floor(progressPercent)}% / {dailyProgress.targetMinutes} minutes
          </span>
          <div className="dashboard-progress-track">
            <div 
              className="dashboard-progress-fill" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
