import React from 'react'
import ReactDOM from 'react-dom'
import './css/normalize.css'
import './css/skeleton.css'

import App from './components/Layout/App'

// import App from './App'
// import { ThemeProvider, defaultTheme } from './theme'
// import { createStateFromHash, IState, updateHashFromState } from './common'
// import rregex, { RRegExp, get_metadata } from './rregex'
// import Store, { mergeHandlers, mergeStates } from './store'
// import * as Evergreen from "evergreen-ui";

const root = document.getElementById('root')
// const store = new Store<IState>(
//   mergeStates(createStateFromHash()),
//   mergeHandlers(updateHashFromState, render)
// )

ReactDOM.render(<App />, root, () =>
  console.log(
    `%c
     _____           _      _____                         _____  _                                             _
    |  __ \\         | |    |  __ \\                       |  __ \\| |                                           | |
    | |__) |   _ ___| |_   | |__) |___  __ _  _____  __  | |__) | | __ _ _   _  __ _ _ __ ___  _   _ _ __   __| |
    |  _  / | | / __| __|  |  _  // _ \\/ _\` |/ _ \\ \\/ /  |  ___/| |/ _\` | | | |/ _\` | '__/ _ \\| | | | '_ \\ / _\` |
    | | \\ \\ |_| \\__ \\ |_   | | \\ \\  __/ (_| |  __/>  <   | |    | | (_| | |_| | (_| | | | (_) | |_| | | | | (_| |
    |_|  \\_\\__,_|___/\\__|  |_|  \\_\\___|\\__, |\\___/_/\\_\\  |_|    |_|\\__,_|\\__, |\\__, |_|  \\___/ \\__,_|_| |_|\\__,_|
                                        __/ |                             __/ | __/ |
                                        |___/                             |___/ |___/

    `,
    'font-family:monospace;color:#666;'
  )
)

// async function feature(name: string, evaluate: Promise<any>) {
//   return evaluate
//     .then(value => store.dispatch({ [name]: value }))
//     .catch((err: Error) => {
//       console.error(err)
//       store.dispatch({ [name]: false, [name + 'Error']: err })
//     })
// }

// render()

// Object.assign(window, { store, RRegExp })
// window.addEventListener('hashchange', () =>
//   store.dispatch(createStateFromHash())
// )

// feature(
//   'features.completed',
//   Promise.all([
//     feature(
//       'features.rregex',
//       rregex.then(() => {
//         const metadata = get_metadata()
//         feature('versions.regex', Promise.resolve(metadata.regex))
//         feature(
//           'versions.regex_syntax',
//           Promise.resolve(metadata['regex-syntax'])
//         )
//         return true
//       })
//     ),
//     feature('features.share', Promise.resolve(!!(navigator as any).share)),
//   ])
// )
