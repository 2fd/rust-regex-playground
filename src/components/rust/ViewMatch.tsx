import React from 'react'
import { IntlMessageFormat } from 'intl-messageformat'
import { Struct } from './Types.js'
import type { Match } from '../../rregex.js'

export type ViewMatchProps = {
  value: string
  matches?: Match[]
  version?: string
}

const matches = new IntlMessageFormat(
  `{len, plural,
    =0 {no matches}
    =1 {1 match}
    other {# matches}
  }`,
  'en-US'
)

export default function ViewMatch(props: ViewMatchProps) {
  // const theme = React.useContext(Theme)
  const len = (props.matches || []).length
  // const colorSuccess = theme.colors.text.success
  // const key = keyGenerator()

  return (
    <div className="w-full">
      {props.matches && (
        <div className="mx-5">
          <p className="mb-1 text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
            {matches.format({ len })}:
          </p>
          {len === 0 && (
            <div className="w-full rounded bg-slate-100 px-4 py-2 font-mono text-sm text-gray-600 shadow ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700">
              <code>NO MATCHES</code>
            </div>
          )}
          {len > 0 &&
            props.matches.map((match, i) => {
              return (
                <div className="mb-4 w-full rounded bg-slate-100 px-4 py-2 font-mono text-sm text-gray-600 shadow ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700">
                  <pre>
                    <Struct
                      value={{
                        '@name': 'regex::Match',
                        '@type': 'struct',
                        start: match.start,
                        end: match.end,
                        'as_str()': match.value,
                      }}
                      version={
                        props.version
                          ? 'regex/' + props.version
                          : 'regex/latest'
                      }
                    />
                  </pre>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
