import { AnimatePresence, motion } from 'framer-motion'
import { Area, AreaChart, Bar as RBar, BarChart, Cell, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RT, XAxis, YAxis } from 'recharts'
import { Activity, Battery, Droplets, Lightbulb, Navigation, ParkingSquare, Sun, Trash2, Zap, Wrench, AlertTriangle } from 'lucide-react'
import { Bar, Btn, C, Counter, Card, Head, Mini, Ring, binColor, fmt } from './ui'

const box = 'p-5 xl:h-[640px] overflow-y-auto'
const tt = { contentStyle: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a' }, labelStyle: { color: '#475569' } }
const axis = { stroke: '#64748b', fontSize: 12, tickLine: false, axisLine: false }
const sevColor = { info: C.mint, warn: C.gold, crit: C.red }

export function OverviewPanel({ s }) {
  return (
    <Card className="flex max-h-[640px] min-h-[320px] flex-col p-5 xl:h-[640px]">
      <Head icon={Activity} title="Flux d’événements" tag="Décisions et alertes en temps réel" />
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {s.events.map((e) => (
            <motion.div layout key={e.id} initial={{ opacity: 0, x: 40, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }}
              className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: sevColor[e.sev] }} />
              <div className="min-w-0">
                <p className="leading-snug">{e.text}</p>
                <p className="mt-0.5 text-xs text-slate-500">{e.t} · {e.kind}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  )
}

export function BinsPanel({ s, act }) {
  const sorted = [...s.bins].sort((a, b) => b.fill - a.fill)
  const avg = s.bins.reduce((a, b) => a + b.fill, 0) / s.bins.length
  const full = s.bins.filter((b) => b.fill >= 85).length
  const ri = s.routeInfo
  return (
    <Card className={box}>
      <Head icon={Trash2} title="Gestion intelligente des déchets" tag="capteurs ultrasoniques" color={C.mint} />
      <div className="mb-4 flex items-center gap-6">
        <Ring value={avg} color={binColor(avg)}><p className="text-2xl font-bold"><Counter value={avg} suffix=" %" /></p><p className="text-xs text-slate-600">moyenne</p></Ring>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Mini label="Conteneurs pleins" color={full ? C.red : C.mint}>{full}</Mini>
          <Mini label="Km économisés" color={C.gold}><Counter value={s.kmSaved} dec={1} /></Mini>
        </div>
      </div>
      <Btn onClick={act.collect} icon={Navigation} className="mb-4 w-full">Lancer la tournée optimisée</Btn>
      <AnimatePresence>
        {ri && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="mb-2 font-semibold">{ri.count} conteneurs sur {ri.total} collectés</p>
            <div className="mb-1 flex justify-between text-xs text-slate-600"><span>Tournée classique (tous les bacs)</span><span>{fmt(ri.trad, 1)} km</span></div>
            <Bar value={100} color={C.grey} />
            <div className="mb-1 mt-3 flex justify-between text-xs text-slate-600"><span>Tournée intelligente</span><span>{fmt(ri.smart, 1)} km</span></div>
            <Bar value={(ri.smart / ri.trad) * 100} color={C.mint} />
            <p className="mt-3 text-xs text-emerald-700">Gain : {fmt((1 - ri.smart / ri.trad) * 100)} % de distance</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-3">
        {sorted.slice(0, 8).map((b) => (
          <motion.div layout key={b.id}>
            <div className="mb-1 flex justify-between text-sm"><span className="text-slate-700">{b.id} · {b.name}</span><span className="font-semibold" style={{ color: binColor(b.fill) }}>{Math.round(b.fill)} %</span></div>
            <Bar value={b.fill} color={binColor(b.fill)} />
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

export function LightsPanel({ s }) {
  const night = s.hour < 6 || s.hour >= 18.5
  const sav = s.kwhTrad ? (1 - s.kwhSmart / s.kwhTrad) * 100 : 0
  const full = s.lights.filter((l) => l.level === 100).length
  const dim = s.lights.filter((l) => l.level === 30).length
  const data = [{ n: 'Classique', v: Math.round(s.kwhTrad), c: C.grey }, { n: 'Intelligent', v: Math.round(s.kwhSmart), c: C.glow }]
  return (
    <Card className={box}>
      <Head icon={Lightbulb} title="Éclairage public adaptatif" tag="détection de mouvement" color={C.gold}
        right={<span className="chip">{night ? 'Nuit' : 'Jour : éteint'}</span>} />
      <div className="mb-5 flex items-center gap-6">
        <Ring value={sav} color={C.gold}><p className="text-2xl font-bold"><Counter value={sav} suffix=" %" /></p><p className="text-xs text-slate-600">économisée</p></Ring>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Mini label="Plein régime" color={C.gold}>{full}</Mini>
          <Mini label="À 30 %">{dim}</Mini>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-10 gap-1.5">
        {s.lights.map((l) => (
          <motion.div key={l.id} title={`${l.id} · ${l.level} %`} animate={{ opacity: l.level ? 0.6 + l.level / 250 : 0.5 }}
            className="grid aspect-square place-items-center rounded-lg" style={{ background: l.level ? `${C.glow}30` : '#f1f5f9', boxShadow: l.level === 100 ? `0 0 0 2px ${C.glow}` : 'none' }}>
            <Lightbulb size={14} color={l.level === 100 ? C.gold : C.glow} />
          </motion.div>
        ))}
      </div>
      <p className="mb-2 text-sm text-slate-600">Énergie cumulée (kWh)</p>
      <div className="h-36">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" {...axis} /><YAxis type="category" dataKey="n" {...axis} width={80} />
            <RT {...tt} cursor={{ fill: '#f1f5f9' }} />
            <RBar dataKey="v" radius={6} isAnimationActive={false}>{data.map((d) => <Cell key={d.n} fill={d.c} />)}</RBar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function ParkingPanel({ s }) {
  const free = s.parking.reduce((a, q) => a + q.free, 0)
  return (
    <Card className={box}>
      <Head icon={ParkingSquare} title="Stationnement intelligent" tag="capteurs de places libres" color={C.violet} />
      <div className="mb-5 rounded-xl bg-slate-50 p-5 text-center">
        <p className="text-xs text-slate-600">Panneau d’affichage conducteurs</p>
        <p className="display text-5xl font-bold text-slate-900"><Counter value={free} /></p>
        <p className="text-xs text-slate-600">places libres dans la ville</p>
      </div>
      <div className="space-y-4">
        {s.parking.map((q) => {
          const occ = ((q.cap - q.free) / q.cap) * 100
          const c = occ > 95 ? C.red : occ > 75 ? C.gold : C.violet
          return (
            <div key={q.id}>
              <div className="mb-1 flex justify-between text-sm"><span>{q.name}</span><span className="text-xs" style={{ color: c }}>{occ > 95 ? 'Complet' : `${q.free} / ${q.cap}`}</span></div>
              <Bar value={occ} color={c} h={8} />
            </div>
          )
        })}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-slate-600">Le conducteur voit les places libres avant d’entrer dans le quartier : moins de tours, moins de trafic.</p>
    </Card>
  )
}

export function WaterPanel({ s, act }) {
  const leaks = s.water.filter((w) => w.leak)
  return (
    <Card className={box}>
      <Head icon={Droplets} title="Réseau d’eau potable" tag="débitmètres et capteurs acoustiques" color={C.cyan} />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Mini label="Fuites actives" color={leaks.length ? C.red : C.mint}>{leaks.length}</Mini>
        <Mini label="Fuites détectées (total)" color={C.cyan}>{s.leaksDetected}</Mini>
      </div>
      <div className="mb-4 h-36">
        <ResponsiveContainer>
          <LineChart data={s.waterHist} margin={{ left: -20, right: 8 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="t" hide /><YAxis {...axis} />
            <RT {...tt} formatter={(v) => [`${v} m³/h`, 'Débit total']} labelFormatter={() => ''} />
            <Line dataKey="flow" stroke={leaks.length ? C.red : C.cyan} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Btn onClick={() => act.randomLeak()} color={C.red} icon={AlertTriangle} className="mb-4 w-full">Simuler une fuite</Btn>
      <div className="space-y-2">
        {s.water.map((w) => (
          <motion.div layout key={w.id} className="flex items-center gap-3 rounded-xl p-3 text-sm" style={{ background: w.leak ? `${C.red}1f` : '#e2e8f0', border: w.leak ? `1px solid ${C.red}66` : '1px solid transparent' }}>
            <span className={`h-2.5 w-2.5 rounded-full ${w.leak ? 'blink' : ''}`} style={{ background: w.leak ? C.red : C.cyan }} />
            <div className="flex-1"><p>{w.id} · {w.name}</p><p className="text-xs text-slate-500">{w.flow} m³/h · {w.db} dB</p></div>
            {w.leak && <button onClick={() => act.leak(w.id)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs hover:bg-slate-200"><Wrench size={12} />Réparer</button>}
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

export function GridPanel({ s }) {
  const g = s.grid
  const cov = g.load ? Math.min(100, (g.solar / g.load) * 100) : 0
  return (
    <Card className={box}>
      <Head icon={Zap} title="Réseau électrique intelligent" tag="bidirectionnel" color={C.gold} />
      <div className="mb-4 flex items-center gap-6">
        <Ring value={cov} color={C.gold}><p className="text-2xl font-bold"><Counter value={cov} suffix=" %" /></p><p className="text-xs text-slate-600">solaire</p></Ring>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Mini label="Production" color={C.gold}><Counter value={g.solar} suffix=" kW" /></Mini>
          <Mini label="Consommation"><Counter value={g.load} suffix=" kW" /></Mini>
        </div>
      </div>
      <div className="mb-4 h-44">
        <ResponsiveContainer>
          <AreaChart data={s.hist} margin={{ left: -20, right: 8 }}>
            <defs>
              <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.gold} stopOpacity=".6" /><stop offset="1" stopColor={C.gold} stopOpacity="0" /></linearGradient>
              <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.cyan} stopOpacity=".45" /><stop offset="1" stopColor={C.cyan} stopOpacity="0" /></linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="h" {...axis} interval={7} /><YAxis {...axis} />
            <RT {...tt} />
            <Area dataKey="solar" name="Solaire (kW)" stroke={C.gold} strokeWidth={2} fill="url(#gs)" isAnimationActive={false} />
            <Area dataKey="load" name="Charge (kW)" stroke={C.cyan} strokeWidth={2} fill="url(#gl)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Mini label={g.export > 0 ? 'Injection vers le réseau' : 'Appel au réseau'} color={g.export > 0 ? C.mint : C.red}><Counter value={g.export > 0 ? g.export : g.import} suffix=" kW" /></Mini>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-2 flex items-center gap-1 text-xs text-slate-600"><Battery size={13} />Stockage batterie</p>
          <Bar value={g.battery} color={g.battery < 25 ? C.red : C.mint} h={10} />
          <p className="mt-1 text-xs text-slate-600">{Math.round(g.battery)} %</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <Sun size={16} color={C.gold} />
        <span>Réseau classique : un seul sens. Smart Grid : compteurs communicants, panneaux décentralisés, équilibrage automatique production / consommation.</span>
      </div>
    </Card>
  )
}
