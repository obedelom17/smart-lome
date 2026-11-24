import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export const C = { mint: '#059669', gold: '#b45309', red: '#dc2626', cyan: '#0284c7', violet: '#7c3aed', grey: '#94a3b8', glow: '#f59e0b' }
export const cl = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v))
export const fmt = (n, d = 0) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
export const binColor = (f) => (f >= 85 ? C.red : f >= 60 ? C.gold : C.mint)

export function Card({ className = '', children, ...p }) {
  return <div className={`card ${className}`} {...p}>{children}</div>
}

export function Counter({ value, dec = 0, suffix = '' }) {
  const [v, setV] = useState(value)
  const ref = useRef(value)
  useEffect(() => {
    const from = ref.current, to = value, t0 = performance.now()
    let id
    const f = (t) => {
      const k = Math.min(1, (t - t0) / 700)
      const cur = from + (to - from) * (1 - Math.pow(1 - k, 3))
      ref.current = cur; setV(cur)
      if (k < 1) id = requestAnimationFrame(f)
    }
    id = requestAnimationFrame(f)
    return () => cancelAnimationFrame(id)
  }, [value])
  return <>{fmt(v, dec)}{suffix}</>
}

export function Ring({ value, color = C.mint, size = 124, stroke = 10, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - cl(value) / 100)}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1), stroke .5s' }} />
      </svg>
      <div className="absolute text-center leading-tight">{children}</div>
    </div>
  )
}

export function Bar({ value, color = C.mint, h = 6 }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-slate-100" style={{ height: h }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        animate={{ width: `${cl(value)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 18 }} />
    </div>
  )
}

export function Head({ icon: Icon, title, tag, color = C.mint, right }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px]" style={{ background: `${color}1f`, color, boxShadow: `inset 0 0 0 1px ${color}33` }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold leading-tight text-slate-900">{title}</h3>
        {tag && <p className="text-sm text-slate-600">{tag}</p>}
      </div>
      {right}
    </div>
  )
}

export function Btn({ children, onClick, color = C.mint, className = '', icon: Icon, disabled }) {
  return (
    <motion.button whileTap={{ scale: disabled ? 1 : 0.95 }} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-50 ${className}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 12px ${color}40` }}>
      {Icon && <Icon size={16} />}{children}
    </motion.button>
  )
}

export function Mini({ label, children, color = '#0f172a' }) {
  return (
    <div className="rounded-xl p-3" style={{ background: `${color}0f`, boxShadow: `inset 0 0 0 1px ${color}22` }}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="display mt-1 text-2xl font-bold" style={{ color }}>{children}</p>
    </div>
  )
}
