import { useEffect, useRef, useState } from 'react'

export const rnd = (a, b) => Math.random() * (b - a) + a
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const pick = (a) => a[Math.floor(Math.random() * a.length)]
export const pad = (n) => String(n).padStart(2, '0')
const clock = () => new Date().toTimeString().slice(0, 8)
export const km = (a, b) =>
  Math.hypot((b.lng - a.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180), (b.lat - a.lat) * 110.57)
export const DEPOT = { lat: 6.156, lng: 1.225, name: 'Dépôt municipal' }
export const STATUS = ['Reçu', 'Assigné', 'Résolu']

const SPOTS = [
  ['Grand Marché', 6.1295, 1.215], ['Port autonome', 6.14, 1.28], ['Aéroport', 6.165, 1.25],
  ['Université de Lomé', 6.175, 1.213], ['Bè', 6.142, 1.24], ['Tokoin', 6.15, 1.205],
  ['Agoè', 6.225, 1.21], ['Adidogomé', 6.19, 1.185], ['Hédzranawoé', 6.155, 1.23], ['Kodjoviakopé', 6.135, 1.195]
]

export function route(list) {
  let cur = DEPOT, d = 0
  const left = [...list], path = [DEPOT]
  while (left.length) {
    left.sort((a, b) => km(cur, a) - km(cur, b))
    const n = left.shift()
    d += km(cur, n); path.push(n); cur = n
  }
  d += km(cur, DEPOT); path.push(DEPOT)
  return { path, d }
}

function log(s, kind, sev, text) {
  s.events = [{ id: s.seq++, t: clock(), kind, sev, text }, ...s.events].slice(0, 40)
}

function sensorCount(s) {
  return s.bins.length + s.lights.length + s.parking.length + s.water.length + 3
}

function sample(s) {
  const t = clock()
  const k = pick(['bin', 'light', 'park', 'water', 'grid'])
  let topic, p
  if (k === 'bin') { const b = pick(s.bins); topic = `lome/dechets/${b.id}`; p = { fill: Math.round(b.fill), bat: +rnd(3.5, 4.1).toFixed(2) } }
  else if (k === 'light') { const l = pick(s.lights); topic = `lome/eclairage/${l.id}`; p = { presence: l.presence, dim: l.level } }
  else if (k === 'park') { const q = pick(s.parking); topic = `lome/parking/${q.id}`; p = { libres: q.free, cap: q.cap } }
  else if (k === 'water') { const w = pick(s.water); topic = `lome/eau/${w.id}`; p = { debit: w.flow, acoustique_db: w.db } }
  else { topic = 'lome/reseau/compteur'; p = { solaire_kw: s.grid.solar, charge_kw: s.grid.load } }
  const bad = Math.random() < 0.1
  if (bad) p[Object.keys(p)[0]] = -999
  return { t, topic, p: JSON.stringify(p), bad }
}

function tick(s) {
  s.tickN++
  s.hour = (s.hour + 0.5) % 24
  const h = s.hour
  const night = h < 6 || h >= 18.5
  const g = s.grid
  const sun = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI))
  g.solar = Math.round(sun * (430 + rnd(-35, 35)))
  g.load = Math.round(210 + Math.exp(-((h - 19.5) ** 2) / 4) * 140 + Math.exp(-((h - 8) ** 2) / 6) * 60 + rnd(-12, 12))
  g.battery = clamp(g.battery + (g.solar - g.load) / 40, 8, 100)
  g.import = Math.max(0, g.load - g.solar - (g.battery > 15 ? 70 : 0))
  g.export = Math.max(0, g.solar - g.load)
  s.hist = [...s.hist.slice(-31), { h: `${pad(Math.floor(h))}h${h % 1 ? '30' : '00'}`, solar: g.solar, load: g.load, import: Math.round(g.import) }]

  for (const l of s.lights) {
    if (night) {
      if (Math.random() < 0.3) l.presence = !l.presence
      l.level = l.presence ? 100 : 30
    } else { l.presence = false; l.level = 0 }
  }
  if (night) {
    s.kwhTrad += s.lights.length * 0.15
    s.kwhSmart += s.lights.reduce((a, l) => a + l.level / 100, 0) * 0.15
  }

  for (const b of s.bins) {
    const prev = b.fill
    b.fill = Math.min(100, b.fill + b.rate * rnd(0.5, 1.5))
    if (prev < 85 && b.fill >= 85) log(s, 'dechets', 'warn', `${b.id} (${b.name}) plein à ${Math.round(b.fill)} %`)
  }

  for (const q of s.parking) {
    const prev = q.free
    q.free = clamp(q.free + Math.round(rnd(-3, 3)), 0, q.cap)
    if (prev / q.cap >= 0.05 && q.free / q.cap < 0.05) log(s, 'parking', 'warn', `Parking ${q.name} complet`)
  }

  for (const w of s.water) {
    if (!w.leak && Math.random() < 0.006) {
      w.leak = true; s.leaksDetected++
      log(s, 'eau', 'crit', `Fuite détectée sur ${w.id} (${w.name})`)
    }
    w.flow = Math.round(w.base * (w.leak ? rnd(1.7, 2.1) : rnd(0.92, 1.08)))
    w.db = Math.round(w.leak ? rnd(58, 74) : rnd(22, 34))
  }
  s.waterHist = [...s.waterHist.slice(-31), { t: s.tickN, flow: s.water.reduce((a, w) => a + w.flow, 0) }]

  for (const r of s.reports) {
    if (r.status < 2 && Math.random() < 0.22) {
      r.status++
      log(s, 'citoyen', 'info', `Signalement ${r.id} : ${STATUS[r.status].toLowerCase()}`)
    }
  }
  if (s.route && Date.now() > s.routeUntil) s.route = null

  const n = sensorCount(s)
  s.msgs += n
  s.bytes += n * 186
  s.rejected += Math.round(n * 0.02 * rnd(0.5, 1.5))
  s.samples = [...Array.from({ length: 4 }, () => sample(s)), ...s.samples].slice(0, 14)
}

