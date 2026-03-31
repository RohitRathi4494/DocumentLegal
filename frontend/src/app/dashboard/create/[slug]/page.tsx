"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FileText, Plus, Trash2, Eye, Download, PlayCircle, Users, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DEMO_DATA: Record<string, any> = {
  'rent-agreement': {
    lessor_name: 'Rajesh Sharma',
    lessee_name: 'Amit Kumar',
    property_address: 'Flat 402, Sunshine Apartments, Sector 15, Gurgaon, Haryana - 122001',
    monthly_rent: 25000,
    security_deposit: 50000,
  }
}

export default function CreateDocumentPage() {
  const { slug } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  
  const [template, setTemplate] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [schema, setSchema] = useState<any>({ sections: [] })
  const [formData, setFormData] = useState<any>({})
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tplRes, clientsRes] = await Promise.all([
        api.get(`document-types/${slug}/`),
        api.get('clients/')
      ])
      
      setTemplate(tplRes.data)
      const currentSchema = tplRes.data.form_schema || { sections: [] }
      setSchema(currentSchema)
      setClients(clientsRes.data)
      
      // Initialize form data
      const initialData: any = {}
      const demoValues = isDemo ? (DEMO_DATA[slug as string] || {}) : {}

      currentSchema.sections.forEach((section: any) => {
        section.fields.forEach((field: any) => {
          if (field.type === 'repeatable') {
            initialData[field.name] = demoValues[field.name] || [{}] 
          } else if (field.type === 'checkbox') {
            initialData[field.name] = demoValues[field.name] !== undefined ? demoValues[field.name] : false
          } else {
            initialData[field.name] = demoValues[field.name] || field.default || ''
          }
        })
      })
      setFormData(initialData)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, [fieldName]: value }))
  }

  const handleRepeatableChange = (groupName: string, index: number, fieldName: string, value: any) => {
    const list = [...(formData[groupName] || [])]
    if (!list[index]) list[index] = {}
    list[index][fieldName] = value
    setFormData((prev: Record<string, any>) => ({ ...prev, [groupName]: list }))
  }

  const addRepeatableRow = (groupName: string) => {
    const list = [...(formData[groupName] || [])]
    list.push({})
    setFormData((prev: Record<string, any>) => ({ ...prev, [groupName]: list }))
  }

  const removeRepeatableRow = (groupName: string, index: number) => {
    const list = [...(formData[groupName] || [])]
    list.splice(index, 1)
    setFormData((prev: Record<string, any>) => ({ ...prev, [groupName]: list }))
  }

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id.toString() === clientId)
    if (client) {
      // Auto-fill common fields if they exist in formData
      setFormData((prev: Record<string, any>) => ({
        ...prev,
        client_name: client.name,
        client_phone: client.phone,
        client_address: client.address,
        client_aadhar: client.aadhar,
        // fallback generic names
        name: prev.name !== undefined ? client.name : prev.name,
        phone: prev.phone !== undefined ? client.phone : prev.phone,
        address: prev.address !== undefined ? client.address : prev.address,
      }))
    }
  }

  const submitDocument = async (action: 'preview' | 'generate' | 'preview_as_html') => {
    setProcessing(true)
    try {
      const payload = {
        document_type: template.id,
        data: formData
      }
      const res = await api.post(`documents/${action}/`, payload)
      
      if (action === 'preview') {
        setPreviewUrl(res.data.preview_url)
      } else if (action === 'preview_as_html') {
        setHtmlPreview(res.data.html)
      } else {
        // Provide download and redirect
        window.open(res.data.download_url, '_blank')
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error("Failed to process document", err)
      alert(err.response?.data?.error || "Error processing document.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-8">Loading Template...</div>
  if (!template) return <div className="p-8">Template not found.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 relative">
      
      {/* Demo Mode Banner */}
      <AnimatePresence>
        {isDemo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-indigo-600 text-white p-4 rounded-3xl flex items-center justify-between shadow-xl shadow-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold">Magic Onboarding active!</span>
                  <p className="text-sm text-indigo-100">We've pre-filled this agreement with example data. Feel free to edit or just click preview.</p>
                </div>
              </div>
              <button onClick={() => router.replace(`/dashboard/create/${slug}`)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Create: {template.name}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
        
        {/* Client Autofill */}
        {clients.length > 0 && (
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border">
            <Users className="w-5 h-5 text-primary" />
            <Select 
              value=""
              onChange={handleClientSelect}
              options={clients.map(c => ({ label: c.name, value: c.id.toString() }))}
              placeholder="Auto-fill from Client..."
              className="border-none bg-transparent w-48 shadow-none hover:bg-transparent focus:ring-0"
            />
          </div>
        )}
      </div>

      <div className="space-y-8">
        {schema.sections?.map((section: any, sIdx: number) => (
          <div key={sIdx} className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-white/5 text-foreground/90">{section.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields?.map((field: any, fIdx: number) => {
                
                // Repeatable Group Handling
                if (field.type === 'repeatable') {
                  return (
                    <div key={fIdx} className="col-span-full space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-primary uppercase tracking-wider">{field.label || field.name}</label>
                        <Button variant="outline" size="sm" onClick={() => addRepeatableRow(field.name)}>
                          <Plus className="w-4 h-4 mr-1" /> Add Entry
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <AnimatePresence>
                        {(formData[field.name] || []).map((item: any, rowIdx: number) => (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            key={rowIdx} 
                            className="p-4 bg-background/50 rounded-xl border border-white/5 relative group"
                          >
                            <button 
                              onClick={() => removeRepeatableRow(field.name, rowIdx)}
                              className="absolute -right-3 -top-3 w-8 h-8 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {field.fields?.map((subField: any, sfIdx: number) => (
                                <div key={sfIdx} className={subField.type === 'textarea' ? 'col-span-full' : ''}>
                                  {subField.type === 'textarea' ? (
                                    <div className="w-full">
                                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{subField.label || subField.name}</label>
                                      <textarea
                                        className="flex min-h-[80px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        value={item[subField.name] || ''}
                                        onChange={(e) => handleRepeatableChange(field.name, rowIdx, subField.name, e.target.value)}
                                      />
                                    </div>
                                  ) : (
                                    <Input
                                      label={subField.label || subField.name}
                                      type={subField.type || 'text'}
                                      value={item[subField.name] || ''}
                                      onChange={(e) => handleRepeatableChange(field.name, rowIdx, subField.name, e.target.value)}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )
                }

                // Standard Fields
                return (
                  <div key={fIdx} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                    {field.type === 'textarea' ? (
                      <div className="w-full">
                        <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{field.label || field.name}</label>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors hover:border-muted-foreground/50"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2 mt-8">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-card"
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        />
                        <label className="text-sm font-medium">{field.label || field.name}</label>
                      </div>
                    ) : field.type === 'select' ? (
                      <div className="w-full">
                        <Select
                          label={field.label || field.name}
                          value={formData[field.name] || ''}
                          onChange={(val) => handleInputChange(field.name, val)}
                          options={field.options || []}
                          placeholder="Select..."
                        />
                      </div>
                    ) : (
                      <Input
                        label={field.label || field.name}
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {previewUrl && (
        <div className="mt-8 p-6 glass-panel border-emerald-500/30 bg-emerald-500/5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="text-emerald-500 w-6 h-6" />
            <div>
              <h4 className="font-semibold text-emerald-400">Preview Generated Successfully</h4>
              <p className="text-sm text-emerald-200/70">Review the temporary document before finalizing.</p>
            </div>
          </div>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
              Download Preview
            </Button>
          </a>
        </div>
      )}
      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-10 flex items-center justify-between">
        <div className="text-sm text-muted-foreground px-4">
          All fields are dynamically rendered from schema.
        </div>
        <div className="flex gap-4 px-4">
          <Button variant="outline" onClick={() => submitDocument('preview_as_html')} isLoading={processing}>
            <Eye className="w-4 h-4 mr-2" /> Instant Web Preview
          </Button>
          <Button variant="secondary" onClick={() => submitDocument('preview')} isLoading={processing}>
            <Download className="w-4 h-4 mr-2" /> Download Preview
          </Button>
          <Button onClick={() => submitDocument('generate')} isLoading={processing}>
            <PlayCircle className="w-4 h-4 mr-2" /> Finalize Document
          </Button>
        </div>
      </div>

      {/* HTML Preview Overlay */}
      <AnimatePresence>
        {htmlPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setHtmlPreview(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-2xl h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
             >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-xl">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Document Preview</h3>
                   </div>
                   <button 
                    onClick={() => setHtmlPreview(null)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                   >
                     <X className="w-6 h-6 text-slate-400" />
                   </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-10 prose prose-slate max-w-none prose-headings:text-indigo-900 prose-p:text-slate-600">
                   <div dangerouslySetInnerHTML={{ __html: htmlPreview || '' }} />
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                   <Button onClick={() => setHtmlPreview(null)}>
                      Close Preview & Continue Editing
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
