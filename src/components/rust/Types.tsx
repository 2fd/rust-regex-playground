import React from 'react'

function href(type: string, name: string, mod: string) {
  const sections = name.split('::')
  const prefix = sections.slice(0, -1).join('/')
  const Name = sections.slice(-1).join('')
  return new URL(`/${mod}/${prefix}/${type}.${Name}.html`, 'https://docs.rs').toString()
}

type RustTypeProps = {
  value: string | number | boolean | any[] | {
    '@type': string,
    '@name': string,
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
                <Type value={value} spaces={spaces + 2} version={props.version} />
              </>
            ))}
            <span>{'\n' + ' '.repeat(spaces) + ']'}</span>
          </span>
        )
      } else if (value['@type'] === 'enum') {
        return <Enum value={value as any} spaces={spaces} version={props.version} />
      } else if (value['@type'] === 'struct') {
        return <Struct value={value as any} spaces={spaces} version={props.version} />
      } else {
        return (
          <span style={{ color: '#5e8759' }}>
            {JSON.stringify(value, null, 2)}
          </span>
        )
      }
    default:
      return null
  }
})

const StructName = React.memo(function (props: { type: string, name: string, version?: string }) {
  return <a
    target="_black"
    href={href(props.type, props.name, props.version || 'latest')}
    style={{ color: '#6E62B6', fontWeight: 500 }}
  >
    {props.name.split('::').slice(-1).join('')}
  </a>
})

type RustStructProps = {
  value: {
    '@type': string,
    '@name': string,
    [key: string]: any
  }
  spaces?: number
  version?: string
}

export const Struct = React.memo(function (props: RustStructProps) {
  const spaces = props.spaces || 0
  const { '@type': type, '@name': name, ...values } = props.value
  return <span style={{ color: '#474d66', fontWeight: 300, fontSize: '1.2rem' }}>
    <span>
      <StructName type={type} name={name} version={props.version} />
      {' {\n'}
    </span>
    {Object.keys(values).map(key => {
      return <span key={key}>
        {' '.repeat(spaces + 2) + key + ': '}
        <Type value={values[key]} spaces={spaces + 2} version={props.version} />
        {'\n'}
        {/* {props.children} */}
      </span>
    })}
    <span>
      {' '.repeat(spaces) + '}'}
    </span>
  </span>
})

type RustEnumProps = {
  value: {
    '@type': string,
    '@name': string,
    '@variant': string,
    [key: string]: any
  }
  spaces?: number
  version?: string
}

const EnumName = React.memo(function (props: { type: string, name: string, variant: string, version?: string }) {
  return <a style={{ color: '#ef835a', fontWeight: 500 }} href={href(props.type, props.name, props.version || 'latest')}>
    {props.name.split('::').slice(-1).join('')}
    '::'
    {props.variant}
  </a>
})

export const Enum = React.memo(function ({ children, ...props }: React.PropsWithChildren<RustEnumProps>) {
  const spaces = props.spaces || 0
  const { '@type': type, '@name': name, '@variant': variant, '@values': values, ...properties } = props.value
  const keys = Object.keys(properties)
  return <>
    <EnumName type={type} name={name} variant={variant} version={props.version} />
    {!!values && <span style={{ color: '#FFB020', fontWeight: 500 }}>(</span>}
    {!!values &&
      Array.isArray(values) &&
      values.map((value, i) => {
        return <React.Fragment key={i}>
          {i !== 0 && ', '}
          <Type value={value} spaces={spaces} version={props.version} />
        </React.Fragment>
      })
    }
    {!!values && <span style={{ color: '#FFB020', fontWeight: 500 }}>)</span>}
    {!values && keys.length > 0 && <span style={{ color: '#FFB020', fontWeight: 500 }}>{' {\n'}</span>}
    {!values && keys.length > 0 && keys.map((key) => {
      console.log(properties[key])
      return <span key={key}>
        {' '.repeat(spaces + 2) + key + ': '}
        <Type value={properties[key]} spaces={spaces + 2} version={props.version} />
        {'\n'}
      </span>
    })}
    {!values && keys.length > 0 && <span style={{ color: '#FFB020', fontWeight: 500 }}>{' '.repeat(spaces) + '}'}</span>}
  </>
})


export function Primitive({ value }: { value?: string | number | boolean }) {
  if (typeof value === 'string' && value.length === 1) {
    const code = String(value)
      .charCodeAt(0)
      .toString(16)
    const indent = 4 - code.length
    const space = '0'.repeat(indent >= 0 ? indent : 0)
    return (
      <>
        <span style={{ color: '#5e8759', fontWeight: 500 }}>'{value}'</span>
        <span style={{ color: '#aba6bf', fontWeight: 500 }}>
          {' \\u'}
          {space}
          {code}
        </span>
      </>
    )
  } else if (typeof value === 'string') {
    return <span style={{ color: '#5e8759', fontWeight: 500 }}>'{value}'</span>
  } else if (typeof value === 'number' && Number.isFinite(value)) {
    return <span style={{ color: '#5e8759', fontWeight: 500 }}>{String(value)}</span>
  } else if (typeof value === 'boolean') {
    return (
      <span title="boolean" style={{ color: '#5e8759', fontWeight: 500 }}>
        {value ? 'true' : 'false'}
      </span>
    )
  } else {
    return null
  }
}
