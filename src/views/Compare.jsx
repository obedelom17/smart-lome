import { useState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Lightbulb, ParkingSquare, Scale, Trash2 } from 'lucide-react'
import { Bar, C, Counter, Card, Head } from '../ui'

const DOMAINS = [
  { id: 'l', icon: Lightbulb, name: 'Éclairage public', color: C.gold, gain: 0.6, unit: 'lampadaires', min: 1000, max: 20000, step: 500, def: 5000, trad: (n) => n * 400, label: 'kWh par an', note: 'Gradation de 50 à 70 % (valeur médiane 60 %) · 100 W · 4 000 h/an' },
  { id: 'w', icon: Trash2, name: 'Collecte des déchets', color: C.mint, gain: 0.36, unit: 'conteneurs', min: 100, max: 2000, step: 50, def: 400, trad: (n) => n * 156, label: 'collectes par an', note: 'Hypothèse : 3 collectes par semaine contre collecte sur seuil de remplissage' },
  { id: 'e', icon: Droplets, name: 'Pertes d’eau', color: C.cyan, gain: 0.37, unit: 'Mm³ distribués', min: 1, max: 20, step: 1, def: 6, trad: (n) => n * 350000, label: 'm³ perdus par an', note: 'Hypothèse : 35 % de pertes réduites à 22 % par détection rapide' },
  { id: 'p', icon: ParkingSquare, name: 'Recherche de stationnement', color: C.violet, gain: 0.5, unit: 'conducteurs par jour', min: 500, max: 10000, step: 500, def: 3000, trad: (n) => n * 12 * 365 / 60, label: 'heures perdues par an', note: 'Hypothèse : 12 min de recherche réduites à 6 min' }
]

function DomainCard({ d }) {
  const [n, setN] = useState(d.def)
  const t = d.trad(n), sm = t * (1 - d.gain)
  return (
    <Card className="p-5">
      <Head icon={d.icon} title={d.name} tag={d.label} color={d.color} right={<span className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: `${d.color}26`, color: d.color }}>-{Math.round(d.gain * 100)} %</span>} />
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm"><span className="text-white/60">Gestion traditionnelle</span><span className="font-mono"><Counter value={t} /></span></div>
          <Bar value={100} color={C.grey} h={12} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm"><span style={{ color: d.color }}>Gestion intelligente</span><span className="font-mono"><Counter value={sm} /></span></div>
          <Bar value={(1 - d.gain) * 100} color={d.color} h={12} />
        </div>
        <motion.p key={Math.round(t - sm)} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-2xl font-bold" style={{ color: d.color }}>
          <Counter value={t - sm} /> <span className="text-sm font-normal text-white/50">économisés</span>
        </motion.p>
        <div>
          <p className="mb-1 text-xs text-white/50">{n.toLocaleString('fr-FR')} {d.unit}</p>
          <input type="range" min={d.min} max={d.max} step={d.step} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </div>
        <p className="text-[11px] leading-relaxed text-white/40">{d.note}</p>
      </div>
    </Card>
  )
}

export default function Compare() {
  return (
    <div className="space-y-5">
      <Card className="p-6 text-center">
        <Head icon={Scale} title="Gestion traditionnelle contre gestion intelligente" tag="Conclusion · synthèse chiffrée" />
        <p className="mx-auto max-w-3xl text-lg font-medium leading-snug md:text-2xl">« Dans quelle mesure les objets connectés peuvent-ils améliorer la qualité de vie urbaine et la gestion des ressources ? »</p>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">{DOMAINS.map((d) => <DomainCard key={d.id} d={d} />)}</div>
      <p className="text-center text-xs text-white/40">Seule la fourchette de 50 à 70 % pour l’éclairage vient du plan de l’exposé. Les autres taux sont des hypothèses pédagogiques à sourcer avant la soutenance.</p>
    </div>
  )
}
