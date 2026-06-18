import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { FlashcardSet, Subcategory, Category } from '../types/flashcard';

type RouteParams = {
  params: {
    subcategoryId: string;
  };
};

export function FlashcardSetsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const subcategoryId = route.params.subcategoryId;

  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchSubcategory();
    fetchSets();
  }, [subcategoryId]);

  const fetchSubcategory = async () => {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*, categories(*)')
      .eq('id', subcategoryId)
      .single();

    if (!error) {
      setSubcategory(data);
      setCategory((data as any).categories);
    }
  };

  const fetchSets = async () => {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('name', { ascending: true });

    if (!error) {
      setSets(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Set name is required.');
      return;
    }

    if (editingSet) {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ name: name.trim(), description: description.trim() || null })
        .eq('id', editingSet.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('flashcard_sets').insert([
        { subcategory_id: subcategoryId, name: name.trim(), description: description.trim() || null },
      ]);
      if (error) console.error(error);
    }

    setName('');
    setDescription('');
    setEditingSet(null);
    setModalVisible(false);
    fetchSets();
  };

  const handleDelete = (item: FlashcardSet) => {
    Alert.alert(
      'Delete flashcard set',
      `Delete "${item.name}"? This will remove all cards in the set.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('flashcard_sets').delete().eq('id', item.id);
            if (error) console.error(error);
            fetchSets();
          },
        },
      ],
    );
  };

  const openEdit = (item: FlashcardSet) => {
    setEditingSet(item);
    setName(item.name);
    setDescription(item.description ?? '');
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{subcategory?.name ?? 'Sets'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchSets}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No sets yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SetDetail', { setId: item.id })}
          >
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.description ? <Text style={styles.cardSubtitle}>{item.description}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              <Pressable style={styles.smallButton} onPress={() => openEdit(item)}>
                <Text style={styles.smallButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={[styles.smallButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                <Text style={[styles.smallButtonText, styles.deleteText]}>Delete</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingSet ? 'Edit Set' : 'New Set'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Set name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancel]} onPress={() => {
                setModalVisible(false);
                setName('');
                setDescription('');
                setEditingSet(null);
              }}>
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.save]} onPress={handleSubmit}>
                <Text style={[styles.actionText, styles.saveText]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  back: {
    color: '#2563eb',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
  },
  addButtonText: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    marginTop: 6,
    color: '#64748b',
  },
  cardActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  deleteButton: {
    backgroundColor: '#fecaca',
  },
  smallButtonText: {
    color: '#0f172a',
    fontWeight: '600',
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
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: '#e2e8f0',
    marginRight: 10,
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
