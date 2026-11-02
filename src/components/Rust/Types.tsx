import React from 'react'

export function href(type: string, name: string, mod: string) {
  const sections = name.split('::')
  const prefix = sections.slice(0, -1).join('/')
  const Name = sections.slice(-1).join('')
  return new URL(
    `/${mod}/${prefix}/${type}.${Name}.html`,
    'https://docs.rs'
  ).toString()
}

// Laying out large syntax trees is expensive: `\w` renders ~4k lines with
// glyphs from 20+ scripts and lone combining marks, which costs >100ms of
// text shaping per render. `content-visibility: auto` skips that work for
// items outside the viewport.
function lazyBlockStyle(value: unknown): React.CSSProperties {
  return {
    display: 'block',
    // Paint containment would clip long lines; grow with the content instead
    // so the parent <pre> keeps scrolling horizontally.
    width: 'max-content',
    minWidth: '100%',
    contentVisibility: 'auto',
    containIntrinsicBlockSize: `auto ${countNewlines(value) + 1}lh`,
  }
}

// Mirrors the line breaks emitted by `Type`, `Struct` and `Enum`, so skipped
// items reserve roughly their real height and the scrollbar does not jump.
function countNewlines(value: unknown): number {
  if (value === null || typeof value !== 'object') return 0
  if (ArrayBuffer.isView(value)) return 2
  if (Array.isArray(value)) {
    return value.length === 0
      ? 2
      : value.length + 1 + value.reduce((n, v) => n + countNewlines(v), 0)
  }
  const {
    '@type': _type,
    '@name': _name,
    '@variant': _variant,
    '@values': values,
    ...properties
  } = value as Record<string, unknown>
  if (Array.isArray(values)) {
    return values.reduce((n: number, v) => n + countNewlines(v), 0)
  }
  const keys = Object.keys(properties)
  return keys.length === 0
    ? 0
    : 1 + keys.reduce((n, key) => n + countNewlines(properties[key]) + 1, 0)
}

type RustTypeProps = {
  value:
    | string
    | number
    | boolean
    | any[]
    | {
        '@type': string
        '@name': string
        [key: string]: any
      }
  spaces?: number
  version?: string
}

export const Type = React.memo(function (props: RustTypeProps) {
  const spaces = props.spaces || 0
  const value = props.value
  switch (typeof value) {
    case 'string':
    case 'boolean':
    case 'undefined':
    case 'number':
      return <Primitive value={value} />
    case 'object':
      if (value === null) {
        return <Primitive value={value} />
      } else if (ArrayBuffer.isView(value)) {
        let t = unit(value)
        return (
          <span>
            <span>{'\n' + ' '.repeat(spaces + 2)}</span>
            {t && (
              <span className="text-syn-meta">{`[${t}; ${value.length}] `}</span>
            )}
            <span>{'['}</span>
            {Array.from(value.values(), (value: number, i: number) => {
              return (
                <React.Fragment key={i}>
                  {i !== 0 && ', '}
                  <Primitive.Byte value={value} />
                </React.Fragment>
              )
            })}
            <span>{']\n' + ' '.repeat(spaces)}</span>
          </span>
        )
      } else if (Array.isArray(value) && value.length > 0) {
        // Each item is its own block so the browser can skip layout for
        // off-screen items (e.g. the ~770 ranges of `\w`). Items already
        // start on their own line, so the rendered text is unchanged.
        return (
          <span>
            <span>{'['}</span>
            {value.map((value, i, values) => (
              <span key={i} style={lazyBlockStyle(value)}>
                {' '.repeat(spaces + 2)}
                <Type
                  value={value}
                  spaces={spaces + 2}
                  version={props.version}
                />
                {i !== values.length - 1 && ','}
              </span>
            ))}
            <span>{' '.repeat(spaces) + ']'}</span>
          </span>
        )
      } else if (Array.isArray(value)) {
        return (
          <span>
            <span>{'[\n'}</span>
            {value.map((value, i) => (
              <React.Fragment key={i}>
                {i !== 0 && ',\n'}
                {' '.repeat(spaces + 2)}
                <Type
                  value={value}
                  spaces={spaces + 2}
                  version={props.version}
                />
              </React.Fragment>
            ))}
            <span>{'\n' + ' '.repeat(spaces) + ']'}</span>
          </span>
        )
      } else if (value['@type'] === 'enum') {
        return (
          <Enum value={value as any} spaces={spaces} version={props.version} />
        )
      } else if (value['@type'] === 'struct') {
        return (
          <Struct
            value={value as any}
            spaces={spaces}
            version={props.version}
          />
        )
      } else {
        return (
          <span className="text-syn-lit">{JSON.stringify(value, null, 2)}</span>
        )
      }
    default:
      return null
  }
})

type RustStructProps = {
  value: {
    '@type': string
    '@name': string
    [key: string]: any
  }
  spaces?: number
  version?: string
}

