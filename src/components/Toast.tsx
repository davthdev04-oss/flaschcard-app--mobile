import React, { useEffect } from 'react';
import type { ToastProps } from '../types/types';

export default function Toast({ isOpen, message, onClose, duration = 3000 }: ToastProps) {
  // Automatically hides the toast after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div style={styles.toastContainer}>
      <p style={styles.text}>{message}</p>
    </div>
  );
}

const styles = {
  toastContainer: {
    position: 'fixed' as const,
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)', // Centers it horizontally
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 2000,
  },
  text: {
    margin: 0,
    fontSize: '14px',
  }
};
