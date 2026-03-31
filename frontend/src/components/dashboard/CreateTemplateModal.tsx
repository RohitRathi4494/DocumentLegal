"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CloudUpload, FileText, Info, Plus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/lib/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTemplateModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })
  const [fields, setFields] = useState<any[]>([
    { name: 'client_name', label: 'Client Full Name', type: 'text', required: true }
  ])

  const addField = () => setFields([...fields, { name: '', label: '', type: 'text', required: true }])
  const removeField = (idx: number) => setFields(fields.filter((_, i) => i !== idx))
  
  const updateField = (idx: number, key: string, value: any) => {
    const newFields = [...fields]
    newFields[idx][key] = value
    if (key === 'label' && !newFields[idx].name) {
       newFields[idx].name = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }
    setFields(newFields)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    try {
      const data = new FormData()
      data.append('template_file', file)
      data.append('name', formData.name)
      data.append('slug', formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'))
      data.append('description', formData.description)
      data.append('form_schema', JSON.stringify(fields))
      data.append('version', '1')

      await api.post('document-types/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSuccess()
      onClose()
      setStep(1)
      setFile(null)
      setFormData({ name: '', slug: '', description: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">Template Wizard</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-300'}`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".docx" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
                         <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-900 truncate max-w-xs">{file.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ready for automation</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-400">
                         <CloudUpload className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select your .docx template</p>
                    </div>
                  )}
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                   <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                   <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-relaxed">Ensure your document uses {"{{ variable_name }}"} tags for dynamic data injection.</p>
                </div>
                <Button 
                  disabled={!file} 
                  onClick={() => setStep(2)}
                  className="w-full h-12 bg-slate-900 hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Template Name</label>
                    <Input 
                      placeholder="e.g. Mutual Non-Disclosure Agreement" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl h-11 text-[13px] border-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">URL Slug (Automated)</label>
                    <Input 
                      placeholder="mutual-nda" 
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value})}
                      className="rounded-xl h-11 text-[13px] border-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Description</label>
                    <textarea 
                       placeholder="Briefly describe what this document achieves..."
                       value={formData.description}
                       onChange={e => setFormData({...formData, description: e.target.value})}
                       className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border border-slate-100">Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-[2] h-12 bg-slate-900 hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-widest">Next Step</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {fields.map((field, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 relative group">
                       <div className="flex-1">
                          <Input 
                             placeholder="Field Label (e.g. Landlord Name)" 
                             value={field.label}
                             onChange={e => updateField(idx, 'label', e.target.value)}
                             className="bg-transparent border-none p-0 h-auto focus:ring-0 font-bold text-slate-900 text-[11px] placeholder:text-slate-300"
                          />
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Key: {field.name || '...'}</div>
                       </div>
                       <select 
                         value={field.type} 
                         onChange={e => updateField(idx, 'type', e.target.value)}
                         className="bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase px-2 py-1 outline-none"
                       >
                         <option value="text">TEXT</option>
                         <option value="number">NUMBER</option>
                         <option value="date">DATE</option>
                         <option value="textarea">AREA</option>
                       </select>
                       <button onClick={() => removeField(idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  ))}
                  <button 
                    onClick={addField}
                    className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Field
                  </button>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border border-slate-100">Back</Button>
                  <Button 
                    onClick={handleSubmit} 
                    isLoading={loading}
                    className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Publish Template
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
