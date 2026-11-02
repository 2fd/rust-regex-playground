import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import {
  useRRegex,
  Match,
  Hir,
  isRRegexVersion,
  RRegexVersion,
  DEFAULT_VERSION,
  Captures,
  RRegex,
} from '../rregex.ts'
import {
  getRRegexDocs,
  getRustRegexDocs,
  getRustRegexSyntaxDocs,
} from '../utils.ts'
import CodeField from './Form/CodeField.tsx'
import Setup, { type Method } from './Form/Setup.tsx'
import Block from './Layout/Block.tsx'
import Header from './Layout/Header.tsx'
import Output, {
  ErrorNotice,
  getStatus,
  getStatusText,
} from './Rust/Results.tsx'

export function getOperation(value: string | null | undefined): Method {
  return value === 'replace' ? 'replace' : 'find'
}

export function getVersion(
  version: string | null | undefined,
  defaultVersion: RRegexVersion = DEFAULT_VERSION
): RRegexVersion {
  return isRRegexVersion(version) ? version : defaultVersion
}

export function executeMethod(Regex: any, state: AppState): AppState {
  if (!Regex) {
    return state
  }

  try {
    const rregex = new Regex(state.regex) as RRegex
    let shortcuts = (rregex.captureNames as any)
      ? rregex
          .captureNames()
          .flatMap((name, i) => (name ? ['$' + name, '$' + i] : ['$' + i]))
      : undefined

    return {
      ...state,
      error: undefined,
      syntax: rregex.syntax(),
      matches: rregex.findAll(state.text),
      captures: rregex.capturesAll && rregex.capturesAll(state.text),
      shortcuts,
      result:
        state.method === 'replace'
          ? rregex.replaceAll(state.text, state.replace)
          : undefined,
    }
  } catch (err) {
    console.error('executeMethod', err)
    return { ...state, error: (err as Error).message, result: undefined }
  }
}

export function setQueryString(state: AppState) {
  if (window.history) {
    const query = new URLSearchParams()
    query.set('version', state.version)
    query.set('method', state.method)
    state.regex && query.set('regex', state.regex)
    state.method === 'replace' &&
      state.replace &&
      query.set('replace', state.replace)
    state.text && query.set('text', state.text)

    const url = new URL(location.href)
    url.search = query.toString()
    history.pushState(state, '', url)
  }
}

type AppMethodState = {
  method: Method
  result: string | undefined
  matches: Match[] | undefined
  captures: Captures[] | undefined
  syntax: Hir | undefined
  shortcuts: string[] | undefined
  error: string | undefined
}

export type AppState = AppMethodState & {
  ready: boolean
  version: string
  regex: string
  replace: string
  text: string
}

