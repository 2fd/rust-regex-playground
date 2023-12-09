import { useEffect, useState } from 'react'
import type * as rregex from 'rregex1.8'
import { memo } from 'radash'

export const VERSIONS = {
  '1.8': import('rregex1.8'),
  '1.7': import('rregex1.7'),
  '1.6': import('rregex1.6'),
  '1.5': import('rregex1.5'),
  '1.4': import('rregex1.4'),
  '1.3': import('rregex1.3'),
  '1.2': import('rregex1.2'),
  '1.1': import('rregex1.1'),
  '1.0': import('rregex1.0'),
} as const

export type RRegexVersion = keyof typeof VERSIONS
export const DEFAULT_VERSION: RRegexVersion = '1.8'

export type Hir = rregex.Hir
export type Match = rregex.Match
export type RRegex = rregex.RRegex

export const isRRegexVersion = (
  version: string | null | undefined
): version is RRegexVersion => {
  return !!version && version in VERSIONS
}

const initializer = memo(
  async (version: RRegexVersion) => {
    const mod = await VERSIONS[version]
    await (mod.default as any)()
    return mod
  },
  {
    ttl: Infinity,
    key: (version: RRegexVersion) => version,
  }
)

type State = {
  rregex: typeof rregex | null
  version: string
  loading: boolean
}

export function useRRegex(version: string) {
  const [state, setRRegex] = useState<State | null>(null)

  useEffect(() => {
    if (state?.version === version) {
      return
    }

    setRRegex({
      rregex: null,
      loading: isRRegexVersion(version),
      version,
    })

    if (isRRegexVersion(version)) {
      Promise.resolve()
        .then(() => initializer(version))
        .then((rregex) => {
          setRRegex((state) => {
            if (state?.version !== version) {
              return state
            }

            return {
              ...state,
              rregex: rregex as any,
              loading: false,
            }
          })
        })
        .catch((err) => {
          console.error(err)
          setRRegex((state) => {
            if (state?.version !== version) {
              return state
            }

            return {
              ...state,
              loading: false,
            }
          })
        })
    }
  }, [version, state, setRRegex])

  return state?.rregex || null
}

export const encoder = new TextEncoder()
export const decoder = new TextDecoder()
export function splitFromMatch(
  text: string,
  matches?: Array<Match>
): Array<string> {
  let offset = 0
  const buff = encoder.encode(text)
  const splits: Array<string> = []
  if (Array.isArray(matches) && matches.length) {
    for (let match of matches) {
      splits.push(decoder.decode(buff.slice(offset, match.start)))
      splits.push(decoder.decode(buff.slice(match.start, match.end)))
      offset = match.end
    }
  }
  splits.push(decoder.decode(buff.slice(offset)))
  return splits
}
