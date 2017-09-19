# Champoo
[![npm](https://img.shields.io/npm/l/champoo.svg)](https://www.npmjs.org/package/champoo)

Champoo is a lazy loader library.
By separating conditioners & loaders, it gives you the flexibility to easily load pretty much everything, the *lazy way*... It is extensible & has a small footprint.

## Installation

### Node

```bash
yarn add champoo
```
or
```bash
npm install champoo
```

### Browser

The package is available as a UMD module: compatible with AMD, CommonJS and exposing a global variable `Champoo` in `lib/Champoo.js` (less than 1Kb minified and gzipped).

## Usage

```html
<img data-lazy data-lazy-conditioner="timeout(1500)" data-lazy-loader="url(https://www.google.com/logos/doodles/2017/sir-john-cornforths-100th-birthday-4995374627422208.2-2x.jpg)" />

<img data-lazy data-lazy-conditioner="viewport(200)" data-lazy-loader="url(https://www.google.com/logos/doodles/2017/mountain-day-2017-5742983679836160-2x.jpg)" />

<iframe data-lazy data-lazy-conditioner="pointer(10,10)" data-lazy-loader="url(https://www.google.com/logos/2010/pacman10-hp.html)" scrolling="no" width="900px" height="304px" frameborder="0" />

<link rel="stylesheet" data-lazy data-lazy-conditioner="timeout(3000)" data-lazy-loader="url(https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css, href)">
```

```js
import Champoo from 'champoo';
import {
  TimeoutConditioner,
  ViewportConditioner,
  MousePointerConditioner
} from '../es/conditioners';

const champoo = new Champoo({
  conditioners: {
    timeout: new TimeoutConditioner(),
    viewport: new ViewportConditioner(),
    pointer: new MousePointerConditioner()
  },
  loaders: {
    url: new UrlLoader()
  }
});

champoo.init();
```

## Demo

```bash
git clone https://github.com/mawrkus/champoo.git
cd champoo
npm install
npm run server:demo
```

## Custom conditioners creation

A conditioner is a simple class having the following interface:

```js
class AmazingConditioner {

  /**
   * @param  {HtmlElement} element
   * @param  {Array} params The conditioner parameters declared on the HTML element
   * @return {Promise}
   */
  check({ element, params }) {
    return new Promise((resolve, reject) => {
      // call resolve() whenever the element meets the condition(s)
      // call reject() if there's a problem
    });
  }

}
```

By registering it when instantiating Champoo...

```js
const champoo = new Champoo({
  conditioners: {
    amazing: new AmazingConditioner()
  },
  loaders: {
    // ...
  }
});
```

...you can use it in the HTML:

```html
<img data-lazy data-lazy-conditioner="amazing(1,2,3)" />
```

## Custom loaders creation

A loader is a simple class having the following interface:

```js
class AmazingLoader {

  /**
   * @param  {HtmlElement} element
   * @param  {Array} params The loader parameters declared on the HTML element
   * @return {Promise}
   */
  load({ element, params }) {
    return new Promise((resolve, reject) => {
      // call resolve() when the element has been loaded
      // call reject() if there's an error while loading
    });
  }

}
```

By registering it when instantiating Champoo...

```js
const champoo = new Champoo({
  conditioners: {
    // ...
  },
  loaders: {
    amazing: new AmazingLoader()
  }
});
```

...you can use it in the HTML:

```html
<img data-lazy data-lazy-loader="amazing(you,and,me)" />
```

## Contribute

1. Fork it: `git clone https://github.com/mawrkus/champoo.git`
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Added some feature'`
4. Check the build: `yarn run build`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request :D
