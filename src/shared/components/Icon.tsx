/**
 * The project's icons in one place, drawn to the geometry the logo and the
 * theme toggle already used: a 20-unit box, currentColor, 1.7 stroke, round
 * caps and joins. Before this, half the icons were inline SVG copied between
 * components and the other half were literal "→" and "✕" characters sitting in
 * the markup, which a screen reader reads aloud as "rightwards arrow".
 *
 * Every icon here is decorative. The label belongs to whatever contains it —
 * the button's text, or a visually-hidden span — so each one is aria-hidden and
 * has no title of its own.
 */

export type IconName = keyof typeof PATHS

const PATHS = {
  'arrow-left': <path d="M16 10H4.6m0 0L9.4 5.2M4.6 10l4.8 4.8" />,
  'arrow-right': <path d="M4 10h11.4m0 0-4.8-4.8M15.4 10l-4.8 4.8" />,
  close: <path d="M5.2 5.2 14.8 14.8M14.8 5.2 5.2 14.8" />,
  sun: (
    <>
      <circle cx="10" cy="10" r="3.6" />
      <path d="M10 2.4v1.8M10 15.8v1.8M17.6 10h-1.8M4.2 10H2.4M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3M15.4 15.4l-1.3-1.3M5.9 5.9 4.6 4.6" />
    </>
  ),
  moon: <path d="M16.2 12.3A6.9 6.9 0 0 1 7.7 3.8a6.9 6.9 0 1 0 8.5 8.5Z" />,
  display: (
    <>
      <rect x="2.6" y="3.6" width="14.8" height="10" rx="1.6" />
      <path d="M7 16.6h6" />
    </>
  ),
} as const

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
