import { Heading, Pane, Code, Card } from "evergreen-ui";
import * as React from "react";
import { fontInput, keyGenerator } from "../common";
import Theme from "../theme";
import { splitFromMatch } from "../rregex";
import { BoxProps } from "ui-box";
import Type, { IRustStruct } from "./Type";
import Documentation from "./Documentation";

export interface IMatch extends IRustStruct {
  start: number;
  end: number;
  as_str: string;
}

export interface IViewMatchProps extends BoxProps {
  size: number | string;
  value: string;
  matches?: Array<IMatch>;
  doc?: Documentation;
}

export default function ViewMatch({
  value,
  matches,
  size,
  doc,
  ...props
}: IViewMatchProps) {
  const theme = React.useContext(Theme);
  const matchesLen = (matches || []).length;
  const colorSuccess = theme.colors.text.success;
  const key = keyGenerator();
  const matchesSplits = React.useMemo(() => splitFromMatch(value, matches), [
    value,
    matches
  ]);

  return (
    <Pane {...props}>
      {!matchesLen && (
        <Heading size={100} float="right" opacity=".7">
          NO MATCHES
        </Heading>
      )}
      {!!matchesLen && (
        <Heading color={colorSuccess} size={100} float="right" opacity=".7">
          {matchesLen}
          {" MATCH FOUND"}
        </Heading>
      )}
      <Heading size={100} style={{ lineHeight: "1.5rem" }}>
        PREVIEW:
      </Heading>
      <Card
        background="tint1"
        padding="1rem"
        elevation={0}
        width="100%"
        style={fontInput}
      >
        {matchesSplits.map((text: string, i: number) => {
          const isMatch = i % 2 && i !== matchesSplits.length - 1;
          const appearance = !isMatch ? "minimal" : undefined;
          return (
            <Code key={key(text)} size={300} appearance={appearance}>
              {text}
            </Code>
          );
        })}
      </Card>
      {matches && (
        <Pane width="100%" paddingY="1rem" style={{ whiteSpace: "pre" }}>
          <Heading size={100} style={{ lineHeight: "1.5rem" }}>
            MATCHES:
          </Heading>
          {!matchesLen && (
            <Card style={fontInput} paddingY="5rem" textAlign="center">
              <Heading size={100} opacity=".7">
                NO MATCHES
              </Heading>
            </Card>
          )}
          {!!matchesLen &&
            matches.map((m, i) => {
              return (
                <Card
                  key={"match::" + i}
                  background="tint1"
                  padding="1rem"
                  elevation={0}
                  width="100%"
                  style={fontInput}
                  marginBottom="1rem"
                >
                  <Code size={300} appearance="minimal">
                    <Type value={m} doc={doc} />
                  </Code>
                </Card>
              );
            })}
        </Pane>
      )}
    </Pane>
  );
}
