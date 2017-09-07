import Champoo from '../Champoo';

function createDom() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div id="1" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-1"></div>
    <div id="2" data-lazy data-lazy-conditioner="conditioner-b" data-lazy-loader="loader-2"></div>
    <div id="3" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-2"></div>
    <div id="4" data-lazy data-lazy-conditioner="conditioner-a(cp1)" data-lazy-loader="loader-1(lp1,lp2)"></div>
    <!-- not concerned -->
    <div id="5" data-lazy data-lazy-conditioner="conditioner-a" data-lazy-loader="loader-x"></div>
    <div id="6" data-lazy data-lazy-conditioner="conditioner-x" data-lazy-loader="loader-1"></div>
    <div id="7" data-lazy data-lazy-conditioner="conditioner-x" data-lazy-loader="loader-x"></div>
  `;

  document.body.appendChild(div);

  return {
    div1: document.getElementById('1'),
    div2: document.getElementById('2'),
    div3: document.getElementById('3'),
    div4: document.getElementById('4'),
    div5: document.getElementById('5'),
    div6: document.getElementById('6'),
    div7: document.getElementById('7')
  };
}

function cleanDom() {
  document.body.innerHTML = '';
}

afterEach(() => cleanDom());

describe('Champoo', () => {
  it('should be a class with the proper API: init()', () => {
    expect(Champoo).toBeInstanceOf(Function);
    expect(Champoo.prototype.init).toBeInstanceOf(Function);
  });

  describe('#init()', () => {
    it('should make all the conditioners referenced in the DOM launch a check', (done) => {
      const conditionerA = { check: jest.fn(() => Promise.resolve()) };
      const conditionerB = { check: jest.fn(() => Promise.resolve()) };

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
        }
      });

      const { div1, div2, div3, div4, div5 } = createDom();

      champoo.init()
        .then(() => {
          expect(conditionerA.check).toHaveBeenCalledTimes(4);
          expect(conditionerA.check).toHaveBeenCalledWith({ element: div1, params: [] });
          expect(conditionerA.check).toHaveBeenCalledWith({ element: div3, params: [] });
          expect(conditionerA.check).toHaveBeenCalledWith({ element: div4, params: ['cp1'] });
          expect(conditionerA.check).toHaveBeenCalledWith({ element: div5, params: [] });

          expect(conditionerB.check).toHaveBeenCalledTimes(1);
          expect(conditionerB.check).toHaveBeenCalledWith({ element: div2, params: [] });

          done();
        })
        .catch(done.fail);
    });

    describe('when a conditioner resolves', () => {
      it('should use the proper loader to load', (done) => {
        const conditionerA = { check: jest.fn(({ element }) => Promise.resolve(`#${element.id} loaded`)) };
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
            'conditioner-a': conditionerA
          },
          loaders: {
            'loader-1': loader1,
            'loader-2': loader2
          }
        });

        const { div1, div3, div4 } = createDom();

        champoo.init()
          .then(() => {
            expect(loader1.load).toHaveBeenCalledTimes(2);
            expect(loader1.load).toHaveBeenCalledWith({ element: div1, params: [] });
            expect(loader1.load).toHaveBeenCalledWith({ element: div4, params: ['lp1', 'lp2'] });

            expect(loader2.load).toHaveBeenCalledTimes(1);
            expect(loader2.load).toHaveBeenCalledWith({ element: div3, params: [] });

            done();
          })
          .catch(done.fail);
      });
    });
  });
});
