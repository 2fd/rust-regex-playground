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
              <span className="text-gray-300 dark:text-gray-500">{`[${t}; ${value.length}] `}</span>
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
          <span className="text-emerald-600 dark:text-emerald-400">
            {JSON.stringify(value, null, 2)}
          </span>
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
    <span className="text-gray-600 dark:text-gray-100">
      <a
        target="_black"
        href={href(type, name, props.version || 'latest')}
        className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
      >
        {name.split('::').slice(-1).join('')}
      </a>
      {!!values && (
        <span className="text-cyan-600 dark:text-cyan-400">{'('}</span>
      )}
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
      {!!values && (
        <span className="text-cyan-600 dark:text-cyan-400">{')'}</span>
      )}
      {!values && (
        <span className="text-cyan-600 dark:text-cyan-400">{' {\n'}</span>
      )}
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
        <span className="text-cyan-600 dark:text-cyan-400">
          {' '.repeat(spaces) + '}'}
        </span>
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
        className="text-yellow-600 hover:underline dark:text-yellow-400"
        href={href(type, name, props.version || 'latest')}
      >
        {name.split('::').slice(-1).join('')}
        {'::'}
        {variant}
      </a>
      {!!values && (
        <span className="text-yellow-600 dark:text-yellow-400">{'('}</span>
      )}
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
      {!!values && (
        <span className="text-yellow-600 dark:text-yellow-400">{')'}</span>
      )}
      {!values && keys.length > 0 && (
        <>
          <span className="text-yellow-600 dark:text-yellow-400">{' {\n'}</span>
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
          <span className="text-yellow-600 dark:text-yellow-400">
            {' '.repeat(spaces) + '}'}
          </span>
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
          <span className="text-emerald-600 dark:text-emerald-400">
            '{String.fromCharCode(value)}'
          </span>
          <a
            className="ml-1 text-gray-400 hover:underline"
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
          <span className="text-emerald-600 dark:text-emerald-400">
            '{value}'
          </span>
          <a
            className="ml-1 text-gray-400 hover:underline"
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
      return (
        <span className="text-emerald-600 dark:text-emerald-400">
          "{value}"
        </span>
      )
    },
    Number: ({ value }: { value: number }) => {
      return (
        <span className="text-emerald-600 dark:text-emerald-400">
          {String(value)}
        </span>
      )
    },
    Boolean: ({ value }: { value: boolean }) => {
      return (
        <span
          title="boolean"
          className="text-emerald-600 dark:text-emerald-400"
        >
          {value ? 'true' : 'false'}
        </span>
      )
    },
    None: () => {
      return (
        <span title="None" className="text-gray-400">
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
    <span className="mx-1 inline-block h-4 border-l border-l-black align-middle opacity-20 dark:border-l-white" />
  )
}
