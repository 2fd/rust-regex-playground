import React from 'react'

export type ViewReplaceProps = Partial<{
  value: string
}>

export default React.memo(function ViewReplace({ value }: ViewReplaceProps) {
  return (
    <div className="w-full">
      <div className="mx-5">
        <p className="mb-1 text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
          REPLACED:
        </p>
        {value === undefined && (
          <div className="w-full rounded bg-slate-100 px-4 py-2 font-mono text-sm text-gray-600 shadow ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700">
            <code>MISSING EXPRESSION</code>
          </div>
        )}
        {value !== undefined && (
          <div className="w-full rounded bg-slate-100 px-4 py-2 font-mono text-sm text-gray-600 shadow ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700">
            <pre className="block min-h-[1.2em] w-full overflow-auto">
              {value || ''}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
})
