'use client'

import { useEffect, useState } from 'react'
import { Icon, type IconName } from '@/shared/components/Icon'

type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'cartwise-theme'

const OPTIONS: Array<{ value: Theme; label: string; icon: IconName }> = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'system', label: 'Match system', icon: 'display' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
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
          <Icon name={option.icon} />
          <span className="visually-hidden">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
