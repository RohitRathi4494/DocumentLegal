"use client"
import React from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { motion } from 'framer-motion'
import { 
  FileText, CheckCircle2, Clock, Zap, ArrowUpRight, 
  ChevronRight, User
} from 'lucide-react'

// --- Trend Chart ---
export function TrendChart({ data }: { data: any[] }) {
  const chartData = data.map(item => ({
    name: new Date(item.day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    count: item.count
  }))

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '0.75rem', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '8px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#4f46e5" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// --- Top Templates ---
export function TopTemplates({ templates }: { templates: any[] }) {
  return (
    <div className="space-y-2">
      {templates.map((tpl, i) => (
        <motion.div 
          key={tpl.document_type__slug}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors border border-slate-100/50">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {tpl.document_type__name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-sm font-black text-slate-900 leading-none">{tpl.usage}</div>
                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Growth +12%</div>
             </div>
             <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// --- Activity Feed ---
export function ActivityFeed({ activity }: { activity: any[] }) {
  return (
    <div className="space-y-4 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
      {activity.map((item, i) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="relative pl-12 group"
        >
          <div className="absolute left-0 top-0.5 w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-105">
             {item.status === 'COMPLETED' ? (
               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
             ) : (
               <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
             )}
          </div>
          
          <div className="p-3 rounded-2xl bg-slate-50/30 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-200/30 transition-all border border-transparent group-hover:border-slate-100">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{item.description}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <User className="w-2 h-2" /> {item.user}
              </div>
              <div className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {item.status}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// --- Usage Gauge ---
export function UsageGauge({ used, limit, plan }: { used: number, limit: any, plan: string }) {
  const percentage = limit === 'inf' || limit === null ? 0 : Math.min(100, (used / limit) * 100)
  const isNearLimit = percentage > 80

  return (
    <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden group shadow-xl shadow-slate-900/20">
      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-3xl transition-all group-hover:bg-indigo-600/30" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Tier</div>
              <div className="text-lg font-black tracking-tighter text-indigo-400 leading-none">{plan}</div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black leading-none">{used}</div>
             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Docs</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
             <span>Capacity</span>
             <span>{limit === 'inf' || limit === null ? '∞' : `${percentage.toFixed(0)}%`}</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${percentage}%` }}
               transition={{ duration: 1, ease: 'easeOut' }}
               className={`h-full rounded-full ${isNearLimit ? 'bg-orange-500' : 'bg-indigo-500'} shadow-[0_0_8px_rgba(79,70,229,0.4)]`}
             />
          </div>
        </div>

        {isNearLimit && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between"
          >
            <div className="text-orange-400 font-black text-[9px] uppercase tracking-tighter flex items-center gap-1">
               <Zap className="w-2.5 h-2.5 fill-current" /> Limit Close
            </div>
            <button className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors group/btn leading-none">
               Upgrade <ArrowUpRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
