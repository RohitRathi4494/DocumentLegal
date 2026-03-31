'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface QuickStartProps {
  onClose: () => void;
  isVisible: boolean;
}

const QuickStart = ({ onClose, isVisible }: QuickStartProps) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [hasDismissed, setHasDismissed] = useState(false);

  if (!isVisible || hasDismissed) return null;

  const handleStartOnboarding = () => {
    // Redirect to the "Rent Agreement" creation with demo data
    // We'll pass a 'demo=true' flag to the creation page to pre-fill it
    router.push('/dashboard/create/rent-agreement?demo=true');
    setHasDismissed(true);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setHasDismissed(true)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 flex">
             <motion.div 
               animate={{ width: `${(step / 3) * 100}%` }}
               className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
             />
          </div>

          <div className="p-8 md:p-12">
            <div className="flex justify-between items-start mb-8">
               <div className="p-4 bg-indigo-50 rounded-2xl">
                 <Rocket className="w-10 h-10 text-indigo-600" />
               </div>
               <button 
                 onClick={() => setHasDismissed(true)}
                 className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                 Skip for now
               </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                      Welcome to <span className="text-indigo-600">MYDOCWRITER</span>
                    </h2>
                    <p className="text-xl text-slate-500 font-medium">
                      The fastest way to generate professional legal documents. Ready to see the magic in 30 seconds?
                    </p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     {[
                       "Choose from 100+ Professional templates",
                       "Automate repetitive drafting instantly",
                       "One-click High Fidelity DOCX generation"
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          <span>{item}</span>
                       </div>
                     ))}
                  </div>

                  <div className="pt-8">
                    <button 
                      onClick={() => setStep(2)}
                      className="group w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all active:scale-95"
                    >
                      Getting Started
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                      First, let's clone <br /> <span className="text-indigo-600 font-black italic">The Rent Agreement</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium">
                      This is our most popular template. We'll add it to your workspace so you can start right away.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-6 group hover:border-indigo-200 transition-colors">
                     <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        <FileText className="w-10 h-10 text-indigo-500" />
                     </div>
                     <div className="flex-grow">
                        <div className="text-sm font-bold text-indigo-600 uppercase mb-1">Recommended</div>
                        <h4 className="text-2xl font-extrabold text-slate-900">Residential Rent Agreement</h4>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <button 
                      onClick={handleStartOnboarding}
                      className="flex-1 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      Create My First Doc
                    </button>
                    <button 
                      onClick={() => setStep(1)}
                      className="px-8 py-5 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                    >
                      Go back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Visual Elements */}
          <div className="bg-slate-50 px-12 py-6 border-t border-slate-100 flex items-center justify-between">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center overflow-hidden grayscale">
                     <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
             <p className="text-sm text-slate-400 font-medium italic">
                Joined by 10,000+ legal professionals this week
             </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickStart;
