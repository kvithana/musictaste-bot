const _ = require('lodash');

const LinkAccount = require('../embeds/LinkAccount');
module.exports = {
    name: 'link',
    description:
        'Get the link for linking your musictaste.space account with Discord.',
    shortDescription: 'Get a link for linking Discord with musictaste.space.',
    args: false,
    execute: (message, args) => message.reply(LinkAccount()),
};
