// tslint:disable:no-console
import * as React from "react";
import { defaultTheme } from "evergreen-ui";
const Theme = React.createContext(defaultTheme);
const { Provider: ThemeProvider, Consumer: ThemeConsumer } = Theme;
export default Theme;
export { ThemeProvider, ThemeConsumer };
