"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FileText, PlayCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FinalizeDocumentPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [document, setDocument] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [schema, setSchema] = useState<any>({ sections: [] })
  const [formData, setFormData] = useState<any>({})
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const docRes = await api.get(`documents/${id}/`)
      setDocument(docRes.data)
      setTemplate(docRes.data.document_type_details)
      setSchema(docRes.data.document_type_details.form_schema || { sections: [] })
      setFormData(docRes.data.data_json || {})
    } catch (err) {
      console.error(err)
      alert("Error loading document data.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }))
  }

  const handleRepeatableChange = (groupName: string, index: number, fieldName: string, value: any) => {
    const list = [...(formData[groupName] || [])]
    if (!list[index]) list[index] = {}
    list[index][fieldName] = value
    setFormData((prev: any) => ({ ...prev, [groupName]: list }))
  }

  const finalizeDocument = async () => {
    setProcessing(true)
    try {
      const res = await api.post(`documents/${id}/finalize/`, {
        data: formData
      })
      window.open(res.data.download_url, '_blank')
      router.push('/dashboard')
    } catch (err: any) {
      console.error("Failed to finalize document", err)
      alert(err.response?.data?.error || "Error finalizing document.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">Finalize: {template.name}</h1>
        <p className="text-muted-foreground italic">Reviewing submission from client (ID: #{id})</p>
      </div>

      <div className="space-y-8">
        {schema.sections?.map((section: any, sIdx: number) => (
          <div key={sIdx} className="glass-panel p-8 rounded-2xl">
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-white/5">{section.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields?.map((field: any, fIdx: number) => {
                if (field.type === 'repeatable') {
                  return (
                    <div key={fIdx} className="col-span-full space-y-6">
                      <label className="text-xs font-bold text-primary uppercase tracking-widest">{field.label || field.name}</label>
                      <div className="space-y-4">
                        {(formData[field.name] || []).map((item: any, rowIdx: number) => (
                          <div key={rowIdx} className="p-6 bg-background/50 rounded-xl border border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {field.fields?.map((subField: any, sfIdx: number) => (
                                <div key={sfIdx} className={subField.type === 'textarea' ? 'col-span-full' : ''}>
                                  {subField.type === 'textarea' ? (
                                    <div>
                                      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase underline">{subField.label || subField.name}</label>
                                      <textarea
                                        className="w-full min-h-[80px] rounded-xl border border-border bg-card px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                        value={item[subField.name] || ''}
                                        onChange={(e) => handleRepeatableChange(field.name, rowIdx, subField.name, e.target.value)}
                                      />
                                    </div>
                                  ) : (
                                    <Input
                                      label={subField.label || subField.name}
                                      value={item[subField.name] || ''}
                                      onChange={(e) => handleRepeatableChange(field.name, rowIdx, subField.name, e.target.value)}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={fIdx} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                    {field.type === 'textarea' ? (
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">{field.label || field.name}</label>
                        <textarea
                          className="w-full min-h-[120px] rounded-xl border border-border bg-card px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2 mt-8">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-border text-primary"
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        />
                        <label className="text-sm font-medium">{field.label || field.name}</label>
                      </div>
                    ) : field.type === 'select' ? (
                      <Select
                        label={field.label || field.name}
                        value={formData[field.name] || ''}
                        onChange={(val) => handleInputChange(field.name, val)}
                        options={field.options || []}
                      />
                    ) : (
                      <Input
                        label={field.label || field.name}
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

      <div className="fixed bottom-0 left-64 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border z-10 flex items-center justify-between">
        <div className="text-sm text-muted-foreground italic">
          Review Client Input & Fix any issues before printing.
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={finalizeDocument} isLoading={processing}>
            <PlayCircle className="w-5 h-5 mr-2" /> Finalize & Generate Document
          </Button>
        </div>
      </div>
    </div>
  )
}
