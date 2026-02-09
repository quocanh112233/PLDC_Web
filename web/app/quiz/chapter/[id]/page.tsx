import QuizClient from '@/components/QuizClient';
import { getQuizData } from '@/lib/quiz';

export const dynamicParams = true; // or false if we strictly only want 1-6

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((id) => ({
    id: String(id),
  }));
}

export default async function ChapterQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialQuestions = await getQuizData(Number(id));
  
  return <QuizClient mode="CHAPTER" chapterId={Number(id)} initialQuestions={initialQuestions} />;
}
