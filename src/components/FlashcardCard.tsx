import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flashcard as FlashcardType } from '../types/flashcard';

interface FlashcardCardProps {
  card: FlashcardType;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  total?: number;
}

export function FlashcardCard({ card, onNext, onPrevious, currentIndex, total }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  return (
    <View style={styles.container}>
      {currentIndex !== undefined && total !== undefined && (
        <Text style={styles.progress}>Card {currentIndex + 1} / {total}</Text>
      )}

      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={toggleFlip}>
        <Text style={styles.cardText}>{isFlipped ? card.answer : card.question}</Text>
      </TouchableOpacity>

      {(card.hint_text || card.hint_code) && (
        <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint(true)}>
          <Text style={styles.hintButtonText}>Show Hint</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        {onPrevious && (
          <Pressable style={styles.actionButton} onPress={onPrevious}>
            <Text style={styles.actionText}>Previous</Text>
          </Pressable>
        )}
        {onNext && (
          <Pressable style={[styles.actionButton, styles.nextButton]} onPress={onNext}>
            <Text style={[styles.actionText, styles.nextText]}>Next</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={showHint} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hint</Text>
            {card.hint_text ? <Text style={styles.modalText}>{card.hint_text}</Text> : null}
            {card.hint_code ? <Text style={styles.codeBlock}>{card.hint_code}</Text> : null}
            <Pressable style={styles.closeButton} onPress={() => setShowHint(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  progress: {
    color: '#4b5563',
    fontSize: 14,
  },
  card: {
    width: '100%',
    minHeight: 220,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardText: {
    color: '#111827',
    fontSize: 18,
    lineHeight: 26,
  },
  hintButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#fbbf24',
  },
  hintButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#2563eb',
  },
  actionText: {
    color: '#111827',
    fontWeight: '600',
  },
  nextText: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    color: '#374151',
    fontSize: 16,
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    fontFamily: 'Menlo',
    color: '#111827',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  closeText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
