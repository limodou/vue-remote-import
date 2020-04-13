import {
  importEntry,
} from "import-html-entry";
import urlParse from 'url'

let cache = {}
let loading = {}

const getDomain = (url) => {
  let domain = ''
  let path = url
  if (url.indexOf('://') > -1) {
    let u = urlParse.parse(url)
    domain = u.protocol + '//' + u.host
    path = u.path
  }
  // let index = path.lastIndexOf('/')
  // if (index > -1 && path.startsWith('/')) {
  //   path = path.substr(0, index)
  // }
  return domain + path
}

export const importResource = (location, callback) => {
  return new Promise((resolve, reject) => {
    let module = cache[location]
    if (module) {
      resolve(module)
      return
    }
    if (loading[location] === undefined) {
      loading[location] = []
      importEntry(location, {
        getDomain
      }).then(result => {
        const {
          template,
          execScripts,
          assetPublicPath
        } = result
        execScripts(window).then(result => {
          if (result.default) result = result.default
          cache[location] = result

          if (callback) callback({
            template,
            assetPublicPath,
            props: result
          })

          resolve(result)
          setTimeout(() => {
            if (loading[location].length > 0) {
              for (let f of loading[location]) {
                f(result)
              }
            }
          }, 0)
        }).catch(err => {
          reject(err)
        })

      }).catch(err => {
        reject(err)
      })
    } else {
      const callback = (m) => {
        resolve(m)
      }
      loading[location].push(callback)
    }
  })
}

export const remoteImport = async (location, name, callback) => {
  const module = await importResource(location, callback)
  if (name) {
    let m = module[name]
    if (!m) {
      throw new Error(`No component named ${name} founded in component ${location}`)
    }
    return module[name]
  } else {
    return module
  }
}
export default remoteImport