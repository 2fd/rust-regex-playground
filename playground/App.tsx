import {
  Button,
  Heading,
  SegmentedControl,
  Pane,
  Code,
  Icon,
  Alert,
  Spinner
} from "evergreen-ui";
import * as React from "react";
import { IState, Method, fontInput } from "./common";
import TextInput from "./form/TextInput";
import Theme from "./theme";
// import * as theme from 'evergreen-ui/commonjs/theme'
import Store from "./store";
import { RRegExp } from "./rregex";
import ViewMatch from "./rust/ViewMatch";
import ViewReplace from "./rust/ViewReplace";
import ViewSyntax from "./rust/ViewSyntax";
import GithubCircle from "./icon/GithubCircle";
import Documentation from "./rust/Documentation";
export interface IAppProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.HTMLProps<HTMLDivElement> {
  store: Store<IState>;
}

export interface IRRegexResult {
  regexExpressionError?: Error;
  replaceExpressionError?: Error;
  syntaxResult?: any;
  findResult?: any;
  replaceResult?: string;
}

export default function App({ store }: IAppProps) {
  function handleChangeProp(propName: string) {
    return function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      store.dispatch({ [propName]: e.target.value });
    };
  }

  const theme = React.useContext(Theme);
  const result = React.useMemo((): IRRegexResult => {
    if (!(store.value.features && store.value.features.rregex)) return {};

    let regex: RRegExp;
    try {
      regex = new RRegExp(store.value.regex || "");
    } catch (err) {
      return { regexExpressionError: err };
    }

    switch (store.value.method) {
      case Method.syntax:
        return { syntaxResult: regex.syntax() };

      case Method.find:
        const findResult = regex.find_all(store.value.text || "");
        return { findResult };

      case Method.replace:
        if (!store.value.replace) {
          return { replaceResult: store.value.text || "" };
        }

        try {
          return {
            replaceResult: regex.replace_all(
              store.value.text || "",
              store.value.replace || ""
            )
          };
        } catch (err) {
          return { replaceExpressionError: err };
        }

      default:
        return {};
    }
  }, [
    store.value.features && store.value.features.rregex,
    store.value.method,
    store.value.regex,
    store.value.replace,
    store.value.text
  ]);

  const { docRegex, docRegexSyntax } = React.useMemo(() => {
    return {
      docRegex: Documentation.fromPackage(
        "regex",
        (store.value.versions && store.value.versions.regex) || ""
      ),
      docRegexSyntax: Documentation.fromPackage(
        "regex-syntax",
        (store.value.versions && store.value.versions.regex_syntax) || ""
      )
    };
  }, [
    store.value.versions && store.value.versions.regex,
    store.value.versions && store.value.versions.regex_syntax
  ]);

  const completed = !!(store.value.features && store.value.features.completed);
  const rregex = !!(store.value.features && store.value.features.rregex);
  const rregexError = store.value.features && store.value.features.rregexError;

  return (
    <Pane display="flex">
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
            RUST REGEX PLAYGROUND
          </Heading>
        </Pane>
        <Pane alignItems="center" display="flex">
          <Button
            is="a"
            target="_blank"
            href="#"
            appearance="minimal"
            height={32}
            iconAfter="book"
            intent="none"
          >
            RUST-REGEX
          </Button>
          <Button
            is="a"
            target="_blank"
            href="#"
            appearance="minimal"
            height={32}
            iconAfter="book"
            intent="none"
          >
            RUST-REGEX-SYNTAX
          </Button>
          <Button
            is="a"
            target="_blank"
            href="#"
            appearance="minimal"
            height={32}
            intent="none"
          >
            PLAYGROUND
            <GithubCircle size={16} style={{ marginLeft: ".5rem" }} />
          </Button>
          {store.value && store.value.features && store.value.features.share && (
            <Button
              appearance="minimal"
              height={32}
              iconAfter="share"
              intent="none"
            >
              SHARE
            </Button>
          )}
          {/* <IconButton appearance="minimal" icon="notifications" iconSize={18} /> */}
          {/* Below you can see the marginRight property on a Button. */}
          {/* <Button marginRight={16}>Button</Button>
          <Button appearance="primary">Primary Button</Button> */}
        </Pane>
      </Pane>
      <Pane
        width="50%"
        height="100vh"
        paddingX="3rem"
        paddingTop="5rem"
        paddingBottom=".5rem"
        background="blueTint"
        borderRight
        overflow="auto"
      >
        <Pane width="100%" display="flex" justifyContent="flex-end">
          <SegmentedControl
            name="method"
            width={280}
            options={[
              {
                label: String(Method.syntax).toUpperCase(),
                value: Method.syntax
              },
              { label: String(Method.find).toUpperCase(), value: Method.find },
              {
                label: String(Method.replace).toUpperCase(),
                value: Method.replace
              }
            ]}
            value={store.value.method || Method.find}
            onChange={(value: Method) => store.dispatch({ method: value })}
          />
        </Pane>
        <Pane marginBottom="1rem">
          <Heading
            is="label"
            size={100}
            style={{
              lineHeight: "1.5rem",
              color: result.regexExpressionError && theme.colors.text.danger
            }}
            flex={1}
          >
            REGULAR EXPRESSION
          </Heading>
          <TextInput
            width="100%"
            isInvalid={!!result.regexExpressionError}
            minRows={store.value.method === Method.syntax ? 10 : 1}
            onChange={handleChangeProp("regex")}
            value={store.value.regex}
            marginBottom={result.regexExpressionError && ".5rem"}
          />
          {result.regexExpressionError && (
            <Code
              size={300}
              appearance="minimal"
              style={{ whiteSpace: "pre", color: theme.colors.text.danger }}
            >
              <Icon icon="error" color="danger" size={12} />{" "}
              {result.regexExpressionError.message}
            </Code>
          )}
        </Pane>
        {store.value.method === Method.replace && (
          <Pane marginBottom="1rem">
            <Heading is="label" size={100} style={{ lineHeight: "1.5rem" }}>
              REPLACE EXPRESSION
            </Heading>
            <TextInput
              width="100%"
              onChange={handleChangeProp("replace")}
              value={store.value.replace}
            />
          </Pane>
        )}
        {(store.value.method === Method.find ||
          store.value.method === Method.replace) && (
          <Pane>
            <Heading is="label" size={100} style={{ lineHeight: "1.5rem" }}>
              TEXT
            </Heading>
            <TextInput
              width="100%"
              minRows={10}
              onChange={handleChangeProp("text")}
              value={store.value.text}
            />
          </Pane>
        )}
      </Pane>
      <Pane
        width="50%"
        height="100vh"
        paddingX=".5rem"
        paddingTop="5rem"
        paddingBottom=".5rem"
        overflow="auto"
      >
        {!completed && (
          <Pane
            width="100%"
            padding="3rem"
            display="flex"
            justifyContent="center"
          >
            <Spinner size={64} />
          </Pane>
        )}
        {completed && !rregex && (
          <Pane width="100%" padding="2rem">
            <Alert intent="danger" title="rust-regex could not be loaded">
              {rregexError && rregexError.message}
            </Alert>
          </Pane>
        )}

        {completed &&
          rregex &&
          (store.value.method === Method.find && (
            <ViewMatch
              size=".75rem"
              padding="2rem"
              value={store.value.text || ""}
              matches={result.findResult}
              doc={docRegex}
            />
          ))}

        {completed &&
          rregex &&
          (store.value.method === Method.replace && (
            <ViewReplace
              size=".75rem"
              padding="2rem"
              value={result.replaceResult || ""}
              doc={docRegex}
            />
          ))}

        {completed &&
          rregex &&
          (store.value.method === Method.syntax && (
            <ViewSyntax
              size=".75rem"
              padding="2rem"
              value={result.syntaxResult}
              doc={docRegexSyntax}
            />
          ))}
      </Pane>
    </Pane>
  );
}