function init() {
  const jit = (v, a = 0.006) => v + rnd(-a, a)
  const s = {
    hour: 4, seq: 1, tickN: 0, msgs: 0, bytes: 0, rejected: 0, leaksDetected: 0, kmSaved: 0, collections: 0,
    kwhTrad: 0, kwhSmart: 0, reportSeq: 1, route: null, routeUntil: 0, routeInfo: null,
    hist: [], waterHist: [], events: [], reports: [], samples: [],
    bins: Array.from({ length: 16 }, (_, i) => {
      const p = SPOTS[i % SPOTS.length]
      return { id: `BIN-${pad(i + 1)}`, name: p[0], lat: jit(p[1]), lng: jit(p[2]), fill: rnd(15, 60), rate: rnd(0.2, 0.9) }
    }),
    lights: Array.from({ length: 20 }, (_, i) => {
      const p = SPOTS[(i * 3) % SPOTS.length]
      return { id: `LUM-${pad(i + 1)}`, name: p[0], lat: jit(p[1]), lng: jit(p[2]), presence: false, level: 0 }
    }),
    parking: [
      ['Grand Marché', 6.131, 1.2175, 120], ['Port autonome', 6.1385, 1.279, 200], ['Aéroport', 6.166, 1.251, 260],
      ['Université', 6.174, 1.214, 150], ['Bd du 13 Janvier', 6.133, 1.226, 90], ['Place de l’Indépendance', 6.1275, 1.2235, 80]
    ].map(([name, lat, lng, cap], i) => ({ id: `PK-${pad(i + 1)}`, name, lat, lng, cap, free: Math.round(cap * rnd(0.15, 0.6)) })),
    water: Array.from({ length: 8 }, (_, i) => {
      const p = SPOTS[(i + 2) % SPOTS.length]
      return { id: `EAU-${pad(i + 1)}`, name: p[0], lat: jit(p[1], 0.004), lng: jit(p[2], 0.004), base: Math.round(rnd(40, 90)), flow: 0, db: 0, leak: false }
    }),
    grid: {
      solar: 0, load: 0, battery: 60, import: 0, export: 0,
      nodes: [
        { id: 'MR-1', name: 'Micro-réseau Université', lat: 6.178, lng: 1.222, share: 0.4 },
        { id: 'MR-2', name: 'Micro-réseau Port', lat: 6.1435, lng: 1.272, share: 0.35 },
        { id: 'MR-3', name: 'Micro-réseau Agoè', lat: 6.212, lng: 1.222, share: 0.25 }
      ]
    }
  }
  for (let i = 0; i < 30; i++) tick(s)
  s.events = []; s.msgs = 0; s.bytes = 0; s.rejected = 0; s.samples = []
  s.leaksDetected = s.water.filter((w) => w.leak).length
  log(s, 'système', 'info', 'Plateforme Smart Lomé démarrée')
  return s
}

export function useSim() {
  const ref = useRef(null)
  if (!ref.current) ref.current = init()
  const [snap, setSnap] = useState(() => ({ ...ref.current }))
  const [paused, setPaused] = useState(false)
  const push = () => setSnap({ ...ref.current })

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => { tick(ref.current); push() }, 2000)
    return () => clearInterval(id)
  }, [paused])

  const act = {
    collect() {
      const s = ref.current
      const full = s.bins.filter((b) => b.fill >= 70)
      if (!full.length) { log(s, 'dechets', 'info', 'Aucun conteneur à collecter (seuil 70 %)'); return push() }
      const smart = route(full), trad = route(s.bins)
      s.route = smart.path.map((p) => [p.lat, p.lng]); s.routeUntil = Date.now() + 14000
      s.routeInfo = { count: full.length, total: s.bins.length, smart: smart.d, trad: trad.d }
      s.kmSaved += trad.d - smart.d; s.collections++
      full.forEach((b) => (b.fill = rnd(2, 8)))
      log(s, 'dechets', 'info', `Tournée optimisée : ${full.length}/${s.bins.length} conteneurs, ${smart.d.toFixed(1)} km`)
      push()
    },
    leak(id) {
      const s = ref.current
      const w = s.water.find((x) => x.id === id)
      if (!w) return
      w.leak = !w.leak
      if (w.leak) { s.leaksDetected++; log(s, 'eau', 'crit', `Fuite détectée sur ${w.id} (${w.name})`) }
      else log(s, 'eau', 'info', `Fuite réparée sur ${w.id}`)
      push()
    },
    randomLeak() {
      const s = ref.current
      const ok = s.water.filter((w) => !w.leak)
      if (ok.length) this.leak(pick(ok).id)
    },
    report({ type, place, text, via }) {
      const s = ref.current
      const id = `SIG-${pad(s.reportSeq++)}`
      s.reports = [{ id, type, place, text, via, status: 0, t: clock() }, ...s.reports].slice(0, 8)
      log(s, 'citoyen', 'info', `Signalement ${id} reçu (${type}, ${place}) via ${via}`)
      push()
      return id
    }
  }
  return { s: snap, act, paused, setPaused }
}
export { sensorCount }
