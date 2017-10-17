'use strict';

/**
 * Module dependencies.
 * @private
 */
const Application = require('./Application');

/**
 * Application Singleton.
 * @type {Application}
 */
let _application = null;

/**
 * Возвращает экземпляр Application.
 * @return {Application}
 */
function createApplication () {
  if (_application === null) {
    _application = new Application();
  }

  return _application;
}

module.exports = createApplication;
