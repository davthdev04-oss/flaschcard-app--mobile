import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { supabase } from "../lib/supabase";
import { Category } from "../types/flashcard";

import CategoryCard from "./CategoryCard";

import AppModal from "../components/UI/AppModal";
import ConfirmModal from "../components/UI/ConfirmModal";
import BottomSheet from "../components/UI/BottomSheet";
import Toast from "../components/UI/Toast";

type ActiveOverlay =
  | "manageCategory"
  | "sort"
  | "deleteConfirm"
  | null;

export function CategoriesScreen() {
  const navigation = useNavigation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeOverlay, setActiveOverlay] =
    useState<ActiveOverlay>(null);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");

  const [subCatCounts, setSubCatCounts] =
    useState<Record<string, number>>({});

  const [activeCount, setActiveCount] = useState(0);

  const [archivedCount, setArchivedCount] = useState(0);

  const [selectedTab, setSelectedTab] = useState<"active" | "archived">("active");

  const [search, setSearch] = useState("");

  const [sort, setSort] =
    useState<"az" | "za" | "newest">("az");

  // Controls the BottomSheet
  const [isOpen, setIsOpen] = useState(false);

  const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState("");

const [showMenu, setShowMenu] = useState(false); 


useEffect(() => {
  fetchCategories();
}, [sort]);

useEffect(() => {
  fetchSubCat();
}, []);

const fetchCategories = async () => {
  setLoading(true);

  const orderColumn =
    sort === "newest" ? "created_at" : "name";

  const ascending =
    sort === "az";

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order(orderColumn, {
      ascending:
        sort === "newest" ? false : ascending,
    });

  if (error) {
    console.error(error);
    setLoading(false);
    return;
  }

  const { count: active } = await supabase
  .from("categories")
  .select("*", { count: "exact", head: true })
  .eq("is_archived", false);

const { count: archived } = await supabase
  .from("categories")
  .select("*", { count: "exact", head: true })
  .eq("is_archived", true);


setActiveCount(active ?? 0);
setArchivedCount(archived ?? 0);

  setCategories(data || []);
  setLoading(false);
};


const fetchSubCat = async () => {
  const { data, error } = await supabase
    .from("subcategories")
    .select("category_id");

  if (error) {
    console.error(error);
    return;
  }

  const counts: Record<string, number> = {};

  data?.forEach((subcategory) => {
    counts[subcategory.category_id] =
      (counts[subcategory.category_id] || 0) + 1;
  });

  setSubCatCounts(counts);
};

const closeOverlays = () => {
  setActiveOverlay(null);
  setEditingCategory(null);
  setName("");
  
};

const handleSubmit = async () => {
  
  if (!name.trim()) {
    Alert.alert(
      "Validation",
      "Category name is required."
    );
    return;
  }
  const categoryName = name.trim();

  if (editingCategory) {
    const { error } = await supabase
      .from("categories")
      .update({ name: name.trim() })
      .eq("id", editingCategory.id);

    if (error) {
      console.error(error);
      return;
    }

    
  } else {
    const { error } = await supabase
      .from("categories")
      .insert([{ name: name.trim() }]);

    if (error) {
      console.error(error);
      return;
    }

    
  }

  setToastMessage(`Category ${name.trim()} created!`);
  setShowToast(true);

  closeOverlays();
  fetchCategories();
};


const runDelete = async () => {
  if (!editingCategory) return;

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", editingCategory.id);

  if (error) {
    console.error(error);
    return;
  }



  closeOverlays();
  fetchCategories();
  setToastMessage(`${editingCategory.name} deleted`);
  setShowToast(true);
};

const openEdit = (category: Category) => {
  setEditingCategory(category);
  setName(category.name);
  setActiveOverlay("manageCategory");
};

const filteredCategories = categories.filter((category) => {
  const matchesSearch = category.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesTab =
    selectedTab === "active"
      ? !category.is_archived
      : category.is_archived;

  return matchesSearch && matchesTab;
});

const showToastMessage = (message: string) => {
  setToastMessage(message);
  setShowToast(true);
};

const archiveCategory = async (id: string) => {
  await supabase
    .from("categories")
    .update({ is_archived: true })
    .eq("id", id);

  fetchCategories();
};

const restoreCategory = async (id: string) => {
  await supabase
    .from("categories")
    .update({ is_archived: false })
    .eq("id", id);

  fetchCategories();
};

  return (
  <RNSafeAreaView style={styles.page}>

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.title}>Library</Text>
    </View>

   <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
  <View style={styles.editButton}>
    <Text
    >{showMenu? "Done" : "Edit"}</Text>
  </View>
