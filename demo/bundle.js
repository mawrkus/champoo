/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _LazyLoader = __webpack_require__(1);

var _LazyLoader2 = _interopRequireDefault(_LazyLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lazyLoader = new _LazyLoader2.default();

lazyLoader.init();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Lazy loader.
 * Pretty much loads everything.
 */
var LazyLoader = function () {

  /**
   * @param  {Object} [selectors]
   * @param  {string} [selectors.lazy='*[data-lazy]']
   * @param  {Object} [attributes]
   * @param  {string} [attributes.conditions='data-lazy-condition']
   * @param  {string} [attributes.loaders='data-lazy-loader']
   * @param  {string} [attributes.status='data-lazy-status']
   * @param  {string} [attributes.error='data-lazy-error']
   * @param  {Object} [conditions={}]
   * @param  {Object} [loaders={}]
   */
  function LazyLoader() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$selectors = _ref.selectors,
        selectors = _ref$selectors === undefined ? {
      lazy: '*[data-lazy]'
    } : _ref$selectors,
        _ref$attributes = _ref.attributes,
        attributes = _ref$attributes === undefined ? {
      conditions: 'data-lazy-condition',
      loaders: 'data-lazy-loader',
      status: 'data-lazy-status',
      error: 'data-lazy-error'
    } : _ref$attributes,
        _ref$conditions = _ref.conditions,
        conditions = _ref$conditions === undefined ? {} : _ref$conditions,
        _ref$loaders = _ref.loaders,
        loaders = _ref$loaders === undefined ? {} : _ref$loaders;

    _classCallCheck(this, LazyLoader);

    this._selectors = selectors;
    this._attributes = attributes;
    this._conditions = conditions;
    this._loaders = loaders;
  }

  /**
   * @return {Promise.<Array>}
   */


  _createClass(LazyLoader, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var conditionsData = this._gatherConditionsDataFromDom();

      var initsP = Object.keys(conditionsData).map(function (conditionName) {
        var conditionsP = conditionsData[conditionName].map(function (data) {
          var element = data.element;

          var validationError = _this._validateCondition({ conditionName: conditionName, element: element });

          if (validationError) {
            _this._setElementStatus({ element: element, status: 'error', error: validationError });
            return Promise.resolve({ element: element, error: validationError });
          }

          return _this._initLazyLoad(data);
        });

        return Promise.all(conditionsP).then(function (resolutions) {
          return { condition: conditionName, resolutions: resolutions };
        });
      });

      return Promise.all(initsP);
    }

    /**
     * @return {Object} { name: [{element, conditionName, conditionParam, loaderName }], ... }
     */

  }, {
    key: '_gatherConditionsDataFromDom',
    value: function _gatherConditionsDataFromDom() {
      var _this2 = this;

      var lazyElements = document.querySelectorAll(this._selectors.lazy);

      var conditionsDataFromDom = Array.from(lazyElements).reduce(function (acc, element) {
        var conditionAttributeValue = element.getAttribute(_this2._attributes.conditions);

        var _conditionAttributeVa = conditionAttributeValue.split(':'),
            _conditionAttributeVa2 = _slicedToArray(_conditionAttributeVa, 2),
            conditionName = _conditionAttributeVa2[0],
            conditionParam = _conditionAttributeVa2[1];

        var loaderAttributeValue = element.getAttribute(_this2._attributes.loaders);
        var loaderName = loaderAttributeValue;

        acc[conditionName] = acc[conditionName] || [];
        acc[conditionName].push({ element: element, conditionName: conditionName, conditionParam: conditionParam, loaderName: loaderName });

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

  }, {
    key: '_initLazyLoad',
    value: function _initLazyLoad(_ref2) {
      var _this3 = this;

      var element = _ref2.element,
          conditionName = _ref2.conditionName,
          conditionParam = _ref2.conditionParam,
          loaderName = _ref2.loaderName;

      var initP = this._conditions[conditionName].init({ element: element, param: conditionParam }).then(function () {
        var validationError = _this3._validateLoader({ loaderName: loaderName, element: element });

        if (validationError) {
          return Promise.reject(validationError);
        }

        return Promise.resolve();
      }).then(function () {
        _this3._setElementStatus({ element: element, status: 'loading' });
        return _this3._loaders[loaderName].load({ element: element });
      }).then(function (loaderResponse) {
        _this3._setElementStatus({ element: element, status: 'loaded' });
        return Promise.resolve({ element: element, loaderResponse: loaderResponse });
      }).catch(function (error) {
        _this3._setElementStatus({ element: element, status: 'error', error: error });
        return Promise.resolve({ element: element, error: error });
      });

      return initP;
    }

    /**
     * @param  {string} conditionName
     * @return {Error|null}
     */

  }, {
    key: '_validateCondition',
    value: function _validateCondition(_ref3) {
      var conditionName = _ref3.conditionName;

      var condition = this._conditions[conditionName];

      if (!condition) {
        return new Error('Unregistered condition "' + conditionName + '"!"');
      }

      if (!condition.init) {
        return new Error('Invalid condition "' + conditionName + '"!"');
      }

      return null;
    }

    /**
     * @param  {string} loaderName
        * @return {Error|null}
     */

  }, {
    key: '_validateLoader',
    value: function _validateLoader(_ref4) {
      var loaderName = _ref4.loaderName;

      var loader = this._loaders[loaderName];

      if (!loader) {
        return new Error('Unregistered loader "' + loaderName + '"!"');
      }

      if (!loader.load) {
        return new Error('Invalid loader "' + loaderName + '"!"');
      }

      return null;
    }

    /**
     * @param {HtmlElement} element
     * @param {string} status 'loading', 'loaded' or 'error'
     * @param {Error} [error]
     */

  }, {
    key: '_setElementStatus',
    value: function _setElementStatus(_ref5) {
      var element = _ref5.element,
          status = _ref5.status,
          error = _ref5.error;

      element.setAttribute(this._attributes.status, status);
      if (error) {
        element.setAttribute(this._attributes.error, error.toString());
      }
    }
  }]);

  return LazyLoader;
}();

exports.default = LazyLoader;

/***/ })
/******/ ]);