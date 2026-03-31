"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { FileText, ArrowRight, Library, Sparkles, Plus, CheckCircle2, CloudUpload } from 'lucide-react'
import CreateTemplateModal from '@/components/dashboard/CreateTemplateModal'

export default function TemplatesPage() {
  const [user, setUser] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [seedSuccess, setSeedSuccess] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [userRes, docRes] = await Promise.all([
        api.get('auth/me/'),
        api.get('document-types/')
      ])
      setUser(userRes.data)
      setTemplates(docRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
     try {
       const res = await api.get('document-types/')
       setTemplates(res.data)
     } catch (err) {
       console.error(err)
     }
  }

  const isAdmin = user?.is_staff || user?.is_superuser

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await api.post('document-types/seed_examples/')
      setSeedSuccess(true)
      await fetchTemplates()
      setTimeout(() => setSeedSuccess(false), 5000)
    } catch (err) {
      console.error(err)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
      <CreateTemplateModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchTemplates}
      />

      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Legal Library</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Access high-fidelity legal standards</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateModal(true)}
              size="sm" 
              className="shadow-lg shadow-indigo-500/10 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 h-10 text-xs font-black uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Template
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/20 max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-6">
             <Library className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Library Unavailable</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 max-w-xs mx-auto leading-relaxed">
             Contact your administrator to populate the high-fidelity professional library.
          </p>
          
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-8">
               <Button 
                 onClick={handleSeed}
                 isLoading={seeding}
                 className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10"
               >
                  <Sparkles className="w-4 h-4 mr-2 fill-white/20" /> Seed Examples
               </Button>
               <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">or</div>
               <Button 
                 variant="outline"
                 onClick={() => setShowCreateModal(true)}
                 className="w-full sm:w-auto h-12 px-8 border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm"
               >
                  <CloudUpload className="w-4 h-4 mr-2" /> Upload Wizard
               </Button>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {seedSuccess && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-600 mb-6"
            >
               <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
               <p className="text-[10px] font-black uppercase tracking-widest">Workspace populated with elite standards. Happy drafting!</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl, idx) => (
              <motion.div 
                key={tpl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="px-2 py-1 bg-slate-50 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                      v{tpl.version}
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2 mb-8">
                    {tpl.description || "High-fidelity legal template ready for automation."}
                  </p>
                </div>

                <Link href={`/dashboard/create/${tpl.slug}`}>
                  <Button variant="secondary" className="w-full h-11 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 group-hover:border-indigo-600 transition-all flex justify-between px-6">
                    Launch Wizard <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