</TouchableOpacity>
 
    {/* Search + Sort */}
    <View style={styles.search_order}>
      <TextInput
        style={styles.textInput}
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setActiveOverlay("sort")}
      >
        <Ionicons
          name="filter-outline"
          size={18}
          color="#0f172a"
          style={styles.sortButtonIcon}
        />

        <Text style={styles.sortButtonText}>
          {sort === "az"
            ? "A-Z"
            : sort === "za"
            ? "Z-A"
            : "Newest"}
        </Text>
      </TouchableOpacity>
    </View>

    {/* Sort Modal */}
    <BottomSheet
      visible={activeOverlay === "sort"}
      onClose={closeOverlays}
    >
      <Text style={styles.modalTitle}>
        Sort Categories
      </Text>

      {(["az", "za", "newest"] as const).map((option) => (
        <Pressable
          key={option}
          style={[
            styles.sortOptionItem,
            sort === option &&
              styles.sortOptionSelected,
          ]}
          onPress={() => {
            setSort(option);
            closeOverlays();
          }}
        >
          <Text style={styles.sortOptionText}>
            {option === "az"
              ? "A-Z"
              : option === "za"
              ? "Z-A"
              : "Newest"}
          </Text>
        </Pressable>
      ))}
    </BottomSheet>

    {/* Add / Edit Category */}
    <BottomSheet
      visible={activeOverlay === "manageCategory"}
      onClose={closeOverlays}
    >
      <Text style={styles.modalTitle}>
        {editingCategory
          ? "Edit Category"
          : "New Category"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Category name"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.modalActions}>

        <Pressable
          style={[
            styles.actionButton,
            styles.save,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.saveText}>
            Save
          </Text>
        </Pressable>

        {editingCategory && (
  editingCategory.is_archived ? (
    <Pressable
      style={styles.archiveButton}
      onPress={() => {
        restoreCategory(editingCategory.id);
        closeOverlays();
      }}
    >
      <Text style={styles.archiveButtonText}>
        Restore 
      </Text>
    </Pressable>
  ) : (
    <Pressable
      style={styles.archiveButton}
      onPress={() => {
        archiveCategory(editingCategory.id);
        closeOverlays();
      }}
    >
      <Text style={styles.archiveButtonText}>
        Archive({archivedCount})
      </Text>
    </Pressable>
  )
)}
        {editingCategory && (
          <Pressable
            style={styles.deleteButton}
            onPress={() =>
              setActiveOverlay("deleteConfirm")
            }
          >
            <Text style={styles.deleteButtonText}>
              Delete
            </Text>
          </Pressable>
        )}

      </View>
    </BottomSheet>

    {/* Delete Confirmation */}
    <ConfirmModal
      isOpen={
        activeOverlay === "deleteConfirm"
      }
      categoryName={
        editingCategory?.name || ""
      }
      onClose={() =>
        setActiveOverlay("manageCategory")
      }
      onConfirm={runDelete}
    />

    <Toast
  isOpen={showToast}
  message={toastMessage}
  onClose={() => setShowToast(false)}
/>

<View style={styles.tabContainer}>
  <Pressable
    style={[
      styles.tab,
      selectedTab === "active" && styles.activeTab,
    ]}
    onPress={() => setSelectedTab("active")}
  >
    <Text
      style={[
        styles.tabText,
        selectedTab === "active" && styles.activeTabText,
      ]}
    >
      Active ({activeCount})
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.tab,
      selectedTab === "archived" && styles.activeTab,
    ]}
    onPress={() => setSelectedTab("archived")}
  >
    <Text
      style={[
        styles.tabText,
        selectedTab === "archived" && styles.activeTabText,
      ]}
    >
      Archived ({archivedCount})
    </Text>
  </Pressable>
</View>

    {/* Categories */}
    <FlatList
  key={selectedTab}
  data={filteredCategories}
  numColumns={selectedTab === "active" ? 2 : 1}
  keyExtractor={(item) => item.id}
  refreshing={loading}
  onRefresh={fetchCategories}
  columnWrapperStyle={
    selectedTab === "active"
      ? {
          justifyContent: "space-between",
          marginBottom: 8,
        }
      : undefined
  }
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.empty}>
          No categories yet.
        </Text>
      }
      renderItem={({ item }) => (
        <CategoryCard
  category={item}
  showMenu={showMenu}
  layout={selectedTab === "active" ? "grid" : "list"}
  onPress={() =>
    navigation.navigate("Subcategories", {
      categoryId: item.id,
    })
  }
  onEdit={() => openEdit(item)}
  onArchive={() => archiveCategory(item.id)}
/>
      )}
    />

    {/* Floating Add Button */}
    <Pressable
      style={styles.fab}
      onPress={() =>
        setActiveOverlay("manageCategory")
      }
    >
      <Ionicons
        name="add-circle"
        size={64}
        color="#8B5CF6"
      />
    </Pressable>

    {/* Bottom Sheet */}
    <BottomSheet
      visible={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Text>Bottom Sheet</Text>
    </BottomSheet>

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
   fab: {
    position: "absolute",
    bottom: 50,
    right: 20,

    // Makes it appear above everything else
    zIndex: 100,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Android shadow
    elevation: 8,
  },

  editButton:{
    flexDirection:"row",
    justifyContent: "flex-end",
    marginRight: 25,
    marginBottom:12,
  },

    archived:{
    justifyContent:"center",
    borderWidth:1,
    borderRadius:10,
    borderColor:"lightgrey",
    paddingHorizontal:50,
    },

  tabContainer: {
  flexDirection: "row",
  backgroundColor: '#f8fafc',
  borderRadius: 14,
  padding: 4,
  marginHorizontal: 16,
  marginBottom: 16,
  gap: 12
},

tab: {
  flex: 1,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  backgroundColor: "#FFF",
},

activeTab: {
  backgroundColor: "#8B5CF6",
  borderColor: "#8B5CF6",
},

tabText: {
  color: "#6B7280",
  fontWeight: "600",
},

activeTabText: {
  color: "#FFF",
},

})
