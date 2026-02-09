'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuizStore, Question } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';

export default function QuizClient({ 
  mode, 
  chapterId, 
  initialQuestions 
}: { 
  mode: 'CHAPTER' | 'TEST', 
  chapterId?: number,
  initialQuestions?: Question[] 
}) {
  const router = useRouter();
  const { 
    setQuestions, questions, currentQuestionIndex, 
    userAnswers, selectAnswer, 
    nextQuestion, prevQuestion, jumpToQuestion, 
    submitQuiz, isSubmitted, 
    timeLeft, tickTimer, trackTimeSpent, resetQuiz 
  } = useQuizStore();

  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [cheatWarning, setCheatWarning] = useState(false);
  
  const initialized = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!loading && !isSubmitted && questions.length > 0) {
      interval = setInterval(() => {
        if (questions[currentQuestionIndex]) {
             trackTimeSpent(questions[currentQuestionIndex].id, 1);
        }
        
        if (mode === 'TEST') {
          tickTimer();
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, isSubmitted, currentQuestionIndex, mode, questions, tickTimer, trackTimeSpent]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault(); 
    };
    
    const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        alert("Thí sinh không được phép sao chép nội dung!");
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (
            e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)
        ) {
            e.preventDefault();
        }
    }

    const handleVisibilityChange = () => {
        if (document.hidden && !isSubmitted) {
            setCheatWarning(true);
        }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubmitted]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    resetQuiz();
    
    if (initialQuestions && initialQuestions.length > 0) {
        setLoading(true);
        let processed: Question[] = [];
        
        if (mode === 'CHAPTER') {
           processed = [...initialQuestions].sort(() => 0.5 - Math.random()).slice(0, 20);
        } else {
           const chapters: Record<number, Question[]> = {};
           initialQuestions.forEach(q => {
               const cid = q.chapterId || 1; 
               if (!chapters[cid]) chapters[cid] = [];
               chapters[cid].push(q);
           });
           
            Object.values(chapters).forEach(chapData => {
                const sample = [...chapData].sort(() => 0.5 - Math.random()).slice(0, 10);
                processed = [...processed, ...sample];
            });
            
            processed.sort(() => 0.5 - Math.random());
        }
        
        setQuestions(processed, mode, chapterId);
        setLoading(false);
        return;
    }

    async function loadData() {
      setLoading(true);
      let loadedQuestions: Question[] = [];

      try {
        if (mode === 'CHAPTER' && chapterId) {
          const res = await fetch(`/data/bai_${chapterId}.json`);
          const data: Question[] = await res.json();
          loadedQuestions = data.sort(() => 0.5 - Math.random()).slice(0, 20);
        } 
        else if (mode === 'TEST') {
          const promises = [1, 2, 3, 4, 5, 6].map(id => fetch(`/data/bai_${id}.json`).then(r => r.json()));
          const allChapters = await Promise.all(promises);
          
          allChapters.forEach((chapData: Question[], idx) => {
            const qs = chapData.map((q:any) => ({...q, chapterId: idx+1}));
            const sample = qs.sort(() => 0.5 - Math.random()).slice(0, 10);
            loadedQuestions = [...loadedQuestions, ...sample];
          });
          
          loadedQuestions.sort(() => 0.5 - Math.random());
        }

        setQuestions(loadedQuestions, mode, chapterId);
      } catch (error) {
        console.error("Failed to load quiz data", error);
        alert("Lỗi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mode, chapterId, setQuestions, resetQuiz, initialQuestions]);

  useEffect(() => {
    if (isSubmitted && !loading && questions.length > 0) {
       router.push('/result');
    }
  }, [isSubmitted, loading, questions, router]);

  useEffect(() => {
    if (mode === 'TEST' && timeLeft === 0 && !loading && questions.length > 0 && !isSubmitted) {
      submitQuiz();
    }
  }, [timeLeft, mode, loading, questions, isSubmitted, submitQuiz]);

  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600 font-bold uppercase animate-pulse">Đang chuẩn bị đề thi...</div>;
  if (!questions.length) return <div className="flex h-screen items-center justify-center text-red-500 font-bold uppercase">Lỗi dữ liệu câu hỏi!</div>;

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans relative select-none">
      
      {/* HEADER */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-20 shrink-0">
        <div className="font-bold text-sm md:text-lg text-blue-800 uppercase tracking-wide truncate max-w-[60%] md:max-w-none">
          {mode === 'CHAPTER' ? `Chương ${chapterId}` : 'THI THỬ'}
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
            {mode === 'TEST' && (
            <div className={`text-lg md:text-xl font-bold font-mono ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            )}
            
            <button 
                onClick={() => setShowExitModal(true)}
                className="text-xs md:text-sm font-bold text-gray-500 hover:text-red-500 uppercase transition-colors whitespace-nowrap"
            >
            Thoát
            </button>
        </div>
      </div>

      {/* MAIN CONTENT: 2 PANES DESKTOP, 1 COLUMN MOBILE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* LEFT: QUESTION */}
        <div className="flex-1 flex flex-col overflow-y-auto w-full md:w-2/3 border-b md:border-b-0 md:border-r border-gray-200 bg-white" onContextMenu={(e) => e.preventDefault()}>
          <div className="p-4 md:p-8 pb-4">
              <div className="mb-4 md:mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded text-xs uppercase mb-3 md:mb-4 tracking-wider">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                <h2 className="text-lg md:text-xl font-medium leading-relaxed text-gray-800 select-none pointer-events-none">
                  {currentQ.question_content}
                </h2>
              </div>

              <div className="space-y-3 md:space-y-4 max-w-2xl">
                {currentQ.answers.map((ans) => {
                  const isSelected = userAnswers[currentQ.id] === ans.key;
                  return (
                    <label 
                      key={ans.key} 
                      className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-xl cursor-pointer transition-all duration-200 group active:scale-[0.99]
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex h-6 items-center shrink-0">
                        <input
                          type="radio"
                          name={`ratio-${currentQ.id}`}
                          value={ans.key}
                          checked={isSelected}
                          onChange={() => selectAnswer(currentQ.id, ans.key)}
                          className="peer h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </div>
                      <div className="text-gray-700 group-hover:text-gray-900 leading-6 select-none pointer-events-none text-sm md:text-base">
                        <span className="font-bold mr-2">{ans.key}.</span>
                        {ans.content.replace(/^[A-D]\.\s*/, '')}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* NAV BUTTONS */}
              <div className="mt-8 flex justify-between gap-4">
                <button
                   onClick={prevQuestion}
                   disabled={currentQuestionIndex === 0}
                   className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2 border border-gray-300 rounded font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors uppercase text-sm"
                >
                  Quay lại
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                   <button
                     onClick={() => setShowConfirmModal(true)}
                     className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all uppercase text-sm"
                   >
                     Nộp bài
                   </button>
                ) : (
                   <button
                     onClick={nextQuestion}
                     className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2 bg-white border border-blue-500 text-blue-600 font-bold rounded hover:bg-blue-50 transition-colors uppercase text-sm text-center"
                   >
                     Câu tiếp
                   </button>
                )}
              </div>
          </div>
          
          {/* MOBILE LIST (IN FLOW) - Visible only on mobile */}
          <div className="md:hidden bg-gray-50 border-t border-gray-200 p-4 pb-8">
               <div className="font-bold text-center text-gray-500 uppercase text-xs tracking-wider mb-4">
                   Danh sách câu hỏi
               </div>
               <div className="grid grid-cols-5 gap-3">
                   {questions.map((q, idx) => {
                     const isAnswered = !!userAnswers[q.id];
                     const isCurrent = idx === currentQuestionIndex;
                     
                     return (
                       <button
                         key={q.id}
                         onClick={() => jumpToQuestion(idx)}
                         className={`
                            aspect-square flex items-center justify-center rounded text-sm font-bold transition-all duration-200
                            ${isCurrent 
                                ? 'ring-2 ring-blue-500 bg-white text-blue-600 z-10 scale-110 shadow-md border border-blue-100' 
                                : isAnswered
                                    ? 'bg-slate-600 text-white' 
                                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                            }
                         `}
                       >
                         {idx + 1}
                       </button>
                     );
                   })}
               </div>
               
               <div className="mt-6 text-center">
                   <div className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">
                       Hoàn thành: <span className="text-blue-600">{Object.keys(userAnswers).length}</span> / {questions.length}
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-500" 
                        style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
                      ></div>
                   </div>
               </div>
          </div>
        </div>

        {/* RIGHT: QUESTION GRID (DESKTOP ONLY) */}
        <div className="hidden md:flex md:w-1/3 md:min-w-[300px] md:max-w-sm md:flex-col md:border-l border-gray-200 bg-gray-50 h-full">
           <div className="p-4 bg-white border-b border-gray-200 font-bold text-center text-gray-500 uppercase text-xs tracking-wider">
               Danh sách câu hỏi
           </div>
           
           <div className="flex-1 p-4 overflow-y-auto">
             <div className="grid grid-cols-5 gap-3">
               {questions.map((q, idx) => {
                 const isAnswered = !!userAnswers[q.id];
                 const isCurrent = idx === currentQuestionIndex;
                 
                 return (
                   <button
                     key={q.id}
                     onClick={() => jumpToQuestion(idx)}
                     className={`
                        aspect-square flex items-center justify-center rounded text-sm font-bold transition-all duration-200
                        ${isCurrent 
                            ? 'ring-2 ring-blue-500 bg-white text-blue-600 z-10 scale-110 shadow-md border border-blue-100' 
                            : isAnswered
                                ? 'bg-slate-600 text-white' 
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }
                     `}
                   >
                     {idx + 1}
                   </button>
                 );
               })}
             </div>
           </div>
           
           <div className="p-6 bg-white border-t border-gray-200 text-center">
               <div className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">
                   Hoàn thành: <span className="text-blue-600">{Object.keys(userAnswers).length}</span> / {questions.length}
               </div>
               <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
                  ></div>
               </div>
           </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn px-4">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full text-center scale-100 animate-scaleUp">
            <h3 className="text-xl font-bold text-blue-800 mb-4 uppercase">Xác nhận nộp bài</h3>
            <p className="text-gray-600 mb-8">
              Bạn đã hoàn thành {Object.keys(userAnswers).length}/{questions.length} câu hỏi. 
              <br/>Bạn có chắc chắn muốn nộp bài không?
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-2 bg-gray-100 font-bold hover:bg-gray-200 text-gray-700 rounded transition-colors uppercase text-sm"
              >
                Làm tiếp
              </button>
              <button 
                onClick={() => { setShowConfirmModal(false); submitQuiz(); }}
                className="flex-1 px-6 py-2 bg-blue-600 font-bold hover:bg-blue-700 text-white rounded shadow transition-colors uppercase text-sm"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn px-4">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full text-center scale-100 animate-scaleUp">
            <h3 className="text-xl font-bold text-red-600 mb-4 uppercase">Cảnh báo thoát</h3>
            <p className="text-gray-600 mb-8">
              Kết quả bài làm hiện tại sẽ KHÔNG được lưu.
              <br/>Bạn có chắc chắn muốn thoát?
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-6 py-2 bg-gray-100 font-bold hover:bg-gray-200 text-gray-700 rounded transition-colors uppercase text-sm"
              >
                Ở lại
              </button>
              <button 
                onClick={() => { resetQuiz(); router.push('/'); }}
                className="flex-1 px-6 py-2 bg-red-600 font-bold hover:bg-red-700 text-white rounded shadow transition-colors uppercase text-sm"
              >
                Thoát luôn
              </button>
            </div>
          </div>
        </div>
      )}
      
      {cheatWarning && (
          <div className="fixed inset-0 bg-red-900/80 flex items-center justify-center z-[60] animate-pulse px-4">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border-4 border-red-600">
                  <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-4 uppercase animate-bounce">CẢNH BÁO GIAN LẬN!</h3>
                  <p className="text-gray-800 font-bold text-base md:text-lg mb-4">
                      Hệ thống phát hiện bạn vừa rời khỏi màn hình làm bài!
                  </p>
                  <p className="text-gray-600 mb-8 italic">
                      Vui lòng tập trung làm bài. Nếu tái phạm, bài thi sẽ bị hủy.
                  </p>
                  <button 
                      onClick={() => setCheatWarning(false)}
                      className="px-8 py-3 bg-red-600 font-bold hover:bg-red-700 text-white rounded shadow-lg uppercase tracking-wide transition-all hover:scale-105"
                  >
                      Tôi đã hiểu
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}
