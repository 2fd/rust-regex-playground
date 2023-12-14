import React from 'react'
import { IntlMessageFormat } from 'intl-messageformat'
import { Divider, Primitive, href } from './Types.tsx'
import type { Captures, Match } from '../../rregex.ts'

const ordinal = function (position: number) {
  // const list = ['st', 'nd', 'rd', 'th']
  let value = String(position | 0)
  if (value.endsWith('1') && value !== '11') {
    value += 'st'
  } else if (value.endsWith('2') && value !== '12') {
    value += 'nd'
  } else if (value.endsWith('3') && value !== '13') {
    value += 'rd'
  } else {
    value += 'th'
  }

  return value
}

type ContainerProps = React.PropsWithChildren<{
  name: string
  action?: React.ReactNode
}>

function Container(props: ContainerProps) {
  return (
    <div className="w-full">
      <div className="mx-5">
        <div className="mb-1 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
              {props.name}
            </p>
          </div>
          <div>{props.action}</div>
        </div>
        {props.children}
      </div>
    </div>
  )
}

type BoxProps = React.PropsWithChildren<{}>

function Box(props: BoxProps) {
  return (
    <div className="mb-4 w-full rounded bg-slate-100 px-4 py-2 font-mono text-sm text-gray-600 shadow ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700">
      {props.children}
    </div>
  )
}

export type ViewReplaceProps = Partial<{
  value: string
}>

export const ViewReplace = React.memo(function ViewReplace({
  value,
}: ViewReplaceProps) {
  return (
    <Container name="REPLACED:">
      {value === undefined && (
        <Box>
          <code>MISSING EXPRESSION</code>
        </Box>
      )}
      {value !== undefined && (
        <Box>
          <pre className="block min-h-[1.2em] w-full overflow-auto">
            {value || ''}
          </pre>
        </Box>
      )}
    </Container>
  )
})

export type ViewMatchProps = {
  matches?: Match[]
  version?: string
  value?: string
}

const matches = new IntlMessageFormat(
  `{len, plural,
    =0 {no matches}
    =1 {1 match}
    other {# matches}
  }`,
  'en-US'
)

export const ViewMatch = React.memo(function ViewMatch(props: ViewMatchProps) {
  if (!props.matches) {
    return null
  }

  const docs = href(
    'struct',
    'regex::Regex',
    'regex/' + (props.version || 'latest')
  )

  return (
    <Container
      name={matches.format({ len: props.matches.length }) + ':'}
      action={
        <p className="text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
          <a
            target="_blank"
            href={docs + '#method.find_iter'}
            className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
          >
            see documentation
          </a>
        </p>
      }
    >
      {props.matches.length === 0 && (
        <Box>
          <code>NO MATCHES</code>
        </Box>
      )}
      {props.matches.length > 0 &&
        props.matches.map((match, i) => {
          return (
            <Box key={i}>
              <pre>
                <Match match={match} version={props.version} position={i + 1} />
              </pre>
            </Box>
          )
        })}
    </Container>
  )
})

export function Match(props: {
  match: Match
  version?: string
  position?: number
}) {
  const docs = href(
    'struct',
    'regex::Match',
    'regex/' + (props.version || 'latest')
  )
  return (
    <>
      {Number.isFinite(props.position) && (
        <span className="mr-2 text-sm text-black opacity-50 dark:text-white">
          {ordinal(props.position!)}
        </span>
      )}
      <a
        target="_black"
        href={docs}
        className="mr-2 font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
      >
        Match
      </a>
      <Divider />
      <a
        target="_blank"
        href={docs + '#method.range'}
        className="mx-2 text-inherit hover:underline"
      >
        (<Primitive.Number value={props.match.start} />
        ..
        <Primitive.Number value={props.match.end} />)
      </a>
      <Divider />
      <Primitive.String value={props.match.value} />
    </>
  )
}

const captures = new IntlMessageFormat(
  `{len, plural,
    =0 {no captures}
    =1 {1 capture}
    other {# captures}
  }`,
  'en-US'
)

export type VewCapturesProps = {
  captures?: Captures[]
  version?: string
  value?: string
}

export const ViewCaptures = React.memo(function ViewCaptures(
  props: VewCapturesProps
) {
  if (!props.captures) {
    return null
  }

  const docs = href(
    'struct',
    'regex::Regex',
    'regex/' + (props.version || 'latest')
  )

  return (
    <Container
      name={captures.format({ len: props.captures.length }) + ':'}
      action={
        <p className="text-xs uppercase leading-4 text-gray-500 dark:text-gray-300">
          <a
            target="_blank"
            href={docs + '#method.captures_iter'}
            className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
          >
            see documentation
          </a>
        </p>
      }
    >
      {props.captures.length === 0 && (
        <Box>
          <code>NO MATCHES</code>
        </Box>
      )}
      {props.captures.length > 0 &&
        props.captures.map((captures, i) => (
          <Box key={i}>
            <Captures
              captures={captures}
              version={props.version}
              position={i + 1}
            />
          </Box>
        ))}
    </Container>
  )
})

export function Captures(props: {
  captures: Captures
  version?: string
  position?: number
}) {
  const docs = href(
    'struct',
    'regex::Captures',
    'regex/' + (props.version || 'latest')
  )
  return (
    <>
      {Number.isFinite(props.position) && (
        <span className="text-sm text-black opacity-50 dark:text-white">
          {ordinal(props.position!)}
        </span>
      )}
      <a
        target="_black"
        href={docs}
        className="mx-2 font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
      >
        Captures
      </a>
      <br />
      <br />
      {Object.entries(props.captures.name).map(([name, match], i) => (
        <React.Fragment key={i}>
          <a
            target="_blank"
            href={docs + '#method.name'}
            className="text-inherit hover:underline"
          >
            <span className="ml-2">.name(</span>
            <Primitive.String value={name} />
            <span className="mr-2">):</span>
          </a>
          <br />
          <span className="ml-8" />
          <Match match={match} version={props.version} />
          <br />
          <br />
        </React.Fragment>
      ))}
      {props.captures.get.map((match, i, all) => (
        <React.Fragment key={i}>
          <a
            target="_blank"
            href={docs + '#method.get'}
            className="text-inherit hover:underline"
          >
            <span className="ml-2">.get(</span>
            <Primitive.Number value={i} />
            <span className="mr-2">):</span>
          </a>
          <br />
          <span className="ml-8" />
          <Match match={match} version={props.version} />
          {all.length - 1 !== i && <br />}
          {all.length - 1 !== i && <br />}
        </React.Fragment>
      ))}
    </>
  )
}
