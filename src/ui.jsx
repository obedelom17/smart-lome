import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export const C = { mint: '#52e0a0', gold: '#e8a317', red: '#ff5d6c', cyan: '#38bdf8', violet: '#a78bfa', grey: '#64748b' }
export const cl = (v, a = 0, b = 100) => Math.min(b, Math.max(a, v))
export const fmt = (n, d = 0) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
export const binColor = (f) => (f >= 85 ? C.red : f >= 60 ? C.gold : C.mint)

export function Glass({ className = '', children, ...p }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return <div onMouseMove={move} className={`glass spot ${className}`} {...p}>{children}</div>
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

export function Ring({ value, color = C.mint, size = 104, stroke = 10, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - cl(value) / 100)}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1), stroke .5s', filter: `drop-shadow(0 0 7px ${color})` }} />
      </svg>
      <div className="absolute text-center leading-tight">{children}</div>
    </div>
  )
}

export function Bar({ value, color = C.mint, h = 6 }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-white/10" style={{ height: h }}>
      <motion.div className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        animate={{ width: `${cl(value)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 18 }} />
    </div>
  )
}

export function Head({ icon: Icon, title, tag, color = C.mint, right }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${color}22`, color, boxShadow: `0 0 24px ${color}33` }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-tight">{title}</h3>
        {tag && <p className="text-xs text-white/45">{tag}</p>}
      </div>
      {right}
    </div>
  )
}

export function Btn({ children, onClick, color = C.mint, className = '', icon: Icon, disabled }) {
  return (
    <motion.button whileHover={{ scale: disabled ? 1 : 1.03 }} whileTap={{ scale: disabled ? 1 : 0.96 }} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#06120d] disabled:opacity-50 ${className}`}
      style={{ background: `linear-gradient(135deg,${color},${color}cc)`, boxShadow: `0 8px 28px -10px ${color}` }}>
      {Icon && <Icon size={16} />}{children}
    </motion.button>
  )
}

export function Mini({ label, children, color = '#e6f2ec' }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-xl font-semibold" style={{ color }}>{children}</p>
    </div>
  )
}
