let DARK: boolean | null = null
export function toggleDark() {
  document.body.parentElement?.classList.toggle('dark')
  const isDark = document.body.parentElement?.classList.contains('dark')
  DARK = !!isDark
  localStorage.setItem('dark', String(DARK))
  return DARK
}

function isDarkMemory() {
  return DARK
}

function isDarkSystem() {
  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
  if (darkThemeMq.matches) {
    return true
  } else {
    return false
  }
}

function isDarkStorage() {
  const isDark = localStorage.getItem('dark')
  switch (isDark) {
    case 'true':
      return true
    case 'false':
      return false
    default:
      return null
  }
}

export function isDark() {
  return isDarkMemory() ?? isDarkStorage() ?? isDarkSystem()
}

export function initialize() {
  if (isDark()) {
    document.body.parentElement?.classList.add('dark')
    localStorage.setItem('dark', 'true')
    DARK = true
  } else {
    document.body.parentElement?.classList.remove('dark')
    localStorage.setItem('dark', 'false')
    DARK = false
  }
}
