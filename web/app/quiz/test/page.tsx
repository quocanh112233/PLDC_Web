import QuizClient from '@/components/QuizClient';
import { getAllQuizData } from '@/lib/quiz';

export const dynamic = 'force-dynamic'; // Random test needs fresh data or at least fresh instance

export default async function TestQuizPage() {
  const allQuestions = await getAllQuizData();
  
  return <QuizClient mode="TEST" initialQuestions={allQuestions} />;
}
