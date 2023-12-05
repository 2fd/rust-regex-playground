import React from 'react'

function href(type: string, name: string, mod: string) {
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
    case 'number':
      return <Primitive value={value} />
    case 'object':
      if (Array.isArray(value)) {
        return (
          <span>
            <span>{'[\n'}</span>
            {value.map((value, i) => (
              <>
                {i !== 0 && ',\n'}
                {' '.repeat(spaces + 2)}
                <Type
                  value={value}
                  spaces={spaces + 2}
                  version={props.version}
                />
              </>
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
  const { '@type': type, '@name': name, ...values } = props.value
  return (
    <span className="text-gray-600 dark:text-gray-100">
      <a
        target="_black"
        href={href(type, name, props.version || 'latest')}
        className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
      >
        {name.split('::').slice(-1).join('')}
      </a>
      <span className="text-cyan-600 dark:text-cyan-400">{' {\n'}</span>
      {Object.keys(values).map((key) => {
        return (
          <span key={key}>
            {' '.repeat(spaces + 2) + key + ': '}
            <Type
              value={values[key]}
              spaces={spaces + 2}
              version={props.version}
            />
            {'\n'}
            {/* {props.children} */}
          </span>
        )
      })}
      <span className="text-cyan-600 dark:text-cyan-400">
        {' '.repeat(spaces) + '}'}
      </span>
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

const EnumName = React.memo(function (props: {
  type: string
  name: string
  variant: string
  version?: string
}) {
  return (
    <a
      className="text-yellow-600 hover:underline dark:text-yellow-400"
      href={href(props.type, props.name, props.version || 'latest')}
    >
      {props.name.split('::').slice(-1).join('')}
      {'::'}
      {props.variant}
    </a>
  )
})

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
      <EnumName
        type={type}
        name={name}
        variant={variant}
        version={props.version}
      />
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

export function Primitive({ value }: { value?: string | number | boolean }) {
  if (typeof value === 'string' && value.length === 1) {
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
  } else if (typeof value === 'string') {
    return (
      <span className="text-emerald-600 dark:text-emerald-400">'{value}'</span>
    )
  } else if (typeof value === 'number' && Number.isFinite(value)) {
    return (
      <span className="text-emerald-600 dark:text-emerald-400">
        {String(value)}
      </span>
    )
  } else if (typeof value === 'boolean') {
    return (
      <span title="boolean" className="text-emerald-600 dark:text-emerald-400">
        {value ? 'true' : 'false'}
      </span>
    )
  } else {
    return null
  }
}