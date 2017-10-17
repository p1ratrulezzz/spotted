'use strict';

/**
 * Типы файлов к загрузке.
 */

module.exports = {
  /**
   * Обложка сообщества.
   * 
   * https://vk.com/dev/photos.getOwnerCoverPhotoUploadServer
   */
  'cover': ['photo', 'photos.getOwnerCoverPhotoUploadServer', 'photos.saveOwnerCoverPhoto'],

  /**
   * Документ.
   * Сюда также входят граффити и аудио-сообщения.
   * 
   * https://vk.com/dev/docs.getMessagesUploadServer
   */
  'document': ['file', 'docs.getMessagesUploadServer', 'docs.save'],

  /**
   * Документ в папку "Отправленные".
   * 
   * https://vk.com/dev/docs.getWallUploadServer
   */
  'document_wall': ['file', 'docs.getWallUploadServer', 'docs.save'],

  /**
   * Фотография в личное сообщение.
   * 
   * https://vk.com/dev/photos.getMessagesUploadServer
   */
  'photo': ['photo', 'photos.getMessagesUploadServer', 'photos.saveMessagesPhoto']
}