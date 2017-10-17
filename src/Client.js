'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomBytes = require('util').promisify(require('crypto').randomBytes);
const querystring = require('querystring');
const FormData    = require('form-data');
const fetch       = require('./lib/fetch');
const fileTypes   = require('./constants/file-types');

/**
 * Local constants.
 * @private
 */
const API_VERSION  = process.env.VK_API_VERSION || '5.68';
const API_BASE_URL = 'https://api.vk.com/method/';

/**
 * Вызывает первые 25 методов из очереди, используя 
 * специальный метод "execute".
 * @param   {Client} client Instance of Client
 * @return  {void}
 * @private
 */
function executeMethodsFromQueue (client) {
  /**
   * Код, который будет вызван через метод "execute".
   * @type {String}
   */
  const executeCode = 'return [' + client._methods.splice(0, 25).join(',') + '];';

  /**
   * Названия коллбэков для вызываемых методов.
   * @type {Array of String}
   * 
   * Используются для резолвинга промисов в случае 
   * сетевых ошибок / ошибок вызова метода "execute".
   */
  const callbackNamesForTheseMethods = client._callbackNames.splice(0, 25);

  client.callDirect('execute', { code: executeCode })
    .then(response => {
      for (const [callbackName, result] of response.response) {
        // In-Execute method error.
        if (result === false && response.execute_errors) {
          client._callbacks[callbackName].reject(response.execute_errors.shift());
        } else {
          client._callbacks[callbackName].resolve(result);
        }

        client._callbacks[callbackName] = undefined;
      }
    })
    .catch(error => {
      for (const callbackName of callbackNamesForTheseMethods) {
        client._callbacks[callbackName].reject(error);

        client._callbacks[callbackName] = undefined;
      }
    });
}

/**
 * При использовании ключа доступа сообщества, 
 * ВКонтакте позволяет отправлять до 20 запросов 
 * в секунду. При этом, судя по тестам, на 
 * ключ доступа сообщества не накладываются 
 * количественные ограничения, т.е. возникновение 
 * капчи при отправке сообщений нам не страшно.
 * 
 * Чтобы использовать API ВКонтакте на максимум, 
 * запросы совершаются через специальный 
 * метод "execute". 
 * 
 * Таким образом, можно достичь скорости отправки 
 * сообщений в 500 сообщ./сек. (в теории)
 * 
 * * Можно использовать методы со специальной пометкой (где разрешен вызов
 *   метода с ключом доступа сообщества), а также все открытые методы.
 */

class Client {
  /**
   * Constructor.
   * @param  {String} [accessToken=''] Ключ доступа сообщества
   * @return {this}
   * @public
   */
  constructor (accessToken = '') {
    /**
     * Ключ доступа сообщества.
     * @type {String}
     */
    this.accessToken = accessToken;

    /**
     * Очередь методов к обработке.
     * @type {Array of MethodString}
     * 
     * MethodString:
     *   "[<callbackName>, <method>]"
     */
    this._methods = [];

    /**
     * Названия коллбэков для вызываемых методов.
     * @type {Array of String}
     * 
     * Элемент данного массива (название коллбэка) с индексом N 
     * соответствует элементу массива "_methods" (вызываемый метод) 
     * с индексом N.
     */
    this._callbackNames = [];

    /**
     * Коллбэки вызываемых методов.
     * @type {Object} { <callbackName>: { resolve, reject } }
     */
    this._callbacks = Object.create(null);

    // Запускаем вызов методов из очереди каждые ~75мс.
    setInterval(() => executeMethodsFromQueue(this), 75);
  }

  /**
   * Помещает метод в очередь методов, которые 
   * вызываются через "execute".
   * @param  {String}  [method=''] Название метода
   * @param  {Object}  [params={}] Параметры метода
   * @return {Promise}
   * @public
   */
  call (method = '', params = {}) {
    return randomBytes(16)
      .then(buf => new Promise((resolve, reject) => {
        const callbackName = buf.toString('hex');
        
        this._callbacks[callbackName] = { resolve, reject };
        this._callbackNames.push(callbackName);
        this._methods.push(`["${callbackName}",API.${method}(${JSON.stringify(params)})]`);
      }));
  }

  /**
   * Напрямую вызывает метод API ВКонтакте, 
   * без помещения его в очередь для вызова через "execute".
   * @param  {String}  [method=''] Название метода
   * @param  {Object}  [params={}] Параметры метода
   * @return {Promise}
   * @public
   * 
   * Использовать прямой вызов метода имеет смысл в том случае, 
   * если ожидается ответ большого размера (> 5Mb), при 
   * котором "execute" возвращает ошибку.
   * 
   * https://github.com/olnaz/node-vkapi/blob/master/src/vkapi.js#L185
   */
  callDirect (method = '', params = {}) {
    params.v            = params.v            || VK_API_VERSION;
    params.access_token = params.access_token || this.accessToken;

    return fetch(API_BASE_URL + method, {
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

        if (method === 'execute') {
          return response;
        }
        
        return response.response;
      });
  }

  /**
   * Загружает файлы в сообщество ВКонтакте.
   * @param  {String}        [type=''] Тип файла к загрузка
   * @param  {Object/Stream} file      Файл к загрузке
   *   @property {Buffer} content
   *   @property {String} name
   * @param  {Object}        [params={}]            Параметры запроса на получение URL сервера
   * @param  {Object}        [afterUploadParams={}] Параметры запроса на сохранение загруженного файла
   * @return {Promise}
   * @public
   *
   * https://github.com/olnaz/node-vkapi/blob/master/src/vkapi.js#L372
   */
  upload (type = '', file, params = {}, afterUploadParams = {}) {
    // Данный тип файла к загрузке не поддерживается.
    if (!fileTypes[type]) {
      return Promise.reject(new Error('Unknown file type.'));
    }

    // Нет файла к загрузке.
    if (!file) {
      return Promise.reject(new Error('No file to upload provided.'));
    }

    /**
     * Название поля для загрузки, название метода 
     * для получения URL сервера, название метода для 
     * сохранения загруженного файла.
     * @type {String}
     */
    const [ fieldName, stepOneMethod, stepTwoMethod ] = fileTypes[type];

    /**
     * Объект FormData, отправляемый с загрузкой файла.
     * @type {FormData}
     */
    const formData = new FormData();

    formData.append(fieldName, file.content || file, file.name);

    return this.call(stepOneMethod, params)
      .then(response => fetch(response.upload_url, { body: formData, method: 'POST' }))
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          throw new Error(response.error);
        }
  
        if (params.group_id) {
          response.group_id = params.group_id;
        }

        if (afterUploadParams) {
          response = Object.assign(response, afterUploadParams);
        }
  
        return this.call(stepTwoMethod, response);
      });
  }
}

module.exports = Client;