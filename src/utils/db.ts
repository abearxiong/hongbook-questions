import { openDB } from 'idb';
import { nanoid } from 'nanoid';
import { Question, questionSchema } from '../types/question';

const dbName = 'questionsDB';
const storeName = 'questions';
const EDIT_STATE_KEY = 'questionBank_editState';

const EXAMPLE_QUESTIONS = [
  {
    id: nanoid(),
    question: "What is React's Virtual DOM?",
    answer: "The Virtual DOM is a lightweight copy of the actual DOM in memory. React uses it to improve performance by minimizing direct manipulation of the DOM. When state changes occur, React first updates the Virtual DOM, compares it with the previous version (diffing), and then efficiently updates only the necessary parts of the actual DOM.",
    showInReview: true
  },
  {
    id: nanoid(),
    question: "Explain the concept of 'closure' in JavaScript",
    answer: "A closure is the combination of a function and the lexical environment within which that function was declared. This environment consists of any local variables that were in-scope at the time the closure was created. In other words, a closure allows an inner function to access variables from its outer scope even after the outer function has returned.",
    showInReview: true
  },
  {
    id: nanoid(),
    question: "What are React Hooks and why were they introduced?",
    answer: "React Hooks are functions that allow you to 'hook into' React state and lifecycle features from function components. They were introduced in React 16.8 to:\n\n1. Reuse stateful logic between components without changing component hierarchy\n2. Split complex components into smaller functions\n3. Use state and other React features without writing class components\n4. Reduce the complexity of class components and lifecycle methods",
    showInReview: true
  }
];

const initDB = async () => {
  const db = await openDB(dbName, 1, {
    async upgrade(db) {
      // Create store if it doesn't exist
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id' });
        
        // Add example questions
        for (const question of EXAMPLE_QUESTIONS) {
          await store.add(question);
        }
      }
    },
  });
  return db;
};

const migrateData = async (db: IDBDatabase) => {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const questions = await store.getAll();
  
  for (const question of questions) {
    const updatedQuestion = {
      ...question,
      // Ensure showInReview exists
      showInReview: question.showInReview ?? true,
      // Convert numeric IDs to nanoid strings
      id: typeof question.id === 'number' ? nanoid() : question.id
    };

    // If ID was changed, delete old record
    if (typeof question.id === 'number') {
      await store.delete(question.id);
    }
    
    await store.put(updatedQuestion);
  }
  
  await tx.done;
};

// Initialize database
const db = await initDB();

// Run migration after initialization
await migrateData(db);

export const getAllQuestions = async () => {
  const questions = await db.getAll(storeName);
  return questions.filter(q => q.question || q.answer); // Filter out empty questions
};

export const addQuestion = async (question: Omit<Question, 'id'>) => {
  try {
    const newQuestion = {
      id: nanoid(),
      question: question.question || '',
      answer: question.answer || '',
      showInReview: question.showInReview ?? true
    };

    const parseResult = questionSchema.safeParse(newQuestion);
    if (!parseResult.success) {
      throw new Error(`Invalid question data: ${parseResult.error.message}`);
    }

    await db.add(storeName, newQuestion);
    markAsEdited();
    return newQuestion.id;
  } catch (error) {
    console.error('Error in addQuestion:', error);
    throw error;
  }
};

export const updateQuestion = async (question: Question) => {
  const parseResult = questionSchema.safeParse(question);
  if (!parseResult.success) {
    throw new Error('Invalid question data');
  }

  await db.put(storeName, question);
  markAsEdited();
  return question.id;
};

export const deleteQuestion = async (id: string) => {
  await db.delete(storeName, id);
  markAsEdited();
  return id;
};

export const clearAllQuestions = async () => {
  const tx = db.transaction(storeName, 'readwrite');
  await tx.objectStore(storeName).clear();
  await tx.done;
  markAsEdited();
};

export const markAsEdited = () => {
  localStorage.setItem(EDIT_STATE_KEY, Date.now().toString());
};

export const getLastEditTime = (): number => {
  const timestamp = localStorage.getItem(EDIT_STATE_KEY);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

export const hasBeenEdited = (since: number): boolean => {
  const lastEdit = getLastEditTime();
  return lastEdit > since;
};