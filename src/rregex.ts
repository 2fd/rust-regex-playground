import { useEffect, useMemo, useState } from 'react'
import * as rregex1_0 from 'rregex1.0'
import * as rregex1_1 from 'rregex1.1'
import * as rregex1_2 from 'rregex1.2'
import * as rregex1_3 from 'rregex1.3'
import * as rregex1_4 from 'rregex1.4'
import * as rregex1_5 from 'rregex1.5'
import { callOnce } from './utils'

const list = [
  rregex1_5,
  rregex1_4,
  rregex1_3,
  rregex1_2,
  rregex1_1,
  rregex1_0,
] as const

export default list

export type RRegex =
  | typeof rregex1_5
  | typeof rregex1_4
  | typeof rregex1_3
  | typeof rregex1_2
  | typeof rregex1_1
  | typeof rregex1_0

export type Match = rregex1_0.Match
export type Hir = rregex1_0.Hir

export function getVersion(version: string) {
  return list.find(mod => mod.metadata.regex === version)!
}

const initializer = new Map(list.map(mod => {
  return [mod.metadata.regex as string, callOnce(mod.default)] as const
}))

export function useRRegex(version: string) {
  const [rregex, setRRegex] = useState<RRegex | null>(null)
  useEffect(() => {
    let cancelled = false

    Promise.resolve()
      .then(() => initializer.get(version)!())
      .then(() => {
        if (!cancelled) {
          setRRegex(getVersion(version))
        }
      })
      .catch(console.error)

    return () => {
      cancelled = true
    }
  }, [version, setRRegex])

  return rregex
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