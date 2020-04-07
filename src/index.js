import {
  importEntry,
} from "import-html-entry";

let cache = {}

const remoteImport = async (location, name) => {
  let module = cache[location]
  try {
    if (!module) {
      const {
        template,
        execScripts,
        assetPublicPath
      } = await importEntry(location);
      window.__REMOTE_WEBPACK_PUBLIC_PATH__ = assetPublicPath;
      module = await execScripts(window)
      cache[location] = module
    }
    if (name) {
      let m = module[name]
      if (!m) {
        throw new Error(`No component named ${name} founded in component ${location}`)
      }
      return module[name]
    } else {
      return module
    }

  } catch (err) {
    console.log(err)
    throw err
  }
}

export default remoteImport