'use strict';

/**
 * Module dependencies.
 * @private
 */
const { URLSearchParams } = require('url');
const fetch               = require('node-fetch');

/**
 * Local constants.
 * @private
 */
const API_VERSION = '5.67';
const FILE_TYPES  = new Map([
  ['cover',    ['photo', 'photos.getOwnerCoverPhotoUploadServer', 'photos.saveOwnerCoverPhoto']], 
  ['document', ['file',  'docs.getWallUploadServer',              'docs.save']], 
  ['photo',    ['photo', 'photos.getMessagesUploadServer',        'photos.saveMessagesPhoto']]
]);

class APIClient {
  constructor (accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Вызов методов API.
   * @param  {String} method
   * @param  {Object} params
   * @return {Promise}
   * @public
   *
   * Можно использовать методы со специальной пометкой (где разрешен вызов 
   * метода с ключом сообщества), а также все открытые методы.
   */
  call (method, params = {}) {
    params.v            = params.v || API_VERSION;
    params.access_token = params.access_token || this.accessToken;

    return fetch(`https://api.vk.com/method/${method}`, {
      method: 'POST', 
      body:   new URLSearchParams(params)
    })
      .then(response => response.json())
      .then(response => response.response);
  }

  /**
   * Загрузка файлов.
   * @param  {String}        type   "cover", "document", "photo" (also "graffiti" and "audio_msg" can be used)
   * @param  {Buffer/Stream} file   
   * @param  {Object}        params 
   * @return {Promise}
   * @public
   *
   * https://github.com/olnaz/node-vkapi/blob/master/lib/files-upload.js#L31
   */
  upload (type, file, params = {}) {
    if (type === 'graffiti') {
      type        = 'document';
      params.type = 'graffiti';
    }

    if (type === 'audio_msg') {
      type        = 'document';
      params.type = 'audio_message';
    }

    // Unsupported type.
    if (!FILE_TYPES.has(type)) 
      return Promise.reject(new Error('Type "' + type + '" is unsupported.'));

    // No file to upload.
    if (!file) 
      return Promise.reject(new Error('No file provided.'));

    const [
      fieldName, 
      stepOneMethodName, 
      stepTwoMethodName
    ] = FILE_TYPES.get(type);

    // Step 1: Get an upload url.
    return this.call(stepOneMethodName, params)
      .then(response => fetch(response.upload_url, { method: 'POST', body: file }))
      .then(response => response.json())
      .then(response => {
        if (response.error) 
          throw new Error(response.error);

        if (params.group_id) 
          response.group_id = params.group_id;

        // Step 2: Save the file uploaded.
        return this.call(stepTwoMethodName, response);
      });
  }
}

module.exports = APIClient;