'use strict';

/**
 * Module dependencies.
 * @private
 */
const EventEmitter = require('events');
const Client       = require('./Client');
const Server       = require('./Server');
const types        = require('./types');

class Application extends EventEmitter {
  /**
   * Constructor.
   * @return {this}
   * @public
   */
  constructor () {
    super();

    /**
     * Instance of Client.
     * @type {Client}
     */
    this.client = null;

    /**
     * Данные обрабатываемого сообщества.
     * @type {Community}
     * 
     * Community:
     *   {
     *     accessToken<String>
     *     confirmationCode<String>
     *     secretKey<String>
     *   }
     */
    this.community = null;
  }

  /**
   * Запускает сервер.
   * @param  {Object}
   *   @property {Number} [port=8080] Порт
   * @return {void}
   * @public
   */
  run ({ port = 8080 } = {}) {
    if (!this.community) {
      return;
    }

    Server
      .createServer(
        /**
         * Обработчик запросов от ВКонтакте.
         * @param {Object} body Входящие данные
         */
        body => {
          if (!body) {
            return;
          }
        
          // Полученный секретный ключ не совпадает с указанным.
          if (this.community.secretKey && this.community.secretKey !== body.secret) {
            return;
          }
        
          this.emit(body.type, types.createTypeByEvent(body, this.client));
        },

        /**
         * Обработчик запросов на подтверждение адреса сервера.
         * @param {Number}   groupId ID сообщества
         * @param {Function} done    Callback(code<String>)
         */
        (groupId, done) => done(this.community.confirmationCode)
      )
      .listen(port);
  }

  /**
   * Устанавливает данные обрабатываемого сообщества.
   * @param  {Object} [community={}] Данные сообщества
   * @return {void}
   * @public
   */
  setCommunity (community = {}) {
    this.client    = new Client(community.accessToken);
    this.community = community;
  }
}

module.exports = Application;