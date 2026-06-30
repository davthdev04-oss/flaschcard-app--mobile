export type Difficulty = 'easy' | 'medium' | 'hard';

export type HintLanguage = 'typescript' | 'javascript' | 'jsx' | 'tsx' | 'sql' | 'css' | 'html';

export interface Category {
  id: string;
  name: string;
  created_at: string;
  is_archived:boolean
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  created_at: string;
}

export interface FlashcardSet {
  id: string;
  subcategory_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint_code: string | null;
  hint_language: HintLanguage | null;
  hint_text: string | null;
  tags: string[] | null;
  difficulty: Difficulty | null;
  notes: string | null;
  set_id: string | null;
  created_at: string;
}

export interface FlashcardFormData {
  question: string;
  answer: string;
  tags: string;
  difficulty: Difficulty | '';
  hint_code: string;
  hint_language: HintLanguage;
  hint_text: string;
  notes: string;
}
