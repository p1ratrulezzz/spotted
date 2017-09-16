'use strict';

const spotty = require('../main');

spotty.addCommunity({
  accessToken: '',
  confirmationCode: '',
  id: 123456789,
  secretKey: ''
});

spotty.on('message_new', ctx => {
  console.log(`[Group id${ctx.group_id}] New message from user id${ctx.object.user_id} received:`, ctx.object.body);

  ctx.reply('Re: ' + ctx.object.body);
});

spotty.run();
