import * as React from "react";
import Heading from "evergreen-ui/commonjs/typography/src/Heading.js";
import Pane from "evergreen-ui/commonjs/layers/src/Pane.js";

export type ITopBarProps = React.Props<any> & {
  title: string;
};

export default function TopBar({ title, children }: ITopBarProps) {
  return (
    <Pane
      display="flex"
      width="100vw"
      height="3.5rem"
      padding=".5rem"
      backgroundColor="white"
      elevation={1}
      style={{ position: "fixed", zIndex: 999 }}
    >
      <Pane flex={1} alignItems="center" display="flex" paddingX="1rem">
        <Heading is="h1" size={500}>
          {title}
        </Heading>
      </Pane>
      <Pane alignItems="center" display="flex">
        {children}
      </Pane>
    </Pane>
  );
}
