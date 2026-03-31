'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Library, 
  Plus, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  FileText,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import api from '@/lib/api';

interface GlobalTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  category?: string;
  cloned?: boolean;
}

const TemplateLibrary = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<GlobalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGlobalTemplates();
  }, []);

  const fetchGlobalTemplates = async () => {
    try {
      const response = await api.get('document-types/');
      // Filter out global templates if we want only global ones in this view
      const globals = response.data.filter((t: any) => t.is_global);
      setTemplates(globals);
    } catch (err) {
      console.error("Error fetching templates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (templateId: number, slug: string) => {
    setCloningId(templateId);
    try {
      await api.post(`document-types/${slug}/clone/`);
      
      // Update local state to show 'Checked'
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, cloned: true } : t
      ));
    } catch (err) {
      console.error("Cloning failed", err);
    } finally {
      setCloningId(null);
    }
  };

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dynamic Header Section */}
      <section className="bg-white border-b border-slate-100 px-6 py-12 md:px-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 -skew-x-[30deg] translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100/50">
                <Sparkles className="w-3 h-3" />
                <span>Grow Your Library</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Professional Template Library</h1>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest max-w-xl leading-relaxed">
                Choose from our curated collection of high-fidelity legal templates. Clone them to your workspace to start automating instantly.
              </p>
            </div>
            
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors group-focus-within:text-indigo-500" />
              <input 
                type="text" 
                placeholder="Search legal forms..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 shadow-inner transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-[11px] font-black uppercase tracking-tight placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, label: "Verified Legal Standards", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { icon: Clock, label: "Updated for 2024 Compliance", color: "bg-blue-50 text-blue-600 border-blue-100" },
              { icon: Library, label: "Curated by Professionals", color: "bg-indigo-50 text-indigo-600 border-indigo-100" }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm group hover:shadow-md transition-shadow">
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-6 md:p-10 w-full flex-1">

        {/* Template Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[280px] bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white border border-slate-100 rounded-[2rem] p-4 pb-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col h-full"
              >
                {/* Visual Label */}
                <div className="flex justify-between items-start mb-6 -mx-2">
                   <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                     System Standard
                   </div>
                   {template.cloned && (
                     <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold">
                       <Check className="w-3.5 h-3.5" />
                       In Workspace
                     </div>
                   )}
                </div>

                <div className="space-y-4 px-2 flex-grow">
                  <div className="p-4 bg-slate-50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                    <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 px-2">
                  <button
                    onClick={() => handleClone(template.id, template.slug)}
                    disabled={cloningId === template.id || template.cloned}
                    className={`w-full group/btn relative flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all overflow-hidden ${
                      template.cloned 
                        ? 'bg-emerald-50 text-emerald-700 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-[0.98]'
                    }`}
                  >
                    {cloningId === template.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : template.cloned ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Ready to Use</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                        <span>Clone to Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Library className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No templates found</h3>
            <p className="text-slate-500">Try adjusting your search terms.</p>
          </div>
        )}

        {/* Pro Banner - Upsell UI */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-full bg-white/[0.03] -skew-x-12 translate-x-32 pointer-events-none" />
           <div className="relative z-10 space-y-6">
              <div className="bg-indigo-500/20 text-indigo-300 w-fit px-5 py-2 rounded-full font-bold text-sm backdrop-blur-sm border border-indigo-400/20">
                🚀 Coming Soon
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Premium Clause Library <br />
                  <span className="text-indigo-400">for Advanced Professionals</span>
                </h2>
                <p className="text-indigo-100/60 max-w-xl text-lg font-medium">
                  We are building a massive library of individual legal clauses so you can "drag and drop" components into your own custom templates.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                 <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-white/5 active:scale-95">
                    View Enterprise Pricing
                 </button>
              </div>
           </div>
           
           <div className="relative z-10 w-full md:w-auto h-64 md:h-80 aspect-square rounded-[3rem] bg-indigo-500/10 border border-white/10 backdrop-blur-sm flex items-center justify-center rotate-3 group hover:rotate-0 transition-transform duration-700">
              <div className="p-10 bg-white/5 rounded-[2rem] border border-white/10 shadow-2xl">
                 <ShieldCheck className="w-24 h-24 text-white/40 group-hover:text-white transition-colors duration-700" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default TemplateLibrary;
