'use strict';

/**
 * Module dependencies.
 * @private
 */
const http = require('uws').http;

/**
 * Local variables.
 * @private
 */
let _requestHandler      = null;
let _confirmationHandler = null;
let _server              = null;

/**
 * Закрывает соединение.
 * @param   {uws.Response} response
 * @param   {String}       [text='ok'] Строка ответа
 * @return  {void}
 * @private
 */
function endRequest (response, text = 'ok') {
  response.writeHead(200, {
    'Connection':     'close',
    'Content-Type':   'text/plain',
    'Content-Length': Buffer.byteLength(text, 'utf8').toString()
  });

  response.end(text);
}

/**
 * Обрабатывает все входящие запросы.
 * @param   {uws.Request}  request
 * @param   {uws.Response} response
 * @return  {void}
 * @private
 */
function internalRequestHandler (request, response) {
  // ВКонтакте отправляет данные только в POST-запросах.
  if (request.method !== 'POST') {
    return endRequest(response);
  }

  /**
   * Chunks.
   * @type {Array of Buffer}
   */
  let chunks = [];

  request.on('data', chunk => chunks.push(Buffer.from(chunk)));
  request.on('end', () => {
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString());

      if (body.type === 'confirmation') {
        _confirmationHandler(body.group_id, code => endRequest(response, code));
      } else {
        endRequest(response);
        _requestHandler(body);
      }
    } catch (e) {
      endRequest(response);
    }

    chunks = null;
  });
}

/**
 * Создаёт сервер для обработки входящих запросов.
 * @param  {Function} requestHandler      Обработчик запросов от ВКонтакте
 * @param  {Function} confirmationHandler Обработчик подтверждений адреса сервера
 * @return {Server}
 * @public
 */
function createServer (requestHandler, confirmationHandler) {
  if (_server !== null) {
    return _server;
  }

  _requestHandler      = requestHandler;
  _confirmationHandler = confirmationHandler;
  _server              = http.createServer(internalRequestHandler);

  return _server;
}

module.exports = {
  createServer
}
