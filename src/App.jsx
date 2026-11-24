import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Building2, Droplets, Lightbulb, LayoutDashboard, Pause, ParkingSquare, Play, Radio, Scale, ShieldAlert, Smartphone, Trash2, Workflow, Zap } from 'lucide-react'
import { sensorCount, useSim } from './sim'
import { C, Counter, Glass } from './ui'
import CityMap from './CityMap'
import { BinsPanel, GridPanel, LightsPanel, OverviewPanel, ParkingPanel, WaterPanel } from './panels'
import Pipeline from './views/Pipeline'
import Citizen from './views/Citizen'
import Compare from './views/Compare'
import Cities from './views/Cities'
import Risks from './views/Risks'

const MODS = [
  { id: 'overview', label: 'Vue globale', icon: LayoutDashboard, tag: 'Introduction · Membre 1' },
  { id: 'pipeline', label: 'Pipeline Big Data', icon: Workflow, tag: 'I.B · Membre 2' },
  { id: 'citizen', label: 'Signalement citoyen', icon: Smartphone, tag: 'I.C · Membre 2' },
  { id: 'lights', label: 'Éclairage', icon: Lightbulb, tag: 'II.A · Membre 3' },
  { id: 'parking', label: 'Parking', icon: ParkingSquare, tag: 'II.A · Membre 3' },
  { id: 'bins', label: 'Déchets', icon: Trash2, tag: 'II.B · Membre 3' },
  { id: 'water', label: 'Eau', icon: Droplets, tag: 'II.B · Membre 3' },
  { id: 'grid', label: 'Smart Grid', icon: Zap, tag: 'II.C · Membre 4' },
  { id: 'cities', label: 'Villes de référence', icon: Building2, tag: 'II.D · Membre 4' },
  { id: 'risks', label: 'Défis et sécurité', icon: ShieldAlert, tag: 'III · Membre 5' },
  { id: 'compare', label: 'Comparateur', icon: Scale, tag: 'Conclusion · Membre 1' }
]
const MAP_MODS = ['overview', 'lights', 'parking', 'bins', 'water', 'grid']
const pad = (n) => String(n).padStart(2, '0')

export default function App() {
  const { s, act, paused, setPaused } = useSim()
  const [mod, setMod] = useState('overview')
  const cur = MODS.find((m) => m.id === mod)
  const night = s.hour < 6 || s.hour >= 18.5
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
      <div className="aurora"><i /><i /><i /></div>
      <div className="gridbg" />

      <aside className="fixed bottom-3 left-3 right-3 z-30 md:bottom-4 md:right-auto md:top-4 md:w-[238px]">
        <Glass className="flex h-full gap-1 overflow-x-auto p-2 md:flex-col md:overflow-y-auto md:p-3">
          <div className="hidden items-center gap-3 px-2 pb-4 pt-2 md:flex">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-forest-700 to-gold"><Radio size={20} color="#06120d" /></div>
            <div><p className="font-bold leading-tight">Smart Lomé</p><p className="text-[11px] text-white/45">IAI-Togo · GLSI 3</p></div>
          </div>
          {MODS.map((m) => (
            <button key={m.id} onClick={() => setMod(m.id)} className="relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left">
              {m.id === mod && <motion.span layoutId="nav" className="absolute inset-0 rounded-xl border border-white/15 bg-white/10" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <m.icon size={18} className="relative shrink-0" color={m.id === mod ? C.mint : '#9fb5aa'} />
              <span className="relative hidden md:block"><span className={`block text-sm ${m.id === mod ? 'font-semibold' : 'text-white/70'}`}>{m.label}</span><span className="block text-[10.5px] text-white/35">{m.tag}</span></span>
            </button>
          ))}
        </Glass>
      </aside>

      <main className="relative z-10 pb-28 md:pb-10 md:pl-[270px]">
        <header className="flex flex-wrap items-end justify-between gap-4 px-5 pt-6 md:px-8">
          <div>
            <p className="text-sm text-white/50">Les villes intelligentes : l’IoT au service de la gouvernance urbaine</p>
            <h1 className="grad-text text-4xl font-bold leading-tight md:text-6xl">{mod === 'overview' ? 'Lomé, ville connectée' : cur.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip font-mono">{night ? 'Nuit' : 'Jour'} simulé {pad(Math.floor(s.hour))}:{s.hour % 1 ? '30' : '00'}</span>
            <span className="chip"><i className={paused ? 'h-2 w-2 rounded-full bg-white/40' : 'live-dot'} />{paused ? 'En pause' : 'En direct'}</span>
            <button onClick={() => setPaused(!paused)} className="chip transition hover:bg-white/15">{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Reprendre' : 'Pause'}</button>
          </div>
        </header>

        <div className="mt-6 space-y-5 px-5 md:px-8">
          {mod === 'overview' && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {kpis.map((k) => (
                <Glass key={k.l} className="p-4">
                  <div className="flex items-center justify-between"><p className="text-xs text-white/55">{k.l}</p><k.i size={16} color={k.c} /></div>
                  <p className="mt-2 text-3xl font-bold" style={{ color: k.c, textShadow: `0 0 28px ${k.c}66` }}>{k.v}</p>
                </Glass>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={mod} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {MAP_MODS.includes(mod) ? (
                <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                  <Glass className="h-[480px] p-0 xl:h-[640px]"><CityMap s={s} mod={mod} /></Glass>
                  {panel}
                </div>
              ) : full}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
