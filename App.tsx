
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  MessageCircle, 
  Code, 
  Database, 
  ChevronRight, 
  ArrowLeft,
  GraduationCap,
  Cpu,
  Globe,
  Settings,
  X,
  Send,
  Loader2,
  Layers,
  FileText,
  Mail,
  Lock,
  LogIn,
  LogOut,
  CheckCircle2,
  HelpCircle,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { Grade, Lesson, ChatMessage, Question } from './types';
import { CURRICULUM } from './constants';
import { createLearningChat, sendMessageToGemini } from './geminiService';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  // --- Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- App Navigation State ---
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [view, setView] = useState<'home' | 'topics' | 'lessons' | 'detail' | 'quiz'>('home');
  
  // --- Quiz State ---
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  // --- Chat State ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [chatMessages, isChatOpen]);

  const topics = useMemo(() => {
    if (!selectedGrade) return [];
    return Array.from(new Set(CURRICULUM[selectedGrade].map(l => l.topic)));
  }, [selectedGrade]);

  const filteredLessons = useMemo(() => {
    if (!selectedGrade || !selectedTopic) return [];
    return CURRICULUM[selectedGrade].filter(l => l.topic === selectedTopic);
  }, [selectedGrade, selectedTopic]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoggingIn(false);
    }, 800);
  };

  const handleSelectGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setSelectedTopic(null);
    setView('topics');
  };

  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setView('lessons');
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setView('detail');
    setChatMessages([
      { 
        role: 'model', 
        text: `Chào em! Thầy là trợ lý Tin học Pro. Chúng ta cùng bắt đầu tìm hiểu bài "${lesson.title}" nhé. Em có câu hỏi nào không?`, 
        timestamp: new Date() 
      }
    ]);
    if (selectedGrade) {
      chatRef.current = createLearningChat(selectedGrade, lesson);
    }
  };

  // --- Quiz Logic ---
  const startQuiz = () => {
    if (!selectedLesson?.questions) return;
    setCurrentQuestionIdx(0);
    setUserAnswers(new Array(selectedLesson.questions.length).fill(null));
    setShowResult(false);
    setView('quiz');
  };

  const handleAnswerSelect = (optionIdx: number) => {
    const nextAnswers = [...userAnswers];
    nextAnswers[currentQuestionIdx] = optionIdx;
    setUserAnswers(nextAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < (selectedLesson?.questions?.length || 0) - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = useMemo(() => {
    if (!selectedLesson?.questions) return 0;
    return userAnswers.reduce((acc, ans, idx) => {
      return ans === selectedLesson.questions![idx].correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [userAnswers, selectedLesson]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatRef.current) return;
    const userMsg: ChatMessage = { role: 'user', text: inputText, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    try {
      const response = await sendMessageToGemini(chatRef.current, inputText);
      const modelMsg: ChatMessage = { role: 'model', text: response || 'Hệ thống bận, em thử lại nhé.', timestamp: new Date() };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const resetToHome = () => {
    setSelectedGrade(null);
    setSelectedTopic(null);
    setSelectedLesson(null);
    setView('home');
    setChatMessages([]);
  };

  // --- Login View ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100 mb-6">
              <BookOpen size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tin Học <span className="text-blue-600">Pro</span></h1>
            <p className="text-slate-500 font-medium mt-3">Cổng học tập trực tuyến THPT</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@school.edu.vn" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center">
                {isLoggingIn ? <Loader2 size={24} className="animate-spin" /> : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={resetToHome}>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><BookOpen size={24} /></div>
          <h1 className="text-2xl font-black text-slate-800">Tin Học <span className="text-blue-600">Pro</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm font-bold text-slate-700 hidden sm:block">{email.split('@')[0]}</p>
          <button onClick={() => setIsLoggedIn(false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-10">
        
        {view === 'home' && (
          <div className="space-y-12 py-10 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">Chào mừng em</span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">Nâng tầm kiến thức <br/> Tin học THPT cùng AI</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[11, 12].map((grade) => (
                <button key={grade} onClick={() => handleSelectGrade(grade as Grade)} className="group bg-white p-12 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-blue-500 transition-all hover:-translate-y-2 text-left relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-50 group-hover:text-blue-50 transition-colors">{grade === 11 ? <Database size={160} /> : <Cpu size={160} />}</div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${grade === 11 ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}><GraduationCap size={32} /></div>
                    <h3 className="text-3xl font-black text-slate-900">Khối lớp {grade}</h3>
                    <div className={`mt-8 inline-flex items-center font-black ${grade === 11 ? 'text-blue-600' : 'text-indigo-600'}`}>Chọn lớp học <ChevronRight size={20} className="ml-2" /></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'topics' && selectedGrade && (
          <div className="space-y-8 animate-in slide-in-from-left duration-500">
            <button onClick={() => setView('home')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold group"><ArrowLeft size={20} className="mr-2" /> Quay lại chọn lớp</button>
            <h2 className="text-4xl font-black text-slate-900">Chủ đề học tập lớp {selectedGrade}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, i) => (
                <button key={i} onClick={() => handleSelectTopic(topic)} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left group">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Layers size={24} /></div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">{topic}</h3>
                  <div className="mt-6 flex items-center text-blue-600 font-bold text-sm">Khám phá bài học <ChevronRight size={16} className="ml-1" /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'lessons' && selectedTopic && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <button onClick={() => setView('topics')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold group"><ArrowLeft size={20} className="mr-2" /> Quay lại chủ đề</button>
            <h2 className="text-4xl font-black text-slate-900">{selectedTopic}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredLessons.map((lesson) => (
                <div key={lesson.id} onClick={() => handleSelectLesson(lesson)} className="bg-white p-8 rounded-3xl shadow-sm border border-transparent hover:border-blue-500 cursor-pointer transition-all hover:shadow-2xl group">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase block w-fit mb-4">{lesson.id}</span>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors mb-4">{lesson.title}</h3>
                  <p className="text-slate-500 line-clamp-2 text-sm font-medium">{lesson.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'detail' && selectedLesson && (
          <div className="space-y-10 animate-in zoom-in-95 duration-500">
            <button onClick={() => setView('lessons')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold group"><ArrowLeft size={20} className="mr-2" /> Quay lại danh sách bài</button>
            <div className="bg-white p-10 sm:p-14 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">{selectedLesson.topic}</span>
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-4 leading-tight">{selectedLesson.title}</h2>
                </div>
                {selectedLesson.questions && (
                  <button onClick={startQuiz} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2 animate-bounce">
                    <span>Làm trắc nghiệm ôn tập</span>
                    <CheckCircle2 size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                  <section>
                    <h4 className="text-xl font-black text-slate-800 mb-5 flex items-center"><div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div> Tóm tắt lý thuyết</h4>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">{selectedLesson.summary}</p>
                  </section>
                  <section>
                    <h4 className="text-xl font-black text-slate-800 mb-5 flex items-center"><div className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></div> Nội dung trọng tâm</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedLesson.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-black mr-4 shrink-0">{idx + 1}</div>
                          <span className="text-slate-700 font-bold">{point}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl h-fit min-h-[300px]">
                  <div className="flex items-center space-x-2 mb-6 opacity-60"><Code size={20} className="text-blue-400" /><span className="font-mono text-xs uppercase tracking-widest">Digital Lab</span></div>
                  <div className="font-mono text-sm space-y-2 text-blue-100/80 italic leading-relaxed">
                    {selectedGrade === 11 ? (
                      <p>Hệ thống lớp 11 sẵn sàng hỗ trợ thực hành {selectedLesson.topic}. Nhấp vào Trợ lý AI để trao đổi thêm các lệnh SQL hoặc phần cứng.</p>
                    ) : (
                      <p>Trình giả lập CSS lớp 12 giúp em quan sát thay đổi trực quan các thuộc tính thiết kế web.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- QUIZ VIEW --- */}
        {view === 'quiz' && selectedLesson && selectedLesson.questions && (
          <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between">
              <button onClick={() => setView('detail')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold"><ArrowLeft size={20} className="mr-2" /> Hủy bài làm</button>
              <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Câu {currentQuestionIdx + 1} / {selectedLesson.questions.length}</div>
            </div>

            {!showResult ? (
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 mb-10 leading-relaxed">
                  {selectedLesson.questions[currentQuestionIdx].question}
                </h3>
                <div className="space-y-4">
                  {selectedLesson.questions[currentQuestionIdx].options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleAnswerSelect(idx)}
                      className={`w-full p-6 rounded-2xl text-left font-bold transition-all border-2 flex items-center justify-between ${
                        userAnswers[currentQuestionIdx] === idx 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-100 hover:border-blue-200 text-slate-600'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${userAnswers[currentQuestionIdx] === idx ? 'border-blue-600 bg-blue-600' : 'border-slate-200'}`}>
                        {userAnswers[currentQuestionIdx] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-12 flex justify-end">
                  <button 
                    disabled={userAnswers[currentQuestionIdx] === null}
                    onClick={nextQuestion}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center"
                  >
                    {currentQuestionIdx === selectedLesson.questions.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 sm:p-16 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4">Kết quả luyện tập</h2>
                <p className="text-slate-500 font-bold text-xl mb-10">Em đạt {score} / {selectedLesson.questions.length} câu đúng!</p>
                
                <div className="space-y-8 text-left mb-12">
                  {selectedLesson.questions.map((q, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                      <div className="flex items-start gap-4">
                        {userAnswers[i] === q.correctAnswer ? (
                          <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle size={24} className="text-red-500 shrink-0" />
                        )}
                        <div className="space-y-2">
                          <p className="font-bold text-slate-800">{q.question}</p>
                          <p className="text-sm text-emerald-600 font-black">Đáp án: {q.options[q.correctAnswer]}</p>
                          {q.explanation && <p className="text-xs text-slate-400 font-medium italic">Giải thích: {q.explanation}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setView('detail')} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
                  Quay lại bài học
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI Chat Component */}
      {view === 'detail' && (
        <>
          {!isChatOpen && (
            <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-all z-40 hover:scale-110">
              <MessageCircle size={32} />
            </button>
          )}

          {isChatOpen && (
            <div className="fixed inset-0 sm:inset-auto sm:bottom-8 sm:right-8 sm:w-[420px] bg-white sm:rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col z-[100] animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cpu size={24} />
                  <div>
                    <p className="font-black text-lg">Hỏi thầy AI</p>
                    <div className="flex items-center space-x-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div><span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Sẵn sàng</span></div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 max-h-[450px]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border rounded-tl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2 border">
                      <div className="flex space-x-1"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></div></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-6 bg-white border-t">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-3">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Nhập câu hỏi..." className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="submit" disabled={isTyping || !inputText.trim()} className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100"><Send size={20} /></button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      <footer className="bg-white border-t mt-auto py-10">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-4">
          <div className="flex justify-center space-x-6 text-slate-300"><Settings size={20} /><Globe size={20} /><Cpu size={20} /></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Tin Học Pro • Chương trình THPT 2018</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
