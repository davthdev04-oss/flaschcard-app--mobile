import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Flashcard as FlashcardType, Difficulty } from '../types/flashcard';
import { FlashcardCard } from '../components/FlashcardCard';

interface StudyScreenProps {
  setId: string;
}

export function StudyScreen({ setId }: StudyScreenProps) {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [filteredCards, setFilteredCards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchFlashcards();
  }, [setId]);

  useEffect(() => {
    applyFilters();
  }, [flashcards, selectedTag, selectedDifficulty, isShuffled]);

  const fetchFlashcards = async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('set_id', setId)
      .order('created_at', { ascending: false });

    if (!error) {
      setFlashcards(data || []);
      const tags = new Set<string>();
      data?.forEach((card) => card.tags?.forEach((tag) => tags.add(tag)));
      setAllTags(Array.from(tags).sort());
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...flashcards];

    if (selectedTag) {
      filtered = filtered.filter((card) => card.tags?.includes(selectedTag));
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((card) => card.difficulty === selectedDifficulty);
    }

    if (isShuffled) {
      filtered = shuffleArray(filtered);
    }

    setFilteredCards(filtered);
    setCurrentIndex(0);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No flashcards available in this set.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            style={[styles.filterButton, !selectedTag && styles.filterButtonActive]}
            onPress={() => setSelectedTag('')}
          >
            <Text style={[styles.filterText, !selectedTag && styles.filterTextActive]}>All Tags</Text>
          </Pressable>
          {allTags.map((tag) => (
            <Pressable
              key={tag}
              style={[styles.filterButton, selectedTag === tag && styles.filterButtonActive]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[styles.filterText, selectedTag === tag && styles.filterTextActive]}>{tag}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterRow}>
        {(['', 'easy', 'medium', 'hard'] as const).map((level) => (
          <Pressable
            key={level}
            style={[styles.filterButton, selectedDifficulty === level && styles.filterButtonActive]}
            onPress={() => setSelectedDifficulty(level as Difficulty | '')}
          >
            <Text style={[styles.filterText, selectedDifficulty === level && styles.filterTextActive]}>
              {level === '' ? 'All' : level}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.filterButton, styles.shuffleButton]} onPress={() => setIsShuffled(!isShuffled)}>
        <Text style={[styles.filterText, isShuffled && styles.filterTextActive]}>{isShuffled ? 'Shuffled' : 'Shuffle'}</Text>
      </Pressable>

      {filteredCards.length > 0 ? (
        <FlashcardCard
          card={filteredCards[currentIndex]}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentIndex={currentIndex}
          total={filteredCards.length}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No cards match the selected filters.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  shuffleButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
});
