"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { FileText, Download, Calendar, QrCode, Clipboard, ExternalLink, Clock, CheckCircle2, Users, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import QuickStart from '@/components/onboarding/QuickStart'
import { TrendChart, TopTemplates, ActivityFeed, UsageGauge } from '@/components/dashboard/Analytics'

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showQuickStart, setShowQuickStart] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [meRes, docsRes, statsRes] = await Promise.all([
        api.get('auth/me/'),
        api.get('documents/'),
        api.get('documents/stats/')
      ])
      
      setUser(meRes.data)
      setDocuments(docsRes.data)
      setStats(statsRes.data)

      // Redirect Admin to Admin Dashboard
      if (meRes.data.is_staff || meRes.data.is_superuser) {
        router.push('/dashboard/admin');
      }
      
      if (docsRes.data.length === 0) {
        setShowQuickStart(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === 'PROCESSING')
    if (hasProcessing) {
      const interval = setInterval(fetchData, 3000)
      return () => clearInterval(interval)
    }
  }, [documents])

  const publicLink = (mounted && user?.profile?.slug)
    ? `${window.location.origin}/p/${user.profile.slug}`
    : ''

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicLink)}`

  const pendingDocs = documents.filter(doc => doc.status === 'SUBMITTED')

  if (loading) return (
    <div className="p-8 flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
      <QuickStart isVisible={showQuickStart} onClose={() => setShowQuickStart(false)} />
      
      {/* Header Section: Professional & Compact */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Command Center</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Real-time legal document throughput</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/templates">
            <Button size="sm" className="shadow-lg shadow-indigo-500/10 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 h-10 text-xs font-black uppercase tracking-widest">
              <PlusIcon className="w-4 h-4 mr-2" /> New Document
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Essential Tracking (4 Units) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-100 p-1">
             <UsageGauge 
                used={stats?.plan_usage?.used || 0} 
                limit={stats?.plan_usage?.limit} 
                plan={stats?.plan_usage?.plan_name || 'FREE'} 
             />
          </div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <QrCode className="w-16 h-16" />
            </div>
            
            <div className="mb-6">
              <h2 className="text-sm font-black flex items-center gap-2 tracking-widest uppercase mb-1">
                 Intake Channel
              </h2>
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest leading-none">Automated client submission</p>
            </div>
            
            <div className="space-y-4">
               <div className="flex justify-center bg-white p-3 rounded-xl w-32 h-32 mx-auto shadow-inner overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500">
                 <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
               </div>

               <div className="space-y-3">
                 <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between group overflow-hidden">
                   <div className="truncate text-[10px] font-bold text-indigo-100 mr-3 uppercase tracking-widest flex-1">{publicLink}</div>
                   <button 
                     onClick={() => copyToClipboard(publicLink)}
                     className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
                   >
                     {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                   </button>
                 </div>
                 <Link href={publicLink} target="_blank" className="block outline-none">
                   <button className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2">
                     <ExternalLink className="w-4 h-4" /> Landing Page
                   </button>
                 </Link>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Analytics & Operations (8 Units) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Performance Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h2 className="text-sm font-black text-slate-900 tracking-widest uppercase">30-Day Velocity</h2>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Generation trends</p>
                   </div>
                   <div className="bg-emerald-50 px-2 py-1 rounded-md text-[8px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100/50">
                      Active
                   </div>
                </div>
                <TrendChart data={stats?.daily_trends || []} />
             </section>

             <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h2 className="text-sm font-black text-slate-900 tracking-widest uppercase">Top Templates</h2>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Market popularity</p>
                   </div>
                   <Link href="/dashboard/templates" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Library</Link>
                </div>
                {stats?.top_templates?.length > 0 ? (
                  <TopTemplates templates={stats.top_templates} />
                ) : (
                  <div className="p-8 bg-slate-50/50 rounded-xl text-center text-slate-300 font-black uppercase tracking-widest text-[9px]">
                     No volume recorded
                  </div>
                )}
             </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
             {/* Activity Timeline (7 Units) */}
             <section className="md:col-span-12 xl:col-span-7 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-sm font-black text-slate-900 tracking-widest uppercase">Live Workspace</h2>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                {stats?.recent_activity?.length > 0 ? (
                  <ActivityFeed activity={stats.recent_activity} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                     <Clock className="w-8 h-8 text-slate-200 mb-2" />
                     <p className="text-slate-300 font-black uppercase tracking-widest text-[9px]">Awaiting activity</p>
                  </div>
                )}
             </section>

             {/* Action Items (5 Units) - Optimized for visibility */}
             <section className="md:col-span-12 xl:col-span-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                    <h2 className="text-sm font-black text-slate-900 tracking-widest uppercase">Action Items ({pendingDocs.length})</h2>
                  </div>
                </div>

                {pendingDocs.length === 0 ? (
                  <div className="p-8 bg-slate-50/50 border border-slate-100 border-dashed rounded-xl text-center">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Queue is Clear</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {pendingDocs.map((doc) => (
                      <motion.div key={doc.id} layout className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-[10px] uppercase truncate max-w-[100px]">{doc.document_type_details?.name}</h3>
                            <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest leading-none mt-1">Pending</p>
                          </div>
                        </div>
                        <Link href={`/dashboard/create/${doc.document_type_details?.slug}?id=${doc.id}`}>
                          <Button variant="secondary" className="rounded-lg h-8 px-3 font-black text-[9px] uppercase tracking-widest text-indigo-600 bg-white border border-indigo-100 hover:bg-indigo-50 leading-none">Draft</Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
             </section>
          </div>

        </div>
      </div>
    </div>
  )
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
