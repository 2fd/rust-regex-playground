import React, { useState } from 'react'
import type { Captures, Hir, Match } from '../../rregex.ts'
import type { Method } from '../Form/Setup.tsx'
import Block from '../Layout/Block.tsx'
import { Struct, href } from './Types.tsx'

export type Status = 'loading' | 'empty' | 'error' | 'ok'

export function getStatus(state: {
  ready: boolean
  error?: string
  regex: string
}): Status {
  if (!state.ready) return 'loading'
  if (state.error) return 'error'
  if (!state.regex) return 'empty'
  return 'ok'
}

export function plural(n: number, one: string, many = one + 'es') {
  return `${n} ${n === 1 ? one : many}`
}

export function getStatusText(status: Status, version: string, matches = 0) {
  switch (status) {
    case 'loading':
      return `Loading rregex ${version}…`
    case 'error':
      return 'Invalid regular expression'
    case 'empty':
      return 'Enter a regular expression'
    case 'ok':
      return plural(matches, 'match')
  }
}

/** Splits a regex-syntax error into its first line and the caret diagram. */
export function ErrorNotice({ error }: { error: string }) {
  const nl = error.indexOf('\n')
  const head = nl === -1 ? error : error.slice(0, nl)
  const title = (head.charAt(0).toUpperCase() + head.slice(1)).replace(
    /:\s*$/,
    ''
  )
  const message = nl === -1 ? '' : error.slice(nl + 1).trim()
  return (
    <div
      role="alert"
      className="rounded-lg border border-err/40 bg-err-soft px-3 py-2 text-[13px]"
    >
      <div className="font-medium text-err">{title}</div>
      {message && (
        <pre className="mt-1 overflow-x-auto text-[12px] leading-5 text-fg">
          {message}
        </pre>
      )}
    </div>
  )
}

export type OutputProps = {
  status: Status
  version: string
  method: Method
  result?: string
  matches?: Match[]
  captures?: Captures[]
  /** `$name` / `$i` tokens, used to name the capture group columns. */
  shortcuts?: string[]
  syntax?: Hir
  isSyntaxStale: boolean
  regexVersion?: string
  regexSyntaxVersion?: string
}

/**
 * Every result stays visible at the same time; only the syntax tree, which
 * can be thousands of lines, is collapsible (and starts collapsed).
 */
export default function Output(props: OutputProps) {
  const regexDocs = href(
    'struct',
    'regex::Regex',
    'regex/' + (props.regexVersion || 'latest')
  )
  const syntaxMod = props.regexSyntaxVersion
    ? 'regex-syntax/' + props.regexSyntaxVersion
    : 'regex/latest'
  const ok = props.status === 'ok'
  const names = groupNames(props.shortcuts)
  const groups = props.captures?.[0]?.get.length ?? names.length

  return (
    <>
      {props.method === 'replace' && (
        <Block
          title="Replace result"
          right={<DocsLink href={regexDocs + '#method.replace_all'} />}
        >
          <Body {...props}>
            <ReplaceResult value={props.result} />
          </Body>
        </Block>
      )}
      <Block
        title="Matches"
        meta={ok ? props.matches?.length : undefined}
        right={<DocsLink href={regexDocs + '#method.find_iter'} />}
      >
        <Body {...props}>
          <MatchesTable matches={props.matches || []} />
        </Body>
      </Block>
      <Block
        title="Capture groups"
        meta={ok ? Math.max(0, groups - 1) : undefined}
        right={<DocsLink href={regexDocs + '#method.captures_iter'} />}
      >
        <Body {...props}>
          <GroupsTable
            captures={props.captures || []}
            names={names}
            columns={groups}
          />
        </Body>
      </Block>
      <Block
        title="Syntax tree"
        meta="how the regex is parsed (HIR)"
        collapsible
        defaultOpen={false}
        right={
          <DocsLink
            href={href('struct', 'regex_syntax::hir::Hir', syntaxMod)}
          />
        }
      >
        <Body {...props} tall>
          {props.syntax && (
            <pre
              className={`px-4 py-3 text-[12px] leading-5 transition-opacity ${
                props.isSyntaxStale ? 'opacity-60' : ''
              }`}
            >
              <Struct value={props.syntax} version={syntaxMod} />
            </pre>
          )}
        </Body>
      </Block>
    </>
  )
}

