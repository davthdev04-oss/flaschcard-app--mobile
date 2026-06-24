import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Category, FlashcardSet, Subcategory } from '../types/flashcard';
import { LibraryScreen } from './LibraryScreen';
import { StudyScreen } from './StudyScreen';

type RouteParams = {
  params: {
    setId: string;
  };
};

export function SetDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const setId = route.params.setId;
  const [activeTab, setActiveTab] = useState<'study' | 'manage'>('study');
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSetDetails();
  }, [setId]);

  const fetchSetDetails = async () => {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*, subcategories(*, categories(*))')
      .eq('id', setId)
      .single();

    if (!error) {
      setFlashcardSet(data);
      setSubcategory((data as any).subcategories);
      setCategory((data as any).subcategories?.categories);
    }
    setLoading(false);
  };

  return (
    <RNSafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{flashcardSet?.name ?? 'Set Detail'}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.breadcrumbs}>
        <Text style={styles.crumb} onPress={() => navigation.navigate('Categories')}>
          Categories
        </Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.crumb} onPress={() => navigation.navigate('Subcategories', { categoryId: category?.id })}>
          {category?.name}
        </Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.current}>{subcategory?.name}</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, activeTab === 'study' && styles.activeTab]}
          onPress={() => setActiveTab('study')}
        >
          <Text style={[styles.tabText, activeTab === 'study' && styles.activeTabText]}>Study</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>Manage Cards</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {activeTab === 'study' ? <StudyScreen setId={setId} /> : <LibraryScreen setId={setId} />}
      </View>
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
  back: {
    color: '#2563eb',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  crumb: {
    color: '#2563eb',
  },
  separator: {
    color: '#64748b',
  },
  current: {
    color: '#0f172a',
  },
  tabRow: {
    flexDirection: 'row',
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    color: '#475569',
    fontWeight: '700',
  },
  activeTabText: {
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
});
