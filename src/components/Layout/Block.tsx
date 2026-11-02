import React, { useState } from 'react'

export type BlockProps = React.PropsWithChildren<{
  title: string
  /** Dim text next to the title (hint or count). */
  meta?: React.ReactNode
  /** Right side of the header (e.g. a docs link). Clicks here never toggle. */
  right?: React.ReactNode
  /** Color of the left edge: inputs, errors and outputs. */
  tone?: 'input' | 'error' | 'output'
  /** Collapsible blocks toggle when any part of the header row is clicked. */
  collapsible?: boolean
  defaultOpen?: boolean
}>

const EDGE = {
  input: 'bg-accent',
  error: 'bg-err',
  output: 'bg-fg-dim/40',
}

/** A titled terminal-style block: one input, or one kind of result. */
export default function Block({
  title,
  meta,
  right,
  tone = 'output',
  collapsible,
  defaultOpen = true,
  children,
}: BlockProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="relative shrink-0 overflow-hidden rounded-md border border-line bg-surface focus-within:border-accent/60">
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-0.5 ${EDGE[tone]}`}
      />
      <header
        // The button inside keeps it keyboard-accessible; its click bubbles here.
        onClick={collapsible ? () => setOpen(!open) : undefined}
        className={`flex items-center gap-3 px-4 py-2 text-[12px] ${
          collapsible ? 'cursor-pointer select-none hover:bg-surface-2' : ''
        }`}
      >
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-fg"
          >
            <span aria-hidden className="w-3 text-fg-dim">
              {open ? '▾' : '▸'}
            </span>
            {title}
          </button>
        ) : (
          <h2 className="shrink-0 whitespace-nowrap text-fg">{title}</h2>
        )}
        {meta !== undefined && (
          <span className="min-w-0 truncate text-fg-dim">{meta}</span>
        )}
        {right && (
          <span
            className="ml-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {right}
          </span>
        )}
      </header>
      {open && <div className="border-t border-line">{children}</div>}
    </section>
  )
}
