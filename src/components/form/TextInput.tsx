import React, { useEffect, useRef } from 'react'
import { BoxProps } from 'ui-box'
import { Heading, Pane, Textarea } from 'evergreen-ui'

const quote: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  opacity: 0.5,
  position: 'absolute',
  height: '32px',
  fontSize: '1.2rem',
  lineHeight: '16px',
}

const leftQuote: React.CSSProperties = {
  ...quote,
  paddingLeft: '1rem',
}

const rightQuote: React.CSSProperties = {
  ...quote,
  paddingRight: '1rem',
  right: 0,
}

export type TextInputProps = BoxProps<any> &
  Partial<{ label: string, error?: boolean }>

export default React.memo(function TextInput({ label, error, ...props }: TextInputProps) {

  const [leftQuoteStyle, rightQuoteStyle] = React.useMemo(() => {
    if (!error) {
      return [leftQuote, rightQuote]
    }

    // const color = theme.colors.text.danger
    return [
      { ...leftQuote, color: '#D14343', opacity: 1 },
      { ...rightQuote, color: '#D14343', opacity: 1 },
    ]
  }, [error])

  return <>
    <Heading
      is="label"
      size={100}
      style={{
        color: error ? '#D14343' : undefined,
        lineHeight: '1.5rem'
      }}>
      {label}
    </Heading>
    <Pane
      fontFamily="Roboto Mono"
      background="white"
      fontWeight={500}
      color="#666"
      fontSize="1rem"
      whiteSpace="pre"
      position="relative"
    >
      <div style={leftQuoteStyle}>r"</div>
      <div style={rightQuoteStyle}>"</div>
      <Textarea
        {...props as any}
        is={AutomaticTextarea}
        isInvalid={!!error}
        minHeight="1rem"
        display="flex"
        background="transparent"
        paddingLeft="2.2rem"
        paddingRight="1.5rem"
        fontSize="1.2rem"
        position="relative"
        style={{ resize: 'none' }}
      />
    </Pane>
  </>
})

function rowsToHeight(rows: number) {
  return rows * 16 + 'px'
}

function heightToRows(height: number) {
  return (height / 16) | 0
}

function AutomaticTextarea(props: React.HTMLProps<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const target = ref.current
    if (!target || typeof target.scrollHeight !== 'number') {
      return
    }

    target.rows = 1
    target.style.height = rowsToHeight(1)
    let currentRows = Math.max(heightToRows(target.scrollHeight), props.rows || 0, 1)

    target.rows = currentRows
    target.style.height = rowsToHeight(currentRows)
  }, [props.value, props.rows])

  return <textarea {...props} ref={ref} />
}