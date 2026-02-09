import MaterialClient from '@/components/MaterialClient';
import { getAllQuizData } from '@/lib/quiz';

export const metadata = {
  title: 'Tài liệu ôn tập | Quiz PLDC',
  description: 'Tổng hợp 450 câu hỏi trắc nghiệm Pháp luật đại cương',
};

export default async function MaterialPage() {
  const initialQuestions = await getAllQuizData();
  return <MaterialClient initialQuestions={initialQuestions} />;
}
