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
    // 如果 location 不带schema 则使用 window.location.href 进行合成
    if (location.indexOf('://') === -1) {
      location = urlParse.resolve(window.location.href, location)
    }
    let resource = cache[location]
    if (resource) {
      if (options.callback) {
        try {
          options.callback(resource)
        } catch (err) {
          reject(err)
          return
        }
      }
      resolve(resource.props)
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
      importEntry(location, opts).then(resource => {
        const {
          template,
          execScripts,
          assetPublicPath
        } = resource
        execScripts(window).then(result => {
          let props = result
          if (result.default) props = result.default
          cache[location] = {
            template,
            assetPublicPath,
            props
          }

          if (options.callback) options.callback(cache[location])

          resolve(props)
          setTimeout(() => {
            if (loading[location].length > 0) {
              for (let f of loading[location]) {
                f(props)
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