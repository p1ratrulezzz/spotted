'use strict';

const spotty = require('../main');

spotty.setCommunity({
  accessToken:      'aswewoqpfsqwepofdsf', // <String> VK Community Access Token
  confirmationCode: 'asdjfdg',             // <String> VK Community Confirmation Code
  secretKey:        'secretAJSDIFfsd'      // <String> VK Community Secret Key
});

spotty.on('message_new', message => {
  console.log(`A new message from user id${message.user_id} received:`, message.body);

  message.reply('Re: ' + message.body);
});

spotty.run();
