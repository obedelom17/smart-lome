import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Phone, Send, Smartphone, Users } from 'lucide-react'
import { STATUS } from '../sim'
import { Btn, C, Card, Head } from '../ui'

const TYPES = ['Déchets', 'Eau', 'Éclairage', 'Parking']
const PLACES = ['Bè', 'Tokoin', 'Agoè', 'Adidogomé']

function Ussd({ act }) {
  const [step, setStep] = useState('idle')
  const [type, setType] = useState(0)
  const [input, setInput] = useState('')
  const [screen, setScreen] = useState('Composez *888# pour démarrer')
  const send = () => {
    const v = input.trim(); setInput('')
    if (step === 'menu') {
      const i = Number(v)
      if (v === '0') { setStep('idle'); return setScreen('Session terminée') }
      if (i >= 1 && i <= 4) { setType(i - 1); setStep('place'); return setScreen(`Quartier :\n${PLACES.map((p, k) => `${k + 1}. ${p}`).join('\n')}`) }
      return setScreen('Choix invalide.\n\n' + MENU)
    }
    if (step === 'place') {
      const i = Number(v)
      if (i >= 1 && i <= 4) {
        const id = act.report({ type: TYPES[type], place: PLACES[i - 1], text: 'Signalement USSD', via: 'USSD' })
        setStep('idle'); return setScreen(`Merci. Référence ${id}.\nVous recevrez un SMS.`)
      }
      return setScreen('Choix invalide.')
    }
  }
  const dial = () => { setStep('menu'); setScreen(MENU) }
  return (
    <div className="space-y-3">
      <div className="min-h-[170px] whitespace-pre-line rounded-xl bg-[#c8e6c0] p-4 font-mono text-[13px] leading-snug text-[#10240f]">{screen}</div>
      {step === 'idle'
        ? <Btn onClick={dial} icon={Phone} className="w-full">Composer *888#</Btn>
        : <div className="flex gap-2"><input className="field" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Votre choix" inputMode="numeric" /><Btn onClick={send} icon={Send}>Envoyer</Btn></div>}
      <p className="text-xs text-white/45">Fonctionne sans internet ni smartphone : inclusion des populations peu connectées.</p>
    </div>
  )
}
const MENU = 'Smart Lomé\n1. Déchets débordants\n2. Fuite d’eau\n3. Lampadaire en panne\n4. Problème de parking\n0. Quitter'

export default function Citizen({ s, act }) {
  const [tab, setTab] = useState('app')
  const [f, setF] = useState({ type: 'Déchets', place: 'Bè', text: '' })
  const [ok, setOk] = useState(null)
  const submit = () => {
    const id = act.report({ ...f, text: f.text || 'Sans description', via: 'App mobile' })
    setOk(id); setF({ ...f, text: '' }); setTimeout(() => setOk(null), 2500)
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card className="p-5">
        <Head icon={Smartphone} title="Le citoyen, producteur de données" tag="Partie I.C · signalement mobile et USSD" color={C.violet} />
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
          {[['app', 'Application'], ['ussd', 'USSD']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-lg py-2 text-sm font-medium transition ${tab === k ? 'bg-white/15' : 'text-white/55'}`}>{l}</button>
          ))}
        </div>
        {tab === 'app' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => <button key={t} onClick={() => setF({ ...f, type: t })} className="chip transition" style={f.type === t ? { background: `${C.violet}33`, borderColor: C.violet } : {}}>{t}</button>)}
            </div>
            <select className="field" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })}>{PLACES.map((p) => <option key={p}>{p}</option>)}</select>
            <textarea className="field min-h-[90px]" placeholder="Décrivez le problème" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} />
            <Btn onClick={submit} icon={Send} color={C.violet} className="w-full">Envoyer le signalement</Btn>
            <AnimatePresence>{ok && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-mint"><CheckCircle2 size={16} />Signalement {ok} envoyé</motion.p>}</AnimatePresence>
          </div>
        ) : <Ussd act={act} />}
      </Card>
      <Card className="p-5">
        <Head icon={Users} title="Suivi des signalements" tag="Collectivité · entreprise · citoyen" color={C.mint} />
        {s.reports.length === 0 && <p className="text-sm text-white/50">Aucun signalement. Envoyez-en un depuis l’application ou le code USSD.</p>}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {s.reports.map((r) => (
              <motion.div layout key={r.id} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between text-sm"><span className="font-semibold">{r.id} · {r.type}</span><span className="chip">{r.via}</span></div>
                <p className="mb-3 text-xs text-white/50">{r.place} · {r.t} · {r.text}</p>
                <div className="flex items-center gap-2">
                  {STATUS.map((st, i) => (
                    <div key={st} className="flex flex-1 items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full transition-colors" style={{ background: i <= r.status ? C.mint : 'rgba(255,255,255,.15)' }} />
                      <span className={`text-xs ${i <= r.status ? 'text-white' : 'text-white/35'}`}>{st}</span>
                      {i < 2 && <span className="h-px flex-1" style={{ background: i < r.status ? C.mint : 'rgba(255,255,255,.12)' }} />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}
