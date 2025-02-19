import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { Question } from '../types/question';
import { getAllQuestions, hasBeenEdited } from '../utils/db';

interface ReviewState {
  questions: Question[];
  currentIndex: number;
  showAnswer: boolean;
  isComplete: boolean;
  isRandom: boolean;
  hiddenQuestions: string[];
  lastEditCheck: number;
  isEditing: boolean;
  editedQuestion: Question | null;
}

interface ReviewActions {
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  toggleAnswer: (show?: boolean) => void;
  setComplete: (complete: boolean) => void;
  toggleRandom: () => void;
  hideQuestion: (id: string) => void;
  setEditing: (editing: boolean) => void;
  setEditedQuestion: (question: Question | null) => void;
  resetProgress: () => void;
  loadQuestions: (targetIndex?: number) => Promise<void>;
}

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set, get) => ({
      // Initial state
      questions: [],
      currentIndex: 0,
      showAnswer: false,
      isComplete: false,
      isRandom: false,
      hiddenQuestions: [],
      lastEditCheck: Date.now(),
      isEditing: false,
      editedQuestion: null,

      // Actions
      setQuestions: (questions) => set({ questions }),
      
      setCurrentIndex: (index) => set({ 
        currentIndex: index,
        showAnswer: false // Reset showAnswer when changing questions
      }),
      
      toggleAnswer: (show?: boolean) => set((state) => ({ 
        showAnswer: typeof show !== 'undefined' ? show : !state.showAnswer 
      })),
      
      setComplete: (complete) => set({ isComplete: complete }),
      
      toggleRandom: () => set((state) => ({ isRandom: !state.isRandom })),
      
      hideQuestion: (id) => set(produce((state) => {
        state.hiddenQuestions.push(id);
      })),
      
      setEditing: (editing) => set({ isEditing: editing }),
      
      setEditedQuestion: (question) => set({ editedQuestion: question }),

      resetProgress: () => set({
        currentIndex: 0,
        showAnswer: false,
        isComplete: false,
        hiddenQuestions: [],
        lastEditCheck: Date.now()
      }),

      loadQuestions: async (targetIndex) => {
        const state = get();
        let loadedQuestions = await getAllQuestions();
        loadedQuestions = loadedQuestions.filter(q => q.showInReview);

        const hasEdits = hasBeenEdited(state.lastEditCheck);
        
        if (hasEdits) {
          if (state.isRandom) {
            loadedQuestions = [...loadedQuestions].sort(() => Math.random() - 0.5);
          }
          set({
            questions: loadedQuestions,
            currentIndex: 0,
            showAnswer: false,
            hiddenQuestions: [],
            lastEditCheck: Date.now()
          });
        } else if (state.isRandom && !targetIndex) {
          loadedQuestions = [...loadedQuestions].sort(() => Math.random() - 0.5);
          set({ 
            questions: loadedQuestions,
            showAnswer: false
          });
        } else {
          set({ 
            questions: loadedQuestions,
            showAnswer: false
          });
        }

        if (targetIndex !== undefined) {
          const newIndex = Math.min(targetIndex, loadedQuestions.length - 1);
          set({ 
            currentIndex: Math.max(0, newIndex),
            showAnswer: false
          });
        }
      }
    }),
    {
      name: 'review-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        isRandom: state.isRandom,
        hiddenQuestions: state.hiddenQuestions,
        lastEditCheck: state.lastEditCheck
      })
    }
  )
);