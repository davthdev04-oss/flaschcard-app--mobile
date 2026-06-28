import React from 'react';

// 1. For AppModal.tsx
export interface AppModalProp {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// 2. For ConfirmModal.tsx
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
}

// 3. For BottomSheet.tsx
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// 4. For Toast.tsx
export interface ToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  duration?: number; // The "?" means this is optional! It defaults to 3000ms if not provided
}