type Field = 'regex' | 'replace' | 'text' | 'version'

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const query = new URLSearchParams(location.search.slice(1))
    const regex = query.get('regex') || ''
    const replace = query.get('replace') || ''
    const text = query.get('text') || ''
    const method = getOperation(query.get('method'))
    const version = getVersion(query.get('version'))

    return {
      ready: false,
      method,
      version,
      regex,
      replace,
      text,
    } as AppState
  })

  const rregex = useRRegex(state.version)

  // Results are computed in the same update as the input change, so each
  // keystroke renders once with consistent input and results. On a parse error
  // `executeMethod` keeps the last valid results (e.g. text highlights).
  const setField = useCallback(
    (name: Field, value: string) => {
      setState((current) => {
        const next = { ...current, [name]: value }
        // A version change loads another wasm module; results are
        // recomputed by the effect below once it is ready.
        return name === 'version' ? next : executeMethod(rregex?.RRegex, next)
      })
    },
    [rregex]
  )

  const setMethod = useCallback(
    (method: Method) => {
      setState((current) =>
        executeMethod(rregex?.RRegex, { ...current, method })
      )
    },
    [rregex]
  )

  const setRegex = useCallback((v: string) => setField('regex', v), [setField])
  const setReplace = useCallback(
    (v: string) => setField('replace', v),
    [setField]
  )
  const setText = useCallback((v: string) => setField('text', v), [setField])
  const setVersion = useCallback(
    (v: string) => setField('version', v),
    [setField]
  )

  useEffect(
    () => setQueryString(state),
    [state.regex, state.replace, state.text, state.method, state.version]
  )
  // The syntax tree can be thousands of lines (e.g. `\w`). Render it at low
  // priority so typing, matches and captures update first; React interrupts
  // a stale tree render if another keystroke arrives.
  const syntax = useDeferredValue(state.syntax)
  const isSyntaxStale = syntax !== state.syntax

  // Recompute once the wasm module for the selected version has loaded
  // (initial load and version changes). While it is null this is a no-op.
  useEffect(
    () => setState((current) => executeMethod(rregex?.RRegex, current)),
    [rregex]
  )

  // Alt+1 / Alt+2 switch between find and replace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || (e.code !== 'Digit1' && e.code !== 'Digit2')) return
      e.preventDefault()
      setMethod(e.code === 'Digit1' ? 'find' : 'replace')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setMethod])

  useEffect(() => {
    console.log(
      `%c
       _____           _      _____                         _____  _                                             _
      |  __ \\         | |    |  __ \\                       |  __ \\| |                                           | |
      | |__) |   _ ___| |_   | |__) |___  __ _  _____  __  | |__) | | __ _ _   _  __ _ _ __ ___  _   _ _ __   __| |
      |  _  / | | / __| __|  |  _  // _ \\/ _\` |/ _ \\ \\/ /  |  ___/| |/ _\` | | | |/ _\` | '__/ _ \\| | | | '_ \\ / _\` |
      | | \\ \\ |_| \\__ \\ |_   | | \\ \\  __/ (_| |  __/>  <   | |    | | (_| | |_| | (_| | | | (_) | |_| | | | | (_| |
      |_|  \\_\\__,_|___/\\__|  |_|  \\_\\___|\\__, |\\___/_/\\_\\  |_|    |_|\\__,_|\\__, |\\__, |_|  \\___/ \\__,_|_| |_|\\__,_|
                                          __/ |                             __/ | __/ |
                                          |___/                             |___/ |___/

      `,
      'font-family:monospace;color:#666;'
    )
  }, [])

  const regexVersion = rregex?.metadata['regex']
  const regexSyntaxVersion = rregex?.metadata['regex-syntax']
  const status = getStatus({
    ready: !!rregex,
    error: state.error,
    regex: state.regex,
  })
  const ok = status === 'ok'
  const docs = [
    {
      label: 'rregex',
      version: state.version,
      href: getRRegexDocs(state.version),
    },
    {
      label: 'regex',
      version: regexVersion,
      href: getRustRegexDocs(regexVersion),
    },
    {
      label: 'regex-syntax',
      version: regexSyntaxVersion,
      href: getRustRegexSyntaxDocs(regexSyntaxVersion),
    },
  ]

  return (
    <div className="flex h-screen flex-col bg-bg text-[13px] text-fg">
      <Header
        status={getStatusText(status, state.version, state.matches?.length)}
        error={status === 'error'}
      />

      {/* Centered up to `max-w-app`; golden ratio split inside:
          input ≈ 61.8%, output ≈ 38.2%. */}
      <main className="mx-auto grid min-h-0 w-full max-w-app flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:overflow-hidden">
        <section
          aria-label="Input"
          className="flex flex-col gap-3 border-line p-5 lg:min-h-0 lg:overflow-y-auto lg:border-r"
        >
          <ColumnTitle>Input</ColumnTitle>
          <Setup
            method={state.method}
            onMethodChange={setMethod}
            version={state.version}
            onVersionChange={setVersion}
            regexVersion={regexVersion}
            regexSyntaxVersion={regexSyntaxVersion}
          />
          <Block
            title="Regular expression"
            meta="Rust regex syntax"
            tone={state.error ? 'error' : 'input'}
          >
            <CodeField
              label="Regular expression"
              value={state.regex}
              onValueChange={setRegex}
              placeholder="(?<year>\d{4})-(?<month>\d{2})"
              autoFocus
              prompt
            />
            {state.error && (
              <div className="px-4 pb-3">
                <ErrorNotice error={state.error} />
              </div>
            )}
          </Block>
          {state.method === 'replace' && (
            <Block title="Replace with" meta="$1 / $name" tone="input">
              <CodeField
                label="Replace with"
                value={state.replace}
                onValueChange={setReplace}
                placeholder="$month/$year"
                shortcuts={state.shortcuts}
                prompt
              />
            </Block>
          )}
          <Block
            title="Test string"
            meta="matches are highlighted as you type"
            tone="input"
          >
            <CodeField
              label="Test string"
              value={state.text}
              onValueChange={setText}
              placeholder="paste the text to search"
              rows={8}
              matches={ok ? state.matches : undefined}
            />
          </Block>
          <footer className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[12px] text-fg-dim">
            <span>
              <Key>Alt</Key>+<Key>1</Key> find
            </span>
            <span>
              <Key>Alt</Key>+<Key>2</Key> replace
            </span>
            <span className="ml-auto flex gap-3">
              {docs.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  target="_blank"
                  className="hover:text-accent hover:underline"
                >
                  {d.label}@{d.version ?? '…'}
                </a>
              ))}
            </span>
          </footer>
        </section>

        <section
          aria-label="Output"
          className="flex flex-col gap-3 p-5 lg:min-h-0 lg:overflow-y-auto"
        >
          <ColumnTitle>Output</ColumnTitle>
          <Output
            status={status}
            version={state.version}
            method={state.method}
            result={state.result}
            matches={state.matches}
            captures={state.captures}
            shortcuts={state.shortcuts}
            syntax={syntax}
            isSyntaxStale={isSyntaxStale}
            regexVersion={regexVersion}
            regexSyntaxVersion={regexSyntaxVersion}
          />
        </section>
      </main>
    </div>
  )
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] tracking-widest text-fg-dim uppercase">
      {children}
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface-2 px-1 text-[11px] text-fg">
      {children}
    </kbd>
  )
}
