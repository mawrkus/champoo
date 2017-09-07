/**
 * Timeout conditioner: resolves a promise after x milliseconds.
 */
export default class TimeoutConditioner {

  /**
   * @param  {number} [defaultDelay=0] in ms
   */
  constructor({ defaultDelay = 0 } = {}) {
    this._defaultDelay = defaultDelay;
  }

  /**
   * @param  {HtmlElement} element
   * @param  {Array} params [delay in ms]
   * @return {Promise}
   */
  check({ element, params }) {
    const [delay = this._defaultDelay] = params;

    return new Promise((resolve) => {
      setTimeout(() => resolve(element), delay);
    });
  }

}
