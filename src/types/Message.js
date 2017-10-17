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

  isAudioMessage () {
    return this.attachments && 
           this.attachments[0].type === 'doc' && 
           this.attachments[0].doc.preview && 
           this.attachments[0].doc.preview.audio_msg;
  }

  isGraffiti () {

  }

  isSticker () {
    return this.attachments && 
           this.attachments[0].type === 'sticker';
  }

  hasAudio () {

  }

  hasPhoto () {

  }

  hasText () {

  }

  hasVideo () {

  }

  /**
   * Позволяет быстро ответить на сообщение.
   * @param  {String/Object} answer Сообщение-ответ
   * @return {Promise}
   * @public
   *
   * Позволяет быстро отправить личное сообщение пользователю от имени сообщества.
   * 
   * https://vk.com/dev/messages.send
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
  
    return this.client.call('messages.send', Object.assign({}, answer, { user_id: this.user_id }));
  }

  send () {

  }

  sendSticker () {

  }

  /**
   * Изменяет статус набора текста сообществом в диалоге.
   * @return {Promise}
   * @public
   */
  setTyping () {
    return this.client.call('messages.setActivity', {
      type:    'typing',
      user_id: this.user_id
    });
  }
}

module.exports = Message;