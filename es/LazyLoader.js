/**
 * Lazy loader.
 * Pretty much loads everything.
 */
export default class LazyLoader {

  /**
   * @param  {Object} [selectors]
   * @param  {string} [selectors.lazy='*[data-lazy]']
   * @param  {Object} [attributes]
   * @param  {string} [attributes.conditions='data-lazy-condition']
   * @param  {string} [attributes.loaders='data-lazy-loader']
   * @param  {string} [attributes.status='data-lazy-status']
   * @param  {string} [attributes.error='data-lazy-error']
   * @param  {Object} [conditions={}]
   * @param  {string} [defaultCondition='']
   * @param  {Object} [loaders={}]
   * @param  {string} [defaultLoader='']
   */
  constructor({
    selectors = {
      lazy: '*[data-lazy]'
    },
    attributes = {
      conditions: 'data-lazy-condition',
      loaders: 'data-lazy-loader',
      status: 'data-lazy-status',
      error: 'data-lazy-error'
    },
    conditions = {},
    defaultCondition = '',
    loaders = {},
    defaultLoader = ''
  } = {}) {
    this._selectors = selectors;
    this._attributes = attributes;
    this._conditions = conditions;
    this._defaultCondition = defaultCondition;
    this._loaders = loaders;
    this._defaultLoader = defaultLoader;
  }

  /**
   * @return {Promise.<Array>}
   */
  init() {
    const conditionsData = this._gatherConditionsDataFromDom();

    const initsP = Object.keys(conditionsData)
      .map((conditionName) => {
        const conditionsP = conditionsData[conditionName]
          .map((data) => {
            const { element } = data;
            const validationError = this._validateCondition({ conditionName });

            if (validationError) {
              this._setElementStatus({ element, status: 'error', error: validationError });
              return Promise.resolve({ element, error: validationError });
            }

            return this._initLazyLoad(data);
          });

        return Promise.all(conditionsP)
          .then(resolutions => ({ condition: conditionName, resolutions }));
      });

    return Promise.all(initsP);
  }

  /**
   * @return {Object} { name: [{element, conditionName, conditionParam, loaderName }], ... }
   */
  _gatherConditionsDataFromDom() {
    const lazyElements = document.querySelectorAll(this._selectors.lazy);

    const conditionsDataFromDom = Array.from(lazyElements)
      .reduce((acc, element) => {
        const conditionAttributeValue = element.getAttribute(this._attributes.conditions) ||
          this._defaultCondition;
        const [conditionName, conditionParam] = conditionAttributeValue.split(':');

        const loaderAttributeValue = element.getAttribute(this._attributes.loaders) ||
          this._defaultLoader;
        const loaderName = loaderAttributeValue;

        acc[conditionName] = acc[conditionName] || [];
        acc[conditionName].push({ element, conditionName, conditionParam, loaderName });

        return acc;
      }, {});

    return conditionsDataFromDom;
  }

  /**
   * @param  {HtmlElement} element
   * @param  {string} conditionName
   * @param  {string} conditionParam
   * @param  {string} loaderName
   * @return {Promise.<Object>}
   */
  _initLazyLoad({ element, conditionName, conditionParam, loaderName }) {
    const initP = this._conditions[conditionName]
      .init({ element, param: conditionParam })
      .then(() => {
        const validationError = this._validateLoader({ loaderName, element });

        if (validationError) {
          return Promise.reject(validationError);
        }

        return Promise.resolve();
      })
      .then(() => {
        this._setElementStatus({ element, status: 'loading' });
        return this._loaders[loaderName].load({ element });
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
   * @param  {string} conditionName
   * @return {Error|null}
   */
  _validateCondition({ conditionName }) {
    const condition = this._conditions[conditionName];

    if (!condition) {
      return new Error(`Unregistered condition "${conditionName}"!"`);
    }

    if (!condition.init) {
      return new Error(`Invalid condition "${conditionName}"!"`);
    }

    return null;
  }

  /**
   * @param  {string} loaderName
      * @return {Error|null}
   */
  _validateLoader({ loaderName }) {
    const loader = this._loaders[loaderName];

    if (!loader) {
      return new Error(`Unregistered loader "${loaderName}"!"`);
    }

    if (!loader.load) {
      return new Error(`Invalid loader "${loaderName}"!"`);
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
