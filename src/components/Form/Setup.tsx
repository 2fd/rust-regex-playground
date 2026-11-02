import React from 'react'
import MagnifyingGlassIcon from '@heroicons/react/24/outline/esm/MagnifyingGlassIcon.js'
import ArrowsRightLeftIcon from '@heroicons/react/24/outline/esm/ArrowsRightLeftIcon.js'
import ChevronUpDownIcon from '@heroicons/react/20/solid/esm/ChevronUpDownIcon.js'
import { VERSIONS, DEFAULT_VERSION } from '../../rregex.ts'

export type Method = 'find' | 'replace'

const OPERATIONS: {
  id: Method
  title: string
  description: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}[] = [
  {
    id: 'find',
    title: 'Find',
    description: 'List every match and its capture groups',
    Icon: MagnifyingGlassIcon,
  },
  {
    id: 'replace',
    title: 'Find & replace',
    description: 'Also build a new text, replacing each match',
    Icon: ArrowsRightLeftIcon,
  },
]

const VERSION_LIST = Object.keys(VERSIONS)

export type SetupProps = {
  method: Method
  onMethodChange: (method: Method) => void
  version: string
  onVersionChange: (version: string) => void
  /** Crate versions of the loaded engine, once its wasm module is ready. */
  regexVersion?: string
  regexSyntaxVersion?: string
}

/**
 * The two settings that change what the app does, given the same weight as
 * the inputs: the operation and the regex engine version.
 */
export default React.memo(function Setup(props: SetupProps) {
  return (
    // Golden ratio, like the input / output columns.
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
      <div className="flex flex-col">
        <div
          id="setup-operation"
          className="mb-1.5 px-1 text-[12px] text-fg-dim"
        >
          Operation
        </div>
        <OperationPicker {...props} />
      </div>
      <div className="flex flex-col">
        <div className="mb-1.5 px-1 text-[12px] text-fg-dim">
          Regex engine version
        </div>
        <VersionPicker {...props} />
      </div>
    </div>
  )
})

function OperationPicker({ method, onMethodChange }: SetupProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby="setup-operation"
      className="grid flex-1 grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1"
    >
      {OPERATIONS.map(({ id, title, description, Icon }) => {
        const checked = method === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onMethodChange(id)}
            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
              checked
                ? 'bg-surface shadow-sm ring-2 ring-accent'
                : 'text-fg-dim hover:bg-surface/60 hover:text-fg'
            }`}
          >
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${checked ? 'text-accent' : ''}`}
            />
            <span className="min-w-0">
              <span
                className={`block text-[14px] font-semibold ${checked ? 'text-fg' : ''}`}
              >
                {title}
              </span>
              <span className="block text-[12px] leading-4 text-fg-dim">
                {description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// A card the size of an operation option, with a transparent native <select>
// on top: it keeps the platform picker and keyboard support.
function VersionPicker({
  version,
  onVersionChange,
  regexVersion,
  regexSyntaxVersion,
}: SetupProps) {
  return (
    <div className="relative flex flex-1 items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-accent hover:border-accent">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">
          rregex {version}
          <span className="ml-2 rounded-full bg-surface-2 px-1.5 py-px text-[11px] font-medium text-fg-dim">
            {version === DEFAULT_VERSION ? 'latest' : 'older release'}
          </span>
        </span>
        <span className="block text-[12px] leading-4 text-fg-dim">
          {regexVersion
            ? `Uses the Rust crates regex ${regexVersion} and regex-syntax ${regexSyntaxVersion}`
            : 'Loading the engine…'}
        </span>
      </span>
      <ChevronUpDownIcon className="mt-1 h-5 w-5 shrink-0 text-fg-dim" />
      <select
        aria-label="Regex engine version"
        value={version}
        onChange={(e) => onVersionChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {VERSION_LIST.map((v) => (
          <option key={v} value={v}>
            rregex {v}
            {v === DEFAULT_VERSION ? ' (latest)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
