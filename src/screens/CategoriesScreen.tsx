import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Category } from '../types/flashcard';
import CategoryCard from './CategoryCard';
import AddButton from '../components/AdddButton';

// Import our custom Modal architecture
import AppModal from '../components/AppModal';
import ConfirmModal from '../components/ConfirmModal';

// Unified Overlay Type State Manager
type ActiveOverlay = 'manageCategory' | 'sort' | 'deleteConfirm' | null;

export function CategoriesScreen() {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Single controller state for ALL screen menus
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [subCatCounts, setSubCatCounts] = useState<Record<string, number>>({});
  const [flashCardCount, setFlashCardCount] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<'az' | 'za' | 'newest'>('az');

  useEffect(() => {
    fetchCategories();
  }, [sort]);

  useEffect(() => {
    fetchSubCat();
  }, []);

  const fetchCategories = async () => {
    const orderColumn = sort === 'newest' ? 'created_at' : 'name';
    const orderOptions = sort === 'za' ? { ascending: false } : { ascending: sort !== 'newest' };

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order(orderColumn, orderOptions);

    if (error) {
      console.error(error);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  };

  const fetchSubCat = async () => {
    const { data, error } = await supabase.from('subcategories').select('category_id');
    if (error) {
      console.error(error);
      return;
    }
    const counts: Record<string, number> = {};
    data?.forEach((subcat) => {
      counts[subcat.category_id] = (counts[subcat.category_id] || 0) + 1;
    });
    setSubCatCounts(counts);
  };

  const closeOverlays = () => {
    setActiveOverlay(null);
    setName('');
    setEditingCategory(null);
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
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from('categories').insert([{ name: name.trim() }]);
      if (error) console.error(error);
    }

    closeOverlays();
    fetchCategories();
  };

  const runDelete = async () => {
    if (!editingCategory) return;
    const { error } = await supabase.from('categories').delete().eq('id', editingCategory.id);
    if (error) console.error(error);
    closeOverlays();
    fetchCategories();
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setActiveOverlay('manageCategory');
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <RNSafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <AddButton title="Add" onPress={() => setActiveOverlay('manageCategory')} />
      </View>

      <View style={styles.search_order}>
        <TextInput
          style={styles.textInput}
          placeholder='Search'
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.sortButton} onPress={() => setActiveOverlay('sort')}>
          <Ionicons name="filter-outline" size={18} color="#0f172a" style={styles.sortButtonIcon} />
          <Text style={styles.sortButtonText}>
            {sort === 'az' ? 'A-Z' : sort === 'za' ? 'Z-A' : 'Newest'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. REFACTORED SORT OVERLAY */}
      <AppModal isOpen={activeOverlay === 'sort'} onClose={closeOverlays}>
        <Text style={styles.modalTitle}>Sort categories</Text>
        {(['az', 'za', 'newest'] as const).map((option) => (
          <Pressable
            key={option}
            style={[styles.sortOptionItem, sort === option && styles.sortOptionSelected]}
            onPress={() => {
              setSort(option);
              closeOverlays();
            }}
          >
            <Text style={styles.sortOptionText}>
              {option === 'az' ? 'A-Z' : option === 'za' ? 'Z-A' : 'Newest'}
            </Text>
          </Pressable>
        ))}
      </AppModal>

      {/* 2. REFACTORED ADD / EDIT OVERLAY */}
      <AppModal isOpen={activeOverlay === 'manageCategory'} onClose={closeOverlays}>
        <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'New Category'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Category name"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.modalActions}>
          <Pressable style={[styles.actionButton, styles.save]} onPress={handleSubmit}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
          {editingCategory && (
            <Pressable 
              style={styles.deleteButton} 
              onPress={() => setActiveOverlay('deleteConfirm')}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </AppModal>

      {/* 3. NEW CUSTOM IN-APP DELETION CONFIRMATION */}
      <ConfirmModal
        isOpen={activeOverlay === 'deleteConfirm'}
        categoryName={editingCategory?.name || ''}
        onClose={() => setActiveOverlay('manageCategory')} // Jumps back to edit if canceled
        onConfirm={runDelete}
      />

      <FlatList
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 8 }}
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchCategories}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No categories yet.</Text>}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            subcategoryCount={subCatCounts[item.id] || 0}
            flashcardCount={flashCardCount[item.id] || 0}
            onPress={() => navigation.navigate("Subcategories", { categoryId: item.id })}
            onEdit={() => openEdit(item)}
          />
        )}
      />
    </RNSafeAreaView>
  );
}

// Keep your existing styles down here unchanged...
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 35, fontWeight: '700', color: '#0f172a' },
  search_order: { flexDirection: 'row', padding: 10, gap: 10 },
  textInput: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  sortButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  sortButtonIcon: { marginRight: 4 },
  sortButtonText: { fontSize: 14, fontWeight: '600' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#0f172a' },
  sortOptionItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sortOptionSelected: { backgroundColor: '#f8fafc' },
  sortOptionText: { fontSize: 16, color: '#334155' },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  save: { backgroundColor: '#1890ff' },
  saveText: { color: '#fff', fontWeight: '600' },
  deleteButton: { padding: 14, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: '#ef4444', fontWeight: '600' },
  list: { padding: 10 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
});
