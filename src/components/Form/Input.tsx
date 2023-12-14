import React, { useCallback, useEffect, useRef } from 'react'
import { Match, splitFromMatch } from '../../rregex.ts'
import { Divider } from '../Rust/Types.tsx'

export type InputProps = React.HTMLProps<HTMLTextAreaElement> &
  Partial<{
    label: string
    error: boolean
    matches?: Match[]
    shortcuts?: string[]
  }>

export default React.memo(function Input({
  label,
  error,
  matches,
  shortcuts,
  ...props
}: InputProps) {
  const splits = React.useMemo(
    () =>
      matches && typeof props.value === 'string'
        ? splitFromMatch(props.value || '', matches)
        : [],
    [props.value, matches]
  )

  const ref = useRef<HTMLTextAreaElement>(null)
  const focus = useRef(new Map<string, number>(new Map()))

  const handleShortcuts = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!ref.current) {
        return
      }

      let value = e.currentTarget.dataset.value
      if (!value) {
        return
      }

      if (document.activeElement === ref.current && focus.current) {
        const { selectionStart, selectionEnd } = ref.current
        const nextChar = ref.current.value.slice(selectionEnd, selectionEnd + 1)
        if (nextChar && nextChar.match(/\w/gi)) {
          value = '${' + value.slice(1) + '}'
        }
        focus.current.set('selectionStart', selectionStart + value.length)
        focus.current.set('selectionEnd', selectionStart + value.length)
        ref.current.setRangeText(value, selectionStart, selectionEnd, 'end')
      } else {
        const length = ref.current.value.length
        ref.current.setRangeText(value, length, length, 'end')
        focus.current.set(
          'selectionStart',
          ref.current.value.length + value.length
        )
        focus.current.set(
          'selectionEnd',
          ref.current.value.length + value.length
        )
      }
    },
    []
  )

  const handleFocusRestore = useCallback(() => {
    if (ref.current) {
      const selectionStart = focus.current.get('selectionStart')!
      const selectionEnd = focus.current.get('selectionEnd')!
      if (Number.isFinite(selectionStart) && Number.isFinite(selectionEnd)) {
        ref.current.focus()
        const event = new InputEvent('change', { bubbles: true })
        ref.current.dispatchEvent(event)
      }

      focus.current.clear()
    }
  }, [])

  useEffect(() => {
    const target = ref.current
    if (!target || typeof target.scrollHeight !== 'number') {
      return
    }

    target.style.minHeight = (props.rows || 1) * 1.4 + 'em'
    target.style.height = 0 + 'px'
    target.style.height = target.scrollHeight + 'px'
  }, [props.value, props.rows])

  return (
    <div className="mx-10 pb-8">
      {label && (
        <label className="text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
          {label}
        </label>
      )}
      <div
        className={`relative rounded ${
          error ? 'bg-red-50' : 'bg-white dark:bg-gray-600'
        } font-mono text-sm shadow ring-1 ${
          error ? 'ring-red-600' : 'ring-gray-300 dark:ring-gray-700'
        }`}
      >
        <div
          className={`absolute left-0 top-0 block px-2 py-2 ${
            error ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          r"
        </div>
        <div
          className={`absolute right-0 top-0 block px-2 py-2 ${
            error ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          "
        </div>
        <pre className="absolute m-0 block h-full w-full resize-none border-0 bg-transparent py-2 pl-6 pr-4 text-gray-600 ring-0">
          {splits.map((text: string, i: number) => {
            const isMatch = i % 2 && i !== splits.length - 1
            return (
              <span
                key={i}
                className={
                  isMatch
                    ? 'rounded border-slate-300 bg-slate-200 dark:border-slate-400 dark:bg-slate-500'
                    : ''
                }
              >
                {text}
              </span>
            )
          })}
        </pre>
        <textarea
          {...props}
          className={`relative m-0 block w-full resize-none border-0 bg-transparent py-2 pl-6 pr-4 ${
            error ? 'text-red-700' : 'text-gray-600 dark:text-gray-100'
          } ring-0`}
          ref={ref}
        />
        {shortcuts && shortcuts.length > 0 && (
          <div
            className={`rounded-b border-t border-black border-opacity-10 py-2 pl-6 pr-4  dark:border-white dark:border-opacity-10 ${
              error
                ? 'text-red-700'
                : 'bg-neutral-50 text-gray-500 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {shortcuts.map((shortcut, i) => {
              return (
                <React.Fragment key={shortcut}>
                  {i !== 0 && <Divider />}
                  <a
                    className="relative inline-block cursor-pointer rounded-sm bg-transparent px-2 py-0.5 hover:bg-neutral-200 hover:dark:bg-gray-800"
                    data-value={shortcut}
                    onMouseDown={handleShortcuts}
                    onClick={handleFocusRestore}
                  >
                    {shortcut}
                  </a>
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})
