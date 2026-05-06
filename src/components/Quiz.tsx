import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  RotateCcw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { Question } from '../types';
import questionsData from '../data/questions.json';

interface QuizProps {
  mode: 'practice' | 'exam';
  onFinish: (score: number) => void;
  onCancel: () => void;
}

const questions = questionsData as Question[];

export default function QuizView({ mode, onFinish, onCancel }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const quizQuestions = useMemo(() => {
    if (mode === 'exam') {
      return [...questions].sort(() => Math.random() - 0.5);
    }
    return questions;
  }, [mode]);

  const currentQuestion = quizQuestions[currentIndex];
  
  const handleAnswer = (answer: any) => {
    if (showFeedback && mode === 'practice') return;
    
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setAttempted(true);
    
    if (mode === 'practice') {
      setShowFeedback(true);
    }
  };

  const handleOrderingSubmit = () => {
    if (mode === 'practice') {
      setShowFeedback(true);
    }
    setAttempted(true);
  };

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
      setAttempted(false);
    } else {
      const score = calculateScore();
      onFinish(score);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach(q => {
      const userAns = userAnswers[q.id];
      if (checkIsCorrect(q, userAns)) {
        correct++;
      }
    });
    return Math.round((correct / quizQuestions.length) * 100);
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100">ביטול</button>
          <div className="h-3 w-48 bg-white border-2 border-brand-black rounded-none overflow-hidden">
            <motion.div 
              className="h-full bg-brand-highlight"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">שאלה {currentIndex + 1} / {quizQuestions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white p-10 border-2 border-brand-black shadow-brutalist space-y-8"
        >
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-black text-white px-2 py-1">{currentQuestion.topic.replace('_', ' ')}</span>
            <h3 className="text-3xl font-black italic uppercase leading-tight">{currentQuestion.question}</h3>
          </div>

          <div className="space-y-4">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, idx) => (
              <AnswerButton 
                key={idx}
                label={option}
                selected={userAnswers[currentQuestion.id] === option}
                correct={showFeedback && option === currentQuestion.answer}
                wrong={showFeedback && userAnswers[currentQuestion.id] === option && option !== currentQuestion.answer}
                disabled={showFeedback && mode === 'practice'}
                onClick={() => handleAnswer(option)}
              />
            ))}

            {currentQuestion.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                <AnswerButton 
                  label="נכון" 
                  selected={userAnswers[currentQuestion.id] === true}
                  correct={showFeedback && currentQuestion.answer === true}
                  wrong={showFeedback && userAnswers[currentQuestion.id] === true && currentQuestion.answer !== true}
                  onClick={() => handleAnswer(true)}
                />
                <AnswerButton 
                  label="לא נכון" 
                  selected={userAnswers[currentQuestion.id] === false}
                  correct={showFeedback && currentQuestion.answer === false}
                  wrong={showFeedback && userAnswers[currentQuestion.id] === false && currentQuestion.answer !== false}
                  onClick={() => handleAnswer(false)}
                />
              </div>
            )}
            
            {currentQuestion.type === 'ordering' && (
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 italic">בחר את השלבים לפי הסדר:</p>
                <div className="flex flex-wrap gap-2 justify-center p-4 min-h-[60px] bg-brand-bg/50 border-2 border-dashed border-brand-black/20">
                  {(userAnswers[currentQuestion.id] || []).map((item: string, idx: number) => (
                    <div key={idx} className="bg-brand-highlight text-brand-black px-4 py-2 border-2 border-brand-black font-black italic flex items-center gap-3">
                      <span className="text-xs bg-brand-black text-white w-5 h-5 flex items-center justify-center rounded-full italic">{idx + 1}</span>
                      {item}
                      <button onClick={() => {
                        const newOrder = [...userAnswers[currentQuestion.id]];
                        newOrder.splice(idx, 1);
                        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: newOrder }));
                      }} className="hover:text-brand-accent">×</button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(currentQuestion.items || []).filter(i => !(userAnswers[currentQuestion.id] || []).includes(i)).map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        const currentOrder = userAnswers[currentQuestion.id] || [];
                        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: [...currentOrder, item] }));
                      }}
                      className="p-3 bg-white border-2 border-brand-black font-bold text-sm hover:bg-brand-highlight transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {attempted && !showFeedback && mode === 'practice' && (
                  <button 
                    onClick={() => handleOrderingSubmit()}
                    className="w-full py-4 bg-brand-black text-white font-black italic uppercase tracking-widest"
                  >
                    בדוק סדר
                  </button>
                )}
              </div>
            )}
            
            {currentQuestion.type === 'matching' && (
               <div className="border-2 border-brand-black p-8 bg-brand-bg space-y-6">
                 <p className="text-[10px] font-bold uppercase tracking-widest">התאם בין המושגים להסברים:</p>
                 <div className="space-y-3">
                   {currentQuestion.pairs?.map((pair, idx) => (
                     <div key={idx} className="flex gap-4 text-right bg-white p-4 border-2 border-brand-black">
                       <span className="font-black italic text-brand-accent uppercase">{pair.left}:</span>
                       <span className="font-bold opacity-80">{pair.right}</span>
                     </div>
                   ))}
                 </div>
                 <button 
                  onClick={() => handleAnswer(true)}
                  className="w-full py-4 bg-brand-highlight text-brand-black font-black italic border-2 border-brand-black shadow-[4px_4px_0px_0px_#1A1A1A]"
                 >הבנתי את ההתאמה</button>
               </div>
            )}
          </div>

          {showFeedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 border-2 border-brand-black ${checkIsCorrect(currentQuestion, userAnswers[currentQuestion.id]) ? 'bg-brand-highlight shadow-[4px_4px_0px_0px_#1A1A1A]' : 'bg-brand-accent text-white shadow-[4px_4px_0px_0px_#1A1A1A]'}`}
            >
              <div className="flex gap-4 items-start">
                {checkIsCorrect(currentQuestion, userAnswers[currentQuestion.id]) ? <CheckCircle2 className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                <div>
                  <p className="font-black italic uppercase mb-2">{checkIsCorrect(currentQuestion, userAnswers[currentQuestion.id]) ? 'מעולה!' : 'לא בדיוק...'}</p>
                  <p className="text-sm font-bold leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="pt-4 flex justify-end">
            {(mode === 'exam' ? attempted : showFeedback) && (
              <button 
                onClick={nextQuestion}
                className="flex items-center gap-4 px-10 py-5 bg-brand-black text-white font-black italic text-xl uppercase tracking-widest hover:bg-opacity-90 transition-all border-2 border-brand-black shadow-[6px_6px_0px_0px_#E0FF62]"
              >
                <span>{currentIndex === quizQuestions.length - 1 ? 'סיום' : 'השאלה הבאה'}</span>
                <ArrowLeft size={24} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AnswerButton({ label, selected, onClick, correct, wrong, disabled }: any) {
  let styles = "w-full p-5 border-2 text-right transition-all flex justify-between items-center group font-bold italic uppercase ";
  if (correct) styles += "bg-brand-highlight border-brand-black border-4 ";
  else if (wrong) styles += "bg-brand-accent border-brand-black text-white ";
  else if (selected) styles += "bg-brand-bg border-brand-black shadow-[4px_4px_0px_0px_#1A1A1A] -translate-y-1 -translate-x-1 ";
  else styles += "bg-white border-brand-black hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ";

  return (
    <button onClick={onClick} disabled={disabled} className={styles}>
      <span>{label}</span>
      <div className={`w-8 h-8 border-2 border-brand-black flex items-center justify-center transition-all ${
        correct ? 'bg-brand-black text-white' : 
        wrong ? 'bg-white text-brand-black' :
        selected ? 'bg-brand-black' : 'bg-white'
      }`}>
        {correct && <CheckCircle2 size={20} />}
        {wrong && <XCircle size={20} />}
        {selected && !correct && !wrong && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  );
}

function checkIsCorrect(q: Question, userAns: any) {
  if (Array.isArray(q.answer)) {
    if (!Array.isArray(userAns)) return false;
    return q.answer.length === userAns.length && q.answer.every(item => userAns.includes(item));
  }
  return q.answer === userAns;
}
