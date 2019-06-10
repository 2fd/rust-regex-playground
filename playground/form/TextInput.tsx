import * as React from "react";
import { Pane, Textarea } from "evergreen-ui";
import { BoxProps } from "ui-box";
import { numberRangeProps, INumberRangeProps, fontInput } from "../common";
import Theme from "../theme";

// console.log(theme)
const pane: React.CSSProperties = {
  background: "white",
  position: "relative"
};

const quote: React.CSSProperties = {
  ...fontInput,
  display: "flex",
  alignItems: "center",
  opacity: 0.5,
  position: "absolute",
  height: "32px",
  lineHeight: "16px"
};

const leftQuote: React.CSSProperties = {
  ...quote,
  paddingLeft: ".6rem"
};

const rightQuote: React.CSSProperties = {
  ...quote,
  paddingRight: "1rem",
  right: 0
};

const textArea: React.CSSProperties = {
  ...fontInput,
  resize: "none",
  display: "flex",
  background: "transparent",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
  position: "relative"
};

export type TextInputProps = React.HTMLProps<HTMLTextAreaElement> &
  BoxProps &
  INumberRangeProps<"minRows", "maxRows">;

function TextInput({
  checked,
  defaultChecked,
  defaultValue,
  isInvalid,
  maxRows,
  minRows,
  onBlur,
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  rows,
  value,
  ...props
}: TextInputProps) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);
  const is = React.useMemo(
    () => (currentProps: React.HTMLProps<HTMLTextAreaElement>) => (
      <textarea {...currentProps} ref={ref} />
    ),
    [ref]
  );
  function calculateRows(target: HTMLTextAreaElement | null) {
    if (!target || typeof target.scrollHeight !== "number") {
      return;
    }

    target.rows = 1;
    let currentRows = (target.scrollHeight - 16) / 20;
    if (typeof minRows === "number" && minRows > 0 && minRows > currentRows) {
      currentRows = minRows;
    }

    if (typeof maxRows === "number" && maxRows > 0 && maxRows < currentRows) {
      currentRows = maxRows;
    }

    target.rows = currentRows;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    calculateRows(e.target);
    typeof onChange === "function" && onChange(e);
  }

  React.useEffect(() => calculateRows(ref.current), [
    value,
    rows,
    minRows,
    maxRows
  ]);

  const theme = React.useContext(Theme);

  const [leftQuoteStyle, rightQuoteStyle] = React.useMemo(() => {
    if (!isInvalid) {
      return [leftQuote, rightQuote];
    }

    const color = theme.colors.text.danger;
    return [{ ...leftQuote, color }, { ...rightQuote, color }];
  }, [isInvalid]);

  return (
    <Pane {...props} style={pane}>
      <div style={leftQuoteStyle}>r"</div>
      <div style={rightQuoteStyle}>"</div>
      <Textarea
        is={is}
        isInvalid={isInvalid}
        maxWidth="100%"
        minHeight="1rem"
        minWidth="100%"
        onChange={handleChange}
        rows={(ref && ref.current && ref.current.rows) || 1}
        style={textArea}
        value={value}
      />
    </Pane>
  );
}

TextInput.propTypes = {
  ...numberRangeProps("minRows", "maxRows", 1)
};

export default TextInput;
