import { useState } from 'react'
import { Building2, Droplets, Lightbulb, LayoutDashboard, Moon, Pause, ParkingSquare, Play, Radio, Scale, ShieldAlert, Smartphone, Sun, Trash2, Workflow, Zap } from 'lucide-react'
import { sensorCount, useSim } from './sim'
import { C, Counter, Card } from './ui'
import CityMap from './CityMap'
import Logo from './Logo'
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
const GC = { '': '#006a4e', Données: '#0284c7', Terrain: '#059669', Analyse: '#7c3aed' }
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
      <div className="tricolor fixed left-0 right-0 top-0 z-[1100]" aria-hidden="true" />
      <aside className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-200 bg-white md:bottom-0 md:right-auto md:top-0 md:w-[240px] md:border-r md:border-t-0">
        <nav aria-label="Modules" className="flex h-full gap-1 overflow-x-auto p-2 md:flex-col md:overflow-y-auto md:p-4 md:pt-6">
          <div className="hidden items-center gap-3 px-2 pb-4 pt-1 md:flex">
            <Logo size={44} className="shrink-0 drop-shadow-sm" />
            <div><p className="display text-lg font-bold leading-tight text-[#006a4e]">Smart Lomé</p><p className="text-xs text-slate-500">IAI-Togo, GLSI 3</p></div>
          </div>
          {MODS.map((m, i) => {
            const on = m.id === mod
            return (
              <div key={m.id} className="contents">
                {m.g && m.g !== MODS[i - 1]?.g && <p className="hidden items-center gap-2 px-3 pb-1 pt-5 text-xs font-bold uppercase tracking-wide md:flex" style={{ color: GC[m.g] }}><i className="h-1.5 w-1.5 rounded-full" style={{ background: GC[m.g] }} />{m.g}</p>}
                <button onClick={() => setMod(m.id)} aria-current={on ? 'page' : undefined}
                  style={on ? { background: `${GC[m.g]}14`, color: GC[m.g], boxShadow: `inset 3px 0 0 ${GC[m.g]}` } : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-[10px] px-3 py-2 text-left transition-colors max-md:flex-col max-md:gap-1 max-md:px-3 ${on ? '' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <m.icon size={18} className="shrink-0" style={on ? undefined : { color: GC[m.g] }} />
                  <span className={`whitespace-nowrap text-sm max-md:text-xs ${on ? 'font-semibold' : ''}`}>{m.label}</span>
                </button>
              </div>
            )
          })}
        </nav>
      </aside>

      <main className="relative pb-28 md:pb-12 md:pl-[240px]">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-5 pt-10 md:px-10">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${GC[cur.g]}14`, color: GC[cur.g] }}>{mod === 'overview' ? 'Les villes intelligentes : l’IoT au service de la gouvernance urbaine' : cur.tag}</p>
              <h1 className="title-grad text-3xl font-bold leading-tight md:text-5xl">{mod === 'overview' ? 'Lomé, ville connectée' : cur.label}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip" style={{ background: night ? '#eef2ff' : '#fffbeb', borderColor: night ? '#c7d2fe' : '#fde68a', color: night ? '#4338ca' : '#b45309' }}>{night ? <Moon size={14} /> : <Sun size={14} />}{pad(Math.floor(s.hour))}:{s.hour % 1 ? '30' : '00'} · {night ? 'nuit' : 'jour'} simulé{night ? 'e' : ''}</span>
              <span className="chip" style={paused ? undefined : { background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}><i className={paused ? 'h-2 w-2 rounded-full bg-slate-400' : 'live-dot'} />{paused ? 'En pause' : 'En direct'}</span>
              <button onClick={() => setPaused(!paused)} aria-pressed={paused} className="chip transition hover:bg-slate-100 hover:shadow-sm">{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Reprendre' : 'Pause'}</button>
            </div>
          </header>

          <div className="mt-8 space-y-6">
            {mod === 'overview' && (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((k) => (
                  <Card key={k.l} className="p-5" style={{ background: `linear-gradient(135deg, ${k.c}12, #fff 70%)`, borderColor: `${k.c}33` }}>
                    <span className="absolute inset-x-0 top-0 h-1" style={{ background: k.c }} />
                    <div className="mb-3 grid h-9 w-9 place-items-center rounded-[10px]" style={{ background: `${k.c}1f`, color: k.c }}><k.i size={18} /></div>
                    <p className="text-sm text-slate-600">{k.l}</p>
                    <p className="display mt-1 text-4xl font-bold" style={{ color: k.c }}>{k.v}</p>
                  </Card>
                ))}
              </div>
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
