"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FileText, Plus, Trash2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PublicIntakePage() {
  const { writer, template: templateSlug } = useParams()
  const router = useRouter()
  
  const [template, setTemplate] = useState<any>(null)
  const [schema, setSchema] = useState<any>({ sections: [] })
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!templateSlug || templateSlug === 'undefined') return

    async function fetchTemplate() {
      try {
        const res = await api.get(`document-types/${templateSlug}/`)
        setTemplate(res.data)
        const formSchema = res.data.form_schema || { sections: [] }
        setSchema(formSchema)
        
        // Initialize form data
        const initialData: any = {}
        formSchema.sections.forEach((section: any) => {
          section.fields.forEach((field: any) => {
            if (field.type === 'repeatable') {
              initialData[field.name] = [{}]
            } else if (field.type === 'checkbox') {
              initialData[field.name] = false
            } else {
              initialData[field.name] = field.default || ''
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
    fetchTemplate()
  }, [templateSlug])

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }))
  }

  const handleRepeatableChange = (groupName: string, index: number, fieldName: string, value: any) => {
    const list = [...(formData[groupName] || [])]
    if (!list[index]) list[index] = {}
    list[index][fieldName] = value
    setFormData((prev: any) => ({ ...prev, [groupName]: list }))
  }

  const addRepeatableRow = (groupName: string) => {
    const list = [...(formData[groupName] || [])]
    list.push({})
    setFormData((prev: any) => ({ ...prev, [groupName]: list }))
  }

  const removeRepeatableRow = (groupName: string, index: number) => {
    const list = [...(formData[groupName] || [])]
    list.splice(index, 1)
    setFormData((prev: any) => ({ ...prev, [groupName]: list }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`public/${writer}/submit/`, {
        document_type: template.id,
        data: formData
      })
      setSubmitted(true)
      // Redirect after a delay or show success
    } catch (err: any) {
      alert(err.response?.data?.error || "Error submitting form.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-10 rounded-3xl max-w-lg"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Submission Successful!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Your details have been sent to the Document Writer. You can now visit them to collect your finalized document.
          </p>
          <Button size="lg" onClick={() => router.push(`/p/${writer}`)}>Back to Services</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">{template.name}</h1>
          <p className="text-muted-foreground">Please fill in all the details carefully.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {schema.sections?.map((section: any, sIdx: number) => (
            <motion.div 
              key={sIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="glass-panel p-8 rounded-2xl"
            >
              <h3 className="text-lg font-semibold mb-6 pb-3 border-b border-border">{section.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields?.map((field: any, fIdx: number) => {
                  if (field.type === 'repeatable') {
                    return (
                      <div key={fIdx} className="col-span-full space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-primary uppercase tracking-widest">{field.label || field.name}</label>
                          <Button type="button" variant="outline" size="sm" onClick={() => addRepeatableRow(field.name)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Entry
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          <AnimatePresence>
                            {(formData[field.name] || []).map((item: any, rowIdx: number) => (
                              <motion.div 
                                key={rowIdx} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-6 bg-background/40 rounded-2xl border border-border relative group"
                              >
                                <button 
                                  type="button"
                                  onClick={() => removeRepeatableRow(field.name, rowIdx)}
                                  className="absolute -right-3 -top-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {field.fields?.map((subField: any, sfIdx: number) => (
                                    <div key={sfIdx} className={subField.type === 'textarea' ? 'col-span-full' : ''}>
                                      {subField.type === 'textarea' ? (
                                        <div className="w-full">
                                          <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">{subField.label || subField.name}</label>
                                          <textarea
                                            className="w-full min-h-[100px] rounded-xl border border-border bg-card px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            value={item[subField.name] || ''}
                                            onChange={(e) => handleRepeatableChange(field.name, rowIdx, subField.name, e.target.value)}
                                            required={subField.required}
                                          />
                                        </div>
                                      ) : (
                                        <Input
                                          label={subField.label || subField.name}
                                          type={subField.type || 'text'}
                                          value={item[subField.name] || ''}
                                          onChange={(e) => handleRepeatableChange(field.name, rowIdx, subField.name, e.target.value)}
                                          required={subField.required}
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

                  return (
                    <div key={fIdx} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                      {field.type === 'textarea' ? (
                        <div className="w-full">
                          <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">{field.label || field.name}</label>
                          <textarea
                            className="w-full min-h-[120px] rounded-xl border border-border bg-card px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                          />
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center gap-3 mt-8">
                          <input 
                            type="checkbox" 
                            className="w-6 h-6 rounded border-border text-primary focus:ring-primary bg-card"
                            checked={formData[field.name] || false}
                            onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          />
                          <label className="text-sm font-semibold">{field.label || field.name}</label>
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
                          type={field.type || 'text'}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
          
          <div className="pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full py-8 text-xl font-bold shadow-xl shadow-primary/20"
              isLoading={submitting}
            >
              Submit to Document Writer
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
