'use strict';

class Default {
  /**
   * Constructor.
   * @param  {Object} [object={}] Объект, инициировавший событие
   * @param  {Client} client      Instance of Client
   * @return {this}
   * @public
   */
  constructor (object = {}, client) {
    this.client = client;

    Object.assign(this, object);
  }
}

module.exports = Default;