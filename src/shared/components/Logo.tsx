type LogoProps = {
  withWordmark?: boolean
}

// Minimal Cartwise mark: a grocery basket with a single leaf — cart + fresh.
export function Logo({ withWordmark = true }: LogoProps) {
  return (
    <span className="logo">
      <svg
        className="logo-mark"
        viewBox="0 0 28 28"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 10h18l-1.6 11.4a2.2 2.2 0 0 1-2.2 1.9H8.8a2.2 2.2 0 0 1-2.2-1.9L5 10Z" />
        <path d="M10.2 14.4v4.4M14 14.4v4.4M17.8 14.4v4.4" />
        <path d="M14 10c0-3.3 2.3-5.3 5.3-5.3 0 3.3-2.3 5.3-5.3 5.3Z" />
        <path d="M14 10V6.3" />
      </svg>
      {withWordmark ? <span className="logo-word">Cartwise</span> : null}
    </span>
  )
}
