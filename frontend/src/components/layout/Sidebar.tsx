"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, Files, Users, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '../ui/Button'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Document', href: '/dashboard/templates', icon: FileText },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
  ]

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Files className="w-6 h-6" />
          LDE Engine
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
