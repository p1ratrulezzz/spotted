'use strict';

/**
 * Module dependencies.
 * @private
 */
const fetch = require('node-fetch');

/**
 * Local constants.
 * @private
 */
const MAX_ATTEMPTS = 3;

/**
 * "node-fetch" with auto-retry.
 * @param  {String}  [url='']     URL
 * @param  {Object}  [options={}] Options
 * @param  {Number}  [_attempt=1] Attempt number
 * @return {Promise}
 * @public
 */
function fetchWithAutoRetry (url = '', options = {}, _attempt = 1) {
  return fetch(url, options)
    .catch(error => {
      if (error.name === 'FetchError') {
        if (_attempt > MAX_ATTEMPTS) {
          throw error;
        } else {
          return fetchWithAutoRetry(url, options, ++_attempt);
        }
      }

      throw error;
    });
}

module.exports = fetchWithAutoRetry;
