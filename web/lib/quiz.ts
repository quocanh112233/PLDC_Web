import fs from 'fs';
import path from 'path';
import { Question } from '@/store/useQuizStore';

const dataDirectory = path.join(process.cwd(), 'public/data');

export async function getQuizData(chapterId: number): Promise<Question[]> {
  const fullPath = path.join(dataDirectory, `bai_${chapterId}.json`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const data = JSON.parse(fileContents);
  
  return data.map((q: any) => ({ ...q, chapterId }));
}

export async function getAllQuizData(): Promise<Question[]> {
  let allQuestions: Question[] = [];
  
  const chapters = [1, 2, 3, 4, 5, 6];
  const results = await Promise.all(chapters.map(id => getQuizData(id)));
  
  results.forEach(chapterData => {
    allQuestions = [...allQuestions, ...chapterData];
  });
  
  return allQuestions;
}
