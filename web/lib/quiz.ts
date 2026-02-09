import fs from 'fs';
import path from 'path';
// No need to redeclare Question type if we import it, BUT to avoid massive dependecy
// let's mirror the type or import it from store if possible.
// Actually, server components can import types.
import { Question } from '@/store/useQuizStore';

const dataDirectory = path.join(process.cwd(), 'public/data');

export async function getQuizData(chapterId: number): Promise<Question[]> {
  const fullPath = path.join(dataDirectory, `bai_${chapterId}.json`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const data = JSON.parse(fileContents);
  
  // Add chapterId metadata
  return data.map((q: any) => ({ ...q, chapterId }));
}

export async function getAllQuizData(): Promise<Question[]> {
  let allQuestions: Question[] = [];
  
  // Load parallel
  const chapters = [1, 2, 3, 4, 5, 6];
  const results = await Promise.all(chapters.map(id => getQuizData(id)));
  
  results.forEach(chapterData => {
    allQuestions = [...allQuestions, ...chapterData];
  });
  
  return allQuestions;
}
