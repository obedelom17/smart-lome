import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { C, Glass, Head } from '../ui'

const CITIES = [
  { n: 'Singapour', color: C.cyan, init: 'Programme Smart Nation', tech: 'Jumeau numérique 3D (Virtual Singapore), capteurs et données urbaines intégrés', lesson: 'Une vision d’État pilotée de bout en bout. Les modèles numériques servent à simuler avant de décider.' },
  { n: 'Barcelone', color: C.gold, init: 'Plateforme ouverte Sentilo', tech: 'Arrosage intelligent des parcs, bacs connectés, plateforme de capteurs ouverte', lesson: 'Une plateforme ouverte évite la dépendance à un fournisseur et génère des économies budgétaires.' },
  { n: 'Kigali', color: C.mint, init: 'Smart Kigali', tech: 'Wi-Fi public, transport connecté Tap&Go, gouvernance numérique agile', lesson: 'Une ville africaine montre qu’on peut avancer par étapes, en partant des services que le citoyen utilise.' },
  { n: 'Diamniadio', color: C.violet, init: 'Ville nouvelle près de Dakar', tech: 'Fibre optique dès l’origine, gestion énergétique centralisée', lesson: 'Intégrer le numérique dès la conception coûte moins cher que d’équiper une ville existante.' }
]

export default function Cities() {
  const [i, setI] = useState(0)
  const c = CITIES[i]
  return (
    <div className="space-y-5">
      <Glass className="p-6">
        <Head icon={Building2} title="Quatre villes de référence" tag="Partie II.D · études de cas comparatives" color={c.color} />
        <div className="mb-5 flex flex-wrap gap-2">
          {CITIES.map((x, k) => (
            <button key={x.n} onClick={() => setI(k)} className="relative rounded-xl px-5 py-2.5 text-sm font-semibold">
              {k === i && <motion.span layoutId="city-pill" className="absolute inset-0 rounded-xl" style={{ background: `${x.color}33`, border: `1px solid ${x.color}` }} />}
              <span className="relative">{x.n}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={c.n} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-3">
            {[['Initiative phare', c.init], ['Technologies', c.tech], ['Leçon transférable à Lomé', c.lesson]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border bg-white/5 p-5" style={{ borderColor: `${c.color}44` }}>
                <p className="mb-2 text-sm font-semibold" style={{ color: c.color }}>{k}</p>
                <p className="text-sm leading-relaxed text-white/80">{v}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Glass>
      <Glass className="overflow-x-auto p-5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-white/50"><tr><th className="pb-3 font-medium">Ville</th><th className="pb-3 font-medium">Initiative</th><th className="pb-3 font-medium">Technologies</th></tr></thead>
          <tbody>
            {CITIES.map((x, k) => (
              <tr key={x.n} onClick={() => setI(k)} className="cursor-pointer border-t border-white/10 transition hover:bg-white/5">
                <td className="py-3 pr-4 font-semibold" style={{ color: x.color }}>{x.n}</td><td className="py-3 pr-4">{x.init}</td><td className="py-3 text-white/70">{x.tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Glass>
    </div>
  )
}
