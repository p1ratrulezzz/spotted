'use strict';

/**
 * Module dependencies.
 * @private
 */
const Default = require('./Default');
const Message = require('./Message');

/**
 * Возвращает объект типа события.
 * @param  {Object} [body={}] Входящие данные
 * @param  {Client} client    Instance of Client
 * @return {Object}
 * @public
 */
function createTypeByEvent (body = {}, client) {
  switch (body.type) {
    case 'message_new':
    case 'message_reply':
      return new Message(body.object, client);
    default:
      return new Default(body.object, client);
  }
}

module.exports = {
  createTypeByEvent, 

  Default,
  Message
}