import React from 'react'
import { BoxProps } from 'ui-box'
import { Heading, Code, Pane, Card } from 'evergreen-ui'

export type ViewReplaceProps = Omit<BoxProps<any>, 'background'> & {
  value?: string | undefined,
  error?: string | undefined,
}

export default function ViewReplace({ value, error, ...props }: ViewReplaceProps) {
  return (
    <Pane {...props}>
      <Heading size={100} style={{ lineHeight: '1.5rem' }}>
        Replace:
      </Heading>
      <Card
        background="tint1"
        padding="1rem"
        elevation={0}
        width="100%"
      >
        {value === undefined && (
          <Heading size={100} paddingY="5rem" textAlign="center">
            MISSING EXPRESSION
          </Heading>
        )}
        {value !== undefined && (
          <Code size={300} appearance="minimal" wordBreak="break-all" wordWrap="break-word" whiteSpace="pre-wrap" border="0" background="transparent" padding="0" margin="0" >
            {value || " "}
          </Code>
        )}
      </Card>
    </Pane>
  )
}
