'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const { questions, userAnswers, timeSpent, isSubmitted, resetQuiz, mode, chapterId } = useQuizStore();
  const [stats, setStats] = useState({ correct: 0, wrong: 0, totalTime: 0 });

  useEffect(() => {
    // Neu vao trang nay ma chua nop bai -> ve home
    if (!isSubmitted) {
      router.push('/');
      return;
    }

    let correctCount = 0;
    let totalTime = 0;

    questions.forEach(q => {
      const uAns = userAnswers[q.id];
      const correctAns = q.answers.find(a => a.is_correct)?.key;
      if (uAns === correctAns) correctCount++;
      totalTime += (timeSpent[q.id] || 0);
    });

    setStats({
      correct: correctCount,
      wrong: questions.length - correctCount,
      totalTime
    });
  }, [questions, userAnswers, timeSpent, isSubmitted, router]);

  const handleHome = () => {
    resetQuiz();
    router.push('/');
  };

  const handleRestart = () => {
    // KHONG can resetQuiz o day, vi QuizClient se tu dong goi resetQuiz khi mount
    if (mode === 'CHAPTER' && chapterId) {
        router.push(`/quiz/chapter/${chapterId}`);
    } else {
        router.push('/quiz/test');
    }
  };

  if (!questions.length) return null;

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm z-10">
        <h1 className="text-xl font-bold text-blue-800 uppercase">Kết quả bài làm</h1>
        <div className="flex gap-4">
            <button 
                onClick={handleRestart}
                className="px-6 py-2 bg-blue-100 font-bold hover:bg-blue-200 text-blue-800 rounded shadow-sm transition-colors uppercase text-sm"
            >
                Làm lại đề này
            </button>
            <button 
                onClick={handleHome}
                className="px-6 py-2 bg-blue-600 font-bold hover:bg-blue-700 text-white rounded shadow transition-colors uppercase text-sm"
            >
                Về Trang Chủ
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: REVIEW LIST */}
        <div className="flex-1 overflow-y-auto p-8 border-r bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-8">
            {questions.map((q, idx) => {
              const uAns = userAnswers[q.id];
              const correctAns = q.answers.find(a => a.is_correct)?.key;
              const isCorrect = uAns === correctAns;
              const isSkipped = !uAns;

              return (
                <div key={q.id} className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-gray-500">Câu {idx + 1}</span>
                    <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? 'ĐÚNG' : isSkipped ? 'BỎ QUA' : 'SAI'}
                    </span>
                  </div>
                  
                  <p className="font-medium text-lg text-gray-900 mb-4">{q.question_content}</p>

                  <div className="space-y-2">
                    {q.answers.map(ans => {
                      const isSelected = uAns === ans.key;
                      const isRealCorrect = ans.is_correct;
                      
                      let style = "border-gray-200 bg-white text-gray-600";
                      
                      if (isRealCorrect) {
                        style = "border-green-500 bg-green-50 text-green-800 font-bold";
                      } else if (isSelected && !isRealCorrect) {
                        style = "border-red-500 bg-red-50 text-red-800 font-bold"; 
                      }

                      return (
                        <div key={ans.key} className={`p-3 border rounded-lg ${style} flex justify-between`}>
                           <div>
                               <span className="mr-2 font-bold">{ans.key}.</span> 
                               {ans.content.replace(/^[A-D]\.\s*/, '')}
                           </div>
                           {isSelected && <span className="text-xs font-bold uppercase bg-gray-200 px-2 py-1 rounded ml-2 h-fit">Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 text-xs text-slate-400 text-right">
                      Thời gian: {timeSpent[q.id] || 0}s
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: STATS & CHART */}
        <div className="w-1/3 min-w-[350px] bg-white p-8 overflow-y-auto">
           <h2 className="text-xl font-bold text-gray-700 mb-6 uppercase tracking-wider border-b pb-2">Thống Kê Chi Tiết</h2>
           
           <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                   <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
                   <div className="text-sm text-green-800 uppercase font-semibold">Câu ĐÚNG</div>
               </div>
               <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                   <div className="text-3xl font-bold text-red-600">{stats.wrong}</div>
                   <div className="text-sm text-red-800 uppercase font-semibold">Câu SAI</div>
               </div>
               <div className="col-span-2 bg-blue-50 p-4 rounded-lg text-center px-8 border border-blue-100">
                   <div className="flex justify-between items-center mb-1">
                        <div className="text-sm text-blue-800 uppercase font-semibold">Tổng Thời Gian</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {Math.floor(stats.totalTime / 60)}p {stats.totalTime % 60}s
                        </div>
                   </div>
                   <div className="text-xs text-blue-400 text-right">Trung bình: {(stats.totalTime / questions.length).toFixed(1)}s / câu</div>
               </div>
           </div>

           <h3 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wider border-b pb-2">Biểu Đồ Thời Gian (giây)</h3>
           <div className="space-y-2 text-xs">
               {questions.map((q, idx) => {
                   const t = timeSpent[q.id] || 0;
                   const isCorrect = userAnswers[q.id] === q.answers.find(a => a.is_correct)?.key;
                   const width = Math.min(100, (t / 60) * 100); // 100% = 60s cap

                   return (
                       <div key={q.id} className="flex items-center gap-2 group hover:bg-gray-50 p-1 rounded">
                           <div className="w-6 text-right font-mono text-gray-400 font-bold">{idx + 1}</div>
                           <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden relative">
                               <div 
                                   className={`h-full transition-all ${isCorrect ? 'bg-blue-500' : 'bg-orange-400'}`} 
                                   style={{ width: `${Math.max(width, 2)}%` }} 
                               />
                           </div>
                           <div className="w-8 text-right font-bold text-gray-600">{t}s</div>
                       </div>
                   );
               })}
               <div className="text-center text-gray-400 mt-6 text-xs border-t pt-2">
                   <span className="inline-block w-3 h-3 bg-blue-500 mr-1 rounded-sm"></span> Đúng
                   <span className="inline-block w-3 h-3 bg-orange-400 ml-4 mr-1 rounded-sm"></span> Sai
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
