import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { Flashcard, FlashcardFormData, Difficulty, HintLanguage } from '../types/flashcard';

interface LibraryScreenProps {
  setId: string;
}

export function LibraryScreen({ setId }: LibraryScreenProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [formData, setFormData] = useState<FlashcardFormData>({
    question: '',
    answer: '',
    tags: '',
    difficulty: '',
    hint_code: '',
    hint_language: 'typescript',
    hint_text: '',
    notes: '',
  });

  useEffect(() => {
    fetchFlashcards();
  }, [setId]);

  const fetchFlashcards = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('set_id', setId)
      .order('created_at', { ascending: false });

    if (!error) {
      setFlashcards(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      Alert.alert('Validation', 'Question and answer are required.');
      return;
    }

    const tagsArray = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : null;

    const cardData = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      tags: tagsArray,
      difficulty: formData.difficulty || null,
      hint_code: formData.hint_code || null,
      hint_language: formData.hint_code ? formData.hint_language : null,
      hint_text: formData.hint_text || null,
      notes: formData.notes || null,
      set_id: setId,
    };

    if (editingCard) {
      const { error } = await supabase.from('flashcards').update(cardData).eq('id', editingCard.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('flashcards').insert([cardData]);
      if (error) console.error(error);
    }

    resetForm();
    fetchFlashcards();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete flashcard', 'Delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('flashcards').delete().eq('id', id);
          if (error) console.error(error);
          fetchFlashcards();
        },
      },
    ]);
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      answer: card.answer,
      tags: card.tags?.join(', ') || '',
      difficulty: card.difficulty || '',
      hint_code: card.hint_code || '',
      hint_language: card.hint_language || 'typescript',
      hint_text: card.hint_text || '',
      notes: card.notes || '',
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      tags: '',
      difficulty: '',
      hint_code: '',
      hint_language: 'typescript',
      hint_text: '',
      notes: '',
    });
    setEditingCard(null);
    setModalVisible(false);
  };

  const handleBulkImport = async () => {
    const lines = bulkImportText.trim().split('\n');
    const cardsToInsert = lines
      .map((line) => {
        const parts = line.split('|');
        if (parts.length < 2) return null;

        const [front, back, difficulty, tags, notes, hintCode] = parts;
        return {
          question: front.trim(),
          answer: back.trim(),
          difficulty: difficulty?.trim() || null,
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : null,
          notes: notes?.trim() || null,
          hint_code: hintCode?.trim() || null,
          hint_language: hintCode?.trim() ? 'typescript' : null,
          hint_text: null,
          set_id: setId,
        };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

    if (cardsToInsert.length === 0) {
      Alert.alert('Import', 'No valid cards found.');
      return;
    }

    const { error } = await supabase.from('flashcards').insert(cardsToInsert);
    if (error) {
      console.error(error);
      Alert.alert('Import error', 'Something went wrong during import.');
      return;
    }

    Alert.alert('Import complete', `Added ${cardsToInsert.length} cards.`);
    setBulkImportText('');
    setShowBulkImport(false);
    fetchFlashcards();
  };

  return (
    <RNSafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Cards</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowBulkImport(true)}>
            <Text style={styles.headerButtonText}>Bulk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.headerButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchFlashcards}
        ListEmptyComponent={<Text style={styles.empty}>No flashcards yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.question}</Text>
              <View style={styles.cardControls}>
                <Pressable style={styles.smallButton} onPress={() => handleEdit(item)}>
                  <Text style={styles.smallButtonText}>Edit</Text>
                </Pressable>
                <Pressable style={[styles.smallButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
                  <Text style={[styles.smallButtonText, styles.deleteText]}>Del</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.cardText}>{item.answer}</Text>
            {item.tags?.length ? <Text style={styles.cardMeta}>Tags: {item.tags.join(', ')}</Text> : null}
            {item.difficulty ? <Text style={styles.cardMeta}>Difficulty: {item.difficulty}</Text> : null}
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingCard ? 'Edit Flashcard' : 'Add Flashcard'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Question"
                value={formData.question}
                onChangeText={(text) => setFormData({ ...formData, question: text })}
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Answer"
                value={formData.answer}
                onChangeText={(text) => setFormData({ ...formData, answer: text })}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Tags (comma-separated)"
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Difficulty (easy / medium / hard)"
                value={formData.difficulty}
                onChangeText={(text) => setFormData({ ...formData, difficulty: text as Difficulty | '' })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Hint code"
                value={formData.hint_code}
                onChangeText={(text) => setFormData({ ...formData, hint_code: text })}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Hint language"
                value={formData.hint_language}
                onChangeText={(text) => setFormData({ ...formData, hint_language: text as HintLanguage })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Hint text"
                value={formData.hint_text}
                onChangeText={(text) => setFormData({ ...formData, hint_text: text })}
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
              <View style={styles.modalActions}>
                <Pressable style={[styles.actionButton, styles.cancel]} onPress={resetForm}>
                  <Text style={styles.actionText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.actionButton, styles.save]} onPress={handleSubmit}>
                  <Text style={[styles.actionText, styles.saveText]}>Save</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showBulkImport} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bulk Import</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Front|Back|Difficulty|Tags|Notes|HintCode"
              value={bulkImportText}
              onChangeText={setBulkImportText}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancel]} onPress={() => setShowBulkImport(false)}>
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.save]} onPress={handleBulkImport}>
                <Text style={[styles.actionText, styles.saveText]}>Import</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  headerButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardText: {
    marginTop: 10,
    color: '#475569',
  },
  cardMeta: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
  },
  cardControls: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  deleteButton: {
    backgroundColor: '#fecaca',
  },
  smallButtonText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  deleteText: {
    color: '#b91c1c',
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: '#64748b',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#e2e8f0',
  },
  save: {
    backgroundColor: '#2563eb',
  },
  actionText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  saveText: {
    color: '#ffffff',
  },
});
