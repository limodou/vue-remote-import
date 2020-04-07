Introduction
-------------

This module is used for load remote VUE component via url. So you can use it in router, global or local component reference. 

How it works
-------------

It'll use import-html-entry package to load html file, so html file just like a minifect descript of your component. And then it'll parse it in order to get html template, styles, and scripts. But for now only scripts is useful. Then it'll execute all scripts and get the result of execution. So you should return components object in remote component project. You can also return multiple components.

For example:

In vue router:

```
import remoteImport from 'vue-remote-import'

...
let router = new Router([
{
  path: '/login',
  name: 'login',
  component: () => remoteImport('http://domain/components/login/index.html')
}
])
```

`index.html` can be ommited, and you can also use other name for entry html filename.

If you return multiple components, so you can use `remoteLoad('http://domain/components', 'login')` to get the component you want. 

Remote Component Development Notation
--------------------------------------

You should output index.html not only js. So that you can use webpack to split code into chunks, and also js filename can have hash support when component changed.

You should process `__webpack_public_path__` so that the webpack public path can be applied on the fly. In order to do that, you can create a file maybe named public_path.js.
And the content of it should be:

    ```
    if (window.__REMOTE_WEBPACK_PUBLIC_PATH__) {
      // eslint-disable-next-line
      __webpack_public_path__ = window.__REMOTE_WEBPACK_PUBLIC_PATH__
    }
    ```

The `__REMOTE_WEBPACK_PUBLIC_PATH__` will be injected by vue-remote-import package when invoke `remoteImport` function. And you need to import it in your component entry file(e.g. main.js). Just like `import './public-path'`

A whole component entry file content could be:

```
import './public-path'
import HelloWorld from './components/HelloWorld.vue'

export {
  HelloWorld
}
```

Other examples for usage:

In global component definition: `Vue.component(name, () => remoteImport('url'))` or in local component definition: 

```
components: {
  page: () => remoteImport('url')
}
```

How to use
-----------

Install vue-remote-import package:

```
npm install vue-remote-import
```

Import it:

```
import remoteImport from 'vue-remote-import';
```

Use it:

```
() => remoteImport('url') // for default export
() => remoteImport('url', componentName) // for common export
```