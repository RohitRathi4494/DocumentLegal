"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, ArrowRight, User } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'

interface Writer {
  slug: string
  business_name: string
  bio: string
}

interface DocumentType {
  id: number
  name: string
  slug: string
  description: string
}

export default function PublicLanding() {
  const { writer } = useParams()
  const router = useRouter()
  const [writerDetails, setWriterDetails] = useState<Writer | null>(null)
  const [templates, setTemplates] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!writer || writer === 'undefined') return

    async function fetchData() {
      try {
        const [writerRes, templatesRes] = await Promise.all([
          api.get(`public/${writer}/`),
          api.get('document-types/')
        ])
        setWriterDetails(writerRes.data)
        setTemplates(templatesRes.data)
      } catch (err: any) {
        setError('Writer not found or error loading data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [writer])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !writerDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div className="glass-panel p-8 rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold mb-4">Oops!</h1>
          <p className="text-muted-foreground mb-6">{error || 'Something went wrong.'}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">{writerDetails.business_name || 'Legal Document Writer'}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{writerDetails.bio || 'Get your legal documents ready instantly by submitting your details below.'}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push(`/p/${writer}/${template.slug}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <Button variant="ghost" size="sm" className="group-hover:text-primary">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{template.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-primary">Legal Document Engine</span>
        </div>
      </div>
    </main>
  )
}
