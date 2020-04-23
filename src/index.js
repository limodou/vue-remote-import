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
  if (!path.endsWith('/')) {
    let index = path.lastIndexOf('/')
    if (index > -1 && path.startsWith('/')) {
      path = path.substr(0, index + 1)
    }
  }
  return domain + path
}

const fetch = async (url) => {
  let result
  if (url.endsWith('.js')) {
    let pos = url.lastIndexOf('/')
    let filename = url.substr(pos + 1)
    result = await window.fetch(url)
    let text = await result.text()
    text = text.replace(`sourceMappingURL=${filename}.map`, `sourceMappingURL=${url}.map`)
    result.text = () => {
      return text
    }
  } else {
    result = window.fetch(url)
  }
  return result
}

export const importResource = (location, options = {}) => {
  return new Promise((resolve, reject) => {
    let module = cache[location]
    if (module) {
      resolve(module)
      return
    }
    if (loading[location] === undefined) {
      loading[location] = []
      let opts = {
        getDomain
      }
      // sourcemap 用于控制是否替换 sourcemap 路径
      if (options.sourcemap) {
        opts.fetch = fetch
      }
      importEntry(location, opts).then(result => {
        const {
          template,
          execScripts,
          assetPublicPath
        } = result
        execScripts(window).then(result => {
          if (result.default) result = result.default
          cache[location] = result

          if (options.callback) options.callback({
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

export const remoteImport = async (location, name, options) => {
  const module = await importResource(location, options)
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