export const Struct = React.memo(function (props: RustStructProps) {
  const spaces = props.spaces || 0
  const {
    '@type': type,
    '@name': name,
    '@values': values,
    ...properties
  } = props.value
  return (
    <span className="text-fg">
      <a
        target="_blank"
        href={href(type, name, props.version || 'latest')}
        className="font-semibold text-syn-type hover:underline"
      >
        {name.split('::').slice(-1).join('')}
      </a>
      {!!values && <span className="text-syn-type">{'('}</span>}
      {!!values &&
        Array.isArray(values) &&
        values.map((value, i, values) => {
          return (
            <React.Fragment key={i}>
              <Type value={value} spaces={spaces} version={props.version} />
              {i !== values.length - 1 && ', '}
            </React.Fragment>
          )
        })}
      {!!values && <span className="text-syn-type">{')'}</span>}
      {!values && <span className="text-syn-type">{' {\n'}</span>}
      {!values &&
        Object.keys(properties).map((key) => {
          return (
            <span key={key}>
              {' '.repeat(spaces + 2) + key + ': '}
              <Type
                value={properties[key]}
                spaces={spaces + 2}
                version={props.version}
              />
              {'\n'}
            </span>
          )
        })}
      {!values && (
        <span className="text-syn-type">{' '.repeat(spaces) + '}'}</span>
      )}
    </span>
  )
})

type RustEnumProps = {
  value: {
    '@type': string
    '@name': string
    '@variant': string
    [key: string]: any
  }
  spaces?: number
  version?: string
}

export const Enum = React.memo(function ({
  children,
  ...props
}: React.PropsWithChildren<RustEnumProps>) {
  const spaces = props.spaces || 0
  const {
    '@type': type,
    '@name': name,
    '@variant': variant,
    '@values': values,
    ...properties
  } = props.value
  const keys = Object.keys(properties)
  return (
    <>
      <a
        className="text-syn-enum hover:underline"
        href={href(type, name, props.version || 'latest')}
      >
        {name.split('::').slice(-1).join('')}
        {'::'}
        {variant}
      </a>
      {!!values && <span className="text-syn-enum">{'('}</span>}
      {!!values &&
        Array.isArray(values) &&
        values.map((value, i, values) => {
          return (
            <React.Fragment key={i}>
              <Type value={value} spaces={spaces} version={props.version} />
              {i !== values.length - 1 && ', '}
            </React.Fragment>
          )
        })}
      {!!values && <span className="text-syn-enum">{')'}</span>}
      {!values && keys.length > 0 && (
        <>
          <span className="text-syn-enum">{' {\n'}</span>
          {keys.map((key) => {
            return (
              <span key={key}>
                {' '.repeat(spaces + 2) + key + ': '}
                <Type
                  value={properties[key]}
                  spaces={spaces}
                  version={props.version}
                />
                {'\n'}
              </span>
            )
          })}
          <span className="text-syn-enum">{' '.repeat(spaces) + '}'}</span>
        </>
      )}
    </>
  )
})

export const Primitive = Object.assign(
  function ({ value }: { value?: string | number | boolean }) {
    if (typeof value === 'string' && value.length === 1) {
      return <Primitive.Char value={value} />
    } else if (typeof value === 'string') {
      return <Primitive.String value={value} />
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      return <Primitive.Number value={value} />
    } else if (typeof value === 'boolean') {
      return <Primitive.Boolean value={value} />
    } else if (value === undefined || value === null) {
      return <Primitive.None />
    } else {
      return null
    }
  },
  {
    Byte: ({ value }: { value: number }) => {
      const code = ('0000' + value.toString(16)).slice(-4)
      return (
        <>
          <span className="text-syn-lit">'{String.fromCharCode(value)}'</span>
          <a
            className="ml-1 text-syn-meta hover:underline"
            target="_blank"
            href={`https://unicodeplus.com/U+${code.toUpperCase()}`}
          >
            {'\\u'}
            {code}
          </a>
        </>
      )
    },
    Char: ({ value }: { value: string }) => {
      const code = ('0000' + String(value).charCodeAt(0).toString(16)).slice(-4)
      return (
        <>
          <span className="text-syn-lit">'{value}'</span>
          <a
            className="ml-1 text-syn-meta hover:underline"
            target="_blank"
            href={`https://unicodeplus.com/U+${code.toUpperCase()}`}
          >
            {'\\u'}
            {code}
          </a>
        </>
      )
    },
    String: ({ value }: { value: string }) => {
      return <span className="text-syn-lit">"{value}"</span>
    },
    Number: ({ value }: { value: number }) => {
      return <span className="text-syn-lit">{String(value)}</span>
    },
    Boolean: ({ value }: { value: boolean }) => {
      return (
        <span title="boolean" className="text-syn-lit">
          {value ? 'true' : 'false'}
        </span>
      )
    },
    None: () => {
      return (
        <span title="None" className="text-syn-meta">
          None
        </span>
      )
    },
  }
)

export function unit(value: any) {
  switch (Object.prototype.toString.call(value)) {
    case '[object Int8Array]':
      return 'i8'
    case '[object Uint8Array]':
      return 'u8'
    case '[object Int16Array]':
      return 'i16'
    case '[object Uint16Array]':
      return 'u16'
    case '[object Int32Array]':
      return 'i32'
    case '[object Uint32Array]':
      return 'u32'
    case '[object Int64Array]':
      return 'i64'
    case '[object Uint64Array]':
      return 'u64'
    case '[object Float32Array]':
      return 'f32'
    case '[object Float64Array]':
      return 'f64'
    default:
      return null
  }
}

export function Divider() {
  return (
    <span className="mx-1 inline-block h-4 border-l border-l-fg align-middle opacity-20" />
  )
}
