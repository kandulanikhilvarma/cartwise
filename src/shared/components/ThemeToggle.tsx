'use client'

import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'cartwise-theme'

const OPTIONS: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="10" cy="10" r="3.6" />
        <path
          strokeLinecap="round"
          d="M10 2.4v1.8M10 15.8v1.8M17.6 10h-1.8M4.2 10H2.4M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3M15.4 15.4l-1.3-1.3M5.9 5.9 4.6 4.6"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'Match system',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="2.6" y="3.6" width="14.8" height="10" rx="1.6" />
        <path strokeLinecap="round" d="M7 16.6h6" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path
          strokeLinejoin="round"
          d="M16.2 12.3A6.9 6.9 0 0 1 7.7 3.8a6.9 6.9 0 1 0 8.5 8.5Z"
        />
      </svg>
    ),
  },
]

function applyTheme(theme: Theme): void {
  if (theme === 'system') {
    delete document.documentElement.dataset.theme
  } else {
    document.documentElement.dataset.theme = theme
  }
}

/**
 * The token layer has always supported an explicit light or dark choice; this
 * is the control that sets it. "Match system" clears the override rather than
 * pinning whichever theme happens to be showing.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') setTheme(stored)
    } catch {
      // Private browsing or blocked storage: stay on system.
    }
  }, [])

  function choose(next: Theme): void {
    setTheme(next)
    applyTheme(next)
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice still applies for this page view.
    }
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          title={option.label}
          onClick={() => choose(option.value)}
        >
          {option.icon}
          <span className="visually-hidden">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
