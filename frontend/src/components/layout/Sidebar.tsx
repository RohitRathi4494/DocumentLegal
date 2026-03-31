"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { FileText, Files, Users, LogOut, LayoutDashboard, CreditCard, Zap, Activity, ShieldCheck, Library } from 'lucide-react'
import { Button } from '../ui/Button'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await api.get('auth/me/')
      setIsAdmin(res.data.is_staff || res.data.is_superuser)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  const adminLinks = [
    { name: 'Admin Home', href: '/dashboard/admin', icon: ShieldCheck },
    { name: 'Legal Repository', href: '/dashboard/templates', icon: Library },
    { name: 'Writers', href: '/dashboard/admin/users', icon: Users },
    { name: 'System Stats', href: '/dashboard/admin/activity', icon: Activity },
  ]

  const writerLinks = [
    { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Document', href: '/dashboard/templates', icon: FileText },
    { name: 'Client Files', href: '/dashboard/clients', icon: Users },
    { name: 'Subscription', href: '/dashboard/billing', icon: CreditCard },
  ]

  const links = isAdmin ? adminLinks : writerLinks

  return (
    <div className="w-64 border-r border-slate-100 bg-white flex flex-col h-screen sticky top-0 shadow-sm z-50">
      <div className="p-6">
        <div className="flex items-center gap-2.5 text-indigo-600 font-black text-xl tracking-tighter uppercase leading-none">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
            <Files className="w-5 h-5" />
          </div>
          MYDOCWRITER
        </div>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-3">
          {isAdmin ? 'Operation Center' : 'Workspace'}
        </div>
        {!loading && links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100/50'
              }`}
            >
              <link.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {link.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 space-y-6">
        {!isAdmin && !loading && (
          <Link href="/dashboard/billing" className="block">
             <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden group shadow-xl shadow-slate-900/10 cursor-pointer">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/30 transition-all duration-500" />
                <div className="flex items-center gap-2 mb-3">
                   <Zap className="w-5 h-5 text-indigo-400" />
                   <div className="text-xs font-black uppercase tracking-tight">Pro Access</div>
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 italic">Power your law firm.</div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 group-hover:gap-2.5 transition-all">
                   Upgrade <Zap className="w-2.5 h-2.5 fill-current" />
                </div>
             </div>
          </Link>
        )}

        {isAdmin && (
           <div className="bg-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden shadow-xl shadow-indigo-600/10">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-4 h-4 text-indigo-200" />
                 <div className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Staff Mode</div>
              </div>
              <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest leading-relaxed">
                 You have full 360-degree control of the software.
              </div>
           </div>
        )}

        <div className="pt-4 border-t border-slate-50">
          <Button variant="ghost" className="w-full justify-start text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-xl h-10 text-xs" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
