'use strict';

/**
 * Module dependencies.
 * @private
 */
const APIClient = require('./APIClient');

/**
 * Обработчик запросов от ВКонтакте.
 * @param  {Object} community Информация о сообществе, в котором произошло событие
 * @param  {Object} body      Входящие данные
 * @return {void}
 * @public
 *
 * this: ./Application.js
 */
function handle (community, body) {
  if (!community || !body) {
    return;
  }

  // Полученный секретный ключ не совпадает с указанным.
  if (community.secretKey && community.secretKey !== body.secret) {
    return;
  }

  this.emit(
    body.type,

    Object.assign({
      call:   APIClient.call.bind(null, community.accessToken),
      reply:  APIClient.reply.bind(null, community.accessToken, body),
      upload: APIClient.upload.bind(null, community.accessToken),
    }, body)
  );
}

module.exports = {
  handle
}
