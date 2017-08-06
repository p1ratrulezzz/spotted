'use strict';

/**
 * Module dependencies.
 * @private
 */
const APIClient = require('./APIClient');

class VKRequest extends APIClient {
  constructor (accessToken, { group_id, object, type }) {
    super(accessToken);

    this.group_id = group_id;
    this.object   = object;
    this.type     = type;
  }

  /**
   * Позволяет быстро удалить оставленный комментарий.
   * @return {Promise}
   * @public
   *
   * Метод доступен только для "board_*"-событий, т.к., судя по документации API, 
   * методы для удаления комментариев к записи/фото/видео недоступны с ключом сообщества.
   *
   * https://vk.com/dev/board.deleteComment
   */
  deleteComment () {
    if (
      //!this.type.includes('_comment_') && 
      //!this.type.includes('_reply_') && 
      !this.type.includes('_post_') 
      || 
      this.type.endsWith('_delete')
    ) 
      return Promise.reject(new Error('You can not use this method here.'));

    return this.call('board.deleteComment', {
      group_id:   this.group_id, 
      topic_id:   this.object.topic_id, 
      comment_id: this.object.id
    });
  }

  /**
   * Информация о том, является ли пользователь участником сообщества.
   * @param  {Boolean} extendedForm Возвращать ответ в расширенной форме?
   * @return {Promise}
   * @public
   *
   * https://vk.com/dev/groups.isMember
   */
  isMember (extendedForm = false) {
    if (
      // Ответ администратора на сообщение.
      this.type === 'message_reply' || 

      // Добавление фотографии в сообщество администратором.
      this.type === 'photo_new' && this.object.user_id === 100 || 

      // Добавление аудио/видео в сообщество.
      this.type === 'audio_new' || this.type === 'video_new' || 

      // Добавление записи на стену от имени сообщества.
      (this.type === 'wall_post_new' || this.type === 'wall_repost') && this.object.from_id < 0 || 

      // Удаление комментариев самим пользователем либо администратором сообщества.
      this.type.endsWith('_delete') || 

      // "group_*"-события в данном методе не нуждаются.
      this.type.startsWith('group_')
    ) 
      return Promise.reject(new Error('You can not use this method here.'));

    return this.call('groups.isMember', {
      group_id: this.group_id, 
      user_id:  this.object.user_id || this.object.from_id, 
      extended: +extendedForm
    });
  }

  /**
   * Быстрые ответы на сообщения.
   * @param  {String}       text        Текст сообщения
   * @param  {Array/String} attachments Прикрепления
   * @param  {Array/String} forwards    ID пересылаемых сообщений
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
  sendMessage (text = '', attachments = '', forwards = '') {
    if (this.type !== 'message_new' && this.type !== 'message_allow') 
      return Promise.reject(new Error('You can not use this method here.'));

    if (!text && !attachments && !forwards) 
      return Promise.reject(new Error('There is nothing to send.'));

    return this.call('messages.send', {
      user_id:          this.object.user_id, 
      message:          text, 
      attachment:       Array.isArray(attachments) && attachments.join(',') || attachments, 
      forward_messages: Array.isArray(forwards) && forwards.join(',') || forwards
    });
  }
}

module.exports = VKRequest;