import { useEffect, useState } from 'react';
import lessonsData from './data/learning_material.json';
import questionsData from './data/questions.json';
import { Lesson, Question, UserProgress } from './types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  ChevronLeft,
  Trophy,
  BrainCircuit,
  ArrowBigRightDash,
  Home
} from 'lucide-react';
import QuizView from './components/Quiz.tsx';
import ResultsView from './components/Results.tsx';

const lessons = lessonsData as Lesson[];
const questions = questionsData as Question[];

type View = 'home' | 'lessons' | 'lesson-content' | 'practice' | 'exam' | 'results';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('science-app-progress');
    return saved ? JSON.parse(saved) : { completedLessons: [], lastExamScore: null, bestExamScore: null };
  });

  useEffect(() => {
    localStorage.setItem('science-app-progress', JSON.stringify(progress));
  }, [progress]);

  const markLessonComplete = (lessonId: string) => {
    if (!progress.completedLessons.includes(lessonId)) {
      setProgress(prev => ({
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-black" dir="rtl">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-black">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 font-black text-3xl tracking-tighter italic hover:opacity-80 transition-opacity"
          >
            <span>HEART+</span>
          </button>
          
          <div className="flex gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <NavButton label="לימוד" active={currentView === 'lessons'} onClick={() => setCurrentView('lessons')} />
              <NavButton label="תרגול" active={currentView === 'practice'} onClick={() => setCurrentView('practice')} />
              <NavButton label="מבחן" active={currentView === 'exam'} onClick={() => setCurrentView('exam')} />
            </nav>
            {progress.bestExamScore !== null && (
              <div className="flex items-center gap-2 bg-brand-highlight border-2 border-brand-black px-4 py-1 font-black italic text-sm shadow-[4px_4px_0px_0px_#1A1A1A]">
                <Trophy size={16} />
                <span>שיא: {progress.bestExamScore}%</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 text-center py-12"
            >
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black leading-none italic tracking-tighter">
                  מוכנים למבחן <br /> <span className="underline decoration-8 decoration-brand-highlight">במדעים?</span>
                </h1>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 max-w-md mx-auto">
                  המסע בתוך הגוף מתחיל כאן. בואו נלמד איך הדם זורם, איך הלב פועם ואיך הכל עובד יחד.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <HomeCard 
                  title="לימוד פרקים"
                  description="כל מה שצריך לדעת על הלב וכלי הדם"
                  onClick={() => setCurrentView('lessons')}
                  color="highlight"
                  count={`${progress.completedLessons.length}/${lessons.length}`}
                />
                <HomeCard 
                  title="אזור תרגול"
                  description="משחקים ושאלות כדי לראות מה הבנו"
                  onClick={() => setCurrentView('practice')}
                  color="white"
                />
                <HomeCard 
                  title="מבחן מסכם"
                  description="מרגישים שהגעתם לשיא? בואו נבדוק"
                  onClick={() => setCurrentView('exam')}
                  color="accent"
                />
              </div>
            </motion.div>
          )}

          {currentView === 'lessons' && (
            <motion.div 
              key="lessons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="text-slate-400" />
                  פרקי לימוד
                </h2>
                <div className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold">
                  {progress.completedLessons.length} / {lessons.length} הושלמו
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lessons.map((lesson, idx) => (
                  <LessonButton 
                    key={lesson.id}
                    lesson={lesson}
                    index={idx}
                    isCompleted={progress.completedLessons.includes(lesson.id)}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setCurrentView('lesson-content');
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'lesson-content' && selectedLesson && (
            <LessonContentView 
              lesson={selectedLesson} 
              onBack={() => setCurrentView('lessons')}
              onComplete={() => {
                markLessonComplete(selectedLesson.id);
                setCurrentView('lessons');
              }}
            />
          )}

          {(currentView === 'practice' || currentView === 'exam') && (
            <motion.div key={currentView}>
              <QuizView 
                mode={currentView} 
                onFinish={(score) => {
                  const isExam = currentView === 'exam';
                  if (isExam) {
                    setProgress(prev => {
                      const newBest = Math.max(prev.bestExamScore || 0, score);
                      return {
                        ...prev,
                        lastExamScore: score,
                        bestExamScore: newBest
                      };
                    });
                  } else {
                     setProgress(prev => ({ ...prev, lastExamScore: score }));
                  }
                  setCurrentView('results');
                }}
                onCancel={() => setCurrentView('home')}
              />
            </motion.div>
          )}

          {currentView === 'results' && (
            <motion.div key="results">
              <ResultsView 
                score={progress.lastExamScore || 0} 
                onHome={() => setCurrentView('home')}
                onRetry={() => setCurrentView('exam')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-brand-black p-2 flex justify-around items-center z-50">
        <NavButton label="בית" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton label="לימוד" active={currentView === 'lessons'} onClick={() => setCurrentView('lessons')} />
        <NavButton label="תרגול" active={currentView === 'practice'} onClick={() => setCurrentView('practice')} />
        <NavButton label="מבחן" active={currentView === 'exam'} onClick={() => setCurrentView('exam')} />
      </div>
    </div>
  );
}

function NavButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
        active 
          ? 'bg-brand-black text-white' 
          : 'opacity-40 hover:opacity-100'
      }`}
    >
      <span>{label}</span>
    </button>
  );
}

function HomeCard({ title, description, onClick, color, count }: any) {
  const bgColors: any = {
    highlight: 'bg-brand-highlight',
    accent: 'bg-brand-accent text-white',
    white: 'bg-white',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-8 border-2 border-brand-black rounded-none text-right transition-transform hover:-translate-x-1 hover:-translate-y-1 shadow-brutalist ${bgColors[color]}`}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{color === 'highlight' ? 'Lesson' : color === 'accent' ? 'Exam' : 'Quiz'}</span>
        {count && <span className="text-xs bg-brand-black/10 px-2 py-0.5 font-bold">{count}</span>}
      </div>
      <h3 className="text-2xl font-black mb-2 italic uppercase">
        {title}
      </h3>
      <p className="text-sm font-medium leading-relaxed opacity-80">{description}</p>
    </button>
  );
}

function LessonButton({ lesson, index, isCompleted, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 p-6 border-2 border-brand-black text-right transition-transform hover:-translate-x-1 hover:-translate-y-1 shadow-brutalist overflow-hidden ${isCompleted ? 'bg-brand-highlight' : 'bg-white'}`}
    >
      <div className={`w-12 h-12 border-2 border-brand-black flex items-center justify-center font-black italic text-xl ${isCompleted ? 'bg-brand-black text-white' : 'bg-white'}`}>
        {isCompleted ? '✓' : index + 1}
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-black italic uppercase leading-none">{lesson.title}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">{lesson.shortSummary}</p>
      </div>
    </button>
  );
}

function LessonContentView({ lesson, onBack, onComplete }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border-2 border-brand-black shadow-brutalist overflow-hidden"
    >
      <div className="p-8 border-b-2 border-brand-black flex items-center justify-between bg-white">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 border-2 border-brand-black rounded-full flex items-center justify-center hover:bg-brand-highlight transition-colors">
            <ArrowBigRightDash size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-black italic uppercase leading-none">{lesson.title}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">{lesson.shortSummary}</p>
          </div>
        </div>
      </div>
      
      <div className="p-10 space-y-12">
        <div className="prose prose-slate max-w-none">
          <ul className="space-y-6 list-none p-0">
            {lesson.explanation.map((item: string, i: number) => (
              <li key={i} className="flex gap-6 items-start text-xl font-medium leading-relaxed">
                <div className="mt-2 w-4 h-4 border-2 border-brand-black bg-brand-highlight flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="border-2 border-brand-black p-8 bg-[#FFFFFF]">
            <h3 className="text-lg font-black italic uppercase underline decoration-4 decoration-brand-highlight mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} />
              נקודות לזכור
            </h3>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-wide opacity-80">
              {lesson.remember.map((item: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="text-brand-accent">▶</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-2 border-brand-black p-8 bg-brand-highlight flex flex-col justify-center">
            <h3 className="text-lg font-black italic uppercase mb-2">
              הידעת?
            </h3>
            <p className="text-sm font-bold leading-relaxed">{lesson.didYouKnow}</p>
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full py-6 bg-brand-black text-white font-black italic text-xl uppercase tracking-widest hover:bg-opacity-90 transition-all border-2 border-brand-black shadow-[8px_8px_0px_0px_#FF7262]"
        >
          הבנתי, בוא נמשיך!
        </button>
      </div>
    </motion.div>
  );
}
