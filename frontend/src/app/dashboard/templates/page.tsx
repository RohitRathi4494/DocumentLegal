"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { FileText, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await api.get('document-types/')
      setTemplates(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Select a Template</h1>
        <p className="text-muted-foreground">Choose the legal document you want to generate.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">Ask your admin to upload document templates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={tpl.id} 
              className="glass-panel p-6 rounded-2xl flex flex-col hover:border-primary/50 transition-colors group cursor-pointer"
            >
              <div className="mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xl mb-1">{tpl.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {tpl.description || "Generate a new document from this template."}
                </p>
                <div className="mt-3 inline-flex text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-muted-foreground">
                  Version {tpl.version}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border">
                <Link href={`/dashboard/create/${tpl.slug}`} className="w-full">
                  <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10">
                    Use Template <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
