import React, { useCallback, useState } from 'react'
import Github from '../Icon/Github.js'
import Rust from '../Icon/Rust.js'
import { getRustRegexDocs, getRustRegexSyntaxDocs } from '../../utils.js'
import { isDark, toggleDark } from '../../theme.js'
import SunIcon from '@heroicons/react/24/solid/esm/SunIcon.js'
import MoonIcon from '@heroicons/react/24/solid/esm/MoonIcon.js'

export type NavbarProps = {
  rustRegexVersion?: string
  rustRegexSyntaxVersion?: string
}

export default React.memo(function Navbar(props: NavbarProps) {
  const [dark, set] = useState(() => isDark())
  const toggle = useCallback(() => {
    set(toggleDark())
  }, [dark])

  return (
    <header className="absolute left-0 top-0 mx-auto flex w-full justify-between border-b border-b-neutral-200 bg-white shadow-md dark:border-b-neutral-600 dark:bg-neutral-800">
      <div className="relative px-4 py-4">
        <h1 className="text-base font-medium text-neutral-900 dark:text-white">
          RUST REGEX PLAYGROUND
        </h1>
        <span className="absolute left-full top-0 mx-0 my-4 block rounded border-neutral-300 bg-neutral-100 px-1 py-0 font-mono text-xs text-neutral-900 dark:bg-neutral-700 dark:text-neutral-300">
          {props.rustRegexVersion || 'latest'}
        </span>
      </div>
      <div className="relative px-4 py-4">
        <a
          className="mx-1 rounded-md px-2 py-1 text-sm font-normal uppercase text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-600"
          href="https://github.com/2fd/rust-regex-playground"
          target="_blank"
        >
          <Github
            width="1.2em"
            height="1.2em"
            className="inline-block align-text-top"
          />
        </a>
        <a
          className="mx-1 cursor-pointer rounded-md px-2 py-1 text-sm font-normal uppercase text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-600"
          onClick={toggle}
        >
          {dark ? (
            <MoonIcon
              width="1.2em"
              height="1.2em"
              className="ml-1 inline-block align-text-top"
            />
          ) : (
            <SunIcon
              width="1.2em"
              height="1.2em"
              className="ml-1 inline-block align-text-top"
            />
          )}
        </a>
      </div>
    </header>
  )
})
