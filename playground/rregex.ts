import rregex, { RRegExp, get_metadata } from "../pkg/index.js";

export default rregex("./pkg/index_bg.wasm").then(() => {
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

 ${JSON.stringify(get_metadata(), null, 2)}
 
 `,
    "font-family:monospace;color:#666;"
  );
  return rregex;
});

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();
export const getMetadata = get_metadata;

export interface IMatch {
  start: number;
  end: number;
  as_str: string;
}
export function splitFromMatch(
  text: string,
  matches?: Array<IMatch>
): Array<string> {
  let offset = 0;
  const buff = encoder.encode(text);
  const splits: Array<string> = [];
  if (Array.isArray(matches) && matches.length) {
    for (let match of matches) {
      splits.push(decoder.decode(buff.slice(offset, match.start)));
      splits.push(decoder.decode(buff.slice(match.start, match.end)));
      offset = match.end;
    }
  }
  splits.push(decoder.decode(buff.slice(offset)));
  return splits;
}

export { RRegExp, get_metadata };
