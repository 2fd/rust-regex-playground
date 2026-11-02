import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { type Match, splitFromMatch } from '../../rregex.ts'

export type CodeFieldProps = {
  /** Accessible name of the textarea. */
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  /** Highlighted in the text, alternating between two colors. */
  matches?: Match[]
  /** Capture group tokens (`$1`, `$name`) offered as insert buttons. */
  shortcuts?: string[]
  /** Minimum visible lines. */
  rows?: number
  autoFocus?: boolean
  /** Show a `❯` prompt before the field. */
  prompt?: boolean
}

// Overlay, textarea and decorations must share these metrics exactly.
const FIELD = 'm-0 block border-0 py-2.5 font-mono text-[13px] leading-6'
const QUOTE = 'select-none text-accent/70'

/**
 * A textarea rendered like a Rust raw string literal (`r"…"`), with the
 * current matches highlighted behind the text.
 *
 * The highlight is a `<pre>` overlay stacked in the same grid cell as the
 * textarea; the overlay text is transparent, only the `<mark>` backgrounds
 * show through. The closing quote is drawn in the overlay right after the
 * last character, so it follows the text instead of sitting at the edge.
 */
export default React.memo(function CodeField({
  label,
  value,
  onValueChange,
  placeholder,
  matches,
  shortcuts,
  rows = 1,
  autoFocus,
  prompt,
}: CodeFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  // Caret position to restore after inserting a shortcut.
  const caret = useRef<number | null>(null)

  const splits = useMemo(
    () => (matches ? splitFromMatch(value, matches) : [value]),
    [value, matches]
  )
  const padLines = Math.max(0, rows - value.split('\n').length)

  useLayoutEffect(() => {
    if (caret.current !== null && ref.current) {
      ref.current.focus()
      ref.current.setSelectionRange(caret.current, caret.current)
      caret.current = null
    }
  }, [value])

  // Insert at the caret (or append when the field is not focused). When the
  // next character is a word character, `$name` must be written as `${name}`
  // or the group name would absorb it.
  const insertShortcut = (e: React.MouseEvent, shortcut: string) => {
    e.preventDefault() // keep focus and selection in the textarea
    const el = ref.current
    if (!el) return
    const focused = document.activeElement === el
    const start = focused ? el.selectionStart : value.length
    const end = focused ? el.selectionEnd : value.length
    const next = value.slice(end, end + 1)
    const token = /\w/.test(next) ? '${' + shortcut.slice(1) + '}' : shortcut
    caret.current = start + token.length
    onValueChange(value.slice(0, start) + token + value.slice(end))
  }

  return (
    <div className="px-4">
      <div className="flex min-w-0">
        {prompt && (
          <span aria-hidden className={`${FIELD} shrink-0 pr-2 text-accent`}>
            ❯
          </span>
        )}
        <span
          aria-hidden
          title="Rust raw string literal"
          className={`${FIELD} mr-1 shrink-0 ${QUOTE}`}
        >
          r"
        </span>
        <div className="grid min-w-0 flex-1">
          <pre
            aria-hidden
            className={`${FIELD} pointer-events-none break-words whitespace-pre-wrap text-transparent [grid-area:1/1]`}
          >
            {splits.map((text, i) =>
              i % 2 && i !== splits.length - 1 ? (
                <mark
                  key={i}
                  className={`rounded-[2px] text-transparent ${
                    ((i - 1) / 2) % 2 ? 'bg-mark-2' : 'bg-mark'
                  }`}
                >
                  {text}
                </mark>
              ) : (
                <span key={i}>{text}</span>
              )
            )}
            {!value && placeholder && (
              <span className="text-fg-dim/70">{placeholder}</span>
            )}
            <span className={`ml-1 ${QUOTE}`}>"</span>
            {'\n'.repeat(padLines) + ' '}
          </pre>
          <textarea
            ref={ref}
            aria-label={label}
            value={value}
            autoFocus={autoFocus}
            cols={1}
            rows={1}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => onValueChange(e.target.value)}
            className={`${FIELD} resize-none overflow-hidden bg-transparent break-words whitespace-pre-wrap text-fg outline-none [grid-area:1/1]`}
          />
        </div>
      </div>
      {shortcuts && shortcuts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-3 text-[12px]">
          <span className="text-fg-dim">insert group</span>
          {shortcuts.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => insertShortcut(e, s)}
              // Keyboard activation fires `click` without a `mousedown`.
              onClick={(e) => e.detail === 0 && insertShortcut(e, s)}
              className="rounded border border-line px-1.5 text-syn-type hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
