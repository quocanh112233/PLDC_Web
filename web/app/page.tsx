'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const chapters = [
    { title: 'Chương 1', id: 1 },
    { title: 'Chương 2', id: 2 },
    { title: 'Chương 3', id: 3 },
    { title: 'Chương 4', id: 4 },
    { title: 'Chương 5', id: 5 },
    { title: 'Chương 6', id: 6 },
  ];

  const startChapter = (id: number) => {
    router.push(`/quiz/chapter/${id}`);
  };

  const startTest = () => {
    router.push(`/quiz/test`);
  };

  const openMaterial = () => {
    router.push('/material');
  };

  return (
    <main className="min-h-screen bg-white text-slate-800 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-5xl flex justify-between items-center mb-12 border-b-2 border-blue-100 pb-4">
        <h1 className="text-3xl font-bold text-blue-700 tracking-wide select-none">
          QUIZ PHÁP LUẬT ĐẠI CƯƠNG
        </h1>
        <button 
          onClick={openMaterial}
          className="px-6 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 hover:shadow-md active:scale-95 transition-all font-semibold uppercase text-sm"
        >
          Tài liệu
        </button>
      </div>

      <section className="w-full max-w-4xl mb-16 text-center">
        <h2 className="text-xl font-bold text-slate-500 mb-8 uppercase tracking-widest select-none">
          Luyện tập theo chương
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chapters.map((chap) => (
            <button
              key={chap.id}
              onClick={() => startChapter(chap.id)}
              className="group relative p-8 bg-white border border-blue-100 rounded-xl shadow-sm 
                         hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 
                         active:scale-95 active:bg-blue-50 
                         transition-all duration-300 ease-out"
            >
              <span className="block text-2xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                {chap.title}
              </span>
              <span className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">20 câu ngẫu nhiên</span>
            </button>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-bold text-slate-500 mb-8 uppercase tracking-widest select-none">
          Thi thử tổng hợp
        </h2>
        
        <button
          onClick={startTest}
          className="w-full p-10 bg-white border-4 border-blue-200 rounded-2xl 
                     hover:border-blue-600 hover:shadow-2xl hover:-translate-y-1
                     active:scale-95 active:bg-blue-50
                     transition-all duration-300 ease-out group"
        >
          <div className="text-4xl font-bold text-blue-700 mb-4 group-hover:scale-105 transition-transform duration-300 uppercase">
            Bắt đầu thi thử
          </div>
          <div className="flex justify-center gap-8 text-slate-500 font-medium text-lg uppercase tracking-wide group-hover:text-blue-600 transition-colors">
            <span>60 Câu hỏi</span>
            <span>60 Phút</span>
            <span>Trộn ngẫu nhiên</span>
          </div>
        </button>
      </section>

      <footer className="mt-auto pt-16 pb-8 text-slate-400 text-sm text-center select-none">
        <p className="mb-2">
            Dự án được phát triển bởi <span className="font-bold text-slate-600">Trần Nguyễn Quốc Anh</span>.
        </p>
        <p className="mb-2">
            Mọi đóng góp xin gửi về Email: <a href="mailto:trannguyenquocanh2004@gmail.com" className="text-blue-500 hover:underline">trannguyenquocanh2004@gmail.com</a>
        </p>
        <p>
            Source Code: <a href="https://github.com/quocanh112233" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold hover:underline">GitHub</a>
        </p>
      </footer>
    </main>
  );
}
