export type KeyDef = {
  primary: string;
  secondary?: string;
  finger: string; // L5, L4, L3, L2, R2, R3, R4, R5, L1, R1
  id: string; // Unique ID for matching
  className?: string;
};

export const row1: KeyDef[] = [
  { primary: '`', secondary: '~', finger: 'L5', id: 'Backquote' },
  { primary: '1', secondary: '!', finger: 'L5', id: 'Digit1' },
  { primary: '2', secondary: '@', finger: 'L4', id: 'Digit2' },
  { primary: '3', secondary: '#', finger: 'L3', id: 'Digit3' },
  { primary: '4', secondary: '$', finger: 'L2', id: 'Digit4' },
  { primary: '5', secondary: '%', finger: 'L2', id: 'Digit5' },
  { primary: '6', secondary: '^', finger: 'R2', id: 'Digit6' },
  { primary: '7', secondary: '&', finger: 'R2', id: 'Digit7' },
  { primary: '8', secondary: '*', finger: 'R3', id: 'Digit8' },
  { primary: '9', secondary: '(', finger: 'R4', id: 'Digit9' },
  { primary: '0', secondary: ')', finger: 'R5', id: 'Digit0' },
  { primary: '-', secondary: '_', finger: 'R5', id: 'Minus' },
  { primary: '=', secondary: '+', finger: 'R5', id: 'Equal' },
  { primary: 'Backspace', finger: 'R5', id: 'Backspace', className: 'special-key backspace' },
];

export const row2: KeyDef[] = [
  { primary: 'Tab', finger: 'L5', id: 'Tab', className: 'special-key tab' },
  { primary: 'q', secondary: 'Q', finger: 'L5', id: 'KeyQ' },
  { primary: 'w', secondary: 'W', finger: 'L4', id: 'KeyW' },
  { primary: 'e', secondary: 'E', finger: 'L3', id: 'KeyE' },
  { primary: 'r', secondary: 'R', finger: 'L2', id: 'KeyR' },
  { primary: 't', secondary: 'T', finger: 'L2', id: 'KeyT' },
  { primary: 'y', secondary: 'Y', finger: 'R2', id: 'KeyY' },
  { primary: 'u', secondary: 'U', finger: 'R2', id: 'KeyU' },
  { primary: 'i', secondary: 'I', finger: 'R3', id: 'KeyI' },
  { primary: 'o', secondary: 'O', finger: 'R4', id: 'KeyO' },
  { primary: 'p', secondary: 'P', finger: 'R5', id: 'KeyP' },
  { primary: '[', secondary: '{', finger: 'R5', id: 'BracketLeft' },
  { primary: ']', secondary: '}', finger: 'R5', id: 'BracketRight' },
  { primary: '\\', secondary: '|', finger: 'R5', id: 'Backslash' },
];

export const row3: KeyDef[] = [
  { primary: 'Caps', finger: 'L5', id: 'CapsLock', className: 'special-key caps' },
  { primary: 'a', secondary: 'A', finger: 'L5', id: 'KeyA' },
  { primary: 's', secondary: 'S', finger: 'L4', id: 'KeyS' },
  { primary: 'd', secondary: 'D', finger: 'L3', id: 'KeyD' },
  { primary: 'f', secondary: 'F', finger: 'L2', id: 'KeyF', className: 'homing' },
  { primary: 'g', secondary: 'G', finger: 'L2', id: 'KeyG' },
  { primary: 'h', secondary: 'H', finger: 'R2', id: 'KeyH' },
  { primary: 'j', secondary: 'J', finger: 'R2', id: 'KeyJ', className: 'homing' },
  { primary: 'k', secondary: 'K', finger: 'R3', id: 'KeyK' },
  { primary: 'l', secondary: 'L', finger: 'R4', id: 'KeyL' },
  { primary: ';', secondary: ':', finger: 'R5', id: 'Semicolon' },
  { primary: "'", secondary: '"', finger: 'R5', id: 'Quote' },
  { primary: 'Enter', finger: 'R5', id: 'Enter', className: 'special-key enter' },
];

export const row4: KeyDef[] = [
  { primary: 'Shift', finger: 'L5', id: 'ShiftLeft', className: 'special-key shift-l' },
  { primary: 'z', secondary: 'Z', finger: 'L5', id: 'KeyZ' },
  { primary: 'x', secondary: 'X', finger: 'L4', id: 'KeyX' },
  { primary: 'c', secondary: 'C', finger: 'L3', id: 'KeyC' },
  { primary: 'v', secondary: 'V', finger: 'L2', id: 'KeyV' },
  { primary: 'b', secondary: 'B', finger: 'L2', id: 'KeyB' },
  { primary: 'n', secondary: 'N', finger: 'R2', id: 'KeyN' },
  { primary: 'm', secondary: 'M', finger: 'R2', id: 'KeyM' },
  { primary: ',', secondary: '<', finger: 'R3', id: 'Comma' },
  { primary: '.', secondary: '>', finger: 'R4', id: 'Period' },
  { primary: '/', secondary: '?', finger: 'R5', id: 'Slash' },
  { primary: 'Shift', finger: 'R5', id: 'ShiftRight', className: 'special-key shift-r' },
];

export const row5: KeyDef[] = [
  { primary: 'Space', finger: 'L1', id: 'Space', className: 'special-key space' },
];

export const allRows = [row1, row2, row3, row4, row5];

// Map a character to its required key ID and whether it needs shift
export const getKeyInfo = (char: string) => {
  if (char === ' ') return { id: 'Space', shift: false, finger: 'L1' };
  
  for (const row of allRows) {
    for (const key of row) {
      if (key.primary === char) {
        return { id: key.id, shift: false, finger: key.finger };
      }
      if (key.secondary === char) {
        return { id: key.id, shift: true, finger: key.finger };
      }
    }
  }
  return null;
};
