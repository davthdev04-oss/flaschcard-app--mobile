import React from 'react';
import type { BottomSheetProps } from '../types/types';

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* Slides up from bottom */}
      <div style={styles.sheetBox} onClick={(e) => e.stopPropagation()}>
        {/* Subtle drag-handle bar at the top */}
        <div style={styles.handle} />
        
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'flex-end', // Aligns box to bottom
    zIndex: 1000,
  },
  sheetBox: {
    backgroundColor: '#fff',
    width: '100%',
    padding: '16px 24px 40px 24px', // Extra padding on bottom for mobile screens
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
  },
  handle: {
    width: '40px',
    height: '5px',
    backgroundColor: '#ddd',
    borderRadius: '3px',
    margin: '0 auto 16px auto',
  }
};
