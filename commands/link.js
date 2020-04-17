const _ = require('lodash');

const LinkAccount = require('../embeds/LinkAccount');
module.exports = {
    name: 'link',
    description:
        'Get the link for linking your musictaste.space account with Discord.',
    args: false,
    execute: (message, args) => message.reply(LinkAccount()),
};
