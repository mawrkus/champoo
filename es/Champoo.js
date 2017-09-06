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
   * @return {Promise.<Array>}
   */
  init() {
    const conditionersData = this._gatherConditionersDataFromDom();

    const initsP = Object.keys(conditionersData)
      .map((conditionerName) => {
        const conditionersP = conditionersData[conditionerName]
          .map((data) => {
            const { element, conditioner } = data;
            const validationError = this._validateConditioner({ conditioner });

            if (validationError) {
              this._setElementStatus({ element, status: 'error', error: validationError });
              return Promise.resolve({ element, error: validationError });
            }

            return this._initLazyLoad(data);
          });

        return Promise.all(conditionersP)
          .then(resolutions => ({ conditioner: conditionerName, resolutions }));
      });

    return Promise.all(initsP);
  }

  /**
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
  _gatherConditionersDataFromDom() {
    const lazyElements = document.querySelectorAll(this._selectors.lazy);

    const conditionersDataFromDom = Array.from(lazyElements)
      .reduce((acc, element) => {
        const data = ['conditioner', 'loader']
          .reduce((updatedData, type) => {
            const attributeValue = element.getAttribute(this._attributes[type]) ||
              this._defaults[type];
            const [name, params] = attributeValue.split(':');

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
    const initP = this._conditioners[conditioner.name]
      .check({ element, params: conditioner.params })
      .then(() => {
        const validationError = this._validateLoader({ loader });

        if (validationError) {
          return Promise.reject(validationError);
        }

        return Promise.resolve();
      })
      .then(() => {
        this._setElementStatus({ element, status: 'loading' });
        return this._loaders[loader.name].load({ element });
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
      return new Error(`Unregistered condition "${conditioner.name}"!"`);
    }

    if (!conditionerInstance.check) {
      return new Error(`Invalid condition "${conditioner.name}"!"`);
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
      return new Error(`Unregistered loader "${loader.name}"!"`);
    }

    if (!loaderInstance.load) {
      return new Error(`Invalid loader "${loader.name}"!"`);
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
