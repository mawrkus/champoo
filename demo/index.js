import Champoo from '../es/Champoo';
import { UrlLoader } from '../es/loaders';
import { TimeoutConditioner, ViewportConditioner } from '../es/conditioners';

const champoo = new Champoo({
  conditioners: {
    timeout: new TimeoutConditioner(),
    viewport: new ViewportConditioner()
  },
  loaders: {
    url: new UrlLoader()
  }
});

champoo.init().then((r) => {
  console.log('All lazy elements loaded.', r); // eslint-disable-line
});
