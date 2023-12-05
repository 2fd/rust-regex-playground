import React, { useEffect, useRef } from 'react'

export type TextareaProps = React.HTMLProps<HTMLTextAreaElement>

export default React.memo(function Textarea(props: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const target = ref.current
    if (!target || typeof target.scrollHeight !== 'number') {
      return
    }

    target.style.minHeight = (props.rows || 1) * 1.4 + 'em'
    target.style.height = 0 + 'px'
    target.style.height = target.scrollHeight + 'px'
  }, [props.value, props.rows])

  return <textarea {...props} ref={ref} />
})
