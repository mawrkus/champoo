/**
 * Mouse pointer conditioner: resolves a promise when the pointer is n pixels away from an element.
 */
export default class MousePointerConditioner {

  /**
   * @param  {number} [defaultDistanceX=100] in px
   * @param  {number} [defaultDistanceY=100] in px
   * @param  {number} [intervalDelay=250] in ms
   */
  constructor({ defaultDistanceX = 100, defaultDistanceY = 100, intervalDelay = 250 } = {}) {
    this._defaultDistanceX = defaultDistanceX;
    this._defaultDistanceY = defaultDistanceY;
    this._intervalDelay = intervalDelay;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._mouseX = -Infinity;
    this._mouseY = -Infinity;
    this._intervalId = null;
    this._elements = [];
  }

  /**
   * @param  {HtmlElement} element
   * @param  {Array} params [delay in ms]
   * @return {Promise}
   */
  check({ element, params }) {
    const [distanceX = this._defaultDistanceX, distanceY = this._defaultDistanceY] = params;

    if (!this._intervalId) {
      this._intervalId = this._initIntervalCheck();
    }

    return new Promise((resolve) => {
      this._elements.push({
        element,
        distanceX: +distanceX,
        distanceY: +distanceY,
        resolve
      });
    });
  }

  /**
   * @return {number}
   */
  _initIntervalCheck() {
    this._mouseX = -Infinity;
    this._mouseY = -Infinity;
    document.addEventListener('mousemove', this._onMouseMove);

    return window.setInterval(() => {
      this._elements = this._tryToloadElements();

      if (!this._elements.length) {
        window.clearInterval(this._intervalId);
        document.removeEventListener('mousemove', this._onMouseMove);
        this._intervalId = null;
      }
    }, this._intervalDelay);
  }

  /**
   * @param  {MouseEvent} event
   */
  _onMouseMove(event) {
    this._mouseX = event.pageX;
    this._mouseY = event.pageY;
  }

  _tryToloadElements() {
    const remainingElements = this._elements
      .filter(({ element, distanceX, distanceY, resolve }) => {
        if (this._isElementCloseEnough({ element, distanceX, distanceY })) {
          resolve(element);
          return false;
        }

        return true;
      });

    return remainingElements;
  }

  /**
  * @param  {HtmlElement} element
  * @param  {number} distanceX
  * @param  {number} distanceY
   * @return {Boolean}
   */
  _isElementCloseEnough({ element, distanceX, distanceY }) {
    const { top, left, bottom, right } = element.getBoundingClientRect();
    const { pageYOffset, pageXOffset } = window;
    const leftEdge = (left + pageXOffset) - distanceX;
    const rightEdge = (right + pageXOffset) + distanceX;
    const topEdge = (top + pageYOffset) - distanceY;
    const bottomEdge = (bottom + pageYOffset) + distanceY;

    return (
      (this._mouseX >= leftEdge && this._mouseX <= rightEdge) &&
      (this._mouseY >= topEdge && this._mouseY <= bottomEdge)
    );
  }

}
