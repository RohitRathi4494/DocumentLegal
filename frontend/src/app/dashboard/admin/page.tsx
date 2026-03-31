"use client"
import React, { useState, useEffect } from 'react'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Files, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight,
  Search,
  MoreVertical,
  Activity,
  Library,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AdminActionMenuProps {
  user: any;
  onUpdate: () => void;
}

const AdminActionMenu = ({ user, onUpdate }: AdminActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string, data: any = {}) => {
    setLoading(true);
    try {
      await api.post(`admin/users/${user.id}/manage/`, { action, ...data });
      onUpdate();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-8 w-8 p-0 rounded-lg transition-all ${isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 z-20 py-2 overflow-hidden"
            >
              <div className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Manage Plan</div>
              {['FREE', 'PRO', 'ADVANCED'].map((plan) => (
                <button
                  key={plan}
                  disabled={loading || user.plan === plan}
                  onClick={() => handleAction('change_plan', { plan })}
                  className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-tight transition-all flex items-center justify-between ${
                    user.plan === plan ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:bg-slate-50'
                  } disabled:opacity-50`}
                >
                  {plan} {user.plan === plan && <Check className="w-3 h-3" />}
                </button>
              ))}

              <div className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mt-2 mb-1 border-t">Account Safety</div>
              <button
                disabled={loading}
                onClick={() => handleAction('toggle_status')}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-2 ${
                  user.is_active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                }`}
              >
                {user.is_active ? 'Suspend Writer' : 'Restore Access'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('admin/stats/'),
        api.get('admin/users/')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">Operation Center</div>
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">System Overview</h1>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Global Performance & User Metrics</p>
        </div>
        <div className="flex gap-3">
           <Button size="sm" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-xl">
              Export CSV
           </Button>
           <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/10">
              System Settings
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Writers', value: stats?.total_writers || 0, icon: Users, trend: '+12%', color: 'indigo' },
          { label: 'Cloud Templates', value: stats?.total_templates || 0, icon: Library, trend: 'Optimal', color: 'slate' },
          { label: 'Generated Docs', value: stats?.total_documents || 0, icon: Files, trend: '+89%', color: 'indigo' },
          { label: 'Est. Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: TrendingUp, trend: 'SaaS Active', color: 'indigo' },
        ].map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/20 group hover:border-indigo-100 transition-all"
          >
             <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                   <item.icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-tight flex items-center gap-1">
                   {item.trend} <ArrowUpRight className="w-3 h-3" />
                </div>
             </div>
             <div>
                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{item.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* User Management Section */}
      <div className="space-y-6">
         <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
               <Activity className="w-5 h-5 text-indigo-600" />
               Registered Writers
            </h2>
            <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search writers..." 
                 className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 ring-indigo-600/20 w-64 placeholder:text-slate-300"
               />
            </div>
         </div>

         <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/30 font-sans">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Writer</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Docs</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-slate-50/50 transition-all group ${!user.is_active ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs uppercase shadow-lg ${
                               user.is_active ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-300 text-slate-600 shadow-none'
                             }`}>
                                {user.username[0]}
                             </div>
                             <div>
                                <div className="text-sm font-black text-slate-900 leading-none mb-1 flex items-center gap-2">
                                   {user.username}
                                   {!user.is_active && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[8px] font-black">SUSPENDED</span>}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 italic">{user.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-xs font-black text-slate-600 uppercase tracking-tight">{user.tenant_name}</td>
                       <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             user.plan === 'ADVANCED' ? 'bg-indigo-100 text-indigo-600' :
                             user.plan === 'PRO' ? 'bg-amber-100 text-amber-600' :
                             'bg-slate-100 text-slate-500'
                          }`}>
                             {user.plan}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-center font-black text-slate-900 text-sm">{user.docs_generated}</td>
                       <td className="px-8 py-6 text-right">
                          <AdminActionMenu user={user} onUpdate={fetchAdminData} />
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
