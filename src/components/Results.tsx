import { motion } from 'motion/react';
import { Trophy, Home, RotateCcw, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResultsProps {
  score: number;
  onHome: () => void;
  onRetry: () => void;
}

export default function ResultsView({ score, onHome, onRetry }: ResultsProps) {
  const getMessage = () => {
    if (score >= 95) return { text: 'מושלם! אתה מלך מערכת ההובלה!', color: 'text-brand-black', sub: 'הידע שלך מרשים מאוד.' };
    if (score >= 80) return { text: 'כל הכבוד! ציון מעולה!', color: 'text-brand-black', sub: 'אתה בהחלט מוכן למבחן.' };
    if (score >= 60) return { text: 'עברת! יפה מאוד.', color: 'text-brand-black', sub: 'קצת חזרה על פרקי "הלב" תעשה לך טוב.' };
    return { text: 'לא נורא, בוא נלמד עוד קצת.', color: 'text-brand-black', sub: 'כדאי לחזור על הפרקים ולנסות שוב.' };
  };

  const { text, color, sub } = getMessage();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center space-y-12 py-12"
    >
      <div className="relative inline-block">
        <div className="w-48 h-48 border-4 border-brand-black bg-brand-highlight flex items-center justify-center shadow-brutalist relative">
           <Trophy size={80} className="text-brand-black opacity-20 absolute" />
           <span className="text-7xl font-black italic relative z-10">{score}%</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className={`text-5xl font-black italic uppercase tracking-tighter ${color}`}>{text}</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{sub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto pt-8">
        <button 
          onClick={onRetry}
          className="flex items-center justify-center gap-2 p-5 bg-brand-black text-white font-black italic uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-[6px_6px_0px_0px_#E0FF62] border-2 border-brand-black"
        >
          <RotateCcw size={20} />
          מבחן חוזר
        </button>
        <button 
          onClick={onHome}
          className="flex items-center justify-center gap-2 p-5 bg-white border-2 border-brand-black text-brand-black font-black italic uppercase tracking-widest hover:bg-slate-50 transition-all shadow-brutalist"
        >
          <Home size={20} />
          חזרה לבית
        </button>
      </div>

      <div className="pt-12 grid grid-cols-3 gap-6 border-t-2 border-brand-black mt-12 bg-white p-8">
        <Stat label="דיוק" value={`${score}%`} />
        <Stat label="כוכבים" value={score >= 80 ? '★★★' : score >= 60 ? '★★☆' : '★☆☆'} />
        <Stat label="מוכנות" value={score >= 60 ? '75%' : '40%'} />
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">
        {label}
      </div>
      <div className="font-black italic text-2xl uppercase">{value}</div>
    </div>
  );
}
