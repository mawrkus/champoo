/**
 * FB comments loader.
 */
export default class FaceBookCommentsLoader {

  /**
   * @param  {string} [sdkVersion='2.10']
   * @param  {string} [defaultLocale='en_US']
   */
  constructor({ sdkVersion = '2.10', defaultLocale = 'en_US' } = {}) {
    this._sdkVersion = sdkVersion;
    this._defaultLocale = defaultLocale;
  }

  /**
   * @param  {Array} params [locale, sdk version]
   * @return {Promise}
   */
  load({ params }) {
    const [locale = this._defaultLocale, version = this._sdkVersion] = params;

    return new Promise((resolve) => {
      window.fbAsyncInit = () => {
        window.FB.Event.subscribe('xfbml.render', (event) => {
          resolve(event);
        });
      };

      // straight from the code generator
      /* eslint-disable */
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = `//connect.facebook.net/${locale}/sdk.js#xfbml=1&version=v${version}`;
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
      /* eslint-enable */
    });
  }

}
