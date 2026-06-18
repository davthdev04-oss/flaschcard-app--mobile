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
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Category } from '../types/flashcard';

export function CategoriesScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Category name is required.');
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({ name: name.trim() })
        .eq('id', editingCategory.id);
      if (error) {
        console.error(error);
      }
    } else {
      const { error } = await supabase.from('categories').insert([{ name: name.trim() }]);
      if (error) {
        console.error(error);
      }
    }

    setName('');
    setEditingCategory(null);
    setModalVisible(false);
    fetchCategories();
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete category',
      `Delete "${category.name}"? This will remove related subcategories and sets.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('categories').delete().eq('id', category.id);
            if (error) console.error(error);
            fetchCategories();
          },
        },
      ],
    );
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchCategories}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No categories yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Subcategories', { categoryId: item.id })}
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
            <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'New Category'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              value={name}
              onChangeText={setName}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancel]} onPress={() => {
                setModalVisible(false);
                setName('');
                setEditingCategory(null);
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
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
