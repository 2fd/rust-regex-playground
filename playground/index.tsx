// tslint:disable:no-console
import * as React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider, defaultTheme } from "./theme";
import { createStateFromHash, IState, updateHashFromState } from "./common";
import rregex, { RRegExp, get_metadata } from "./rregex";
import Store, { mergeHandlers, mergeStates } from "./store";
// import * as Evergreen from "evergreen-ui";

const root = document.getElementById("root");
const store = new Store<IState>(
  mergeStates(createStateFromHash()),
  mergeHandlers(updateHashFromState, render)
);

async function feature(name: string, evaluate: Promise<any>) {
  return evaluate
    .then(value => store.dispatch({ [name]: value }))
    .catch((err: Error) => {
      console.error(err);
      store.dispatch({ [name]: false, [name + "Error"]: err });
    });
}

function render() {
  ReactDOM.render(
    <ThemeProvider value={defaultTheme}>
      <App store={store} />
    </ThemeProvider>,
    root
  );
}

render();

Object.assign(window, { store, RRegExp });
window.addEventListener("hashchange", () =>
  store.dispatch(createStateFromHash())
);

feature(
  "features.completed",
  Promise.all([
    feature(
      "features.rregex",
      rregex.then(() => {
        const metadata = get_metadata();
        feature("versions.regex", Promise.resolve(metadata.regex));
        feature(
          "versions.regex_syntax",
          Promise.resolve(metadata["regex-syntax"])
        );
        return true;
      })
    ),
    feature("features.share", Promise.resolve(!!(navigator as any).share))
  ])
);
