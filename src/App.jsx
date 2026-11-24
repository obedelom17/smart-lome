import { useState } from 'react'
import { Building2, Droplets, Lightbulb, LayoutDashboard, Moon, Pause, ParkingSquare, Play, Radio, Scale, ShieldAlert, Smartphone, Sun, Trash2, Workflow, Zap } from 'lucide-react'
import { sensorCount, useSim } from './sim'
import { C, Counter, Card } from './ui'
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
    { l: 'Alertes en cours', v: <Counter value={alerts} />, c: alerts ? C.red : C.mint, i: ShieldAlert },
    { l: 'Économie d’éclairage', v: <Counter value={sav} suffix=" %" />, c: C.gold, i: Lightbulb },
    { l: 'Couverture solaire', v: <Counter value={cov} suffix=" %" />, c: C.gold, i: Zap }
  ]
  const panel = { overview: <OverviewPanel s={s} />, bins: <BinsPanel s={s} act={act} />, lights: <LightsPanel s={s} />, parking: <ParkingPanel s={s} />, water: <WaterPanel s={s} act={act} />, grid: <GridPanel s={s} /> }[mod]
  const full = { pipeline: <Pipeline s={s} />, citizen: <Citizen s={s} act={act} />, compare: <Compare />, cities: <Cities />, risks: <Risks /> }[mod]

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-200 bg-white md:bottom-0 md:right-auto md:top-0 md:w-[240px] md:border-r md:border-t-0">
        <nav aria-label="Modules" className="flex h-full gap-1 overflow-x-auto p-2 md:flex-col md:overflow-y-auto md:p-4">
          <div className="hidden items-center gap-3 px-2 pb-4 pt-1 md:flex">
            <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl" />
            <div><p className="display text-lg font-bold leading-tight">Smart Lomé</p><p className="text-xs text-slate-500">IAI-Togo, GLSI 3</p></div>
          </div>
          {MODS.map((m, i) => {
            const on = m.id === mod
            return (
              <div key={m.id} className="contents">
                {m.g && m.g !== MODS[i - 1]?.g && <p className="hidden px-3 pb-1 pt-5 text-xs font-semibold text-slate-500 md:block">{m.g}</p>}
                <button onClick={() => setMod(m.id)} aria-current={on ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-[10px] px-3 py-2 text-left transition-colors max-md:flex-col max-md:gap-1 max-md:px-3 ${on ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <m.icon size={18} className="shrink-0" />
                  <span className={`whitespace-nowrap text-sm max-md:text-xs ${on ? 'font-semibold' : ''}`}>{m.label}</span>
                </button>
              </div>
            )
          })}
        </nav>
      </aside>

      <main className="pb-28 md:pb-12 md:pl-[240px]">
        <div className="mx-auto max-w-[1280px] px-5 pt-8 md:px-10">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 text-sm text-slate-600">{mod === 'overview' ? 'Les villes intelligentes : l’IoT au service de la gouvernance urbaine' : cur.tag}</p>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">{mod === 'overview' ? 'Lomé, ville connectée' : cur.label}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{night ? <Moon size={14} /> : <Sun size={14} />}{pad(Math.floor(s.hour))}:{s.hour % 1 ? '30' : '00'} · {night ? 'nuit' : 'jour'} simulé{night ? 'e' : ''}</span>
              <span className="chip"><i className={paused ? 'h-2 w-2 rounded-full bg-slate-400' : 'live-dot'} />{paused ? 'En pause' : 'En direct'}</span>
              <button onClick={() => setPaused(!paused)} aria-pressed={paused} className="chip transition hover:bg-slate-100">{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Reprendre' : 'Pause'}</button>
            </div>
          </header>

          <div className="mt-8 space-y-6">
            {mod === 'overview' && (
              <Card className="grid grid-cols-2 lg:grid-cols-4">
                {kpis.map((k, i) => (
                  <div key={k.l} className={`p-5 ${i % 2 ? 'border-l border-slate-200' : ''} ${i > 1 ? 'border-t border-slate-200 lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l lg:border-slate-200' : ''}`}>
                    <p className="flex items-center gap-2 text-sm text-slate-600"><k.i size={16} color={k.c} />{k.l}</p>
                    <p className="display mt-2 text-4xl font-bold" style={{ color: k.c }}>{k.v}</p>
                  </div>
                ))}
              </Card>
            )}
            <div key={mod}>
              {MAP_MODS.includes(mod) ? (
                <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
                  <Card className="h-[420px] p-0 xl:h-[640px]"><CityMap s={s} mod={mod} /></Card>
                  {panel}
                </div>
              ) : full}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
