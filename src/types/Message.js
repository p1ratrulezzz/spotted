'use strict';

class Message {
  /**
   * Constructor.
   * @param  {Object} [message={}] Объект сообщения [https://vk.com/dev/objects/message]
   * @param  {Client} client       Instance of Client
   * @return {this}
   * @public
   */
  constructor (message = {}, client) {
    this.client = client;

    /**
     * Полное описание полей полученного сообщения 
     * можно найти здесь: https://vk.com/dev/objects/message
     */
    Object.assign(this, message);
  }

  /**
   * Удаляет сообщение.
   * @param  {Number/Object} [params=this.id] Параметры запроса (либо ID сообщения)
   * @return {Promise}
   * @public
   * 
   * По умолчанию, вызов функции приведет к удалению текущего сообщения.
   * 
   * https://vk.com/dev/messages.delete
   */
  delete (params = this.id) {
    if (typeof params === 'number') {
      params = {
        message_ids: params
      }
    }

    return this.client.call('messages.delete', params);
  }

  /**
   * Является ли сообщение аудиозаписью?
   * @return {Boolean}
   * @public
   * 
   * https://vk.com/dev/objects/attachments_m
   */
  isAudio () {
    return this.attachments && 
           this.attachments[0].type === 'audio';
  }

  /**
   * Является ли сообщение аудио-сообщением?
   * @return {Boolean}
   * @public
   * 
   * https://vk.com/dev/objects/doc
   */
  isAudioMessage () {
    return !!(
      this.attachments && 
      this.attachments[0].type === 'doc' && 
      this.attachments[0].doc.preview && 
      this.attachments[0].doc.preview.audio_msg
    );
  }

  /**
   * Является ли сообщение граффити?
   * @return {Boolean}
   * @public
   * 
   * https://vk.com/dev/objects/doc
   */
  isGraffiti () {
    return !!(
      this.attachments && 
      this.attachments[0].type === 'doc' && 
      this.attachments[0].doc.preview && 
      this.attachments[0].doc.preview.graffiti
    );
  }

  /**
   * Является ли сообщение фотографией?
   * @return {Boolean}
   * @public
   * 
   * https://vk.com/dev/objects/attachments_m
   */
  isPhoto () {
    return this.attachments && 
           this.attachments[0].type === 'photo';
  }

  /**
   * Является ли сообщение стикером?
   * @return {Boolean}
   * @public
   * 
   * https://vk.com/dev/objects/attachments_m
   */
  isSticker () {
    return this.attachments && 
           this.attachments[0].type === 'sticker';
  }


  /**
   * Является ли сообщение обычным текстом?
   * @return {Boolean}
   * @public
   * 
   * https://vk.com/dev/objects/attachments_m
   */
  isText () {
    return this.body && 
           !this.attachments && 
           !this.fwd_messages &&
           !this.geo;
  }

  /**
   * Позволяет быстро отправить сообщение в текущий диалог.
   * @param  {String/Object} answer Сообщение-ответ
   * @return {Promise}
   * @public
   */
  reply (answer) {
    if (!answer) {
      return Promise.reject(new Error('There is nothing to send.'));
    }

    if (typeof answer === 'string') {
      answer = {
        message: answer
      }
    }
  
    return this.send(Object.assign({}, answer, { user_id: this.user_id }));
  }

  /**
   * Восстанавливает сообщение.
   * @param  {Number}  [messageId=this.id] ID сообщения
   * @return {Promise}
   * @public
   * 
   * https://vk.com/dev/messages.restore
   */
  restore (messageId = this.id) {
    return this.client.call('messages.restore', { message_id: messageId });
  }

  /**
   * Отправляет сообщение.
   * @param  {Object}  [params={}] Параметры запроса
   * @return {Promise}
   * @public
   * 
   * https://vk.com/dev/messages.send
   */
  send (params = {}) {
    return this.client.call('messages.send', params);
  }

  /**
   * Изменяет статус набора текста сообществом в диалоге.
   * @param  {Number}  [userId=this.user_id] ID пользователя (== ID диалога)
   * @return {Promise}
   * @public
   * 
   * https://vk.com/dev/messages.setActivity
   */
  setTyping (userId = this.user_id) {
    return this.client.call('messages.setActivity', {
      type:    'typing',
      user_id: userId
    });
  }
}

module.exports = Message;