const REGEX_PARAMS = /\s*([^(]+)(\((.+)\))?\s*/; // e.g.: "conditioner-name(p1,p2,p3)"

/**
 * Champoo loads pretty much loads everything.
 * Its design is based on the separation of:
 *
 * 1. Conditioners: responsibles for resolving a promise when a DOM element satisfies a given
 * condition (e.g.: becoming visible in the DOM).
 *
 * 2. Loaders: responsibles for actually triggering the loading of the content of that element
 * (e.g.: setting the "src" attribute of an <img> tag).
 */
export default class Champoo {

  /**
   * @param  {Object} [selectors]
   * @param  {string} [selectors.lazy='*[data-lazy]']
   * @param  {Object} [attributes]
   * @param  {string} [attributes.conditioner='data-lazy-condition']
   * @param  {string} [attributes.loader='data-lazy-loader']
   * @param  {string} [attributes.status='data-lazy-status']
   * @param  {string} [attributes.error='data-lazy-error']
   * @param  {Object} [conditioners={}]
   * @param  {Object} [loaders={}]
   * @param  {string} [defaults={}]
   * @param  {string} [defaults.conditioner='']
   * @param  {string} [defaults.loader='']
   */
  constructor({
    selectors = {
      lazy: '[data-lazy]'
    },
    attributes = {
      conditioner: 'data-lazy-conditioner',
      loader: 'data-lazy-loader',
      status: 'data-lazy-status',
      error: 'data-lazy-error'
    },
    conditioners = {},
    loaders = {},
    defaults = {
      conditioner: '',
      loader: ''
    }
  } = {}) {
    this._selectors = selectors;
    this._attributes = attributes;
    this._conditioners = conditioners;
    this._loaders = loaders;
    this._defaults = defaults;
  }

  /**
   * @param {string} [container=document]
   * @return {Promise.<Array>}
   */
  init({ container = document } = {}) {
    const conditionersData = this._gatherConditionersDataFromDom({ container });

    const initsP = Object.keys(conditionersData)
      .map((conditionerName) => {
        const conditionersP = conditionersData[conditionerName]
          .map(data => this._initLazyLoad(data));

        return Promise.all(conditionersP)
          .then(resolutions => ({ conditioner: conditionerName, resolutions }));
      });

    return Promise.all(initsP);
  }

  /**
   * @param {HtmlElement} container
   * @return {Object}
   * {
   *   conditionerName: [{
   *     element,
   *     conditioner: { name, params },
   *     loader: { name, params }
   *   }, {} {} {}],
   *   ...
   * }
   */
  _gatherConditionersDataFromDom({ container }) {
    const lazyElements = Array.from(container.querySelectorAll(this._selectors.lazy));
    const lazyElementsToInitialize = lazyElements
      .filter(lazyElement => !lazyElement.getAttribute(this._attributes.status));

    const conditionersDataFromDom = lazyElementsToInitialize
      .reduce((acc, element) => {
        const data = ['conditioner', 'loader']
          .reduce((updatedData, type) => {
            const attributeValue = element.getAttribute(this._attributes[type]) ||
              this._defaults[type];

            const [, name, , rawParams] = attributeValue.match(REGEX_PARAMS) || [];
            const params = rawParams ? rawParams.split(',').map(p => p.trim()) : [];

            updatedData[type] = { name, params };

            return updatedData;
          }, { element });

        const conditionerName = data.conditioner.name;
        acc[conditionerName] = acc[conditionerName] || [];
        acc[conditionerName].push(data);

        return acc;
      }, {});

    return conditionersDataFromDom;
  }

  /**
   * @param  {HtmlElement} element
   * @param  {Object} conditioner
   * @param  {Object} loader
   * @return {Promise.<Object>}
   */
  _initLazyLoad({ element, conditioner, loader }) {
    const invalidConditionerError = this._validateConditioner({ conditioner });

    if (invalidConditionerError) {
      this._setElementStatus({ element, status: 'error', error: invalidConditionerError });
      return Promise.resolve({ element, error: invalidConditionerError });
    }

    this._setElementStatus({ element, status: 'init' });

    const initP = this._conditioners[conditioner.name]
      .check({ element, params: conditioner.params })
      .then(() => {
        const invalidLoaderError = this._validateLoader({ loader });

        if (invalidLoaderError) {
          return Promise.reject(invalidLoaderError);
        }

        return Promise.resolve();
      })
      .then(() => {
        this._setElementStatus({ element, status: 'loading' });
        return this._loaders[loader.name].load({ element, params: loader.params });
      })
      .then((loaderResponse) => {
        this._setElementStatus({ element, status: 'loaded' });
        return Promise.resolve({ element, loaderResponse });
      })
      .catch((error) => {
        this._setElementStatus({ element, status: 'error', error });
        return Promise.resolve({ element, error });
      });

    return initP;
  }

  /**
   * @param  {Object} conditioner
   * @return {Error|null}
   */
  _validateConditioner({ conditioner }) {
    const conditionerInstance = this._conditioners[conditioner.name];

    if (!conditionerInstance) {
      return new Error(`Unregistered conditioner "${conditioner.name}"!`);
    }

    if (!conditionerInstance.check) {
      return new Error(`Invalid conditioner "${conditioner.name}"!`);
    }

    return null;
  }

  /**
   * @param  {Object} loader
      * @return {Error|null}
   */
  _validateLoader({ loader }) {
    const loaderInstance = this._loaders[loader.name];

    if (!loaderInstance) {
      return new Error(`Unregistered loader "${loader.name}"!`);
    }

    if (!loaderInstance.load) {
      return new Error(`Invalid loader "${loader.name}"!`);
    }

    return null;
  }

  /**
   * @param {HtmlElement} element
   * @param {string} status 'loading', 'loaded' or 'error'
   * @param {Error} [error]
   */
  _setElementStatus({ element, status, error }) {
    element.setAttribute(this._attributes.status, status);

    if (error) {
      element.setAttribute(this._attributes.error, error.toString());
    }
  }

}
