/**
 * URL loader: sets the "src" attribute of an element to the URL value passed as parameter.
 * Handles load & error events.
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
   * @param  {Array} params [url, optional attribute name]
   * @return {Promise}
   */
  load({ element, params }) {
    const [url, attribute = this._defaultAttribute] = params;

    return new Promise((resolve, reject) => {
      element.addEventListener('error', (/* event */) => {
        const error = new Error(`Cannot load URL "${url}"!`);
        reject(error);
      });

      element.addEventListener('load', event => resolve(event));

      element.setAttribute(attribute, url);
    });
  }

}
