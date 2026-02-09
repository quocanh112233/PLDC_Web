'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/store/useQuizStore';

export default function MaterialClient({ initialQuestions }: { initialQuestions: Question[] }) {
  const router = useRouter();
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChapter, setFilterChapter] = useState<number | 'ALL'>('ALL');
  
  // Navigation State
  const [matches, setMatches] = useState<number[]>([]); 
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // Filter Questions Logic
  const visibleQuestions = useMemo(() => {
    if (filterChapter === 'ALL') return initialQuestions;
    return initialQuestions.filter((q: any) => q.chapterId === filterChapter);
  }, [initialQuestions, filterChapter]);

  // Search Logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const newMatches: number[] = [];

    visibleQuestions.forEach(q => {
      const inQuestion = q.question_content.toLowerCase().includes(lowerTerm);
      const inAnswers = q.answers.some(a => a.content.toLowerCase().includes(lowerTerm));

      if (inQuestion || inAnswers) {
        newMatches.push(q.id);
      }
    });

    setMatches(newMatches);
    setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);
    
    if (newMatches.length > 0) {
        setTimeout(() => scrollToId(newMatches[0]), 100);
    }

  }, [searchTerm, visibleQuestions]);

  const scrollToId = (id: number) => {
      const el = document.getElementById(`q-${id}`);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  const nextMatch = () => {
      if (matches.length === 0) return;
      const next = (currentMatchIndex + 1) % matches.length;
      setCurrentMatchIndex(next);
      scrollToId(matches[next]);
  };

  const prevMatch = () => {
      if (matches.length === 0) return;
      const prev = (currentMatchIndex - 1 + matches.length) % matches.length;
      setCurrentMatchIndex(prev);
      scrollToId(matches[prev]);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-orange-300 text-orange-900 px-0.5 rounded border border-orange-400 font-bold shadow-sm animate-pulse-slow">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };
  
  const handleDownload = () => {
      window.print();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b py-4 px-6 md:px-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-md z-20 sticky top-0 print:hidden transition-all">
        <h1 className="text-xl font-bold text-blue-800 flex items-center gap-4 uppercase tracking-wide">
            <button onClick={() => router.push('/')} className="hover:bg-blue-50 hover:shadow active:scale-95 px-4 py-1.5 rounded border border-blue-200 text-blue-600 text-sm font-bold uppercase transition-all">
                Trang chủ
            </button>
            Tài liệu
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
            <select 
                value={filterChapter} 
                onChange={(e) => setFilterChapter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="border p-2 rounded text-sm bg-gray-50 text-gray-700 font-bold uppercase outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all hover:bg-white w-full md:w-auto cursor-pointer"
            >
                <option value="ALL">Tất cả chương</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Chương {n}</option>)}
            </select>
            
            {/* SEARCH BAR & NAVIGATION */}
            <div className={`relative flex items-center bg-white border rounded transition-all w-full md:w-96 ${searchTerm ? 'ring-2 ring-orange-200 border-orange-300 shadow-md' : 'border-gray-300'}`}>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 pl-3 rounded-l outline-none text-gray-700 placeholder-gray-400"
                />
                
                {matches.length > 0 ? (
                   <div className="flex items-center text-xs font-bold bg-orange-50 px-2 h-full border-l border-orange-200 text-orange-700 select-none">
                       <span className="mr-2 whitespace-nowrap">
                           {currentMatchIndex + 1} / {matches.length}
                       </span>
                       <div className="flex gap-1">
                           <button onClick={prevMatch} className="hover:bg-orange-200 p-1 rounded active:bg-orange-300">↑</button>
                           <button onClick={nextMatch} className="hover:bg-orange-200 p-1 rounded active:bg-orange-300">↓</button>
                       </div>
                   </div>
                ) : searchTerm ? (
                   <div className="px-3 text-xs font-bold text-gray-400 whitespace-nowrap">0 / 0</div>
                ): null}
            </div>
            
            <button 
                onClick={handleDownload}
                className="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700 hover:shadow-lg active:scale-95 uppercase text-sm transition-all whitespace-nowrap"
            >
                Tải PDF
            </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible scroll-smooth">
        <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl p-8 min-h-full print:border-none print:shadow-none transition-colors">
            <div className="mb-8 text-center border-b pb-4 print:visible">
                <h1 className="text-2xl font-bold uppercase text-blue-900 mb-2 print:text-black">Tài liệu ôn tập Pháp luật đại cương</h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest print:text-black">Tổng hợp 450 câu hỏi trắc nghiệm</p>
            </div>

            {visibleQuestions.length === 0 ? (
                <div className="text-center text-gray-400 py-12 font-bold uppercase">Không có dữ liệu chương này.</div>
            ) : (
                <div className="space-y-8 print:space-y-4">
                    {visibleQuestions.map((q: any) => {
                        const isCurrentMatch = matches[currentMatchIndex] === q.id;
                        const isMatch = matches.includes(q.id);

                        return (
                        <div 
                            key={q.id} 
                            id={`q-${q.id}`}
                            className={`break-inside-avoid print:mb-4 transition-all duration-500 rounded-lg p-2 -m-2
                                ${isCurrentMatch ? 'bg-orange-50 ring-2 ring-orange-300 shadow-lg scale-[1.01]' : ''}
                                ${!isCurrentMatch && isMatch ? 'bg-orange-50/30' : ''}
                            `}
                        >
                            <div className="flex justify-between items-baseline mb-2 bg-slate-50 p-2 rounded border-l-4 border-blue-400 print:bg-transparent print:border-none print:p-0">
                                <h3 className="font-bold text-gray-600 uppercase text-xs tracking-wide flex items-center gap-2 print:text-black">
                                    <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded print:bg-transparent print:text-black print:p-0 print:border print:border-black">Câu {q.id}</span>
                                    <span className="text-gray-400 px-2 print:hidden">Chương {q.chapterId}</span>
                                </h3>
                            </div>
                            
                            <p className="mb-4 text-lg font-medium text-gray-900 leading-relaxed px-4 print:text-base print:px-0 print:text-black">
                                {highlightText(q.question_content, searchTerm)}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 px-6 print:px-0 print:grid-cols-1 print:gap-y-1">
                                {q.answers.map((ans: any) => {
                                    const isCorrect = ans.is_correct;
                                    return (
                                        <div key={ans.key} className={`py-2 px-3 rounded ${isCorrect ? 'bg-blue-50 text-blue-900 font-bold print:bg-transparent print:text-black print:font-bold print:underline' : 'text-gray-600 hover:bg-gray-50 print:text-black'}`}>
                                            <span className={`${isCorrect ? 'text-blue-700 print:text-black' : 'text-gray-400 print:text-black'} mr-2 font-bold inline-block w-4`}>
                                                {ans.key}.
                                            </span>
                                            {highlightText(ans.content.replace(/^[A-D]\.\s*/, ''), searchTerm)}
                                        </div>
                                    );
                                })}
                            </div>
                            <hr className="mt-8 border-dashed border-gray-200 print:hidden" />
                        </div>
                    )})}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
