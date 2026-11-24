import { MapContainer, TileLayer, Marker, Tooltip, Polyline, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { C, binColor } from './ui'
import { DEPOT } from './sim'

const cache = {}
const icon = (c, s, pulse) => {
  const k = `${c}|${s}|${pulse}`
  return (cache[k] ||= L.divIcon({ className: '', html: `<span class="mk ${pulse ? 'mk-pulse' : ''}" style="--c:${c};--s:${s}px"></span>`, iconSize: [s, s], iconAnchor: [s / 2, s / 2] }))
}

function points(s, mod) {
  const all = mod === 'overview', sz = all ? 11 : 18, out = []
  const add = (k, o, c, pulse, tip, size = sz) => out.push({ k, lat: o.lat, lng: o.lng, c, pulse, tip, sz: size })
  if (all || mod === 'bins') s.bins.forEach((b) => add(b.id, b, binColor(b.fill), b.fill >= 85, `${b.id} · ${b.name} · ${Math.round(b.fill)} %`))
  if (all || mod === 'lights') s.lights.forEach((l) => add(l.id, l, l.level === 100 ? C.gold : l.level ? '#a3894a' : C.grey, false, `${l.id} · éclairage ${l.level} %`, all ? 9 : 15))
  if (all || mod === 'parking') s.parking.forEach((q) => add(q.id, q, q.free / q.cap < 0.05 ? C.red : C.violet, q.free / q.cap < 0.05, `${q.name} · ${q.free}/${q.cap} places libres`, all ? 13 : 20))
  if (all || mod === 'water') s.water.forEach((w) => add(w.id, w, w.leak ? C.red : C.cyan, w.leak, `${w.id} · ${w.name} · ${w.flow} m³/h${w.leak ? ' · FUITE' : ''}`))
  if (all || mod === 'grid') s.grid.nodes.forEach((n) => add(n.id, n, C.gold, s.grid.solar > 0, `${n.name} · ${Math.round(s.grid.solar * n.share)} kW solaire`, all ? 14 : 22))
  return out
}

const LEGENDS = {
  overview: [['Déchets', C.mint], ['Éclairage', C.gold], ['Parking', C.violet], ['Eau', C.cyan]],
  bins: [['Normal', C.mint], ['Bientôt plein', C.gold], ['Plein', C.red]],
  lights: [['Plein régime', C.gold], ['Gradation 30 %', '#a3894a'], ['Éteint (jour)', C.grey]],
  parking: [['Places libres', C.violet], ['Complet', C.red]],
  water: [['Débit normal', C.cyan], ['Fuite', C.red]],
  grid: [['Micro-réseau solaire', C.gold]]
}

export default function CityMap({ s, mod }) {
  const pts = points(s, mod)
  return (
    <div className="relative h-full w-full">
      <MapContainer center={[6.165, 1.235]} zoom={12} zoomControl={false} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <ZoomControl position="bottomright" />
        {s.route && (
          <>
            <Polyline positions={s.route} pathOptions={{ color: C.mint, weight: 4, className: 'flow' }} />
            <Marker position={[DEPOT.lat, DEPOT.lng]} icon={icon(C.gold, 20, true)}><Tooltip direction="top">{DEPOT.name}</Tooltip></Marker>
          </>
        )}
        {pts.map((p) => (
          <Marker key={`${mod}-${p.k}`} position={[p.lat, p.lng]} icon={icon(p.c, p.sz, p.pulse)}>
            <Tooltip direction="top" offset={[0, -6]}>{p.tip}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2">
        {(LEGENDS[mod] || []).map(([l, c]) => (
          <span key={l} className="chip bg-[#06120d]/80 backdrop-blur"><i className="h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />{l}</span>
        ))}
      </div>
    </div>
  )
}
