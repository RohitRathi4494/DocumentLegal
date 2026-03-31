"use client"
import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import { CheckCircle2, Zap, Shield, Sparkles, CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

// @ts-ignore
const Razorpay = typeof window !== 'undefined' ? (window as any).Razorpay : null;

const PLANS = [
  {
    name: 'FREE',
    price: '0',
    description: 'Perfect for exploring the platform.',
    features: [
      'Rent Agreement Template only',
      'Max 5 documents lifetime',
      'DOCX downloads included',
      'Instant HTML preview',
      'Standard support'
    ],
    buttonText: 'Current Plan',
    color: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: Shield,
    isCurrent: true
  },
  {
    name: 'PRO',
    price: '499',
    period: '/month',
    description: 'For professionals generating multiple docs.',
    features: [
      'Access to all standard templates',
      'Up to 50 documents monthly',
      'DOCX & PDF downloads',
      'Priority processing',
      'Email support'
    ],
    buttonText: 'Upgrade to Pro',
    color: 'bg-indigo-600',
    textColor: 'text-white',
    icon: Zap,
    isPopular: true
  },
  {
    name: 'ADVANCED',
    price: '1499',
    period: '/month',
    description: 'Unleash full power for your business.',
    features: [
      'All Global Templates inclused',
      'Unlimited Document Generation',
      'Custom Template Uploads',
      'Team & Multi-Tenant Support',
      '24/7 Priority Support'
    ],
    buttonText: 'Get Advanced',
    color: 'bg-slate-900',
    textColor: 'text-white',
    icon: Sparkles
  }
]

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initiating, setInitiating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('auth/me/')
      setUser(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName: string) => {
    if (planName === 'FREE' || planName === user?.tenant?.subscription?.plan) return

    setInitiating(planName)
    setError(null)

    try {
      const res = await api.post('subscriptions/initiate/', { plan: planName })
      const { subscription_id, razorpay_key } = res.data

      const options = {
        key: razorpay_key,
        subscription_id: subscription_id,
        name: "MYDOCWRITER",
        description: `${planName} Subscription`,
        image: "https://your-logo-url.com/logo.png",
        handler: function (response: any) {
          // Send payment data to your server for verification if needed
          // but our webhook will handle the heavy lifting.
          // We just refresh the UI here.
          window.location.reload()
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: {
          color: "#4f46e5"
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to initiate payment. Please try again.")
    } finally {
      setInitiating(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  )

  const currentPlan = user?.tenant?.subscription?.plan || 'FREE'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 py-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm tracking-wide uppercase"
        >
           <CreditCard className="w-4 h-4" /> Subscription & Billing
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Scale Your Legal Business</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Choose the plan that fits your growth. Flexible subscriptions, powerful features, and premium document generation.
        </p>
      </div>

      {error && (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
        >
           <AlertCircle className="w-5 h-5 flex-shrink-0" />
           <p className="font-bold">{error}</p>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => {
          const isCurrent = plan.name === currentPlan
          const isLocked = initiating !== null && initiating !== plan.name

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[3rem] border transition-all duration-500 ${
                plan.isPopular 
                  ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105 z-10 bg-white' 
                  : 'border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl ${plan.color} ${plan.textColor} flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/5`}>
                  <plan.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                  {plan.period && <span className="text-slate-400 font-bold ml-1">{plan.period}</span>}
                </div>
                <p className="text-slate-500 mt-4 font-medium text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex-grow space-y-5 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.isPopular ? 'primary' : 'outline'}
                size="lg"
                disabled={isCurrent || isLocked || initiating === plan.name}
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${
                  isCurrent 
                    ? 'bg-slate-100 text-slate-400 border-none' 
                    : plan.isPopular 
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20' 
                      : 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {initiating === plan.name ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {plan.buttonText} {!isCurrent && <ArrowRight className="w-4 h-4 ml-2" />}
                  </>
                )}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Trust Badge */}
      <div className="pt-16 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mb-8">Powered by Industry Leaders</p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale contrast-125">
           {/* Placeholders for logos */}
           <div className="font-black text-2xl">RAZORPAY</div>
           <div className="font-black text-2xl">VISA</div>
           <div className="font-black text-2xl">MASTERCARD</div>
           <div className="font-black text-2xl">UPI</div>
        </div>
      </div>

    </div>
  )
}
