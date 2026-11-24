import { motion } from 'framer-motion'
import { BrainCircuit, Database, Radio, Wifi } from 'lucide-react'
import { sensorCount } from '../sim'
import { C, Counter, Glass, Head, fmt } from '../ui'

export default function Pipeline({ s }) {
  const n = sensorCount(s)
  const alerts = s.events.filter((e) => e.sev !== 'info')
  const valid = s.msgs ? (1 - s.rejected / s.msgs) * 100 : 100
  const stages = [
    { icon: Radio, label: 'Capteurs terrain', sub: 'Poubelles, lampadaires, parking, eau, compteurs', val: <Counter value={n} />, unit: 'objets connectés', color: C.mint },
    { icon: Wifi, label: 'Réseaux de transmission', sub: 'LoRaWAN · MQTT · 4G', val: <Counter value={n / 2} dec={1} />, unit: 'messages / seconde', color: C.cyan },
    { icon: Database, label: 'Stockage et analyse Big Data', sub: 'Filtrage, règles, agrégation', val: <Counter value={s.bytes / 1e6} dec={2} />, unit: 'Mo collectés', color: C.violet },
    { icon: BrainCircuit, label: 'Aide à la décision', sub: 'Alertes et actions municipales', val: <Counter value={alerts.length} />, unit: 'décisions récentes', color: C.gold }
  ]
  const v4 = [
    { k: 'Volume', v: <Counter value={s.msgs} />, u: 'messages reçus', d: 'Toute la ville produit des données en continu.', c: C.mint },
    { k: 'Vélocité', v: <Counter value={n / 2} dec={1} />, u: 'msg/s, latence ~45 ms', d: 'Les données doivent être traitées en temps réel.', c: C.cyan },
    { k: 'Variété', v: '5 types', u: '3 protocoles : MQTT, LoRaWAN, USSD', d: 'Capteurs, compteurs, signalements citoyens.', c: C.violet },
    { k: 'Véracité', v: <Counter value={valid} dec={1} suffix=" %" />, u: `${fmt(s.rejected)} valeurs rejetées`, d: 'Les mesures aberrantes sont filtrées.', c: C.gold }
  ]
  return (
    <div className="space-y-5">
      <Glass className="p-6">
        <Head icon={Radio} title="Chaîne Capteur → Donnée → Décision" tag="Partie I.B · fonctionnement de l’IoT et du Big Data" />
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-0">
          {stages.map((st, i) => (
            <div key={st.label} className="contents">
              <motion.div whileHover={{ y: -4 }} className="relative flex-1 rounded-2xl border bg-white/5 p-4" style={{ borderColor: `${st.color}55`, boxShadow: `0 0 40px -18px ${st.color}` }}>
                <st.icon size={22} color={st.color} />
                <p className="mt-3 text-sm font-semibold">{st.label}</p>
                <p className="mb-3 text-xs text-white/45">{st.sub}</p>
                <p className="text-3xl font-bold" style={{ color: st.color }}>{st.val}</p>
                <p className="text-xs text-white/50">{st.unit}</p>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="relative mx-0 hidden h-[2px] w-14 shrink-0 bg-white/15 md:block">
                  {[0, 0.8, 1.6].map((d) => <span key={d} className="packet" style={{ '--c': st.color, animationDelay: `${d}s` }} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Glass>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {v4.map((x) => (
          <Glass key={x.k} className="p-5">
            <p className="text-sm font-semibold" style={{ color: x.c }}>{x.k}</p>
            <p className="mt-2 text-3xl font-bold">{x.v}</p>
            <p className="text-xs text-white/55">{x.u}</p>
            <p className="mt-3 text-xs leading-relaxed text-white/40">{x.d}</p>
          </Glass>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Glass className="p-5">
          <Head icon={Database} title="Flux brut entrant" tag="Messages MQTT simulés" color={C.violet} />
          <div className="space-y-1.5 font-mono text-[12px]">
            {s.samples.map((m, i) => (
              <motion.div key={`${m.t}-${m.topic}-${i}-${s.tickN}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className={`overflow-hidden text-ellipsis whitespace-nowrap rounded-lg px-3 py-1.5 ${m.bad ? 'bg-red-500/15 text-red-300' : 'bg-black/30 text-mint/90'}`}>
                <span className="text-white/35">{m.t}</span> {m.topic} {m.p} {m.bad && '· REJETÉ'}
              </motion.div>
            ))}
          </div>
        </Glass>
        <Glass className="p-5">
          <Head icon={BrainCircuit} title="Décisions déclenchées" tag="Alertes issues de l’analyse" color={C.gold} />
          <div className="space-y-2">
            {alerts.length === 0 && <p className="text-sm text-white/50">Aucune alerte. Lancez une fuite d’eau depuis le module Eau.</p>}
            {alerts.slice(0, 7).map((e) => (
              <div key={e.id} className="flex gap-3 rounded-xl bg-white/5 p-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: e.sev === 'crit' ? C.red : C.gold }} />
                <div><p>{e.text}</p><p className="font-mono text-[11px] text-white/40">{e.t}</p></div>
              </div>
            ))}
          </div>
        </Glass>
      </div>
    </div>
  )
}
