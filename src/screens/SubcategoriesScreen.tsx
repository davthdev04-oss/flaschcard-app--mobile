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
import { Category, Subcategory } from '../types/flashcard';

type RouteParams = {
  params: {
    categoryId: string;
  };
};

export function SubcategoriesScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const categoryId = route.params.categoryId;

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategory();
    fetchSubcategories();
  }, [categoryId]);

  const fetchCategory = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (!error) {
      setCategory(data);
    }
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (!error) {
      setSubcategories(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }

    if (editingSubcategory) {
      const { error } = await supabase
        .from('subcategories')
        .update({ name: name.trim() })
        .eq('id', editingSubcategory.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase
        .from('subcategories')
        .insert([{ category_id: categoryId, name: name.trim() }]);
      if (error) console.error(error);
    }

    setName('');
    setEditingSubcategory(null);
    setModalVisible(false);
    fetchSubcategories();
  };

  const handleDelete = (subcategory: Subcategory) => {
    Alert.alert(
      'Delete subcategory',
      `Delete "${subcategory.name}"? This will remove related flashcard sets.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('subcategories').delete().eq('id', subcategory.id);
            if (error) console.error(error);
            fetchSubcategories();
          },
        },
      ],
    );
  };

  const openEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setName(subcategory.name);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{category?.name ?? 'Subcategories'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchSubcategories}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No subcategories yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('FlashcardSets', { subcategoryId: item.id })}
          >
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
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
            <Text style={styles.modalTitle}>{editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Subcategory name"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancel]} onPress={() => {
                setModalVisible(false);
                setName('');
                setEditingSubcategory(null);
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
