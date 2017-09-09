import Champoo from '../Champoo';

function createDom() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div id="container-1">
      <div id="1" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-1"></div>
      <div id="2" data-lazy data-lazy-conditioner="conditioner-b" data-lazy-loader="loader-2"></div>
    </div>
    <div id="container-2">
      <div id="3" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-2"></div>
      <div id="4" data-lazy data-lazy-conditioner="conditioner-a(cp1)" data-lazy-loader="loader-1(lp1,lp2)"></div>
    </div>
    <div id="container-3">
      <div id="5" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-1"></div>
      <div id="6" data-lazy data-lazy-conditioner="conditioner-x" data-lazy-loader="loader-1"></div>
    </div>
    <div id="container-4">
      <div id="7" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-2"></div>
      <div id="8" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-x"></div>
    </div>
  `;

  document.body.appendChild(div);

  return {
    container1: document.getElementById('container-1'),
    div1: document.getElementById('1'),
    div2: document.getElementById('2'),
    container2: document.getElementById('container-2'),
    div3: document.getElementById('3'),
    div4: document.getElementById('4'),
    container3: document.getElementById('container-3'),
    div5: document.getElementById('5'),
    div6: document.getElementById('6'),
    container4: document.getElementById('container-4'),
    div7: document.getElementById('7'),
    div8: document.getElementById('8')
  };
}

function cleanDom() {
  document.body.innerHTML = '';
}

function createChampoo() {
  const conditionerA = { check: jest.fn(() => Promise.resolve()) };
  const conditionerB = { check: jest.fn(() => Promise.resolve()) };
  const loader1 = { load: jest.fn(({ element }) => Promise.resolve(`loaded #${element.id}`)) };
  const loader2 = { load: jest.fn(({ element }) => Promise.resolve(`loaded #${element.id}`)) };

  const champoo = new Champoo({
    selectors: {
      lazy: '*[data-lazy]'
    },
    attributes: {
      conditioner: 'data-lazy-conditioner',
      loader: 'data-lazy-loader',
      status: 'data-lazy-status',
      error: 'data-lazy-error'
    },
    conditioners: {
      'conditioner-a': conditionerA,
      'conditioner-b': conditionerB
    },
    loaders: {
      'loader-1': loader1,
      'loader-2': loader2
    }
  });

  return {
    conditionerA,
    conditionerB,
    loader1,
    loader2,
    champoo
  };
}

