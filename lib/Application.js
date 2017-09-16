'use strict';

/**
 * Module dependencies.
 * @private
 */
const EventEmitter = require('events');
const Request      = require('./Request');
const Server       = require('./Server');

/**
 * Local variables.
 * @private
 */

/**
 * true, если сервер запущен.
 * @type {Boolean}
 */
let _isListening = false;

/**
 * Информация о подключенных сообществах.
 * @type {Object}
 *   @property {Object} <group_id>
 *     @property {String} accessToken      Токен сообщества
 *     @property {String} confirmationCode Код подтверждения адреса сервера
 *     @property {Number} id               ID сообщества
 *     @property {String} secretKey        Секретный ключ
 */
let _communities = Object.create(null);

class Application extends EventEmitter {
  /**
   * Constructor.
   * @return {this}
   * @public
   */
  constructor () {
    super();
  }

  /**
   * @param {Object}
   *   @property {String} accessToken      Токен сообщества
   *   @property {String} confirmationCode Код подтверждения адреса сервера
   *   @property {Number} id               ID сообщества
   *   @property {String} secretKey        Секретный ключ
   * @return {this}
   * @public
   */
  addCommunity (community) {
    _communities[community.id] = community;

    return this;
  }

  /**
   * Запускает сервер.
   * @param  {Object}
   *   @property {Number} port Порт [default = 8080]
   * @return {void}
   * @public
   */
  run ({ port = 8080 }) {
    // Сервер уже запущен.
    if (_isListening) {
      return;
    }

    // Запускаем сервер.
    Server
      .createServer(
        /**
         * Обработчик запросов от ВКонтакте.
         * @param {Object} body
         */
        body => {
          Request.handle.call(this, _communities[body.group_id], body)
        },

        /**
         * Обработчик запросов на подтверждение адреса сервера.
         * @param {Number}   groupId ID сообщества
         * @param {Function} done    Callback(code<String>)
         */
        (groupId, done) => {
          done(_communities[groupId] && _communities[groupId].confirmationCode);
        }
      )
      .listen(port);

    _isListening = true;
  }
}

module.exports = Application;
