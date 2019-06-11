import Heading from "evergreen-ui/commonjs/typography/src/Heading.js";
import Code from "evergreen-ui/commonjs/typography/src/Code.js";
import Pane from "evergreen-ui/commonjs/layers/src/Pane.js";
import Card from "evergreen-ui/commonjs/layers/src/Card.js";
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
        Syntax:
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