describe('Champoo', () => {
  it('should be a class with the proper API: init()', () => {
    expect(Champoo).toBeInstanceOf(Function);
    expect(Champoo.prototype.init).toBeInstanceOf(Function);
  });

  describe('#init({ container = document })', () => {
    afterEach(() => cleanDom());

    describe('when omitting to pass the "container" parameter', () => {
      it('should make all the conditioners referenced in the document launch a check', (done) => {
        const { conditionerA, conditionerB, champoo } = createChampoo();
        const { div1, div2, div3, div4, div5, div7, div8 } = createDom();

        champoo.init()
          .then(() => {
            expect(conditionerA.check).toHaveBeenCalledTimes(6);
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div1, params: [] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div3, params: [] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div4, params: ['cp1'] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div5, params: [] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div7, params: [] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div8, params: [] });

            expect(conditionerB.check).toHaveBeenCalledTimes(1);
            expect(conditionerB.check).toHaveBeenCalledWith({ element: div2, params: [] });

            done();
          })
          .catch(done.fail);
      });
    });

    describe('when passing a "container" parameter', () => {
      it('should make only the conditioners referenced in this container launch a check', (done) => {
        const { conditionerA, conditionerB, champoo } = createChampoo();
        const { container2, div3, div4 } = createDom();

        champoo.init({ container: container2 })
          .then(() => {
            expect(conditionerA.check).toHaveBeenCalledTimes(2);
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div3, params: [] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div4, params: ['cp1'] });

            expect(conditionerB.check).not.toHaveBeenCalled();

            done();
          })
          .catch(done.fail);
      });
    });

    describe('when called several times', () => {
      it('should not provoke more than one check per conditioner', (done) => {
        const { conditionerA, conditionerB, champoo } = createChampoo();
        const { container2, div3, div4 } = createDom();

        champoo.init({ container: container2 })
          .then(() => champoo.init({ container: container2 }))
          .then(() => champoo.init({ container: container2 }))
          .then(() => {
            expect(conditionerA.check).toHaveBeenCalledTimes(2);
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div3, params: [] });
            expect(conditionerA.check).toHaveBeenCalledWith({ element: div4, params: ['cp1'] });

            expect(conditionerB.check).not.toHaveBeenCalled();

            done();
          })
          .catch(done.fail);
      });

      describe('when called the 1st time', () => {
        it('should set the "status" attribute of all the lazy elements to "init"', (done) => {
          const { champoo } = createChampoo();
          const { container2, div3, div4 } = createDom();

          const initP = champoo.init({ container: container2 });

          expect(div3.getAttribute('data-lazy-status')).toBe('init');
          expect(div4.getAttribute('data-lazy-status')).toBe('init');

          initP.then(() => done()).catch(done.fail);
        });
      });
    });

    describe('when a conditioner referenced in the DOM is not registered', () => {
      it('should set the "status" attribute of the corresponding element to "error"', (done) => {
        const { champoo } = createChampoo();
        const { container3, div5, div6 } = createDom();

        champoo.init({ container: container3 })
          .then(() => {
            expect(div5.getAttribute('data-lazy-status')).not.toBe('error');
            expect(div6.getAttribute('data-lazy-status')).toBe('error');
            done();
          })
          .catch(done.fail);
      });

      it('should set the "error" attribute of the corresponding element', (done) => {
        const { champoo } = createChampoo();
        const { container3, div5, div6 } = createDom();

        champoo.init({ container: container3 })
          .then(() => {
            expect(div5.getAttribute('data-lazy-error')).toBeNull();
            expect(div6.getAttribute('data-lazy-error')).toEqual(expect.any(String));
            done();
          })
          .catch(done.fail);
      });
    });

    describe('when a conditioner referenced on an element resolves', () => {
      it('should make the loader referenced on this element launch a load', (done) => {
        const { loader1, loader2, champoo } = createChampoo();
        const { div1, div2, div3, div4, div5, div7 } = createDom();

        champoo.init()
          .then(() => {
            expect(loader1.load).toHaveBeenCalledTimes(3);
            expect(loader1.load).toHaveBeenCalledWith({ element: div1, params: [] });
            expect(loader1.load).toHaveBeenCalledWith({ element: div4, params: ['lp1', 'lp2'] });
            expect(loader1.load).toHaveBeenCalledWith({ element: div5, params: [] });

            expect(loader2.load).toHaveBeenCalledTimes(3);
            expect(loader2.load).toHaveBeenCalledWith({ element: div2, params: [] });
            expect(loader2.load).toHaveBeenCalledWith({ element: div3, params: [] });
            expect(loader2.load).toHaveBeenCalledWith({ element: div7, params: [] });

            done();
          })
          .catch(done.fail);
      });
    });

    describe('when a conditioner referenced on an element rejects', () => {
      it('should set the "status" attribute of this element to "error"', (done) => {
        const { container1, div1 } = createDom();

        const champoo = new Champoo({
          selectors: {
            lazy: '*[data-lazy]'
          },
          attributes: {
            conditioner: 'data-lazy-conditioner',
            loader: 'data-lazy-loader',
            status: 'data-lazy-status',
            error: 'data-lazy-error'
          },
          conditioners: {
            'conditioner-a': { check: jest.fn(() => Promise.reject(new Error('Ooops!'))) }
          },
          loaders: {
            'loader-1': { load: jest.fn(() => Promise.resolve()) }
          }
        });

        champoo.init({ container: container1 })
          .then(() => {
            expect(div1.getAttribute('data-lazy-status')).toBe('error');
            done();
          })
          .catch(done.fail);
      });

      it('should set the "error" attribute of this element', (done) => {
        const { container1, div1 } = createDom();

        const champoo = new Champoo({
          selectors: {
            lazy: '*[data-lazy]'
          },
          attributes: {
            conditioner: 'data-lazy-conditioner',
            loader: 'data-lazy-loader',
            status: 'data-lazy-status',
            error: 'data-lazy-error'
          },
          conditioners: {
            'conditioner-a': { check: jest.fn(() => Promise.reject(new Error('Ooops!'))) }
          },
          loaders: {
            'loader-1': { load: jest.fn(() => Promise.resolve()) }
          }
        });

        champoo.init({ container: container1 })
          .then(() => {
            expect(div1.getAttribute('data-lazy-error')).toEqual(expect.any(String));
            done();
          })
          .catch(done.fail);
      });
    });

    describe('when a loader referenced in the DOM is not registered', () => {
      it('should set the "status" attribute of the corresponding element to "error"', (done) => {
        const { champoo } = createChampoo();
        const { container4, div7, div8 } = createDom();

        champoo.init({ container: container4 })
          .then(() => {
            expect(div7.getAttribute('data-lazy-status')).not.toBe('error');
            expect(div8.getAttribute('data-lazy-status')).toBe('error');
            done();
          })
          .catch(done.fail);
      });

      it('should set the "error" attribute of the corresponding element', (done) => {
        const { champoo } = createChampoo();
        const { container4, div7, div8 } = createDom();

        champoo.init({ container: container4 })
          .then(() => {
            expect(div7.getAttribute('data-lazy-error')).toBeNull();
            expect(div8.getAttribute('data-lazy-error')).toEqual(expect.any(String));
            done();
          })
          .catch(done.fail);
      });
    });

    describe('before making a loader referenced on an element loading', () => {
      it('should set the "status" attribute of this element to "loading"', (done) => {
        const { container1 } = createDom();

        const champoo = new Champoo({
          selectors: {
            lazy: '*[data-lazy]'
          },
          attributes: {
            conditioner: 'data-lazy-conditioner',
            loader: 'data-lazy-loader',
            status: 'data-lazy-status',
            error: 'data-lazy-error'
          },
          conditioners: {
            'conditioner-a': { check: jest.fn(() => Promise.resolve()) }
          },
          loaders: {
            'loader-1': {
              load: jest.fn(({ element }) => {
                expect(element.getAttribute('data-lazy-status').toBe('loading'));
                return Promise.resolve();
              })
            }
          }
        });

        champoo.init({ container: container1 })
          .then(() => done())
          .catch(done.fail);
      });
    });

    describe('when a loader referenced on an element resolves', () => {
      it('should set the "status" attribute of this element to "loaded"', (done) => {
        const { container1, div1 } = createDom();

        const champoo = new Champoo({
          selectors: {
            lazy: '*[data-lazy]'
          },
          attributes: {
            conditioner: 'data-lazy-conditioner',
            loader: 'data-lazy-loader',
            status: 'data-lazy-status',
            error: 'data-lazy-error'
          },
          conditioners: {
            'conditioner-a': { check: jest.fn(() => Promise.resolve()) }
          },
          loaders: {
            'loader-1': { load: jest.fn(() => Promise.resolve()) }
          }
        });

        champoo.init({ container: container1 })
          .then(() => {
            expect(div1.getAttribute('data-lazy-status')).toBe('loaded');
            done();
          })
          .catch(done.fail);
      });
    });

    describe('when a loader referenced on an element rejects', () => {
      it('should set the "status" attribute of this element to "error"', (done) => {
        const { container1, div1 } = createDom();

        const champoo = new Champoo({
          selectors: {
            lazy: '*[data-lazy]'
          },
          attributes: {
            conditioner: 'data-lazy-conditioner',
            loader: 'data-lazy-loader',
            status: 'data-lazy-status',
            error: 'data-lazy-error'
          },
          conditioners: {
            'conditioner-a': { check: jest.fn(() => Promise.resolve()) }
          },
          loaders: {
            'loader-1': { load: jest.fn(() => Promise.reject(new Error('Ooops!'))) }
          }
        });

        champoo.init({ container: container1 })
          .then(() => {
            expect(div1.getAttribute('data-lazy-status')).toBe('error');
            done();
          })
          .catch(done.fail);
      });

      it('should set the "error" attribute of this element', (done) => {
        const { container1, div1 } = createDom();

        const champoo = new Champoo({
          selectors: {
            lazy: '*[data-lazy]'
          },
          attributes: {
            conditioner: 'data-lazy-conditioner',
            loader: 'data-lazy-loader',
            status: 'data-lazy-status',
            error: 'data-lazy-error'
          },
          conditioners: {
            'conditioner-a': { check: jest.fn(() => Promise.resolve()) }
          },
          loaders: {
            'loader-1': { load: jest.fn(() => Promise.reject(new Error('Ooops!'))) }
          }
        });

        champoo.init({ container: container1 })
          .then(() => {
            expect(div1.getAttribute('data-lazy-error')).toEqual(expect.any(String));
            done();
          })
          .catch(done.fail);
      });
    });

    it('should resolves when all loaders have resolved or rejected', (done) => {
      const { container2 } = createDom();

      let hasLoader1Resolved = false;
      let hasLoader2Resolved = false;

      const champoo = new Champoo({
        selectors: {
          lazy: '*[data-lazy]'
        },
        attributes: {
          conditioner: 'data-lazy-conditioner',
          loader: 'data-lazy-loader',
          status: 'data-lazy-status',
          error: 'data-lazy-error'
        },
        conditioners: {
          'conditioner-a': { check: jest.fn(() => Promise.resolve()) }
        },
        loaders: {
          'loader-1': {
            load: jest.fn(() => {
              hasLoader1Resolved = true;
              return Promise.resolve();
            })
          },
          'loader-2': {
            load: jest.fn(() => {
              hasLoader2Resolved = true;
              return Promise.reject();
            })
          }
        }
      });

      champoo.init({ container: container2 })
        .then(() => {
          expect(hasLoader1Resolved).toBe(true);
          expect(hasLoader2Resolved).toBe(true);
          done();
        })
        .catch(done.fail);
    });

    it('should resolve with an array containing all the resolutions data per conditioner', (done) => {
      const { div1, div2, div3, div4, div5, div6, div7, div8 } = createDom();
      const { champoo } = createChampoo();

      champoo.init()
        .then((response) => {
          const expectedResponse = [
            {
              conditioner: 'conditioner-a',
              resolutions: [
                { element: div1, loaderResponse: 'loaded #1' },
                { element: div3, loaderResponse: 'loaded #3' },
                { element: div4, loaderResponse: 'loaded #4' },
                { element: div5, loaderResponse: 'loaded #5' },
                { element: div7, loaderResponse: 'loaded #7' },
                { element: div8, error: expect.any(Error) }
              ]
            },
            {
              conditioner: 'conditioner-b',
              resolutions: [
                { element: div2, loaderResponse: 'loaded #2' }
              ]
            },
            {
              conditioner: 'conditioner-x',
              resolutions: [
                { element: div6, error: expect.any(Error) }
              ]
            }
          ];

          expect(response).toEqual(expectedResponse);

          done();
        })
        .catch(done.fail);
    });
  });
});
