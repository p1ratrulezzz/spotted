'use strict';

/**
 * Module dependencies.
 * @private
 */
const { randomBytes } = require('crypto');
const EventEmitter    = require('events');
const fs              = require('fs');
const fetch           = require('node-fetch');
const APIClient       = require('./APIClient');
const Server          = require('./Server');
const VKRequest       = require('./VKRequest');

/**
 * Local variables.
 * @private
 */
let _server      = null;
let _isListening = false;

/**
 * Community info.
 * @type {Object}
 *   @property {Object} <group_id>
 *     @property {String} confirmationCode
 *     @property {String} accessToken
 *     @property {String} secretKey
 */
let _communityInfos = Object.create(null);

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
   * Запускает приложение.
   * @param  {Object}
   *   @property {Array of CommunityToken} tokens Токены сообществ
   *   @property {Number}                  port   Порт
   * @return {Promise}
   * @public
   *
   * CommunityToken:
   *   [
   *     group_id, 
   *     access_token
   *   ]
   */
  run ({ tokens = [], port = 9005 }) {
    // Сервер уже запущен.
    if (_isListening) 
      return Promise.resolve(this);

    /**
     * Обработчик запросов ВКонтакте.
     * @param   {Object} body Входящие данные
     * @return  {void}
     * @private
     */
    const requestHandler = body => {
      const secretKey = _communityInfos[body.group_id].secretKey;

      // Полученный секретный ключ не совпадает с указанным.
      if (secretKey && secretKey !== body.secret) 
        return;

      this.emit(body.type, new VKRequest(_communityInfos[body.group_id].accessToken, body));
    }

    /**
     * Обработчик "подтверждений".
     * @param   {Number}   group_id ID сообщества
     * @param   {Function} done     Callback(response)
     * @return  {void}
     * @private
     */
    const confirmationHandler = (group_id, done) => done(_communityInfos[group_id].confirmationCode);

    let client = new APIClient();

    return Promise.all(
      tokens.map(([group_id, access_token]) => {
        const communitySecretKey = randomBytes(12).toString('hex');

        _communityInfos[group_id]             = Object.create(null);
        _communityInfos[group_id].secretKey   = communitySecretKey;
        _communityInfos[group_id].accessToken = access_token;

        return client.call('execute', {
          access_token, 
          code: `API.groups.setCallbackServerSettings({ group_id: ${group_id}, secret_key: "${communitySecretKey}" });` + 
                `return API.groups.getCallbackConfirmationCode({ group_id: ${group_id} });`
        })
        .then(communityConfirmationCode => {
          _communityInfos[group_id].confirmationCode = communityConfirmationCode.code;

          return true;
        })
        .catch(error => {
          // @todo
          console.log('Error:', error);

          return false;
        });
      })
    )
    .then(results => {
      const anyErrors = results.some(elm => elm !== true);

      if (anyErrors) 
        throw 'Errors getting community infos.';

      return;
    })
    .then(() => {
      // Запускаем сервер.
      _server = Server.createServer(requestHandler, confirmationHandler);
      _server.listen(port);
      _isListening = true;

      // Получаем внешний IP-адрес сервера.
      return fetch('https://api.ipify.org/');
    })
    .then(response => response.text())
    .then(publicIP => {
      return Promise.all(
        tokens.map(([group_id, access_token]) => {
          return (function setCallbackServer () {
            return client.call('groups.setCallbackServer', {
              access_token, 
              group_id, 
              server_url: 'http://' + publicIP
            })
            .then(response => {
              if (response.state_code !== 1) 
                return setCallbackServer();

              return response;
            });
          })();
        })
      );
    })
    .then((results) => {
      // @todo
      console.log(results);
      console.log('Setting up is done.', _communityInfos);

      client = null;

      return this;
    });
  }

  /**
   * Останавливает обработку запросов.
   * @return {void}
   * @public
   */
  stop () {
    if (!_isListening) 
      return;

    _server.close();
    _isListening = false;
  }
}

module.exports = Application;