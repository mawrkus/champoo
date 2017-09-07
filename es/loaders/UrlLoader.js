/**
 * URL loader: sets the attribute to the value passed as parameters.
 */
export default class UrlLoader {

  /**
   * @param  {string} [defaultAttribute='src']
   */
  constructor({ defaultAttribute = 'src' } = {}) {
    this._defaultAttribute = defaultAttribute;
  }

  /**
   * @param  {HtmlElement} element
   * @param  {Array} params [attribute name, attribute value]
   * @return {Promise}
   */
  load({ element, params }) {
    let [attribute, url] = params;

    if (params.length === 1) {
      url = attribute;
      attribute = this._defaultAttribute;
    }

    return new Promise((resolve, reject) => {
      element.onerror = (/* event */) => {
        const error = new Error(`Cannot load URL "${url}"!`);
        reject(error);
      };

      element.onload = (event) => {
        resolve(event);
      };

      element.setAttribute(attribute, url);
    });
  }

}
