Introduction
-------------

This module is used for load remote VUE component via url. So you can use it in router, global or local component reference. 

How it works
-------------

It'll use import-html-entry package to load html file, so html file just like a minifect descript of your component. And then it'll parse it in order to get html template, styles, and scripts. But for now only scripts is useful. Then it'll execute all scripts and get the result of execution. So you should return components object in remote component project. You can also return multipl components.

For example:

1. In vue router:

```
import remoteLoad from 'vue-remote-component'

...
let router = new Router([
{
  path: '/login',
  name: 'login',
  component: remoteLoad('http://domain/components/login/index.html')
}
])
```

`index.html` can be ommited, and you can also use other name for entry html filename.

If you return multiple components, so you can use `remoteLoad('http://domain/components', 'login'). 