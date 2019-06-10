import { Heading, Pane, Code, Card } from "evergreen-ui";
import * as React from "react";
import { fontInput } from "../common";
import Theme from "../theme";
import { BoxProps } from "ui-box";
import Type, { IRustType } from "./Type";
import Documentation from "./Documentation";

export interface IViewSyntaxProps extends BoxProps {
  size: number | string;
  value: IRustType;
  doc?: Documentation;
}

export default function ViewSyntax({
  value,
  size,
  doc,
  ...props
}: IViewSyntaxProps) {
  const theme = React.useContext(Theme);

  return (
    <Pane {...props}>
      <Heading size={100} style={{ lineHeight: "1.5rem" }}>
        Replace:
      </Heading>
      <Card
        background="tint1"
        padding="1rem"
        elevation={0}
        width="100%"
        style={fontInput}
      >
        <Code size={300} appearance="minimal">
          <Type value={value} doc={doc} />
        </Code>
      </Card>
    </Pane>
  );
}
