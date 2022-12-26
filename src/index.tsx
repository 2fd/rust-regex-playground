import React from 'react'
import ReactDOM from 'react-dom'
import './css/normalize.css'
import './css/skeleton.css'

import App from './components/Layout/App'
const root = document.getElementById('root')

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
