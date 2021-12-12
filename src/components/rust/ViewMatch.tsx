import React from 'react'
import { BoxProps } from 'ui-box'
import { Heading, Code, Pane, Card } from 'evergreen-ui'
import { Struct } from './Types'
import Documentation from './Documentation'
import { Match } from 'rregex1.0'
import { splitFromMatch } from '../../rregex'

export type ViewMatchProps = Omit<BoxProps<any>, 'background'> & {
  value: string
  matches?: Match[]
  version?: string
}

export default function ViewMatch({
  value,
  matches,
  version,
  ...props
}: ViewMatchProps) {
  // const theme = React.useContext(Theme)
  const matchesLen = (matches || []).length
  // const colorSuccess = theme.colors.text.success
  // const key = keyGenerator()
  const matchesSplits = React.useMemo(() => splitFromMatch(value, matches), [
    value,
    matches,
  ])

  return (
    <Pane {...props}>
      {!matchesLen && (
        <Heading size={100} float="right" opacity={.7}>
          NO MATCHES
        </Heading>
      )}
      {!!matchesLen && (
        <Heading size={100} float="right" opacity={.7}>
          {matchesLen}
          {' MATCH FOUND'}
        </Heading>
      )}
      <Heading size={100} style={{ lineHeight: '1.5rem' }}>
        PREVIEW:
      </Heading>
      <Card
        background="tint1"
        padding="1rem"
        elevation={0}
        width="100%"
      >
        {matchesSplits.map((text: string, i: number) => {
          const isMatch = i % 2 && i !== matchesSplits.length - 1
          // const appearance = !isMatch ? 'minimal' : undefined

          if (isMatch) {
            return <Code key={i} size={300} appearance="default" margin={0} borderWidth={0} paddingLeft=".3rem" paddingRight=".3rem">
              {text}
            </Code>
          } else {
            return <Code key={i} size={300} backgroundColor="transparent" borderWidth={0} margin={0} padding={0} boxShadow="0">
              {text}
            </Code>
          }
        })}
      </Card>
      {matches && (
        <Pane width="100%" paddingY="1rem" style={{ whiteSpace: 'pre' }}>
          <Heading size={100} style={{ lineHeight: '1.5rem' }}>
            MATCHES:
          </Heading>
          {!matchesLen && (
            <Card paddingY="5rem" textAlign="center">
              <Heading size={100} opacity={.7}>
                NO MATCHES
              </Heading>
            </Card>
          )}
          {!!matchesLen &&
            matches.map((match, i) => {
              return (
                <Card
                  key={'match::' + i}
                  background="tint1"
                  padding="1rem"
                  elevation={0}
                  width="100%"
                  marginBottom="1rem"
                >
                  <pre>
                    <Struct value={{
                      '@name': 'regex::Match',
                      '@type': 'struct',
                      start: match.start,
                      end: match.end,
                      'as_str()': match.value
                    }} version={version ? 'regex/' + version : 'regex/latest'} />
                  </pre>
                </Card>
              )
            })}
        </Pane>
      )}
    </Pane>
  )
}
