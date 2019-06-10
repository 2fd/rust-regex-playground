import Store from "./store";
import { hash } from "immutable";

export interface IState {
  features?: {
    completed?: boolean;
    completedError?: Error;
    rregex?: boolean;
    rregexError?: Error;
    share?: boolean;
    shareError?: Error;
  };
  versions?: {
    regex?: string;
    regex_syntax?: string;
  };
  method?: Method;
  regex?: string;
  text?: string;
  showReplace?: boolean;
  showSyntax?: boolean;
  replace?: string;
  error?: Error;
}

export const fontInput: React.CSSProperties = {
  fontFamily: "Roboto Mono",
  fontWeight: 500,
  color: "#666",
  fontSize: ".8rem",
  whiteSpace: "pre"
};

export enum Method {
  syntax = "syntax",
  find = "find",
  replace = "replace"
}

export function keyGenerator() {
  const map = new Map();
  return function keyGeneratorFunction(value: any): string {
    const h = hash(value);
    map.set(h, !map.has(h) ? 0 : map.get(h) + 1);
    return [h, map.get(h)].join("::");
  };
}

export function size(s: any) {
  switch (typeof s) {
    case "string":
      return s;
    case "number":
      return Number.isFinite(s) ? s + "px" : undefined;
    default:
      return undefined;
  }
}

export function createStateFromHash(): Partial<IState> {
  const hash = new URLSearchParams(String(location.hash).slice(1));
  return {
    method: (Method[hash.get("method") as any] || Method.find) as Method,
    regex: hash.get("regex") || "",
    text: hash.get("text") || "",
    replace: hash.get("replace") || ""
  };
}

export function updateHashFromState(store: Store<IState>) {
  const hash = new URLSearchParams(String(location.hash).slice(1));
  hash.set("method", Method[store.value.method as any] || Method.find);
  store.value.regex
    ? hash.set("regex", store.value.regex)
    : hash.delete("regex");
  store.value.text ? hash.set("text", store.value.text) : hash.delete("text");
  store.value.replace
    ? hash.set("replace", store.value.replace)
    : hash.delete("replace");

  const newHash = "#" + hash.toString();
  if (location.hash !== newHash) {
    location.hash = newHash;
  }
}

export type INumberRangeProps<Min extends string, Max extends string> = {
  [key in Min | Max]?: number
};

export function numberRangeProps(
  minProp: string,
  maxProp: string,
  minAvailableValue: number = -Infinity,
  maxAvailableValue: number = Infinity
) {
  return {
    [minProp]: (
      props: { [name: string]: any },
      propName: string,
      componentName: string
    ) => {
      const value = props[propName];
      if (value === undefined) {
        return;
      }

      if (typeof value !== "number") {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be a number.`
        );
      }

      if (Number.isNaN(value)) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Cannot be \`NaN\`.`
        );
      }

      if (value < minAvailableValue) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be greater or equal than \`${minAvailableValue}\`.`
        );
      }

      const maxValue = props[maxProp];
      if (
        typeof maxValue === "number" &&
        !Number.isNaN(maxValue) &&
        value > maxValue
      ) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be lower than \`${maxProp}\`.`
        );
      }
    },
    [maxProp]: (
      props: { [name: string]: any },
      propName: string,
      componentName: string
    ) => {
      const value = props[propName];
      if (value === undefined) {
        return;
      }

      if (typeof value !== "number") {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be a number.`
        );
      }

      if (Number.isNaN(value)) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Cannot be \`NaN\`.`
        );
      }

      if (value > maxAvailableValue) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be lower or equal than \`${maxAvailableValue}\`.`
        );
      }

      const minValue = props[minProp];
      if (
        typeof minValue === "number" &&
        !Number.isNaN(minValue) &&
        value < minValue
      ) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be greater than \`${minProp}\`.`
        );
      }
    }
  };
}
