'use strict';

const spotty = require('../main');

spotty.addCommunity({
  accessToken:      'aswewoqpfsqwepofdsf', // <String> VK Community Access Token
  confirmationCode: 'asdjfdg',             // <String> VK Community Confirmation Code
  id:               12345678,              // <Number> VK Community ID
  secretKey:        'secretAJSDIFfsd'      // <String> VK Community Secret Key
});

spotty.on('message_new', ctx => {
  console.log(`[Group id${ctx.group_id}] A new message from user id${ctx.object.user_id} received:`, ctx.object.body);

  ctx.reply('Re: ' + ctx.object.body);
});

spotty.run();
