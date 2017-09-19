/**
 * Viewport conditioner: resolves a promise when an element is n pixels away from the viewport.
 */
export default class ViewportConditioner {

  /**
   * @param  {number} [defaultDistance=200] in px
   * @param  {number} [intervalDelay=250] in ms
   */
  constructor({ defaultDistance = 200, intervalDelay = 250 } = {}) {
    this._defaultDistance = defaultDistance;
    this._intervalDelay = intervalDelay;

    this._docElement = document.documentElement;
    this._intervalId = null;
    this._elements = [];
  }

  /**
   * @param  {HtmlElement} element
   * @param  {Array} params [delay in ms]
   * @return {Promise}
   */
  check({ element, params }) {
    const [distance = this._defaultDistance] = params;

    if (!this._intervalId) {
      this._intervalId = window.setInterval(() => {
        this._elements = this._tryToloadElements();

        if (!this._elements.length) {
          window.clearInterval(this._intervalId);
          this._intervalId = null;
        }
      }, this._intervalDelay);
    }

    return new Promise((resolve) => {
      this._elements.push({
        element,
        distance: +distance,
        resolve
      });
    });
  }

  _tryToloadElements() {
    const remainingElements = this._elements
      .filter(({ element, distance, resolve }) => {
        if (this._isElementCloseEnough({ element, distance })) {
          resolve(element);
          return false;
        }

        return true;
      });

    return remainingElements;
  }

  /**
  * @param  {HtmlElement} element
  * @param  {number} distance
   * @return {Boolean}
   */
  _isElementCloseEnough({ element, distance }) {
    const { top, left, bottom, right } = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || this._docElement.clientWidth;
    const viewportHeight = window.innerHeight || this._docElement.clientHeight;

    return !(
      top - distance > viewportHeight ||
      bottom + distance < 0 ||
      right + distance < 0 ||
      left - distance > viewportWidth
    );
  }

}
