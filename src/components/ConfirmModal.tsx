import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AppModal from './AppModal';
import { ConfirmModalProps } from '../types/types';

export default function ConfirmModal({ isOpen, onClose, onConfirm, categoryName }: ConfirmModalProps) {
  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <Text style={styles.modalTitle}>Delete category</Text>
      <Text style={styles.modalText}>
        Are you sure you want to delete "{categoryName}"? This action removes related subcategories and sets permanently.
      </Text>
      
      <div style={styles.modalActions}>
        <Pressable style={[styles.actionButton, styles.cancel]} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.delete]} onPress={onConfirm}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </div>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: '#f1f5f9',
  },
  delete: {
    backgroundColor: '#ef4444',
  },
  cancelText: {
    fontWeight: '600',
    color: '#334155',
  },
  deleteText: {
    fontWeight: '600',
    color: '#ffffff',
  },
});
