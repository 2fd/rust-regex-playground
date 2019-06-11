import * as React from "react";
import Button from "evergreen-ui/commonjs/buttons/src/Button.js";
import GithubCircle from "../icon/GithubCircle";

export type IMenuItemProps = React.Props<HTMLAnchorElement> &
  React.HTMLAttributes<HTMLAnchorElement> & {
    iconAfter?: string;
    iconBefore?: string;
    intent?: string;
    appearance?: string;
    height?: number;
    href?: string;
  };

export default function MenuItem(props: IMenuItemProps) {
  const height = props.height || 32;

  return (
    <Button
      is="a"
      target="_blank"
      appearance="minimal"
      intent="none"
      height={height}
      {...props}
    >
      {props.iconBefore === "github" && (
        <GithubCircle size={height - 16} style={{ marginRight: ".5rem" }} />
      )}
      {props.children}
      {props.iconAfter === "github" && (
        <GithubCircle size={height - 16} style={{ marginLeft: ".5rem" }} />
      )}
    </Button>
  );
}

MenuItem.defaultProps = {
  height: 32
};
