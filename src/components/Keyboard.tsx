import React from 'react';
import { allRows, getKeyInfo } from '../utils/keyboardLayout';
import type { KeyDef } from '../utils/keyboardLayout';
import './Keyboard.css';

interface KeyboardProps {
  expectedChar: string;
}

export const Keyboard: React.FC<KeyboardProps> = ({ expectedChar }) => {
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

  const isFingerActive = (fingerId: string) => activeFingers.has(fingerId);

  return (
    <div className="keyboard-container">
      <div className="keyboard">
        {allRows.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
      
      <div className="hands-container">
        {/* Left Hand */}
        <div className="hand left">
          <div className={`finger finger-5 left ${isFingerActive('L5') ? 'active' : ''}`} />
          <div className={`finger finger-4 left ${isFingerActive('L4') ? 'active' : ''}`} />
          <div className={`finger finger-3 left ${isFingerActive('L3') ? 'active' : ''}`} />
          <div className={`finger finger-2 left ${isFingerActive('L2') ? 'active' : ''}`} />
          <div className={`finger finger-1 left ${isFingerActive('L1') ? 'active' : ''}`} />
        </div>
        
        {/* Right Hand */}
        <div className="hand right">
          <div className={`finger finger-5 right ${isFingerActive('R5') ? 'active' : ''}`} />
          <div className={`finger finger-4 right ${isFingerActive('R4') ? 'active' : ''}`} />
          <div className={`finger finger-3 right ${isFingerActive('R3') ? 'active' : ''}`} />
          <div className={`finger finger-2 right ${isFingerActive('R2') ? 'active' : ''}`} />
          <div className={`finger finger-1 right ${isFingerActive('R1') ? 'active' : ''}`} />
        </div>
      </div>
    </div>
  );
};
