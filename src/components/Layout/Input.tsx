import React from 'react'
import Textarea, { TextareaProps } from '../Form/Textarea.tsx'
import { Match, splitFromMatch } from '../../rregex.ts'

export type InputProps = TextareaProps &
  Partial<{
    label: string
    error: boolean
    matches?: Match[]
  }>

export default React.memo(function Input({
  label,
  error,
  matches,
  ...props
}: InputProps) {
  const splits = React.useMemo(
    () =>
      matches && typeof props.value === 'string'
        ? splitFromMatch(props.value || '', matches)
        : [],
    [props.value, matches]
  )

  return (
    <div className="mx-10 pb-8">
      {label && (
        <label className="text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
          {label}
        </label>
      )}
      <div
        className={`relative rounded ${error ? 'bg-red-50' : 'bg-white dark:bg-gray-600'
          } font-mono text-sm shadow ring-1 ${error ? 'ring-red-600' : 'ring-gray-300 dark:ring-gray-700'
          }`}
      >
        <div
          className={`absolute left-0 top-0 block px-2 py-2 ${error ? 'text-red-400' : 'text-gray-400'
            }`}
        >
          r"
        </div>
        <div
          className={`absolute right-0 top-0 block px-2 py-2 ${error ? 'text-red-400' : 'text-gray-400'
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
        <Textarea
          {...props}
          className={`relative m-0 block w-full resize-none border-0 bg-transparent py-2 pl-6 pr-4 ${error ? 'text-red-400' : 'text-gray-600 dark:text-gray-100'
            } shadow-sm ring-0`}
        />
      </div>
    </div>
  )
})
