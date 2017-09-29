import Champoo from '../es/Champoo';
import { UrlLoader } from '../es/loaders';
import { TimeoutConditioner, ViewportConditioner, MousePointerConditioner } from '../es/conditioners';

import FaceBookCommentsLoader from './FaceBookCommentsLoader';

const champoo = new Champoo({
  conditioners: {
    timeout: new TimeoutConditioner(),
    viewport: new ViewportConditioner(),
    pointer: new MousePointerConditioner()
  },
  loaders: {
    'url': new UrlLoader(),
    'fb-comments': new FaceBookCommentsLoader()
  }
});

champoo.init().then((r) => {
  console.log('All lazy elements loaded.', r); // eslint-disable-line
});
