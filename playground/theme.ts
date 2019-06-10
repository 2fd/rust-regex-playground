// tslint:disable:no-console
import * as React from "react";
import defaultTheme from "evergreen-ui/commonjs/theme/src/default-theme/index.js";
const Theme = React.createContext(defaultTheme);
const { Provider: ThemeProvider, Consumer: ThemeConsumer } = Theme;
export default Theme;
export { ThemeProvider, ThemeConsumer, defaultTheme };
