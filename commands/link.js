const _ = require('lodash');

const LinkAccount = require('../embeds/LinkAccount');
module.exports = {
    name: 'link',
    description:
        "Check if you've linked your musictaste.space account with Discord.",
    args: false,
    execute: (message, args) => message.reply("you're all linked!"),
};
