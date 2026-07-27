import React from 'react';
import './HandsIndicator.css';

interface HandsIndicatorProps {
  activeFingers: Set<string>;
}

export const HandsIndicator: React.FC<HandsIndicatorProps> = ({ activeFingers }) => {
  const isFingerActive = (fingerId: string) => activeFingers.has(fingerId);

  return (
    <div className="hands-indicator-wrapper">
      <svg viewBox="0 0 750 230" className="hands-svg">
        
        {/* LEFT HAND */}
        <g className="hand-group left-hand" transform="translate(180, 10)">
          {/* Palm */}
          <rect className="palm" x="10" y="130" width="103" height="70" rx="10" />
          <rect className="palm" x="91" y="150" width="53" height="50" rx="10" />
          
          {/* Fingers */}
          <rect className={`finger ${isFingerActive('L5') ? 'active' : ''}`} x="10" y="40" width="22" height="110" rx="11" />
          <rect className={`finger ${isFingerActive('L4') ? 'active' : ''}`} x="37" y="20" width="22" height="130" rx="11" />
          <rect className={`finger ${isFingerActive('L3') ? 'active' : ''}`} x="64" y="10" width="22" height="140" rx="11" />
          <rect className={`finger ${isFingerActive('L2') ? 'active' : ''}`} x="91" y="20" width="22" height="130" rx="11" />
          
          {/* Thumb */}
          <rect className={`finger ${isFingerActive('L1') ? 'active' : ''}`} x="122" y="75" width="22" height="95" rx="11" />
        </g>

        {/* RIGHT HAND */}
        <g className="hand-group right-hand" transform="translate(420, 10)">
          {/* Palm */}
          <rect className="palm" x="37" y="130" width="103" height="70" rx="10" />
          <rect className="palm" x="6" y="150" width="53" height="50" rx="10" />
          
          {/* Fingers */}
          <rect className={`finger ${isFingerActive('R1') ? 'active' : ''}`} x="6" y="75" width="22" height="95" rx="11" />
          <rect className={`finger ${isFingerActive('R2') ? 'active' : ''}`} x="37" y="20" width="22" height="130" rx="11" />
          <rect className={`finger ${isFingerActive('R3') ? 'active' : ''}`} x="64" y="10" width="22" height="140" rx="11" />
          <rect className={`finger ${isFingerActive('R4') ? 'active' : ''}`} x="91" y="20" width="22" height="130" rx="11" />
          <rect className={`finger ${isFingerActive('R5') ? 'active' : ''}`} x="118" y="40" width="22" height="110" rx="11" />
        </g>
      </svg>
    </div>
  );
};
