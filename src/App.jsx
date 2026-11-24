import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Building2, Droplets, Lightbulb, LayoutDashboard, Moon, Pause, ParkingSquare, Play, Radio, Scale, ShieldAlert, Smartphone, Sun, Trash2, Workflow, Zap } from 'lucide-react'
import { sensorCount, useSim } from './sim'
import { C, Counter, Card, cl } from './ui'
import CityMap from './CityMap'
import { BinsPanel, GridPanel, LightsPanel, OverviewPanel, ParkingPanel, WaterPanel } from './panels'
import Pipeline from './views/Pipeline'
import Citizen from './views/Citizen'
import Compare from './views/Compare'
import Cities from './views/Cities'
import Risks from './views/Risks'

const MODS = [
  { id: 'overview', g: '', label: 'Vue globale', icon: LayoutDashboard, tag: 'Introduction' },
  { id: 'pipeline', g: 'Données', label: 'Pipeline Big Data', icon: Workflow, tag: 'Partie I.B' },
  { id: 'citizen', g: 'Données', label: 'Signalement citoyen', icon: Smartphone, tag: 'Partie I.C' },
  { id: 'lights', g: 'Terrain', label: 'Éclairage', icon: Lightbulb, tag: 'Partie II.A' },
  { id: 'parking', g: 'Terrain', label: 'Parking', icon: ParkingSquare, tag: 'Partie II.A' },
  { id: 'bins', g: 'Terrain', label: 'Déchets', icon: Trash2, tag: 'Partie II.B' },
  { id: 'water', g: 'Terrain', label: 'Eau', icon: Droplets, tag: 'Partie II.B' },
  { id: 'grid', g: 'Terrain', label: 'Smart Grid', icon: Zap, tag: 'Partie II.C' },
  { id: 'cities', g: 'Analyse', label: 'Villes de référence', icon: Building2, tag: 'Partie II.D' },
  { id: 'risks', g: 'Analyse', label: 'Défis et sécurité', icon: ShieldAlert, tag: 'Partie III' },
  { id: 'compare', g: 'Analyse', label: 'Comparateur', icon: Scale, tag: 'Conclusion' }
]
const MAP_MODS = ['overview', 'lights', 'parking', 'bins', 'water', 'grid']
const pad = (n) => String(n).padStart(2, '0')
const STARS = [[28, 22], [52, 12], [88, 26], [126, 14], [160, 30], [182, 16], [70, 40]]

/* Le moment mémorable : un ciel qui suit l'heure simulée. Il pilote l'éclairage et le solaire. */
function Sky({ hour }) {
  const night = hour < 6 || hour >= 18.5
  const t = cl(night ? ((hour - 18.5 + 24) % 24) / 11.5 : (hour - 6) / 12.5, 0, 1)
  const a = Math.PI * (1 - t)
  const x = 100 + 80 * Math.cos(a), y = 88 - 70 * Math.sin(a)
  return (
    <div className="relative w-[236px] overflow-hidden rounded-2xl border border-white/10">
      <motion.svg viewBox="0 0 200 100" className="block w-full" animate={{ backgroundColor: night ? '#0d1536' : '#27407f' }} transition={{ duration: 1.5 }}>
        {night && STARS.map(([sx, sy], i) => <circle key={i} className="star" style={{ animationDelay: `${i * 0.4}s` }} cx={sx} cy={sy} r="1.2" fill="#cfd8ff" />)}
        <path d="M20 88 A80 70 0 0 1 180 88" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1" strokeDasharray="3 4" />
        <motion.circle key={night ? 'n' : 'd'} r="8" fill={night ? '#dfe5ff' : C.gold} initial={{ cx: x, cy: y }} animate={{ cx: x, cy: y }} transition={{ duration: 2, ease: 'linear' }} />
        <rect x="0" y="88" width="200" height="12" fill="#0b1020" />
        <rect x="0" y="88" width="66" height="2" fill={C.mint} /><rect x="66" y="88" width="68" height="2" fill={C.gold} /><rect x="134" y="88" width="66" height="2" fill={C.red} />
      </motion.svg>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-1 text-xs">
        <span className="display text-lg font-bold leading-none">{pad(Math.floor(hour))}:{hour % 1 ? '30' : '00'}</span>
        <span className="flex items-center gap-1 text-white/70">{night ? <Moon size={13} /> : <Sun size={13} />}{night ? 'Nuit simulée' : 'Jour simulé'}</span>
      </div>
    </div>
  )
}

