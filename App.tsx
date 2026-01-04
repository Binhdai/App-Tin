
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
  AlertCircle,
  Clock,
  User,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { Grade, Lesson, ChatMessage, Question, UserStats } from './types';
import { CURRICULUM } from './constants';
import { createLearningChat, sendMessageToGemini } from './geminiService';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  // --- Authentication & User Info ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- App Navigation State ---
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [view, setView] = useState<'home' | 'topics' | 'lessons' | 'detail' | 'quiz'>('home');
  
  // --- Persistent Stats State ---
  const [studySeconds, setStudySeconds] = useState(0);
  const [stats, setStats] = useState<UserStats>({
    fullName: '',
    grade: 11,
    totalCorrect: 0,
    totalQuestions: 0,
    completedLessonIds: [],
    totalPoints: 0
  });

  // --- Quiz Session State ---
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

  // --- Study Timer Effect ---
  useEffect(() => {
    let interval: number;
    if (isLoggedIn) {
      interval = window.setInterval(() => {
        setStudySeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const progressPercentage = useMemo(() => {
    if (!selectedGrade) return 0;
    const totalInGrade = CURRICULUM[selectedGrade].length;
    const completedInGrade = stats.completedLessonIds.filter(id => id.startsWith(selectedGrade.toString())).length;
    return Math.round((completedInGrade / totalInGrade) * 100);
  }, [selectedGrade, stats.completedLessonIds]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setStats(prev => ({ ...prev, fullName: fullName }));
      setIsLoggedIn(true);
      setIsLoggingIn(false);
    }, 800);
  };

  const handleSelectGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setStats(prev => ({ ...prev, grade }));
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
    // Đánh dấu đã học bài này
    if (!stats.completedLessonIds.includes(lesson.id)) {
      setStats(prev => ({
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lesson.id]
      }));
    }
    
    setChatMessages([
      { 
        role: 'model', 
        text: `Chào em ${fullName.split(' ').pop()}! Thầy là trợ lý Tin học Pro. Chúng ta cùng bắt đầu bài "${lesson.title}" nhé.`, 
        timestamp: new Date() 
      }
    ]);
    if (selectedGrade) {
      chatRef.current = createLearningChat(selectedGrade, lesson);
    }
  };

  // FIX: Added resetToHome function to reset navigation to home view
  const resetToHome = () => {
    setView('home');
    setSelectedGrade(null);
    setSelectedTopic(null);
    setSelectedLesson(null);
    setChatMessages([]);
  };

  // FIX: Added handleAnswerSelect to manage quiz interactions
  const handleAnswerSelect = (idx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIdx] = idx;
    setUserAnswers(newAnswers);
  };

  const startQuiz = () => {
    if (!selectedLesson?.questions) return;
    setCurrentQuestionIdx(0);
    setUserAnswers(new Array(selectedLesson.questions.length).fill(null));
    setShowResult(false);
    setView('quiz');
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < (selectedLesson?.questions?.length || 0) - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Cập nhật stats khi hoàn thành bài quiz
      const correctCount = userAnswers.reduce((acc, ans, idx) => {
        return ans === selectedLesson!.questions![idx].correctAnswer ? (acc as number) + 1 : (acc as number);
      }, 0) as number;

      setStats(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + correctCount,
        totalQuestions: prev.totalQuestions + (selectedLesson?.questions?.length || 0),
        totalPoints: prev.totalPoints + (correctCount * 10)
      }));
      setShowResult(true);
    }
  };

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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100 mb-6">
              <BookOpen size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tin Học <span className="text-blue-600">Pro</span></h1>
            <p className="text-slate-500 font-medium mt-3 uppercase tracking-widest text-xs">Hệ thống học tập cá nhân hóa</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và Tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email / Mã HS</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hs@school.edu.vn" className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center">
                {isLoggingIn ? <Loader2 size={24} className="animate-spin" /> : "Vào lớp học"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* --- HEADER WITH STATS --- */}
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={resetToHome}>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><BookOpen size={20} /></div>
          <h1 className="text-xl font-black text-slate-800">Tin Học <span className="text-blue-600">Pro</span></h1>
        </div>

        <div className="hidden md:flex items-center space-x-6 border-x px-8 mx-4">
           <div className="flex flex-col items-center">
             <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Thời gian</span>
             <div className="flex items-center text-blue-600 font-mono font-bold text-sm">
               <Clock size={14} className="mr-1" /> {formatTime(studySeconds)}
             </div>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Điểm số</span>
             <div className="flex items-center text-emerald-600 font-bold text-sm">
               <Trophy size={14} className="mr-1" /> {stats.totalPoints}
             </div>
           </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Học sinh</p>
            <p className="text-sm font-black text-slate-700 leading-none">{stats.fullName}</p>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-10">
        
        {/* --- VIEW 1: HOME & DASHBOARD --- */}
        {view === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Dashboard Stats Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><User size={120} /></div>
                 <div className="z-10">
                   <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6"><Award size={24} /></div>
                   <h2 className="text-2xl font-black">{stats.fullName}</h2>
                   <p className="opacity-80 font-bold text-sm">Học sinh chuyên Tin</p>
                 </div>
                 <div className="mt-8 z-10 flex items-center space-x-2 bg-black/20 w-fit px-4 py-2 rounded-full border border-white/10">
                   <Target size={16} />
                   <span className="text-xs font-bold uppercase tracking-widest">Level 1</span>
                 </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><Clock size={24} /></div>
                  <p className="text-2xl font-black text-slate-800">{formatTime(studySeconds)}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Thời gian học</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><Target size={24} /></div>
                  <p className="text-2xl font-black text-slate-800">{stats.totalCorrect} <span className="text-slate-300 font-normal text-lg">/ {stats.totalQuestions}</span></p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Câu trả lời đúng</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Award size={24} /></div>
                  <p className="text-2xl font-black text-slate-800">{stats.totalPoints}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Điểm tích lũy</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4 pt-4">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">Hôm nay em muốn bắt đầu từ đâu?</span>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">Lựa chọn khối lớp học tập</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[11, 12].map((grade) => (
                <button key={grade} onClick={() => handleSelectGrade(grade as Grade)} className="group bg-white p-12 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-blue-500 transition-all hover:-translate-y-2 text-left relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-50 group-hover:text-blue-50 transition-colors">{grade === 11 ? <Database size={160} /> : <Cpu size={160} />}</div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${grade === 11 ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}><GraduationCap size={32} /></div>
                    <h3 className="text-3xl font-black text-slate-900">Khối lớp {grade}</h3>
                    <div className="mt-8 flex items-center justify-between">
                       <div className={`inline-flex items-center font-black ${grade === 11 ? 'text-blue-600' : 'text-indigo-600'}`}>Bắt đầu <ChevronRight size={20} className="ml-2" /></div>
                       <div className="text-xs font-bold text-slate-400">Tiến trình: {stats.completedLessonIds.filter(id => id.startsWith(grade.toString())).length} bài</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 2: TOPICS --- */}
        {view === 'topics' && selectedGrade && (
          <div className="space-y-8 animate-in slide-in-from-left duration-500">
            <div className="flex items-center justify-between">
              <button onClick={() => setView('home')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold group"><ArrowLeft size={20} className="mr-2" /> Quay lại</button>
              <div className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-blue-100">
                <TrendingUp size={18} className="mr-2" />
                <span className="text-sm font-black uppercase tracking-widest">Tiến trình lớp {selectedGrade}: {progressPercentage}%</span>
              </div>
            </div>
            
            <div className="bg-blue-600 h-2 w-full rounded-full overflow-hidden bg-blue-100">
               <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <h2 className="text-4xl font-black text-slate-900">Chủ đề lớp {selectedGrade}</h2>
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

        {/* --- VIEW 3: LESSONS --- */}
        {view === 'lessons' && selectedTopic && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <button onClick={() => setView('topics')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold group"><ArrowLeft size={20} className="mr-2" /> Quay lại chủ đề</button>
            <h2 className="text-4xl font-black text-slate-900">{selectedTopic}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredLessons.map((lesson) => (
                <div key={lesson.id} onClick={() => handleSelectLesson(lesson)} className={`bg-white p-8 rounded-3xl shadow-sm border-2 transition-all hover:shadow-2xl group cursor-pointer ${stats.completedLessonIds.includes(lesson.id) ? 'border-emerald-100' : 'border-transparent hover:border-blue-500'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase">{lesson.id}</span>
                    {stats.completedLessonIds.includes(lesson.id) && <div className="p-1 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle2 size={20} /></div>}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors mb-4">{lesson.title}</h3>
                  <p className="text-slate-500 line-clamp-2 text-sm font-medium">{lesson.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 4: DETAIL --- */}
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
                  <button onClick={startQuiz} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2">
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
                  <div className="font-mono text-sm space-y-4 text-blue-100/80 italic leading-relaxed">
                    <p>Học sinh: {fullName}</p>
                    <p>Mã HS: {email.split('@')[0]}</p>
                    <p>Điểm hiện tại: {stats.totalPoints}</p>
                    <hr className="opacity-10" />
                    <p className="text-xs">Sử dụng Trợ lý AI để thảo luận thêm về kiến thức lớp {selectedGrade}.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 5: QUIZ --- */}
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
                    {currentQuestionIdx === selectedLesson.questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 sm:p-16 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Award size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4">Hoàn thành bài tập!</h2>
                <p className="text-slate-500 font-bold text-xl mb-10">Chúc mừng {fullName}! Em đã xuất sắc hoàn thành phần trắc nghiệm.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-12">
                   <div className="p-6 bg-slate-50 rounded-3xl">
                      <p className="text-3xl font-black text-slate-800">{userAnswers.reduce((acc, ans, idx) => ans === selectedLesson!.questions![idx].correctAnswer ? (acc as number) + 1 : (acc as number), 0) as number}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Câu trả lời đúng</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-3xl">
                      <p className="text-3xl font-black text-emerald-600">+{ (userAnswers.reduce((acc, ans, idx) => ans === selectedLesson!.questions![idx].correctAnswer ? (acc as number) + 1 : (acc as number), 0) as number) * 10 }</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Điểm tích lũy</p>
                   </div>
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
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Hỏi về bài học..." className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
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
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Tin Học Pro • {fullName} • Lớp {stats.grade}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
