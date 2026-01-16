
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc,
  setDoc,
  enableIndexedDbPersistence,
  getCountFromServer
} from "firebase/firestore";
import { Question, LeaderboardEntry, CommunityComment } from '../types';
import { BUILT_IN_QUESTIONS } from '../constants';

const firebaseConfig = {
  apiKey: "AIzaSyC7bzH3qTlHoRuSll_6r5AaH_WM8fmHR7A",
  authDomain: "milion-de46a.firebaseapp.com",
  projectId: "milion-de46a",
  storageBucket: "milion-de46a.firebasestorage.app",
  messagingSenderId: "577513431082",
  appId: "1:577513431082:web:309874aa2c222f0540a353",
  measurementId: "G-SR4HELPHPR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Persistence failed: Multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Persistence failed: Browser doesn't support it");
    }
  });
} catch (e) {
  console.error("Firestore persistence error", e);
}

const COLLECTIONS = {
  QUESTIONS: 'questions',
  LEADERBOARD: 'leaderboard',
  COMMENTS: 'comments'
};

export const StorageService = {
  getStats: async () => {
    try {
      const qCount = await getCountFromServer(collection(db, COLLECTIONS.QUESTIONS));
      const sCount = await getCountFromServer(collection(db, COLLECTIONS.LEADERBOARD));
      const cCount = await getCountFromServer(collection(db, COLLECTIONS.COMMENTS));
      return {
        questions: qCount.data().count,
        scores: sCount.data().count,
        comments: cCount.data().count
      };
    } catch (e) {
      return { questions: 0, scores: 0, comments: 0 };
    }
  },

  getQuestions: async (filters?: { language: string; category: string; difficulty: string }): Promise<Question[]> => {
    try {
      let q;
      if (filters) {
        q = query(
          collection(db, COLLECTIONS.QUESTIONS),
          where("language", "==", filters.language),
          where("category", "==", filters.category),
          where("difficulty", "==", filters.difficulty)
        );
      } else {
        q = collection(db, COLLECTIONS.QUESTIONS);
      }

      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...(doc.data() as any) } as Question);
      });

      if (questions.length === 0 && filters) {
        return BUILT_IN_QUESTIONS.filter(q => 
          q.language === filters.language && 
          q.category === filters.category &&
          q.difficulty === filters.difficulty
        );
      }

      return questions.length > 0 ? questions : BUILT_IN_QUESTIONS;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return BUILT_IN_QUESTIONS;
    }
  },

  saveQuestion: async (question: Question) => {
    try {
      const { id, ...data } = question;
      if (id && !id.startsWith('q_')) {
        await setDoc(doc(db, COLLECTIONS.QUESTIONS, id), data);
      } else {
        await addDoc(collection(db, COLLECTIONS.QUESTIONS), data);
      }
    } catch (error) {
      console.error("Error saving question:", error);
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  },

  getLeaderboard: async (count: number = 50): Promise<LeaderboardEntry[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.LEADERBOARD),
        orderBy("score", "desc"),
        limit(count)
      );
      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        entries.push({ id: docSnap.id, ...(docSnap.data() as any) } as LeaderboardEntry & { id: string });
      });
      return entries;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  },

  saveScore: async (entry: LeaderboardEntry) => {
    try {
      await addDoc(collection(db, COLLECTIONS.LEADERBOARD), entry);
    } catch (error) {
      console.error("Error saving score:", error);
    }
  },

  deleteScore: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.LEADERBOARD, id));
    } catch (error) {
      console.error("Error deleting score:", error);
    }
  },

  getComments: async (): Promise<CommunityComment[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.COMMENTS),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const comments: CommunityComment[] = [];
      querySnapshot.forEach((docSnap) => {
        comments.push({ id: docSnap.id, ...docSnap.data() } as CommunityComment);
      });
      return comments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  addComment: async (comment: Omit<CommunityComment, 'id'>) => {
    try {
      await addDoc(collection(db, COLLECTIONS.COMMENTS), comment);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  },

  deleteComment: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.COMMENTS, id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }
};
