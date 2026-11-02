// Light / dark theme.
//
// On the first visit the theme follows the OS preference (and keeps following
// it if it changes). Once the user picks a theme with the toggle, that choice
// is stored and wins over the OS from then on.
//
// index.html runs the same resolution inline before first paint to avoid a
// flash of the wrong theme; keep both in sync.

const STORAGE_KEY = 'theme'
const LEGACY_KEY = 'dark' // auto-written by the previous design on every visit
const CHANGE_EVENT = 'themechange'

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function storedTheme(): boolean | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'dark' ? true : value === 'light' ? false : null
  } catch {
    return null
  }
}

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function isDark() {
  return document.documentElement.classList.contains('dark')
}

/** Subscribe to theme changes (for `useSyncExternalStore`). */
export function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

/** Flip the theme and remember it as the user's explicit choice. */
export function toggleDark() {
  const dark = !isDark()
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {
    // Storage unavailable (private mode): still switch for this session.
  }
  apply(dark)
  return dark
}

export function initialize() {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // ignore
  }
  apply(storedTheme() ?? media().matches)
  media().addEventListener('change', (e) => {
    if (storedTheme() === null) apply(e.matches)
  })
}
