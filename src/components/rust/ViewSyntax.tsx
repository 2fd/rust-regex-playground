import React from 'react'
import { Struct } from './Types.js'
import { Hir } from '../../rregex.js'

export type ViewSyntaxProps = {
  value: Hir
  version?: string
}

export default function ViewSyntax({ value, version }: ViewSyntaxProps) {
  return (
    <div className="w-full">
      <div className="mx-5">
        <p className="mb-1 text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
          Syntax
        </p>
        <div className="w-full rounded bg-white px-4 py-2 font-mono text-sm text-gray-600 shadow ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700">
          <pre className="w-full overflow-auto">
            <Struct
              value={value}
              version={version ? 'regex-syntax/' + version : 'regex/latest'}
            />
          </pre>
        </div>
      </div>
    </div>
  )
}
