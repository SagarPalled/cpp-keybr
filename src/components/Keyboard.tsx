import React from 'react';
import { allRows, getKeyInfo } from '../utils/keyboardLayout';
import type { KeyDef } from '../utils/keyboardLayout';
import './Keyboard.css';
import { HandsIndicator } from './HandsIndicator';

interface KeyboardProps {
  expectedChar: string;
  paused?: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({ expectedChar, paused }) => {
  const keyInfo = getKeyInfo(expectedChar);
  
  const activeKeys = new Set<string>();
  const activeFingers = new Set<string>();

  if (keyInfo) {
    activeKeys.add(keyInfo.id);
    activeFingers.add(keyInfo.finger);
    
    // Strict opposite-hand shift logic
    if (keyInfo.shift) {
      const isRightHand = keyInfo.finger.startsWith('R');
      if (isRightHand) {
        activeKeys.add('ShiftLeft');
        activeFingers.add('L5');
      } else {
        activeKeys.add('ShiftRight');
        activeFingers.add('R5');
      }
    }
  }

  const renderKey = (key: KeyDef) => {
    const isActive = activeKeys.has(key.id);
    const classes = ['key', key.className || '', isActive ? 'active' : ''].filter(Boolean).join(' ');
    
    return (
      <div key={key.id} className={classes} data-finger={key.finger}>
        {key.secondary && <span className="label-secondary">{key.secondary}</span>}
        <span className="label-primary">{key.primary}</span>
      </div>
    );
  };

  return (
    <div className={`keyboard-container ${paused ? 'paused' : ''}`}>
      <div className="keyboard">
        {allRows.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
      
      <HandsIndicator activeFingers={activeFingers} />
    </div>
  );
};
