import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Lock, RotateCcw, ShieldAlert, ShieldCheck, Skull, Cpu } from 'lucide-react'
import { Bar, Btn, C, Card, Head, Ring } from '../ui'

const LAW = ['Minimisation : ne collecter que le nécessaire', 'Anonymisation des données de présence', 'Consentement et information des citoyens', 'Durée de conservation limitée', 'Contrôle par l’autorité (IPDCP)']
const OPTS = [
  { k: 'Équipements autonomes à énergie solaire', cost: -10, inc: 10 },
  { k: 'Technologies libres et peu coûteuses', cost: -25, inc: 5 },
  { k: 'Capteurs basse consommation (LoRa)', cost: -15, inc: 0 },
  { k: 'Canaux accessibles : USSD et mobile', cost: 5, inc: 30 },
  { k: 'Intégration des pré-collecteurs informels', cost: 0, inc: 25 },
  { k: 'Interfaces en langues nationales', cost: 5, inc: 15 }
]

export default function Risks() {
  const [secure, setSecure] = useState(false)
  const [att, setAtt] = useState({ run: false, hit: [], blocked: 0 })
  const [law, setLaw] = useState([])
  const [opts, setOpts] = useState([])
  const attack = () => {
    if (att.run) return
    setAtt((a) => ({ ...a, run: true, hit: [] }))
    const targets = [...Array(24).keys()].sort(() => Math.random() - 0.5).slice(0, 9)
    targets.forEach((d, i) => setTimeout(() => setAtt((a) => (secure ? { ...a, blocked: a.blocked + 1 } : { ...a, hit: [...a.hit, d] })), 350 * (i + 1)))
    setTimeout(() => setAtt((a) => ({ ...a, run: false })), 350 * 10)
  }
  const tog = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const cost = 100 + opts.reduce((a, i) => a + OPTS[i].cost, 0)
  const inc = 20 + opts.reduce((a, i) => a + OPTS[i].inc, 0)
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <Head icon={ShieldAlert} title="Cybersécurité des objets connectés" tag="Partie III.B · surveillance et piratage" color={C.red}
          right={<button onClick={() => setAtt({ run: false, hit: [], blocked: 0 })} className="rounded-lg bg-white/10 p-2 hover:bg-white/20"><RotateCcw size={16} /></button>} />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid grid-cols-8 gap-2.5">
            {[...Array(24).keys()].map((d) => {
              const hit = att.hit.includes(d)
              return (
                <motion.div key={d} animate={{ scale: hit ? [1, 1.25, 1] : 1 }} className="grid aspect-square place-items-center rounded-xl" style={{ background: hit ? `${C.red}30` : `${C.mint}18`, border: `1px solid ${hit ? C.red : `${C.mint}55`}` }}>
                  {hit ? <Skull size={16} color={C.red} /> : <Cpu size={16} color={C.mint} />}
                </motion.div>
              )
            })}
          </div>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-4">
              <span className="flex items-center gap-2 text-sm"><Lock size={16} color={C.mint} />Chiffrement TLS et authentification</span>
              <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} className="h-5 w-5 accent-[#2ed18a]" />
            </label>
            <Btn onClick={attack} color={C.red} icon={ShieldAlert} className="w-full" disabled={att.run}>Simuler une attaque</Btn>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/5 p-3"><p className="text-3xl font-bold" style={{ color: C.red }}>{att.hit.length}</p><p className="text-xs text-white/50">objets compromis</p></div>
              <div className="rounded-xl bg-white/5 p-3"><p className="text-3xl font-bold" style={{ color: C.mint }}>{att.blocked}</p><p className="text-xs text-white/50">tentatives bloquées</p></div>
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <Head icon={ShieldCheck} title="Protection de la vie privée" tag="Loi n° 2019-014 · IPDCP" color={C.cyan} />
          <div className="flex items-center gap-5">
            <Ring value={(law.length / LAW.length) * 100} color={C.cyan}><p className="text-xl font-bold">{law.length}/{LAW.length}</p><p className="text-[10px] text-white/50">garanties</p></Ring>
            <div className="flex-1 space-y-2">
              {LAW.map((l, i) => (
                <label key={l} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 p-2.5 text-sm">
                  <input type="checkbox" checked={law.includes(i)} onChange={() => tog(law, setLaw, i)} className="h-4 w-4 accent-[#4cc3ff]" />{l}
                </label>
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <Head icon={Leaf} title="Smart City adaptée à Lomé" tag="Partie III.C · Low-Tech et frugale" color={C.mint} />
          <div className="mb-4 space-y-2">
            {OPTS.map((o, i) => (
              <label key={o.k} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 p-2.5 text-sm">
                <input type="checkbox" checked={opts.includes(i)} onChange={() => tog(opts, setOpts, i)} className="h-4 w-4 accent-[#2ed18a]" />{o.k}
              </label>
            ))}
          </div>
          <div className="space-y-3">
            <div><div className="mb-1 flex justify-between text-xs"><span className="text-white/60">Indice de coût (plus bas = mieux)</span><span className="font-mono">{cost}</span></div><Bar value={cost / 1.3} color={C.gold} h={10} /></div>
            <div><div className="mb-1 flex justify-between text-xs"><span className="text-white/60">Indice d’inclusion</span><span className="font-mono">{Math.min(100, inc)}</span></div><Bar value={inc} color={C.mint} h={10} /></div>
          </div>
          <p className="mt-3 text-[11px] text-white/40">Indices illustratifs pour la démonstration, pas des mesures.</p>
        </Card>
      </div>
    </div>
  )
}
