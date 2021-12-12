export function getRustRegexDocs(version: string = 'latest') {
  return `https://docs.rs/regex/${version}/regex/`
}

export function getRustRegexSyntaxDocs(version: string = 'latest') {
  return `https://docs.rs/regex-syntax/${version}/regex_syntax/`
}

type Callback = (...args: any) => any

export function callOnce<F extends Callback>(fun: F): F {

  let value: { result: any } | null = null

  return ((...args: any[]) => {
    if (!value) {
      value = { result: fun(...args) }
    }

    return value.result
  }) as F
}