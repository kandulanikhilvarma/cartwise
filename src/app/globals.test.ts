import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Every class name written into JSX has to exist in the stylesheet.
 *
 * This is not style policing. Deleting a rule during a refactor leaves the
 * markup that used it rendering unstyled and silent — no error, no warning,
 * just a screen that quietly looks wrong. That shipped twice: the barcode
 * result kept .nutrition-card and .tone-* after the token pass removed them.
 */

const CSS_PATH = join('src', 'app', 'globals.css')

function definedClasses(): Set<string> {
  const css = readFileSync(CSS_PATH, 'utf8')
  return new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((match) => match[1]))
}

function tsxFiles(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...tsxFiles(full))
    else if (entry.name.endsWith('.tsx')) found.push(full)
  }
  return found
}

describe('globals.css', () => {
  it('defines every class the JSX asks for', () => {
    const defined = definedClasses()
    const orphans: string[] = []

    for (const file of tsxFiles('src')) {
      const source = readFileSync(file, 'utf8')
      // Static className="..." only. Template literals build names at runtime
      // (`signal-tag is-${kind}`) and cannot be checked this way.
      for (const attr of source.matchAll(/className="([^"{}]+)"/g)) {
        for (const name of attr[1].split(/\s+/).filter(Boolean)) {
          if (!defined.has(name)) orphans.push(`.${name} in ${relative('.', file)}`)
        }
      }
    }

    expect(orphans).toEqual([])
  })
})
