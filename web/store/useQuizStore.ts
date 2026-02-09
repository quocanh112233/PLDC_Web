import { create } from "zustand";

export type Question = {
  id: number;
  question_content: string;
  chapterId?: number;
  answers: {
    key: string;
    content: string;
    is_correct: boolean;
  }[];
};

type QuizMode = "CHAPTER" | "TEST";

type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>; // questionId -> selectedKey ('A' | 'B'...)
  timeSpent: Record<number, number>; // questionId -> seconds
  isSubmitted: boolean;
  mode: QuizMode;
  timeLeft: number; // For TEST mode (seconds)
  startTime: number | null; // Timestamp
  chapterId: number | null; // 1-6 or null for MIX

  // Actions
  setQuestions: (qs: Question[], mode: QuizMode, chapterId?: number) => void;
  selectAnswer: (qId: number, key: string) => void;
  jumpToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitQuiz: () => void;
  tickTimer: () => void; // Decrement timeLeft (TEST) or just track total time
  trackTimeSpent: (qId: number, seconds: number) => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  timeSpent: {},
  isSubmitted: false,
  mode: "CHAPTER",
  timeLeft: 0,
  startTime: null,
  chapterId: null,

  setQuestions: (qs, mode, chapterId) =>
    set({
      questions: qs,
      mode,
      chapterId: chapterId || null,
      currentQuestionIndex: 0,
      userAnswers: {},
      timeSpent: {},
      isSubmitted: false,
      startTime: Date.now(),
      timeLeft: mode === "TEST" ? 60 * 60 : 0, // 60 mins for Test
    }),

  selectAnswer: (qId, key) =>
    set((state) => ({
      userAnswers: { ...state.userAnswers, [qId]: key },
    })),

  jumpToQuestion: (index) => set({ currentQuestionIndex: index }),

  nextQuestion: () =>
    set((state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return {};
    }),

  prevQuestion: () =>
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        return { currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return {};
    }),

  submitQuiz: () => set({ isSubmitted: true }),

  tickTimer: () =>
    set((state) => {
      if (state.isSubmitted) return {};
      if (state.mode === "TEST") {
        return { timeLeft: Math.max(0, state.timeLeft - 1) };
      }
      return {};
    }),

  trackTimeSpent: (qId, seconds) =>
    set((state) => ({
      timeSpent: {
        ...state.timeSpent,
        [qId]: (state.timeSpent[qId] || 0) + seconds,
      },
    })),

  resetQuiz: () =>
    set({
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      timeSpent: {},
      isSubmitted: false,
      startTime: null,
    }),
}));
