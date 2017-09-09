# Champoo

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

<img data-lazy data-lazy-conditioner="viewport(200)" data-lazy-loader="url(src,https://www.google.com/logos/doodles/2017/mountain-day-2017-5742983679836160-2x.jpg)" />

<iframe data-lazy data-lazy-conditioner="viewport(400)" data-lazy-loader="url(https://www.google.com/logos/2010/pacman10-hp.html)" scrolling="no" width="900px" height="304px" frameborder="0" />

<link rel="stylesheet" data-lazy data-lazy-conditioner="timeout(3000)" data-lazy-loader="url(href,https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css)">
```

```js
import Champoo from 'champoo';
import { TimeoutConditioner, ViewportConditioner } from 'champoo/conditioners';
import { UrlLoader } from 'champoo/loaders';

const champoo = new Champoo({
  conditioners: {
    timeout: new TimeoutConditioner(),
    viewport: new ViewportConditioner()
  },
  loaders: {
    url: new UrlLoader()
  }
});

champoo.init();
```

### Demo

```bash
git clone https://github.com/mawrkus/champoo.git
cd champoo
npm install
npm run server:demo
```
## Contribute

1. Fork it: `git clone https://github.com/mawrkus/champoo.git`
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Added some feature'`
4. Check the build: `yarn run build`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request :D
