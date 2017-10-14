'use strict';

/**
 * Module dependencies.
 * @private
 */
const querystring = require('querystring');
const FormData    = require('form-data');
const fetch       = require('./FetchWithAutoRetry');

/**
 * Local constants.
 * @private
 */
const API_VERSION = '5.68';
const FILE_TYPES  = new Map([
  ['cover',    ['photo', 'photos.getOwnerCoverPhotoUploadServer', 'photos.saveOwnerCoverPhoto']],
  ['document', ['file',  'docs.getWallUploadServer',              'docs.save']],
  ['photo',    ['photo', 'photos.getMessagesUploadServer',        'photos.saveMessagesPhoto']]
]);

/**
 * Вызов методов API ВКонтакте.
 * @param  {String}  _accessToken Токен сообщества
 * @param  {String}  method       Название метода
 * @param  {Object}  params       Параметры метода
 * @return {Promise}
 * @public
 *
 * Можно использовать методы со специальной пометкой (где разрешен вызов
 * метода с ключом сообщества), а также все открытые методы.
 */
function call (_accessToken, method, params = {}) {
  params.v            = params.v || API_VERSION;
  params.access_token = params.access_token || _accessToken;

  return fetch(`https://api.vk.com/method/${method}`, {
    body:    querystring.stringify(params),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    method:  'POST',
    timeout: 5000
  })
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        throw response.error;
      }

      return response.response;
    });
}

/**
 * Быстрые ответы на сообщения.
 * @param  {String}  _accessToken Токен сообщества
 * @param  {Object}  _body        Тело запроса
 * @param  {String}  text         Текст сообщения
 * @param  {String}  attachments  Прикрепления
 * @param  {String}  forwards     ID пересылаемых сообщений
 * @return {Promise}
 * @public
 *
 * Позволяет быстро отправить личное сообщение пользователю от имени сообщества
 * при возникновении событий: "message_new", "message_allow".
 *
 * Для отправки стикеров можно использовать метод "messages.sendSticker".
 *
 * https://vk.com/dev/messages.send
 */
function reply (_accessToken, _body, text = '', attachments = '', forwards = '') {
  if (_body.type !== 'message_new' && _body.type !== 'message_allow') {
    return Promise.reject(new Error('You can not use this method here.'));
  }

  if (!text && !attachments && !forwards) {
    return Promise.reject(new Error('There is nothing to send.'));
  }

  return call(_accessToken, 'messages.send', {
    user_id:          _body.object.user_id,
    message:          text,
    attachment:       attachments,
    forward_messages: forwards
  });
}

/**
 * Загрузка файлов в сообщество ВКонтакте.
 * @param  {String}        _accessToken Токен сообщества
 * @param  {String}        type         "cover", "document", "photo"
 * @param  {Object/Stream} file         Файл
 *   @property {Buffer} content
 *   @property {String} name
 * @param  {Object}        params       Параметры запроса
 * @return {Promise}
 * @public
 *
 * https://github.com/olnaz/node-vkapi/blob/master/src/vkapi.js#L372
 */
function upload (_accessToken, type, file, params = {}) {
  if (!FILE_TYPES.has(type)) {
    return Promise.reject(new Error('Unknown file type.'));
  }

  if (!file) {
    return Promise.reject(new Error('No file to upload provided.'));
  }

  if (!file.content && !file.name) {
    file = {
      content: file
    }
  }

  const [ fieldName, stepOneMethodName, stepTwoMethodName ] = FILE_TYPES.get(type);

  return call(_accessToken, stepOneMethodName, params)
    .then(response => {
      const formData = new FormData();

      formData.append(fieldName, file.content, file.name);

      return fetch(response.upload_url, { body: formData, method: 'POST' });
    })
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        throw new Error(response.error);
      }

      if (params.group_id) {
        response.group_id = params.group_id;
      }

      return call(_accessToken, stepTwoMethodName, response);
    });
}

module.exports = {
  call,
  reply,
  upload
}
