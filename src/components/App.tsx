import React, { useCallback, useEffect, useState } from 'react'
import {
  useRRegex,
  VERSIONS,
  Match,
  Hir,
  isRRegexVersion,
  RRegexVersion,
} from '../rregex.js'
import Navbar from './Layout/Navbar.js'
import Loading from './Icon/Loading.js'
import Alert from './Layout/Alert.js'
import Input from './Layout/Input.js'
import ViewMatch from './Rust/ViewMatch.js'
import ViewReplace from './Rust/ViewReplace.js'
import ViewSyntax from './Rust/ViewSyntax.js'
import { getRustRegexDocs, getRustRegexSyntaxDocs } from '../utils.js'
import Rust from './Icon/Rust.js'
import Github from './Icon/Github.js'

const enum Method {
  Find = 'find',
  Replace = 'replace',
}

export function getOperation(value: string | null | undefined): Method {
  switch (value) {
    case Method.Replace:
      return Method.Replace
    case Method.Find:
    default:
      return Method.Find
  }
}

export function getVersion(
  version: string | null | undefined,
  defaultVersion: RRegexVersion = '1.7'
): RRegexVersion {
  return isRRegexVersion(version) ? version : defaultVersion
}

export function executeMethod(Regex: any, state: AppState) {
  if (!Regex) {
    return state
  }

  try {
    const rregex = new Regex(state.regex)
    switch (state.method) {
      case Method.Find:
        return {
          ...state,
          error: undefined,
          match: rregex.findAll(state.text),
          syntax: rregex.syntax(),
          result: undefined,
        }
      case Method.Replace:
        return {
          ...state,
          error: undefined,
          match: rregex.findAll(state.text),
          syntax: rregex.syntax(),
          result: rregex.replaceAll(state.text, state.replace),
        }
      default:
        return state
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

    switch (state.method) {
      case Method.Find:
        state.regex && query.set('regex', state.regex)
        state.text && query.set('text', state.text)
        break
      case Method.Replace:
        state.regex && query.set('regex', state.regex)
        state.replace && query.set('replace', state.replace)
        state.text && query.set('text', state.text)
        break
    }

    const url = new URL(location.href)
    url.search = query.toString()
    history.pushState(state, '', url)
  }
}

type AppMethodState = {
  method: Method
  result: string | undefined
  match: Match[] | undefined
  syntax: Hir | undefined
  error: string | undefined
}

type AppState = AppMethodState & {
  ready: boolean
  version: string
  regex: string
  replace: string
  text: string
}

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

  const handleChangeMethod = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const method = e.currentTarget.dataset.method
      if (method) {
        setState((current) => ({
          ...current,
          method: getOperation(method),
        }))
      }
    },
    [setState]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<{ name?: string; value?: string }>) => {
      const { name, value } = e.target
      if (name) {
        setState((current) => ({ ...current, [name]: value || '' }))
      }
    },
    [setState]
  )

  useEffect(
    () => setQueryString(state),
    [state.regex, state.replace, state.text, state.method, state.version]
  )
  useEffect(
    () => setState(executeMethod(rregex?.RRegex, state)),
    [state.method, state.regex, state.replace, state.text, setState, rregex]
  )
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

  return (
    <>
      <Navbar
        rustRegexVersion={rregex?.metadata.regex}
        rustRegexSyntaxVersion={rregex?.metadata['regex-syntax']}
      />
      <main className="flex">
        <section className="min-h-screen w-1/6 flex-auto border-r border-r-neutral-300 bg-slate-200 pt-28 dark:border-r-neutral-500 dark:bg-neutral-900">
          <div className="mx-5">
            <p className="mb-4 block border-b border-b-neutral-300 text-sm font-semibold uppercase text-neutral-600 dark:text-neutral-400">
              VERSION
            </p>
            <select
              className="block w-full rounded-md border-none bg-transparent px-1 py-1 font-mono text-sm text-neutral-900 dark:text-white"
              name="version"
              onChange={handleChange}
              value={state.version}
            >
              {Object.keys(VERSIONS).map((version) => {
                return (
                  <option key={version} value={version}>
                    v{version}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="mx-5 mt-10">
            <p className="mb-4 block border-b border-b-neutral-300 text-sm font-semibold uppercase text-neutral-600 dark:text-neutral-400">
              OPERATION
            </p>
            {[Method.Find, Method.Replace].map((method) => {
              return (
                <a
                  className={
                    'inline-block w-full cursor-pointer border-r-2 px-2 py-2 text-sm uppercase' +
                    (state.method === method
                      ? ' border-r-indigo-500 text-indigo-600 dark:border-r-white dark:text-white'
                      : ' border-r-transparent text-neutral-500 hover:border-r-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:hover:border-b-neutral-300 dark:hover:text-neutral-300')
                  }
                  data-method={method}
                  onClick={handleChangeMethod}
                >
                  {method}
                </a>
              )
            })}
          </div>
          <div className="mx-5 mt-10">
            <p className="mb-4 block border-b border-b-neutral-300 text-sm font-semibold uppercase text-neutral-600 dark:text-neutral-400">
              DOCUMENTATION
            </p>
            <a
              className="mb-2 flex w-full flex-wrap items-center justify-between rounded-md px-2 py-1 text-sm  font-normal uppercase leading-3 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-600"
              href={getRustRegexDocs(rregex?.metadata['regex'])}
              target="_blank"
            >
              <div>REGEX</div>
              <Rust width="1em" height="1em" className="block text-lg" />
            </a>
            <a
              className="mb-2 flex w-full flex-wrap items-center justify-between rounded-md px-2 py-1 text-sm  font-normal uppercase leading-3 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-600"
              href={getRustRegexSyntaxDocs(rregex?.metadata['regex-syntax'])}
              target="_blank"
            >
              <div>REGEX-SYNTAX</div>
              <Rust width="1em" height="1em" className="block text-lg" />
            </a>
            <a
              className="mb-2 flex w-full flex-wrap items-center justify-between rounded-md px-2 py-1 text-sm font-normal leading-3 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-600"
              href={'https://github.com/2fd/rregex'}
              target="_blank"
            >
              <div>
                RRegex<span className="opacity-50">.js</span>
              </div>
              <Github width="1em" height="1em" className="block text-lg" />
            </a>
          </div>
        </section>
        <section className="min-h-screen w-3/6 border-r border-r-neutral-300 bg-slate-100 pt-24 dark:border-r-neutral-500 dark:bg-neutral-800">
          <Input
            label="Regular expression"
            rows={1}
            error={!!state.error}
            name="regex"
            value={state.regex}
            onChange={handleChange}
          />
          {state.method === Method.Replace && (
            <Input
              label="Replace expression"
              rows={1}
              name="replace"
              value={state.replace}
              onChange={handleChange}
            />
          )}
          <Input
            label="Text"
            rows={5}
            name="text"
            value={state.text}
            matches={state.match}
            onChange={handleChange}
          />
          {!!rregex && !state.error && state.syntax && (
            <div className="mx-5">
              <ViewSyntax
                value={state.syntax}
                version={rregex.metadata['regex-syntax']}
              />
            </div>
          )}
          <div className="pb-20" />
        </section>
        <section className="min-h-screen w-2/6 flex-auto bg-white pt-24 dark:bg-neutral-700">
          {!rregex && (
            <div className="flex justify-center p-20">
              <Loading className="h-8 w-8 animate-spin text-indigo-600 dark:text-white" />
            </div>
          )}
          {!!rregex && state.error && (
            <div className="flex justify-center p-20">
              <Alert
                title={
                  state.error.slice(0, 1).toUpperCase() +
                  state.error.slice(1, state.error.indexOf('\n'))
                }
                message={state.error.slice(state.error.indexOf('\n') + 1)}
              />
            </div>
          )}
          {!!rregex && !state.error && state.method === Method.Replace && (
            <div className="pb-8">
              <ViewReplace value={state.replace} />
            </div>
          )}
          {!!rregex && !state.error && state.match && (
            <div className="pb-8">
              <ViewMatch
                matches={state.match}
                value={state.text}
                version={rregex.metadata.regex}
              />
            </div>
          )}
        </section>
      </main>
    </>
  )
}