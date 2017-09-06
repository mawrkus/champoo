import LazyLoader from '../LazyLoader';

function createDom() {
  const div = document.createElement('div');

  div.innerHTML = `
    <div id="1" data-lazy data-lazy-condition="condition-a" data-lazy-loader="loader-1"></div>
    <div id="2" data-lazy data-lazy-condition="condition-b" data-lazy-loader="loader-2"></div>
    <div id="3" data-lazy data-lazy-condition="condition-a" data-lazy-loader="loader-2"></div>
    <div id="4" data-lazy data-lazy-condition="condition-a:param-value" data-lazy-loader="loader-1"></div>
    <!-- not concerned -->
    <div id="5" data-lazy data-lazy-condition="condition-a" data-lazy-loader="loader-x"></div>
    <div id="6" data-lazy data-lazy-condition="condition-x" data-lazy-loader="loader-1"></div>
    <div id="7" data-lazy data-lazy-condition="condition-x" data-lazy-loader="loader-x"></div>
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

describe('LazyLoader', () => {
  it('should be a class with the proper API: init()', () => {
    expect(LazyLoader).toBeInstanceOf(Function);
    expect(LazyLoader.prototype.init).toBeInstanceOf(Function);
  });

  describe('#init()', () => {
    it('should initialize all the conditions referenced in the DOM', (done) => {
      const conditionA = { init: jest.fn(() => Promise.resolve()) };
      const conditionB = { init: jest.fn(() => Promise.resolve()) };

      const lazyLoader = new LazyLoader({
        selectors: {
          lazy: '*[data-lazy]'
        },
        attributes: {
          conditions: 'data-lazy-condition',
          loaders: 'data-lazy-loader',
          status: 'data-lazy-status',
          error: 'data-lazy-error'
        },
        conditions: {
          'condition-a': conditionA,
          'condition-b': conditionB
        }
      });

      const { div1, div2, div3, div4, div5 } = createDom();

      lazyLoader.init()
        .then(() => {
          expect(conditionA.init).toHaveBeenCalledTimes(4);
          expect(conditionA.init).toHaveBeenCalledWith({ element: div1, param: undefined });
          expect(conditionA.init).toHaveBeenCalledWith({ element: div3, param: undefined });
          expect(conditionA.init).toHaveBeenCalledWith({ element: div4, param: 'param-value' });
          expect(conditionA.init).toHaveBeenCalledWith({ element: div5, param: undefined });

          expect(conditionB.init).toHaveBeenCalledTimes(1);
          expect(conditionB.init).toHaveBeenCalledWith({ element: div2, param: undefined });

          done();
        })
        .catch(done.fail);
    });

    it('should trigger the proper loader each time a condition resolves', (done) => {
      const conditionA = { init: jest.fn(() => Promise.resolve()) };
      const loader1 = { load: jest.fn(({ element }) => Promise.resolve(`loaded #${element.id}`)) };
      const loader2 = { load: jest.fn(({ element }) => Promise.resolve(`loaded #${element.id}`)) };

      const lazyLoader = new LazyLoader({
        selectors: {
          lazy: '*[data-lazy]'
        },
        attributes: {
          conditions: 'data-lazy-condition',
          loaders: 'data-lazy-loader',
          status: 'data-lazy-status',
          error: 'data-lazy-error'
        },
        conditions: {
          'condition-a': conditionA
        },
        loaders: {
          'loader-1': loader1,
          'loader-2': loader2
        }
      });

      const { div1, div3, div4 } = createDom();

      lazyLoader.init()
        .then(() => {
          expect(loader1.load).toHaveBeenCalledTimes(2);
          expect(loader1.load).toHaveBeenCalledWith({ element: div1 });
          expect(loader1.load).toHaveBeenCalledWith({ element: div4 });

          expect(loader2.load).toHaveBeenCalledTimes(1);
          expect(loader2.load).toHaveBeenCalledWith({ element: div3 });

          done();
        })
        .catch(done.fail);
    });
  });
});
