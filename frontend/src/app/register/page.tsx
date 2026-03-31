"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/lib/api'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Files } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('auth/register/', formData)
      const res = await api.post('auth/login/', { username: formData.username, password: formData.password })
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.username?.[0] || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white border border-slate-100 p-8 rounded-2xl shadow-xl shadow-slate-200/50 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
            <Files className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Create Account</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Join the Legal Revolution</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-xl mb-6 text-[10px] font-black uppercase tracking-tight text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Username</label>
            <Input 
              placeholder="e.g. john_doe" 
              required 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="rounded-xl h-12 text-sm border-slate-100 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Email Address</label>
            <Input 
              type="email"
              placeholder="john@example.com"  
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="rounded-xl h-12 text-sm border-slate-100 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
            <Input 
              type="password"
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="rounded-xl h-12 text-sm border-slate-100 focus:ring-indigo-500/20"
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 mt-2" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8">
           Member? <Link href="/login" className="text-indigo-600 hover:underline">Sign In Now</Link>
        </p>
      </motion.div>
    </div>
  )
}
