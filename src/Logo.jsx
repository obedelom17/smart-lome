export default function Logo({ size = 40, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Drapeau du Togo">
      <defs><clipPath id="logo-clip"><rect width="64" height="64" rx="16" /></clipPath></defs>
      <g clipPath="url(#logo-clip)">
        <rect width="64" height="64" fill="#006a4e" />
        <rect y="12.8" width="64" height="12.8" fill="#ffce00" />
        <rect y="38.4" width="64" height="12.8" fill="#ffce00" />
        <rect width="38.4" height="38.4" fill="#d21034" />
        <polygon points="19.20,8.20 21.85,15.56 29.66,15.80 23.48,20.59 25.67,28.10 19.20,23.70 12.73,28.10 14.92,20.59 8.74,15.80 16.55,15.56" fill="#fff" />
      </g>
    </svg>
  )
}
