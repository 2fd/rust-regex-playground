import * as React from "react";
import Style from "./Type.css";
import Documentation from "./Documentation";

export type IRustType = IRustEnum | IRustStruct | IRustPrimitive;

export interface IRustEnum {
  ["@type"]: "enum";
  ["@name"]: string;
  ["@variant"]: string;
  ["@value"]: IRustType | IRustType[];
  [key: string]: IRustType | IRustType[];
}

export interface IRustStruct {
  ["@type"]: "struct";
  ["@name"]: string;
  ["@value"]: string | number | boolean;
  [key: string]: IRustType;
}

export type IRustPrimitive = string | number | boolean;

export interface ITypeProps<H = IRustType> {
  value?: H;
  showFullName?: boolean;
  doc?: Documentation;
}

export default function Type({
  value,
  showFullName,
  doc
}: ITypeProps<IRustType | Array<IRustType>>) {
  if (value === undefined) {
    return null;
  }

  switch (typeof value) {
    case "string":
    case "boolean":
    case "number":
      return <Primitive value={value} />;
    case "object":
      if (Array.isArray(value)) {
        return (
          <span>
            <span>{"[ "}</span>
            {value.map((v, i) => (
              <span className={Style.Indent} key={"item_" + i}>
                <Type value={v} showFullName={showFullName} doc={doc} />
                {value.length !== i + 1 && ", "}
              </span>
            ))}
            <span>{" ]"}</span>
          </span>
        );
      } else if (value["@type"] === "enum") {
        return <Enum value={value} showFullName={showFullName} doc={doc} />;
      } else if (value["@type"] === "struct") {
        return <Struct value={value} showFullName={showFullName} doc={doc} />;
      } else {
        return (
          <span className={Style.Primitive}>
            {JSON.stringify(value, null, 2)}
          </span>
        );
      }
    default:
      return null;
  }
}

export function Struct({ value, showFullName, doc }: ITypeProps<IRustStruct>) {
  if (!value || typeof value !== "object" || value["@type"] !== "struct") {
    return null;
  }

  const val = value["@value"];
  const props = Object.keys(value).filter(name => name[0] !== "@");
  const name = showFullName
    ? value["@name"]
    : value["@name"].slice(value["@name"].lastIndexOf("::") + 2);

  if (val !== undefined && value["@name"] === "std::string::String") {
    return (
      <span className={Style.Primitive}>
        {'"'}
        {val}
        {'"'}
      </span>
    );
  }

  return (
    <>
      {
        <a
          className={Style.Struct}
          target="_black"
          href={doc && doc.getUrl(value["@type"], value["@name"])}
        >
          {name}
        </a>
      }
      <span className={Style.Struct}>{" {"}</span>
      {val !== undefined && <Primitive value={val} />}
      {props.map((prop, i) => {
        return (
          <span className={Style.Indent} key={value["@name"] + "::" + prop}>
            <span className={Style.Prop}>
              {prop}
              {": "}
            </span>
            <Type value={value[prop]} doc={doc} />
            {props.length !== i + 1 && ", "}
          </span>
        );
      })}
      <span className={Style.Struct}>{"}"}</span>
    </>
  );
}

export function Enum({ value, showFullName, doc }: ITypeProps<IRustEnum>) {
  if (!value || typeof value !== "object" || value["@type"] !== "enum") {
    return null;
  }

  const props = Object.keys(value).filter(name => name[0] !== "@");
  const val = Array.isArray(value["@value"])
    ? value["@value"]
    : value["@value"] !== undefined
    ? [value["@value"]]
    : [];

  return (
    <>
      {
        <a
          className={Style.Enum}
          target="_black"
          href={doc && doc.getUrl(value["@type"], value["@name"])}
        >
          {showFullName && value["@name"]}
          {showFullName && "::"}
          {value["@variant"]}
        </a>
      }
      {(props.length > 0 || val.length > 0) && (
        <span className={Style.Enum}>(</span>
      )}
      {val.length > 0 &&
        val.map((v, i) => (
          <React.Fragment key={value["@name"] + "::" + i}>
            <Type value={v} doc={doc} />
            {val.length !== i + 1 && ", "}
          </React.Fragment>
        ))}
      {props.length > 0 &&
        props.map((prop, i) => (
          <React.Fragment key={value["@name"] + "::" + prop}>
            <Type value={value[prop]} doc={doc} />
            {props.length !== i + 1 && ", "}
          </React.Fragment>
        ))}
      {(props.length > 0 || val.length > 0) && (
        <span className={Style.Enum}>)</span>
      )}
    </>
  );
}

export function Primitive({ value }: ITypeProps<IRustPrimitive>) {
  if (typeof value === "string" && value.length === 1) {
    const code = String(value)
      .charCodeAt(0)
      .toString(16);
    const indent = 4 - code.length;
    const space = "0".repeat(indent >= 0 ? indent : 0);
    return (
      <>
        <span className={Style.Primitive}>'{value}'</span>
        <span className={Style.Note}>
          {" \\u"}
          {space}
          {code}
        </span>
      </>
    );
  } else if (typeof value === "number" && Number.isFinite(value)) {
    return <span className={Style.Primitive}>{String(value)}</span>;
  } else if (typeof value === "boolean") {
    return (
      <span title="boolean" className={Style.Primitive}>
        {value ? "true" : "false"}
      </span>
    );
  } else {
    return null;
  }
}