export default function App() {
  const { s, act, paused, setPaused } = useSim()
  const [mod, setMod] = useState('overview')
  const cur = MODS.find((m) => m.id === mod)
  const alerts = s.bins.filter((b) => b.fill >= 85).length + s.water.filter((w) => w.leak).length + s.parking.filter((q) => q.free / q.cap < 0.05).length
  const cov = s.grid.load ? Math.min(100, (s.grid.solar / s.grid.load) * 100) : 0
  const sav = s.kwhTrad ? (1 - s.kwhSmart / s.kwhTrad) * 100 : 0
  const n = sensorCount(s)

  const kpis = [
    { l: 'Capteurs actifs', v: <Counter value={n} />, c: C.mint, i: Radio },
    { l: 'Messages par seconde', v: <Counter value={n / 2} dec={1} />, c: C.cyan, i: Activity },
    { l: 'Alertes actives', v: <Counter value={alerts} />, c: alerts ? C.red : C.mint, i: ShieldAlert },
    { l: 'Économie éclairage', v: <Counter value={sav} suffix=" %" />, c: C.gold, i: Lightbulb },
    { l: 'Couverture solaire', v: <Counter value={cov} suffix=" %" />, c: C.gold, i: Zap }
  ]
  const panel = { overview: <OverviewPanel s={s} />, bins: <BinsPanel s={s} act={act} />, lights: <LightsPanel s={s} />, parking: <ParkingPanel s={s} />, water: <WaterPanel s={s} act={act} />, grid: <GridPanel s={s} /> }[mod]
  const full = { pipeline: <Pipeline s={s} />, citizen: <Citizen s={s} act={act} />, compare: <Compare />, cities: <Cities />, risks: <Risks /> }[mod]

  return (
    <div className="relative min-h-screen">
      <aside className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-ink/95 backdrop-blur md:bottom-0 md:right-auto md:top-0 md:w-[252px] md:border-r md:border-t-0">
        <nav className="flex h-full gap-1 overflow-x-auto p-2 md:flex-col md:overflow-y-auto md:p-4">
          <div className="hidden items-center gap-3 px-2 pb-5 pt-1 md:flex">
            <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl" />
            <div><p className="display text-lg font-extrabold leading-tight">Smart Lomé</p><p className="text-[11px] text-white/45">IAI-Togo, GLSI 3</p></div>
          </div>
          {MODS.map((m, i) => (
            <div key={m.id} className="contents">
              {m.g && m.g !== MODS[i - 1]?.g && <p className="hidden px-3 pb-1 pt-4 text-xs font-semibold text-white/35 md:block">{m.g}</p>}
              <button onClick={() => setMod(m.id)} className="relative flex shrink-0 items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-white/[.04]">
                {m.id === mod && (
                  <motion.span layoutId="nav" className="absolute inset-0 rounded-[10px] bg-white/[.07]" transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-gold" />
                  </motion.span>
                )}
                <m.icon size={18} className="relative shrink-0" color={m.id === mod ? C.gold : '#8b96c4'} />
                <span className={`relative hidden text-sm md:block ${m.id === mod ? 'font-semibold' : 'text-white/65'}`}>{m.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      <main className="relative z-10 pb-24 md:pb-10 md:pl-[252px]">
        <div className="flagbar" />
        <header className="flex flex-wrap items-end justify-between gap-5 px-5 pt-7 md:px-8">
          <div className="min-w-0">
            <p className="mb-2 text-sm text-white/50">{cur.tag}, {mod === 'overview' ? 'Les villes intelligentes : l’IoT au service de la gouvernance urbaine' : 'Smart Lomé'}</p>
            <motion.h1 key={mod} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              className="text-4xl font-extrabold leading-[1.02] md:text-6xl">{mod === 'overview' ? 'Lomé, ville connectée' : cur.label}</motion.h1>
            <div className="mt-4 flex items-center gap-2">
              <span className="chip"><i className={paused ? 'h-2 w-2 rounded-full bg-white/40' : 'live-dot'} />{paused ? 'En pause' : 'En direct'}</span>
              <button onClick={() => setPaused(!paused)} className="chip transition hover:bg-white/10">{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Reprendre' : 'Pause'}</button>
            </div>
          </div>
          <Sky hour={s.hour} />
        </header>

        <div className="mt-7 space-y-5 px-5 md:px-8">
          {mod === 'overview' && (
            <Card className="grid grid-cols-2 divide-white/10 lg:grid-cols-5 lg:divide-x">
              {kpis.map((k, i) => (
                <motion.div key={k.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 200, damping: 22 }} className="p-5">
                  <div className="flex items-center justify-between"><p className="text-xs text-white/55">{k.l}</p><k.i size={16} color={k.c} /></div>
                  <p className="display mt-2 text-4xl font-extrabold" style={{ color: k.c }}>{k.v}</p>
                </motion.div>
              ))}
            </Card>
          )}
          <div key={mod} className="rise">
            {MAP_MODS.includes(mod) ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <Card className="h-[480px] p-0 xl:h-[640px]"><CityMap s={s} mod={mod} /></Card>
                {panel}
              </div>
            ) : full}
          </div>
        </div>
      </main>
    </div>
  )
}
