import React, { useCallback, useEffect, useState } from 'react'
import { Pane, TabNavigation, Tab, PaneProps, Select, Spinner, Alert } from 'evergreen-ui'
import Navbar from './Navbar'
import list, { useRRegex, RRegex, Match, Hir } from '../../rregex'
import TextInput from '../form/TextInput'
import ViewReplace from '../rust/ViewReplace'
import ViewMatch from '../rust/ViewMatch'
import ViewSyntax from '../rust/ViewSyntax'

const enum Method {
  Syntax = 'syntax',
  Find = 'find',
  Replace = 'replace',
}

export function getOperation(value: string | null | undefined): Method {
  switch (value) {
    case Method.Syntax:
      return Method.Syntax;
    case Method.Replace:
      return Method.Replace;
    case Method.Find:
    default:
      return Method.Find
  }
}

export function getVersion(version: string | null | undefined, defaultVersion: string = list[0].metadata.regex): string {
  if (!version) {
    return defaultVersion
  }

  const mod = list.find(mod => mod.metadata.regex.indexOf(version) === 0)
  if (mod) {
    return mod.metadata.regex
  }

  return defaultVersion
}

export function executeMethod(rregex: RRegex | null, state: AppState) {
  if (!rregex) {
    return state
  }

  try {
    const re = new rregex.RRegex(state.regex)
    switch (state.method) {
      case Method.Syntax:
        return {
          ...state,
          error: undefined,
          result: re.syntax(),
        }
      case Method.Find:
        return {
          ...state,
          error: undefined,
          result: re.findAll(state.text),
        }
      case Method.Replace:
        return {
          ...state,
          error: undefined,
          result: re.replaceAll(state.text, state.replace),
        }
      default:
        return state
    }
  } catch (err) {
    return { ...state, error: (err as Error).message, result: undefined }
  }
}

export function setQueryString(state: AppState) {
  if (window.history) {
    const query = new URLSearchParams()
    query.set('version', state.version)
    query.set('method', state.method)

    switch (state.method) {
      case Method.Syntax:
        query.set('regex', state.regex)
        break;
      case Method.Find:
        query.set('regex', state.regex)
        query.set('text', state.text)
        break;
      case Method.Replace:
        query.set('regex', state.regex)
        query.set('replace', state.replace)
        query.set('text', state.text)
        break;
    }

    const url = new URL(location.href)
    url.search = query.toString()
    history.pushState(state, '', url)
  }
}

type AppFindState = {
  method: Method.Find,
  result: Match[] | undefined,
  error: string | undefined,
}

type AppReplaceState = {
  method: Method.Replace,
  result: string | undefined,
  error: string | undefined,
}

type AppSyntaxState = {
  method: Method.Syntax,
  result: Hir | undefined,
  error: string | undefined,
}

type AppMethodState = AppFindState | AppReplaceState | AppSyntaxState

type AppState = AppMethodState & {
  ready: boolean,
  version: string,
  regex: string,
  replace: string,
  text: string,
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
      result: undefined,
      error: undefined,
    }
  })

  const rregex = useRRegex(state.version)
  const selectVersion = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setState({ ...state, version: e.target.value, ready: false }), [state, setState])
  const setFind = useCallback(() => setState({ ...state, method: Method.Find, result: undefined, }), [state, setState])
  const setSyntax = useCallback(() => setState({ ...state, method: Method.Syntax, result: undefined }), [state, setState])
  const setReplace = useCallback(() => setState({ ...state, method: Method.Replace, result: undefined }), [state, setState])
  const handleChangeRegex = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setState({ ...state, regex: e.target.value }), [state, setState])
  const handleChangeReplace = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setState({ ...state, replace: e.target.value }), [state, setState])
  const handleChangeText = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setState({ ...state, text: e.target.value }), [state, setState])

  useEffect(() => setQueryString(state), [state.regex, state.replace, state.text, state.method, state.version])
  useEffect(() => setState(executeMethod(rregex, state)), [state.method, state.regex, state.replace, state.text, setState, rregex])

  return (
    <Pane clearfix display="flex">
      <Navbar rustRegexVersion={rregex?.metadata.regex} rustRegexSyntaxVersion={rregex?.metadata['regex-syntax']} />
      <SectionPane background="tint2">
        <Pane clearfix display="flex" width="100%">
          <Pane>
            <TabNavigation>
              <Tab isSelected={state.method === Method.Find} onSelect={setFind}>FIND</Tab>
              <Tab isSelected={state.method === Method.Replace} onSelect={setReplace}>REPLACE</Tab>
              <Tab isSelected={state.method === Method.Syntax} onSelect={setSyntax}>SYNTAX</Tab>
            </TabNavigation>
          </Pane>
          <Pane flex="1" />
          <Pane>
            <Select value={state.version} onChange={selectVersion} width='12rem'>
              {list.map(mod => {
                return <option key={mod.metadata.regex} value={mod.metadata.regex}>v{mod.metadata.regex}</option>
              })}
            </Select>
          </Pane>
        </Pane>
        <Pane marginTop="2rem" marginBottom="1rem">
          <TextInput
            width="100%"
            label="REGULAR EXPRESSION"
            error={!!state.error}
            rows={state.method === Method.Syntax ? 10 : 1}
            onChange={handleChangeRegex}
            value={state.regex} />
        </Pane>
        {state.method === Method.Replace && <Pane marginBottom="1rem">
          <TextInput
            rows={1}
            width="100%"
            label="REPLACE EXPRESSION"
            value={state.replace}
            onChange={handleChangeReplace}
          />
        </Pane>}
        {(state.method === Method.Replace || state.method === Method.Find) && <Pane marginBottom="1rem">
          <TextInput
            label="TEXT"
            rows={10}
            width="100%"
            onChange={handleChangeText}
            value={state.text}
          />
        </Pane>}
      </SectionPane>
      <SectionPane justifyContent="center" paddingTop="13rem">
        {!rregex && <Spinner />}
        {!!rregex && state.error && <Alert marginTop="1.5rem" intent="danger" title={state.error.slice(0, 1).toUpperCase() + state.error.slice(1, state.error.indexOf('\n'))}>
          <pre style={{ color: '#696f8c', fontSize: '1.2rem', marginBottom: 0 }}>{state.error.slice(state.error.indexOf('\n') + 1)}</pre>
        </Alert>}
        {!!rregex && state.method === Method.Find && state.result && <ViewMatch matches={state.result} value={state.text} version={rregex.metadata.regex} />}
        {!!rregex && state.method === Method.Replace && state.result && <ViewReplace value={state.result} version={rregex.metadata.regex} />}
        {!!rregex && state.method === Method.Syntax && state.result && <ViewSyntax value={state.result} version={rregex.metadata['regex-syntax']} />}
      </SectionPane>
    </Pane>
  )
}

function SectionPane(props: PaneProps) {
  return <Pane
    width="50%"
    height="100vh"
    paddingX="3rem"
    paddingTop="8rem"
    paddingBottom=".5rem"
    paddingLeft="40px"
    paddingRight="40px"
    borderRight
    overflow="auto"
    {...props}
  />
}
