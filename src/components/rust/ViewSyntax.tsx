import React from 'react'
import { BoxProps } from 'ui-box'
import { Heading, Code, Pane, Card } from 'evergreen-ui'
import * as rregex from 'rregex1.0'
import { Struct } from './Types'

export type ViewSyntaxProps = Omit<BoxProps<any>, 'background'> & {
  value: rregex.Hir
  version?: string
}

export default function ViewSyntax({
  value,
  version,
  ...props
}: ViewSyntaxProps) {
  return (
    <Pane {...props}>
      <Heading size={100} style={{ lineHeight: '1.5rem' }}>
        Syntax:
      </Heading>
      <Card
        background="tint1"
        padding="1rem"
        elevation={0}
        width="100%"
      >
        <pre style={{ margin: 0 }}>
          <Struct value={value} version={version ? 'regex-syntax/' + version : 'regex/latest'} />
        </pre>
      </Card>
    </Pane>
  )
}
