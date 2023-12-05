import React from 'react'
import ExclamationCircleIcon from '@heroicons/react/24/solid/esm/ExclamationCircleIcon.js'

export type AlertProps = Partial<{
  title: string
  message: string
}>

export default React.memo(function Alert(props: AlertProps) {
  return (
    <div className="flex w-full rounded-md border-2 border-red-400 bg-red-100 px-4 py-2">
      <div className="flex-none">
        <ExclamationCircleIcon className="h-7 w-7 pr-2 text-red-700" />
      </div>
      <div className="flex-auto">
        {props.title && <p className="text-lg text-red-700">{props.title}</p>}
        {props.message && (
          <pre className="text-xs text-gray-600">{props.message}</pre>
        )}
      </div>
    </div>
  )
})
