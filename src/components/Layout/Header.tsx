import React, { useSyncExternalStore } from 'react'
import SunIcon from '@heroicons/react/24/outline/esm/SunIcon.js'
import MoonIcon from '@heroicons/react/24/outline/esm/MoonIcon.js'
import Github from '../Icon/Github.tsx'
import { isDark, subscribe, toggleDark } from '../../theme.ts'

export type HeaderProps = {
  /** Short summary of the current state, e.g. "3 matches". */
  status: string
  error?: boolean
}

export default React.memo(function Header({ status, error }: HeaderProps) {
  // Follows OS changes too (theme.ts applies them until the user picks one).
  const dark = useSyncExternalStore(subscribe, isDark)

  return (
    <header className="shrink-0 border-b border-line">
      <div className="mx-auto flex max-w-app flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
        <h1 className="flex items-center gap-2">
          <span aria-hidden className="text-accent">
            ❯
          </span>
          <span className="font-bold">rust-regex</span>
          <span className="text-fg-dim">playground</span>
        </h1>
        <span
          role="status"
          className="ml-auto flex items-center gap-1.5 text-fg-dim"
        >
          <span aria-hidden className={error ? 'text-err' : 'text-accent'}>
            ●
          </span>
          {status}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleDark}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-fg-dim hover:bg-surface-2 hover:text-fg"
          >
            {dark ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )}
            {dark ? 'dark' : 'light'}
          </button>
          <a
            title="Source on GitHub"
            href="https://github.com/2fd/rust-regex-playground"
            target="_blank"
            className="rounded p-1 text-fg-dim hover:bg-surface-2 hover:text-fg"
          >
            <Github width="18" height="18" />
          </a>
        </div>
      </div>
    </header>
  )
})
