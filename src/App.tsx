import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  BarChart3, 
  GraduationCap,
  Play,
  ArrowRight,
  Home as HomeIcon,
  HelpCircle,
  Menu,
  X,
  Cpu,
  Users,
  Shield,
  Zap,
  Monitor,
  Calculator,
  Trophy,
  Info
} from 'lucide-react';
import { subjects, type Question, type Subject } from './data';

// --- Types ---
export interface ScoreEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  score: number;
  correct: number;
  total: number;
  date: string;
}

// --- Components ---

const Navbar = ({ currentPage, onNavigate }: { currentPage: string, onNavigate: (page: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-primary-light bg-clip-text text-transparent">
              QuizMaster Pro
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')} 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('quiz')} 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'quiz' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Quiz
            </button>
            <button 
              onClick={() => onNavigate('leaderboard')} 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'leaderboard' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Leaderboard
            </button>
            <button 
              onClick={() => onNavigate('about')} 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'about' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              About
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-400 hover:text-white">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-secondary border-b border-white/10 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button 
                onClick={() => { onNavigate('home'); setIsOpen(false); }} 
                className="block w-full text-left px-3 py-4 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                Home
              </button>
              <button 
                onClick={() => { onNavigate('quiz'); setIsOpen(false); }} 
                className="block w-full text-left px-3 py-4 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                Quiz
              </button>
              <button 
                onClick={() => { onNavigate('leaderboard'); setIsOpen(false); }} 
                className="block w-full text-left px-3 py-4 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                Leaderboard
              </button>
              <button 
                onClick={() => { onNavigate('about'); setIsOpen(false); }} 
                className="block w-full text-left px-3 py-4 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                About
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Icons Helper ---
const SubjectIcon = ({ icon, className = "w-8 h-8", size }: { icon: string, className?: string, size?: number }) => {
  switch (icon) {
    case 'Brain': return <Brain className={className} size={size} />;
    case 'BookOpen': return <BookOpen className={className} size={size} />;
    case 'Cpu': return <Cpu className={className} size={size} />;
    case 'Users': return <Users className={className} size={size} />;
    case 'Shield': return <Shield className={className} size={size} />;
    case 'Zap': return <Zap className={className} size={size} />;
    case 'Monitor': return <Monitor className={className} size={size} />;
    case 'Calculator': return <Calculator className={className} size={size} />;
    default: return <BookOpen className={className} size={size} />;
  }
};

export default function App() {
  const [page, setPage] = useState('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ai');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { selected: number | boolean, correct: boolean }>>({});
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const currentQuestion = currentSubject.questions[currentIndex];
  
  const totalQuestionsAllSubjects = subjects.reduce((acc, s) => acc + s.questions.length, 0);
  
  // Load leaderboard from local storage
  useEffect(() => {
    const saved = localStorage.getItem('quizMasterLeaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse leaderboard data');
      }
    }
  }, []);

  const correctCount = useMemo(() => 
    (Object.values(answers) as { correct: boolean }[]).filter(a => a.correct).length,
  [answers]);

  const wrongCount = useMemo(() => 
    (Object.values(answers) as { correct: boolean }[]).filter(a => !a.correct).length,
  [answers]);

  const isFinished = Object.keys(answers).length === currentSubject.questions.length;

  const handleStartSubject = (id: string) => {
    setSelectedSubjectId(id);
    setCurrentIndex(0);
    setAnswers({});
    setPage('quiz');
  };

  const handleSelectOption = (idx: number | boolean) => {
    if (answers[currentIndex]) return; // Already answered

    const isCorrect = currentQuestion.options 
      ? idx === currentQuestion.correct
      : idx === currentQuestion.answer;

    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { selected: idx, correct: !!isCorrect }
    }));
  };

  const handleResetQuestion = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const score = Math.round((correctCount / currentSubject.questions.length) * 100);

  const handleFinishQuiz = () => {
    // Save to leaderboard
    const newEntry: ScoreEntry = {
      id: Date.now().toString(),
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      score,
      correct: correctCount,
      total: currentSubject.questions.length,
      date: new Date().toISOString()
    };
    
    const updatedLeaderboard = [newEntry, ...leaderboard];
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('quizMasterLeaderboard', JSON.stringify(updatedLeaderboard));
    
    setPage('results');
  };

  const clearLeaderboard = () => {
    if (window.confirm('Are you sure you want to clear all your quiz history?')) {
      setLeaderboard([]);
      localStorage.removeItem('quizMasterLeaderboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary overflow-x-hidden text-slate-50">
      <Navbar currentPage={page} onNavigate={setPage} />
      
      <main className="flex-grow pt-20 px-4 pb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto w-full"
            >
              {/* Hero */}
              <div className="flex flex-col lg:flex-row items-center gap-12 py-8 lg:py-16">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold mb-6">
                    <GraduationCap className="w-4 h-4" />
                    Multi-subject Learning Hub
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                    Master your skills in <br />
                    <span className="text-primary-light">AI & Computing</span>
                  </h1>
                  <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Test your knowledge with our professional-grade quizzes. Whether you're learning Python for AI or sharpening your IT and English grammar, we've got you covered.
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 border-t border-white/5 pt-8">
                    <div>
                      <div className="text-2xl font-bold text-primary">{totalQuestionsAllSubjects}+</div>
                      <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total Questions</div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div>
                      <div className="text-2xl font-bold text-primary">{subjects.length}</div>
                      <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Key Subjects</div>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div>
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Self-Paced</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative hidden lg:block">
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative grid grid-cols-2 gap-4">
                    {[
                      { icon: <Brain />, text: 'Python', color: 'bg-primary' },
                      { icon: <GraduationCap />, text: 'Grammar', color: 'bg-indigo-500' },
                      { icon: <Calculator />, text: 'Math & Logic', color: 'bg-emerald-600' },
                      { icon: <Play />, text: 'IT Terms', color: 'bg-violet-500' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        className="bg-bg-card border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl backdrop-blur-sm"
                      >
                        <div className={`p-3 ${item.color} rounded-xl shadow-lg`}>
                          {item.icon}
                        </div>
                        <span className="font-bold text-slate-200">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {subjects.map((subject) => (
                  <motion.div
                    key={subject.id}
                    whileHover={{ y: -5 }}
                    className="p-8 bg-bg-card border border-white/10 rounded-3xl group transition-all hover:bg-bg-card-hover hover:border-primary/50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <SubjectIcon icon={subject.icon} size={80} />
                    </div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <SubjectIcon icon={subject.icon} className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{subject.name}</h3>
                      <p className="text-slate-400 mb-6 leading-relaxed">
                        {subject.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="px-3 py-1 bg-bg-secondary rounded-full text-xs font-bold text-primary-light">
                          {subject.questions.length} Questions
                        </span>
                        <button 
                          onClick={() => handleStartSubject(subject.id)}
                          className="flex items-center gap-2 font-bold text-primary hover:text-white transition-colors"
                        >
                          Start Quiz <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {page === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-3xl mx-auto w-full"
            >
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <SubjectIcon icon={currentSubject.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{currentSubject.name}</h2>
                  </div>
                  <div className="text-slate-400 font-mono text-sm px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-primary font-bold">{currentIndex + 1}</span> / {currentSubject.questions.length}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / currentSubject.questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-primary-light"
                  />
                </div>
                <div className="flex gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/20 rounded-full text-xs font-bold text-success">
                    <CheckCircle2 className="w-3 h-3" /> {correctCount}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-danger/10 border border-danger/20 rounded-full text-xs font-bold text-danger">
                    <XCircle className="w-3 h-3" /> {wrongCount}
                  </div>
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-bg-card border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl"
                >
                  <div className="mb-6 flex justify-between items-start">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                      {currentQuestion.options ? 'Multiple Choice' : 'True/False'}
                    </span>
                    {answers[currentIndex] && (
                      <button 
                        onClick={handleResetQuestion}
                        className="p-2 text-slate-500 hover:text-warning hover:bg-warning/10 rounded-lg transition-all"
                        title="Reset this question"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-8 leading-tight text-slate-100">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-4">
                    {currentQuestion.options ? (
                      currentQuestion.options.map((opt, i) => {
                        const status = answers[currentIndex];
                        const isCorrect = i === currentQuestion.correct;
                        const isSelected = status?.selected === i;
                        
                        let stateStyles = "border-white/10 hover:border-primary/50 hover:bg-white/5";
                        if (status) {
                          if (isCorrect) stateStyles = "border-success bg-success/10 text-success-light";
                          else if (isSelected) stateStyles = "border-danger bg-danger/10 text-danger-light";
                          else stateStyles = "opacity-40 border-white/5";
                        } else if (isSelected) {
                          stateStyles = "border-primary bg-primary/10";
                        }

                        return (
                          <button
                            key={i}
                            disabled={!!status}
                            onClick={() => handleSelectOption(i)}
                            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all group flex items-start gap-4 ${stateStyles}`}
                          >
                            <div className={`mt-0.5 w-6 h-6 min-w-[1.5rem] rounded-full border-2 flex items-center justify-center transition-colors
                              ${status ? (isCorrect ? 'bg-success border-success' : isSelected ? 'bg-danger border-danger' : 'border-white/10') : 'border-white/20 group-hover:border-primary'}
                            `}>
                              {status && (isCorrect ? <CheckCircle2 className="w-4 h-4 text-white" /> : isSelected ? <XCircle className="w-4 h-4 text-white" /> : null)}
                            </div>
                            <span className="font-medium text-lg">{opt}</span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {[true, false].map((val) => {
                          const status = answers[currentIndex];
                          const isCorrect = val === currentQuestion.answer;
                          const isSelected = status?.selected === val;

                          let stateStyles = "border-white/10 hover:border-primary/50 hover:bg-white/5";
                          if (status) {
                            if (isCorrect) stateStyles = "border-success bg-success/10 text-success-light";
                            else if (isSelected) stateStyles = "border-danger bg-danger/10 text-danger-light";
                            else stateStyles = "opacity-40 border-white/5";
                          }

                          return (
                            <button
                              key={val.toString()}
                              disabled={!!status}
                              onClick={() => handleSelectOption(val)}
                              className={`p-6 sm:p-8 rounded-2xl border-2 transition-all font-bold text-xl ${stateStyles}`}
                            >
                              {val ? 'TRUE' : 'FALSE'}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {answers[currentIndex] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-8 p-6 rounded-2xl border ${answers[currentIndex].correct ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}
                    >
                      <div className={`flex items-center gap-2 font-bold mb-2 ${answers[currentIndex].correct ? 'text-success' : 'text-danger'}`}>
                        {answers[currentIndex].correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {answers[currentIndex].correct ? 'Perfectly Correct!' : 'Good effort, but not quite.'}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {currentQuestion.explanation || currentQuestion.correction || 'Correct answer highlighted above.'}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center gap-4">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(c => c - 1)}
                  className="px-6 py-3 rounded-xl bg-bg-secondary border border-white/10 text-slate-300 font-bold hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>

                {currentIndex === currentSubject.questions.length - 1 ? (
                  <button 
                    disabled={!isFinished}
                    onClick={handleFinishQuiz}
                    className="px-8 py-3 rounded-xl bg-success text-white font-bold shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finish Quiz <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    disabled={!answers[currentIndex]}
                    onClick={() => setCurrentIndex(c => c + 1)}
                    className="px-10 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {page === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className="bg-bg-card border border-white/10 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-success/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                  <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center shadow-2xl
                    ${score >= 70 ? 'bg-success text-white' : score >= 50 ? 'bg-warning text-slate-900' : 'bg-danger text-white'}
                  `}>
                    {score >= 70 ? <CheckCircle2 size={48} /> : score >= 50 ? <HelpCircle size={48} /> : <XCircle size={48} />}
                  </div>
                  
                  <h2 className="text-4xl font-extrabold mb-2">Quiz Completed!</h2>
                  <p className="text-slate-400 font-medium mb-10">Your Performance in {currentSubject.name}</p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
                    {/* Radial Score */}
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                        <motion.circle 
                          cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" 
                          strokeDasharray={2 * Math.PI * 88}
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - score / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'} 
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                        <span className="text-5xl font-black">{score}</span>
                        <span className="text-slate-500 font-bold uppercase tracking-tighter">Percent</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left">
                        <div className="text-success mb-1 font-black text-2xl">{correctCount}</div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Correct</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left">
                        <div className="text-danger mb-1 font-black text-2xl">{wrongCount}</div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Incorrect</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl text-left col-span-2">
                        <div className="text-primary mb-1 font-black text-2xl">{currentSubject.questions.length}</div>
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Questions</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={() => handleStartSubject(selectedSubjectId)}
                      className="px-10 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <RotateCcw className="w-5 h-5" /> Retake Quiz
                    </button>
                    <button 
                      onClick={() => setPage('home')}
                      className="px-10 py-4 bg-bg-secondary border border-white/10 text-slate-200 font-bold rounded-2xl hover:bg-white/5 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <HomeIcon className="w-5 h-5" /> Back to Home
                    </button>
                    <button 
                      onClick={() => setPage('leaderboard')}
                      className="px-10 py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold rounded-2xl hover:bg-indigo-600/30 active:scale-95 transition-all flex items-center gap-3"
                    >
                      <Trophy className="w-5 h-5" /> View Leaderboard
                    </button>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="mt-16 text-left border-t border-white/5 pt-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Detailed Breakdown
                    </h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {currentSubject.questions.map((q, i) => {
                      const answer = answers[i];
                      return (
                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                            ${answer?.correct ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}
                          `}>
                            {answer?.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-tighter font-black text-slate-500 mb-0.5">Question {i + 1}</div>
                            <div className="text-sm font-medium text-slate-300 truncate">{q.question}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-warning" />
                    My Leaderboard
                  </h2>
                  <p className="text-slate-400 mt-2">Track your learning progress and top scores</p>
                </div>
                {leaderboard.length > 0 && (
                  <button 
                    onClick={clearLeaderboard}
                    className="px-4 py-2 text-sm font-bold text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {leaderboard.length === 0 ? (
                <div className="bg-bg-card border border-white/10 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No scores yet!</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Take a quiz to see your performance history and track your improvement over time.
                  </p>
                  <button 
                    onClick={() => setPage('home')}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Take a Quiz
                  </button>
                </div>
              ) : (
                <div className="bg-bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                          <th className="p-5">Subject</th>
                          <th className="p-5">Score</th>
                          <th className="p-5">Correct</th>
                          <th className="p-5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaderboard.map((entry, index) => (
                          <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-5">
                              <div className="font-bold text-slate-200">{entry.subjectName}</div>
                            </td>
                            <td className="p-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border
                                ${entry.score >= 70 ? 'bg-success/10 text-success border-success/20' : 
                                  entry.score >= 50 ? 'bg-warning/10 text-warning border-warning/20' : 
                                  'bg-danger/10 text-danger border-danger/20'}
                              `}>
                                {entry.score}%
                              </div>
                            </td>
                            <td className="p-5 text-slate-300 font-medium">
                              {entry.correct} / {entry.total}
                            </td>
                            <td className="p-5 text-slate-400 text-sm">
                              {new Date(entry.date).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {page === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-3xl mx-auto w-full"
            >
              <div className="bg-bg-card border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Info className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-white">About QuizMaster Pro</h2>
                    <p className="text-slate-400">Your ultimate learning and testing platform</p>
                  </div>
                </div>

                <div className="space-y-8 text-slate-300 leading-relaxed">
                  <p className="text-lg">
                    QuizMaster Pro is a comprehensive educational platform designed to help students, developers, and lifelong learners test their knowledge across a variety of crucial domains in modern computing and general knowledge.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Comprehensive Coverage
                      </h4>
                      <p className="text-sm text-slate-400">From AI fundamentals and OS architecture to Mathematics and English grammar.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <h4 className="text-success font-bold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Instant Feedback
                      </h4>
                      <p className="text-sm text-slate-400">Detailed explanations provided immediately after answering to reinforce learning.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <h4 className="text-warning font-bold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Performance Tracking
                      </h4>
                      <p className="text-sm text-slate-400">Save your scores locally and track your progress over time on the Leaderboard.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                      <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Developer Focused
                      </h4>
                      <p className="text-sm text-slate-400">Built with modern tech: React, Tailwind CSS, and Framer Motion.</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8 mt-8">
                    <h3 className="text-xl font-bold mb-4 text-white">Project Information</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-400">Version</span>
                        <span className="font-mono font-bold">2.1.0</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-400">Author</span>
                        <span className="font-bold">Ahmed Abdelhamid Abdelfattah</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-400">Section</span>
                        <span className="font-bold">Artificial Intelligence Programming</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-slate-400">Tech Stack</span>
                        <span className="font-bold text-sm bg-white/10 px-2 py-1 rounded">React • Vite • Tailwind</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={() => setPage('home')}
                      className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                      Start Learning Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="py-8 px-4 border-t border-white/5 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div className="text-center md:text-left">
            <p className="font-bold text-slate-400 mb-1">Ahmed Abdelhamid Abdelfattah</p>
            <p>Artificial Intelligence Programming Section</p>
          </div>
          <p>© {new Date().getFullYear()} QuizMaster Pro • Multi-Subject Learning Platform</p>
        </div>
      </footer>
    </div>
  );
}

