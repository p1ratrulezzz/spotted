'use strict';

/**
 * Module dependencies.
 * @private
 */
const Application = require('./lib/Application');
const APIClient   = require('./lib/APIClient');

module.exports           = new Application();
module.exports.APIClient = APIClient;
