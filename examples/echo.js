'use strict';

const spotty = require('../main');

spotty.on('message_new', request => {
  console.log(`[Group id${request.group_id}] New message from user id${request.object.user_id} received:`, request.object.body);

  request.sendMessage('Re: ' + request.object.body);
});

spotty.run({
  tokens: [
    [123456, 'community_access_token']
  ], 

  port: 9001
});