/** Shows the loading / empty / error placeholder instead of the result. */
function Body({
  status,
  version,
  tall,
  children,
}: React.PropsWithChildren<
  Pick<OutputProps, 'status' | 'version'> & { tall?: boolean }
>) {
  switch (status) {
    case 'loading':
      return <Empty>Loading rregex {version}…</Empty>
    case 'error':
      return <Empty>Fix the regular expression to see results.</Empty>
    case 'empty':
      return <Empty>Enter a regular expression to see results.</Empty>
    case 'ok':
      return (
        <div
          className={`${tall ? 'max-h-[60vh]' : 'max-h-[40vh]'} overflow-auto`}
        >
          {children}
        </div>
      )
  }
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-6 text-center text-[13px] text-fg-dim">{children}</p>
  )
}

function DocsLink({ href: url }: { href: string }) {
  return (
    <a
      href={url}
      target="_blank"
      className="text-[12px] text-fg-dim hover:text-accent hover:underline"
    >
      docs ↗
    </a>
  )
}

const TH =
  'px-3 py-2 text-left text-[11px] font-medium tracking-wide text-fg-dim uppercase'
const TD = 'px-3 py-1.5 align-top'
const ROW = 'border-b border-line/60 last:border-0 hover:bg-surface-2'

function MatchesTable({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return <Empty>No matches in the test string.</Empty>
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead className="sticky top-0 bg-surface">
        <tr className="border-b border-line">
          <th className={TH + ' w-10'}>#</th>
          <th className={TH}>Matched text</th>
          <th className={TH + ' w-32 text-right'}>Position</th>
        </tr>
      </thead>
      <tbody>
        {matches.map((m, i) => (
          <tr key={i} className={ROW}>
            <td className={TD + ' text-fg-dim tabular-nums'}>{i + 1}</td>
            <td className={TD}>
              <MatchedText value={m.value} />
            </td>
            <td className={TD + ' text-right text-fg-dim tabular-nums'}>
              {m.start}–{m.end}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function GroupsTable({
  captures,
  names,
  columns,
}: {
  captures: Captures[]
  names: (string | undefined)[]
  columns: number
}) {
  if (captures.length === 0) {
    return <Empty>No matches, so no groups were captured.</Empty>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead className="sticky top-0 bg-surface">
          <tr className="border-b border-line">
            <th className={TH + ' w-10'}>#</th>
            {Array.from({ length: columns }, (_, g) => (
              <th key={g} className={TH + ' whitespace-nowrap'}>
                {g === 0 ? (
                  'Full match'
                ) : (
                  <>
                    ${names[g] || g}
                    {names[g] && <span className="ml-1 opacity-60">({g})</span>}
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {captures.map((c, i) => (
            <tr key={i} className={ROW}>
              <td className={TD + ' text-fg-dim tabular-nums'}>{i + 1}</td>
              {c.get.map((m, g) => (
                <td key={g} className={TD}>
                  {m ? (
                    <MatchedText
                      value={m.value}
                      title={`Position ${m.start}–${m.end}`}
                    />
                  ) : (
                    <span className="text-fg-dim italic">not matched</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReplaceResult({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (value === undefined) return
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      },
      () => {}
    )
  }
  return (
    <div className="relative">
      <pre className="min-h-12 px-4 py-3 pr-20 text-[13px] leading-6 whitespace-pre-wrap text-fg">
        {value ?? ''}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 rounded-md border border-line bg-surface px-2 py-0.5 text-[12px] text-fg-dim hover:text-fg"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

/** Matched text with whitespace kept; empty matches are shown explicitly. */
function MatchedText({ value, title }: { value: string; title?: string }) {
  return (
    <span title={title} className="rounded bg-mark px-1 whitespace-pre text-fg">
      {value === '' ? <span className="text-fg-dim italic">empty</span> : value}
    </span>
  )
}

/** Group index → name, derived from the `$name` / `$i` shortcut tokens. */
function groupNames(shortcuts: string[] | undefined) {
  const names: (string | undefined)[] = []
  let pending: string | undefined
  for (const token of shortcuts || []) {
    const key = token.slice(1)
    if (/^\d+$/.test(key)) {
      names[Number(key)] = pending
      pending = undefined
    } else {
      pending = key
    }
  }
  return names
}
