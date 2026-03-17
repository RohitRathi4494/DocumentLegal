"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { FileText, Download, Calendar, QrCode, Clipboard, ExternalLink, Clock, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [meRes, docsRes] = await Promise.all([
        api.get('auth/me/'),
        api.get('documents/')
      ])
      setUser(meRes.data)
      setDocuments(docsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const downloadImage = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Intake_${user?.profile?.slug || 'writer'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  }

  const printPoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Printable Intake Poster</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              display: flex; 
              flex-direction: column; 
              items-align: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              text-align: center;
              background: white;
              color: black;
            }
            .container {
              border: 10px solid #4f46e5;
              padding: 50px;
              border-radius: 40px;
              max-width: 600px;
            }
            h1 { font-size: 3rem; margin-bottom: 10px; color: #1e1b4b; }
            p { font-size: 1.5rem; color: #475569; margin-bottom: 40px; }
            .qr-box { 
              background: white; 
              padding: 20px; 
              border: 2px solid #e2e8f0; 
              display: inline-block;
              border-radius: 20px;
              margin-bottom: 40px;
            }
            img { width: 300px; height: 300px; }
            .footer { font-size: 1.2rem; font-weight: bold; color: #4f46e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Scan to Get Started</h1>
            <p>Skip the queue! Submit your details for legal documents directly from your phone.</p>
            <div class="qr-box">
              <img src="${qrUrl}" alt="QR Code" />
            </div>
            <div class="footer">Legal Document Services</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                // window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const publicLink = (mounted && user?.profile?.slug)
    ? `${window.location.origin}/p/${user.profile.slug}`
    : ''

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicLink)}`

  const pendingDocs = documents.filter(doc => doc.status === 'SUBMITTED')
  const completedDocs = documents.filter(doc => doc.status === 'COMPLETED')

  if (loading) return (
    <div className="p-8 flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}</h1>
          <p className="text-muted-foreground text-lg">Manage your documents and client intake.</p>
        </div>
        <Link href="/dashboard/templates">
          <Button size="lg" className="shadow-lg shadow-primary/20">
            <PlusIcon className="w-5 h-5 mr-2" /> Create New Document
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: QR & Public Link */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-3xl border-primary/20 bg-primary/5"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <QrCode className="text-primary" /> Your Intake Link
            </h2>
            
            <div className="bg-white p-4 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
              <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={downloadImage}>
                   Download Image
                </Button>
                <Button variant="outline" size="sm" onClick={printPoster}>
                   Print for Cabin
                </Button>
              </div>

              <div className="p-4 bg-background/50 rounded-2xl border border-border flex items-center justify-between group overflow-hidden">
                <div className="truncate text-sm text-muted-foreground mr-2">{publicLink}</div>
                <button 
                  onClick={() => copyToClipboard(publicLink)}
                  className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary flex-shrink-0"
                >
                  {copySuccess ? <CheckCircle2 className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                </button>
              </div>
              
              <Link href={publicLink} target="_blank" className="block">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Intake Page
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: Inboxes */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Pending Submissions */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-2xl font-bold">Client Submissions <span className="text-muted-foreground font-normal ml-2 text-lg">({pendingDocs.length})</span></h2>
            </div>

            {pendingDocs.length === 0 ? (
              <div className="p-12 glass-panel rounded-3xl text-center border-dashed border-2">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">No new submissions. Share your link to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingDocs.map((doc) => (
                  <motion.div key={doc.id} layout className="glass-panel p-5 rounded-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{doc.document_type_details?.name}</h3>
                        <p className="text-sm text-muted-foreground">Submitted {new Date(doc.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/documents/${doc.id}/finalize`}>
                      <Button variant="secondary">Finalize & Print</Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Completed Documents */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Finalized Documents <span className="text-muted-foreground font-normal ml-2 text-lg">({completedDocs.length})</span></h2>
            
            {completedDocs.length === 0 ? (
              <div className="p-12 glass-panel rounded-3xl text-center">
                <p className="text-muted-foreground">Your history is empty.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedDocs.map((doc) => (
                  <motion.div key={doc.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{doc.document_type_details?.name}</h3>
                        <p className="text-sm text-muted-foreground">Finalized {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={doc.generated_file} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
